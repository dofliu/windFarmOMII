import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const screenshots = {
  deployment: path.join(outputDirectory, 'owm-onboarding-01-deployment.png'),
  eventDeck: path.join(outputDirectory, 'owm-onboarding-02-event-deck.png'),
  reactive: path.join(outputDirectory, 'owm-onboarding-03-reactive.png'),
  diagnosis: path.join(outputDirectory, 'owm-onboarding-04-diagnosis.png'),
  debrief: path.join(outputDirectory, 'owm-onboarding-05-debrief.png'),
  mobile: path.join(outputDirectory, 'owm-onboarding-mobile.png'),
};

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

async function expectGuideStep(step) {
  const guide = page.getByTestId('onboarding-guide');
  await guide.waitFor({ state: 'visible' });
  const actual = await guide.getAttribute('data-step');
  if (actual !== step) throw new Error(`Expected onboarding step ${step}, received ${actual}.`);
}

async function expectFocused(testId) {
  const target = page.getByTestId(testId);
  await target.waitFor({ state: 'visible' });
  const className = await target.getAttribute('class');
  if (!className?.includes('onboarding-focus')) throw new Error(`${testId} is not highlighted by onboarding.`);
}

try {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('owm.campaign.v1');
    localStorage.removeItem('owm.campaign.v2');
    localStorage.removeItem('owm.campaign.v3');
    localStorage.removeItem('owm.campaign.v5');
    localStorage.removeItem('owm.onboarding.v1');
  });
  await page.reload({ waitUntil: 'networkidle' });

  await expectGuideStep('DEPLOYMENT');
  const deploymentForm = page.locator('.deployment-form.onboarding-focus');
  if ((await deploymentForm.count()) !== 1) throw new Error('Deployment form is not the unique onboarding focus.');
  await page.screenshot({ path: screenshots.deployment, fullPage: true });

  await page.getByTestId('onboarding-primary').click();
  await expectGuideStep('EVENT_DECK');
  await expectFocused('mission-event-deck');
  if (await page.getByTestId('onboarding-primary').isEnabled()) throw new Error('Onboarding allowed deployment before Operation Readiness 5/5.');
  for (const testId of ['planning-confirm-permit', 'planning-confirm-ppe', 'planning-confirm-access']) {
    await page.getByTestId(testId).check();
  }
  const readinessText = await page.getByTestId('operation-readiness').innerText();
  if (!readinessText.includes('5/5 · READY') || !(await page.getByTestId('onboarding-primary').isEnabled())) {
    throw new Error(`Onboarding readiness gate did not unlock: ${readinessText}`);
  }
  await page.screenshot({ path: screenshots.eventDeck, fullPage: true });

  await page.getByTestId('onboarding-primary').click();
  await expectGuideStep('REACTIVE_WINDOW');
  const endRoundButton = page.getByTestId('next-round');
  await endRoundButton.waitFor({ state: 'visible' });
  await page.locator('.phaser-host canvas').waitFor({ state: 'visible', timeout: 15000 });
  await endRoundButton.click();
  await expectFocused('branch-event-panel');
  await page.screenshot({ path: screenshots.reactive, fullPage: true });

  const firstReactive = page.locator('[data-testid^="branch-reactive-"]:not(:disabled)');
  if ((await firstReactive.count()) !== 0) throw new Error('Fresh L1 onboarding team unexpectedly exposes Reactive before Career Track L3.');
  await page.getByTestId('branch-accept').click();
  await expectGuideStep('DIAGNOSIS_GATE');

  let diagnosisSeen = false;
  let reachedDebrief = false;
  for (let round = 0; round < 12 && !reachedDebrief; round += 1) {
    const pendingBranch = page.getByTestId('branch-event-panel');
    if (await pendingBranch.isVisible()) {
      const reactions = page.locator('[data-testid^="branch-reactive-"]:not(:disabled)');
      if ((await reactions.count()) > 0) await reactions.first().click();
      else await page.getByTestId('branch-accept').click();
    }

    const diagnosisChoice = page.getByTestId('diagnosis-choice-correct');
    if (await diagnosisChoice.isVisible()) {
      await expectGuideStep('DIAGNOSIS_GATE');
      await expectFocused('diagnosis-panel');
      await page.screenshot({ path: screenshots.diagnosis, fullPage: true });
      diagnosisSeen = true;
      await diagnosisChoice.click();
      await expectGuideStep('DEBRIEF');
    }

    const teamTabs = page.locator('.team-tabs button');
    const teamCount = await teamTabs.count();
    if (teamCount !== 3) throw new Error(`Expected 3 team tabs, received ${teamCount}.`);
    for (let memberIndex = 0; memberIndex < teamCount && !reachedDebrief; memberIndex += 1) {
      await teamTabs.nth(memberIndex).click();
      for (let action = 0; action < 4; action += 1) {
        const skills = page.locator('.skill-button:not(:disabled)');
        if ((await skills.count()) === 0) break;
        await skills.first().click();
        reachedDebrief = await page.getByTestId('mission-debrief').isVisible();
        if (reachedDebrief) break;
      }
    }

    if (!reachedDebrief) {
      if (!(await endRoundButton.isVisible())) break;
      await endRoundButton.click();
      reachedDebrief = await page.getByTestId('mission-debrief').isVisible();
    }
  }

  if (!diagnosisSeen) throw new Error('Onboarding did not reach the diagnosis gate.');
  if (!reachedDebrief) throw new Error('Onboarding mission did not reach debrief within 12 rounds.');
  await expectGuideStep('DEBRIEF');
  await expectFocused('mission-debrief');
  await page.getByTestId('campaign-reward').waitFor({ state: 'visible' });
  await page.screenshot({ path: screenshots.debrief, fullPage: true });

  const storedBeforeComplete = await page.evaluate(() => ({
    onboarding: JSON.parse(localStorage.getItem('owm.onboarding.v1') ?? 'null'),
    campaign: JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'),
  }));
  if (storedBeforeComplete.onboarding?.status !== 'active' || storedBeforeComplete.onboarding?.stepIndex !== 4) {
    throw new Error(`Unexpected saved onboarding state before completion: ${JSON.stringify(storedBeforeComplete.onboarding)}`);
  }
  const campaignKeys = Object.keys(storedBeforeComplete.campaign ?? {}).sort();
  const expectedCampaignKeys = ['bestScores', 'characterXp', 'completedMissionIds', 'crewFatigue', 'equipmentCondition', 'maintenanceCredits', 'ownedEquipmentIds', 'recoveryTokens', 'schemaVersion', 'totalXp', 'unlockedMissionIds', 'windFarm'].sort();
  if (JSON.stringify(campaignKeys) !== JSON.stringify(expectedCampaignKeys)) {
    throw new Error(`Onboarding changed Campaign save schema: ${campaignKeys.join(', ')}`);
  }

  await page.getByTestId('onboarding-primary').click();
  await page.getByTestId('onboarding-guide').waitFor({ state: 'hidden' });
  const completed = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.onboarding.v1') ?? 'null'));
  if (completed?.status !== 'completed' || completed?.stepIndex !== 4) throw new Error(`Onboarding completion was not saved: ${JSON.stringify(completed)}`);

  await page.reload({ waitUntil: 'networkidle' });
  if (await page.getByTestId('onboarding-guide').isVisible()) throw new Error('Completed onboarding reopened after reload.');
  await page.getByTestId('onboarding-replay').click();
  await expectGuideStep('DEPLOYMENT');
  const replayed = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.onboarding.v1') ?? 'null'));
  if (replayed?.status !== 'active' || replayed?.stepIndex !== 0) throw new Error(`Onboarding replay did not reset state: ${JSON.stringify(replayed)}`);
  await page.getByTestId('onboarding-skip').click();
  await page.getByTestId('onboarding-guide').waitFor({ state: 'hidden' });
  const skipped = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.onboarding.v1') ?? 'null'));
  if (skipped?.status !== 'skipped') throw new Error(`Onboarding skip was not saved: ${JSON.stringify(skipped)}`);

  const mobilePage = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  mobilePage.on('console', (message) => {
    if (message.type() === 'error') errors.push(`mobile: ${message.text()}`);
  });
  mobilePage.on('pageerror', (error) => errors.push(`mobile: ${error.message}`));
  await mobilePage.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => {
    localStorage.removeItem('owm.campaign.v1');
    localStorage.removeItem('owm.campaign.v2');
    localStorage.removeItem('owm.campaign.v3');
    localStorage.removeItem('owm.campaign.v5');
    localStorage.removeItem('owm.onboarding.v1');
  });
  await mobilePage.reload({ waitUntil: 'networkidle' });
  await mobilePage.getByTestId('onboarding-guide').waitFor({ state: 'visible' });
  const mobileLayout = await mobilePage.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (mobileLayout.scrollWidth > mobileLayout.width + 1) {
    throw new Error(`Mobile onboarding overflows horizontally: ${mobileLayout.width} / ${mobileLayout.scrollWidth}`);
  }
  await mobilePage.screenshot({ path: screenshots.mobile, fullPage: true });
  await mobilePage.getByTestId('onboarding-skip').click();
  await mobilePage.close();

  if (errors.length > 0) throw new Error(`Browser console errors:\n${errors.join('\n')}`);
  console.log('Onboarding smoke passed: first-play L1 crew -> deployment -> Operation Readiness 5/5 -> event deck -> full-consequence Reactive window -> diagnosis gate -> debrief -> completion persistence -> replay -> skip.');
  console.log('Campaign save v5 inventory/maintenance/crew readiness/fleet state remained isolated; onboarding persisted separately in owm.onboarding.v1.');
  for (const [name, file] of Object.entries(screenshots)) console.log(`${name}: ${file}`);
} finally {
  await browser.close();
}
