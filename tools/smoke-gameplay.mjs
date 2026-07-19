import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const artIndex = JSON.parse(await readFile(path.join(projectRoot, 'public', 'assets', 'source-art', 'p01', 'index.json'), 'utf8'));
const screenshots = {
  deployment: path.join(outputDirectory, 'owm-gameplay-deployment.png'),
  missionMap: path.join(outputDirectory, 'owm-gameplay-mission-map.png'),
  operation: path.join(outputDirectory, 'owm-gameplay-operation.png'),
  branch: path.join(outputDirectory, 'owm-gameplay-branch-event.png'),
  diagnosis: path.join(outputDirectory, 'owm-gameplay-diagnosis.png'),
  debrief: path.join(outputDirectory, 'owm-gameplay-debrief.png'),
  debriefScore: path.join(outputDirectory, 'owm-gameplay-debrief-score.png'),
  debriefLog: path.join(outputDirectory, 'owm-gameplay-debrief-log.png'),
  codex: path.join(outputDirectory, 'owm-gameplay-codex.png'),
  collection: path.join(outputDirectory, 'owm-gameplay-collection.png'),
  sandbox: path.join(outputDirectory, 'owm-gameplay-sandbox.png'),
  mobile: path.join(outputDirectory, 'owm-gameplay-mobile-telegraph.png'),
  mobileMissionMap: path.join(outputDirectory, 'owm-gameplay-mobile-mission-map.png'),
  mobileCrewRotation: path.join(outputDirectory, 'owm-gameplay-mobile-crew-rotation.png'),
  mobileForecast: path.join(outputDirectory, 'owm-gameplay-mobile-dispatch-forecast.png'),
  mobileReturnNotice: path.join(outputDirectory, 'owm-gameplay-mobile-return-notice.png'),
  s4EventDeck: path.join(outputDirectory, 'owm-gameplay-s4-event-deck.png'),
  s4Branch: path.join(outputDirectory, 'owm-gameplay-s4-branch-event.png'),
  s5EventDeck: path.join(outputDirectory, 'owm-gameplay-s5-event-deck.png'),
  campaignComplete: path.join(outputDirectory, 'owm-gameplay-campaign-complete.png'),
  masteryDeployment: path.join(outputDirectory, 'owm-gameplay-mastery-perks-deployment.png'),
  masteryRuntime: path.join(outputDirectory, 'owm-gameplay-mastery-perks-runtime.png'),
  masteryCollection: path.join(outputDirectory, 'owm-gameplay-mastery-perks-collection.png'),
  maintenance: path.join(outputDirectory, 'owm-gameplay-equipment-maintenance.png'),
  crewReadiness: path.join(outputDirectory, 'owm-gameplay-crew-readiness.png'),
};

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

async function confirmOperationPlanning(targetPage) {
  const readinessTab = targetPage.getByTestId('deployment-tab-readiness');
  if ((await readinessTab.count()) === 1) await readinessTab.click();
  for (const testId of ['planning-confirm-permit', 'planning-confirm-ppe', 'planning-confirm-access']) {
    const checkbox = targetPage.getByTestId(testId);
    await checkbox.waitFor({ state: 'visible' });
    await checkbox.check();
  }
}

async function openCampaignRouteMissions(targetPage) {
  await targetPage.getByTestId('deployment-tab-route').click();
  await targetPage.getByTestId('campaign-route-tab-fleet').waitFor({ state: 'visible' });
  const missionsTab = targetPage.getByTestId('campaign-route-tab-missions');
  await missionsTab.waitFor({ state: 'visible' });
  await missionsTab.click();
  await targetPage.waitForFunction(() => {
    const tab = document.querySelector('[data-testid="campaign-route-tab-missions"]');
    return tab?.getAttribute('aria-selected') === 'true'
      && document.querySelectorAll('[data-testid^="mission-node-"]').length >= 15;
  });
}

async function openCampaignRouteBriefing(targetPage) {
  await targetPage.getByTestId('deployment-tab-route').click();
  await targetPage.getByTestId('campaign-route-tab-fleet').waitFor({ state: 'visible' });
  const briefingTab = targetPage.getByTestId('campaign-route-tab-briefing');
  await briefingTab.waitFor({ state: 'visible' });
  await briefingTab.click();
  await targetPage.waitForFunction(() => document.querySelector('[data-testid="campaign-route-tab-briefing"]')?.getAttribute('aria-selected') === 'true');
}

async function assertSingleScreen(targetPage, label, rootSelector) {
  const metrics = await targetPage.evaluate((selector) => {
    const scrolling = document.scrollingElement;
    const root = document.querySelector(selector);
    const rect = root?.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: scrolling?.scrollWidth ?? 0,
      scrollHeight: scrolling?.scrollHeight ?? 0,
      rootTop: rect?.top ?? null,
      rootBottom: rect?.bottom ?? null,
    };
  }, rootSelector);
  if (metrics.scrollWidth > metrics.viewportWidth + 1 || metrics.scrollHeight > metrics.viewportHeight + 1) {
    throw new Error(`${label} document overflow: ${JSON.stringify(metrics)}`);
  }
  if (metrics.rootTop === null || metrics.rootBottom === null || metrics.rootTop < -1 || metrics.rootBottom > metrics.viewportHeight + 1) {
    throw new Error(`${label} root clipped: ${JSON.stringify(metrics)}`);
  }
}

async function assertSourceArtSurface(targetPage, selector, label, expectedCharacterId) {
  const surface = targetPage.locator(selector).first();
  await surface.waitFor({ state: 'visible' });
  const metadata = await surface.evaluate((element) => ({
    characterId: element.getAttribute('data-source-art-character-id'),
    version: element.getAttribute('data-source-art-version'),
    file: element.getAttribute('data-source-art-file'),
    qaStatus: element.getAttribute('data-source-art-qa-status'),
    engineeringQaStatus: element.getAttribute('data-source-art-engineering-qa-status'),
    hasSourceArt: element.classList.contains('collection-card') || element.classList.contains('has-source-art'),
  }));
  if (expectedCharacterId && metadata.characterId !== expectedCharacterId) {
    throw new Error(`${label} source-art character mismatch: ${JSON.stringify({ expectedCharacterId, metadata })}`);
  }
  const activeArt = artIndex.items[metadata.characterId];
  if (!activeArt) {
    throw new Error(`${label} source-art character is not active in index: ${JSON.stringify(metadata)}`);
  }
  const expectedMetadata = {
    characterId: metadata.characterId,
    version: activeArt.version,
    file: activeArt.file,
    qaStatus: activeArt.qaStatus,
    engineeringQaStatus: activeArt.engineeringQaStatus,
    hasSourceArt: true,
  };
  if (JSON.stringify(metadata) !== JSON.stringify(expectedMetadata)) {
    throw new Error(`${label} source-art metadata mismatch: ${JSON.stringify({ expectedMetadata, metadata })}`);
  }
  const image = surface.locator('img.source-art-image, .collection-art img').first();
  await image.waitFor({ state: 'visible' });
  await image.evaluate((element) => element.decode());
  const imageState = await image.evaluate((element) => ({
    src: element.getAttribute('src'),
    naturalWidth: element.naturalWidth,
    naturalHeight: element.naturalHeight,
    renderedWidth: element.getBoundingClientRect().width,
    renderedHeight: element.getBoundingClientRect().height,
    objectFit: getComputedStyle(element).objectFit,
    objectPosition: getComputedStyle(element).objectPosition,
    frameContainsImage: (() => {
      const frame = element.closest('.portrait-placeholder, .collection-art');
      const imageRect = element.getBoundingClientRect();
      const frameRect = frame?.getBoundingClientRect();
      return Boolean(frameRect)
        && imageRect.left >= frameRect.left - 1
        && imageRect.right <= frameRect.right + 1
        && imageRect.top >= frameRect.top - 1
        && imageRect.bottom <= frameRect.bottom + 1;
    })(),
  }));
  const naturalAspect = imageState.naturalWidth / imageState.naturalHeight;
  if (!imageState.src?.includes(activeArt.file) || imageState.naturalWidth <= 0 || imageState.naturalHeight <= 0 || Math.abs(naturalAspect - 2 / 3) > 0.01) {
    throw new Error(`${label} source-art image failed active file/aspect check: ${JSON.stringify({ activeArt, imageState, naturalAspect })}`);
  }
  if (imageState.objectFit !== 'contain' || !imageState.frameContainsImage) {
    throw new Error(`${label} source-art safe-frame style failed: ${JSON.stringify(imageState)}`);
  }
  if (imageState.renderedWidth <= 0 || imageState.renderedHeight <= 0) {
    throw new Error(`${label} source-art image has invalid rendered size: ${JSON.stringify(imageState)}`);
  }
  return { metadata, imageState };
}

async function commitEndRound(targetPage, options = {}) {
  const { buttonTestId = 'next-round', promptTestId = 'round-commit-confirmation', expectPrompt = false } = options;
  const button = targetPage.getByTestId(buttonTestId);
  await button.click();
  const prompt = targetPage.getByTestId(promptTestId);
  const promptVisible = await prompt.isVisible().catch(() => false);
  if (expectPrompt && !promptVisible) {
    throw new Error(`${promptTestId} did not appear before a high-risk End Round commit.`);
  }
  if (promptVisible) await button.click();
}

try {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('owm.campaign.v1');
    localStorage.removeItem('owm.campaign.v2');
    localStorage.removeItem('owm.campaign.v3');
    localStorage.removeItem('owm.campaign.v5');
    // 讓主 gameplay flow 使用已達 Track L3 的合法進度，以保留 Reactive browser regression；fresh 60/300 gate 由 layout smoke 驗證。
    localStorage.setItem('owm.campaign.v5', JSON.stringify({
      schemaVersion: 5,
      totalXp: 440,
      completedMissionIds: [],
      unlockedMissionIds: ['MSN-TUT-001'],
      bestScores: {},
      characterXp: { 'CHR-GOV-001': 95, 'CHR-MAR-176': 95, 'CHR-OMI-223': 250 },
    }));
    // 一般 gameplay smoke 固定關閉首次導覽，避免導覽狀態污染既有回歸流程。
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
  });
  await page.reload({ waitUntil: 'networkidle' });

  const deployButton = page.getByTestId('deploy-mission');
  await deployButton.waitFor({ state: 'visible' });
  const windFarmBoard = await page.getByTestId('wind-farm-board').innerText();
  if ((await page.locator('[data-testid^="wind-turbine-WTG-OWM-"]').count()) !== 6 || !windFarmBoard.includes('FLEET DISPATCH PRIORITY') || !windFarmBoard.includes('4 ACTION') || !windFarmBoard.includes('BACKLOG')) {
    throw new Error(`Fleet Dispatch / Wind Farm Board is incomplete: ${windFarmBoard}`);
  }
  if (!(await page.getByTestId('wind-turbine-WTG-OWM-001').getAttribute('class'))?.includes('selected')) throw new Error('Selected Mission did not highlight its assigned Turbine.');
  if (await deployButton.isEnabled()) throw new Error('Readiness gate did not block deployment before required confirmations.');
  await page.getByTestId('deployment-tab-crew').click();
  if ((await page.getByTestId('career-unlocked-count').innerText()).trim() !== '62/300') throw new Error('Progressed Track should expose 62/300 Campaign characters before the mission.');
  await page.getByTestId('deployment-team-2').selectOption('CHR-OMI-223');
  await page.getByTestId('deployment-tab-readiness').click();
  const readinessText = await page.getByTestId('operation-readiness').innerText();
  if (!readinessText.includes('OWM-N01') || !readinessText.includes('SEA STATE') || !readinessText.includes('2') || !readinessText.includes('PTW-MECH-LOTO') || !readinessText.includes('Gameplay abstraction')) {
    throw new Error(`Initial Operation Profile is incomplete: ${readinessText}`);
  }
  await confirmOperationPlanning(page);
  if (!(await deployButton.isEnabled()) || !(await page.getByTestId('operation-readiness').innerText()).includes('5/5 · READY')) {
    throw new Error('Deployment is not ready after all five readiness checks passed.');
  }
  await page.getByTestId('deployment-tab-loadout').click();
  const initialInventory = await page.getByTestId('equipment-inventory').innerText();
  if (!initialInventory.includes('40/200') || !initialInventory.includes('80 MNT') || !initialInventory.includes('L1') || !initialInventory.includes('40/40') || !initialInventory.includes('L2') || !initialInventory.includes('0/40')) {
    throw new Error(`Initial Equipment inventory is incorrect: ${initialInventory}`);
  }
  if (!(await page.getByTestId('equipment-maintenance').innerText()).includes('100%') || await page.getByTestId('repair-equipment').isEnabled()) {
    throw new Error('New Campaign equipment did not start at full condition.');
  }
  if ((await page.getByTestId('deployment-equipment').locator('option:not(:disabled)').count()) !== 35 || (await page.getByTestId('deployment-spare').locator('option:not(:disabled)').count()) !== 5) {
    throw new Error('Campaign should expose exactly 35 non-spare and 5 spare L1 items at start.');
  }
  await page.locator('.deployment-portrait.has-source-art').waitFor({ state: 'visible' });
  await assertSourceArtSurface(page, '.deployment-portrait', 'Deployment crew preview');
  await page.getByTestId('deployment-tab-forecast').click();
  const dispatchForecast = await page.getByTestId('dispatch-forecast').innerText();
  if (!dispatchForecast.includes('100%') || !dispatchForecast.includes('92%') || !dispatchForecast.includes('86%') || !dispatchForecast.includes('+24–34') || !dispatchForecast.includes('3 → 5 RST') || !dispatchForecast.includes('Gameplay forecast')) {
    throw new Error(`Initial Dispatch Forecast is incomplete: ${dispatchForecast}`);
  }
  const dispatchRotation = await page.getByTestId('forecast-rotation-advisor').innerText();
  if (!dispatchRotation.includes('建議輪調') || !dispatchRotation.includes('6/6') || !dispatchRotation.includes('臨界+') || !(await page.getByTestId('apply-forecast-rotation').isEnabled())) {
    throw new Error(`Dispatch Forecast Crew Rotation Advisor is incomplete: ${dispatchRotation}`);
  }
  await openCampaignRouteMissions(page);
  if ((await page.locator('.campaign-chapter').count()) !== 5 || (await page.locator('.mission-node').count()) !== 15) {
    throw new Error('Initial Campaign map does not expose 5 chapters and 15 mission nodes.');
  }
  if ((await page.locator('.mission-node[data-status="available"]').count()) !== 1 || (await page.locator('.mission-node[data-status="locked"]').count()) !== 14) {
    throw new Error('Initial Campaign map status should be 1 available and 14 locked missions.');
  }
  await openCampaignRouteBriefing(page);
  const initialEventDeck = await page.getByTestId('mission-event-deck').innerText();
  if (!initialEventDeck.includes('R01') || !initialEventDeck.includes('天候惡化') || !initialEventDeck.includes('×0.75') || !initialEventDeck.includes('R07')) {
    throw new Error(`Initial mission-specific event deck is incomplete: ${initialEventDeck}`);
  }
  await page.screenshot({ path: screenshots.deployment, fullPage: true });

  await deployButton.click();
  const endRoundButton = page.getByTestId('next-round');
  await endRoundButton.waitFor({ state: 'visible' });
  await page.locator('.phaser-host canvas').waitFor({ state: 'visible', timeout: 15000 });
  const fieldTurbineStatus = await page.getByTestId('field-turbine-status').innerText();
  if (!fieldTurbineStatus.includes('WTG-001') || !fieldTurbineStatus.includes('R 88%') || !fieldTurbineStatus.includes('B 1')) {
    throw new Error(`Operation field Turbine status is incomplete: ${fieldTurbineStatus}`);
  }
  await page.locator('.card-panel .portrait-placeholder.has-source-art').waitFor({ state: 'visible' });
  await assertSourceArtSurface(page, '.card-panel .portrait-placeholder', 'Operation selected crew card');
  const campaignClassRule = await page.getByTestId('boss-class-rule').innerText();
  if (!campaignClassRule.includes('DRV') || !campaignClassRule.includes('傳動衝擊')) {
    throw new Error(`Campaign Boss class rule is missing: ${campaignClassRule}`);
  }
  const telegraphChip = await page.getByTestId('telegraph-chip').innerText();
  if (!telegraphChip.includes('DRV')) throw new Error(`Campaign telegraph chip is missing: ${telegraphChip}`);
  if (!(await page.getByTestId('runtime-statuses').isVisible())) throw new Error('Runtime status icons are not visible.');

  // 先承受一次任務風險，確保天候與安全資源真的由回合系統驅動。
  const initialWeather = Number((await page.locator('.resource-meter.weather b').innerText()).replace('%', ''));
  await commitEndRound(page, { expectPrompt: true });
  const settledWeather = Number((await page.locator('.resource-meter.weather b').innerText()).replace('%', ''));
  if (!(settledWeather < initialWeather)) {
    throw new Error(`Weather risk did not settle: ${initialWeather} -> ${settledWeather}`);
  }
  const operationLog = await page.locator('.log-list').innerText();
  if (!operationLog.includes('傳動衝擊')) {
    throw new Error(`Boss class event was not written to operation log: ${operationLog}`);
  }
  const hazardEvent = await page.getByTestId('hazard-event').innerText();
  if (!hazardEvent.includes('傳動衝擊') || !hazardEvent.includes('SHOCK')) {
    throw new Error(`Hazard event telegraph is incomplete: ${hazardEvent}`);
  }
  const branchPanel = page.getByTestId('branch-event-panel');
  if (!(await branchPanel.isVisible())) throw new Error('First round did not open a branch event response window.');
  const branchText = await branchPanel.innerText();
  if (!branchText.includes('天候惡化') || !branchText.includes('REACTIVE WINDOW') || !branchText.includes('×0.75')) {
    throw new Error(`Unexpected first branch event: ${branchText}`);
  }
  if (await endRoundButton.isEnabled()) throw new Error('End round remained enabled while a branch event was pending.');
  await page.screenshot({ path: screenshots.branch, fullPage: true });
  const reactiveRecommendation = page.getByTestId('branch-reactive-cta');
  await reactiveRecommendation.waitFor({ state: 'visible' });
  const recommendedReactiveCharacterId = await reactiveRecommendation.getAttribute('data-recommended-character-id');
  const recommendedReactiveSkillId = await reactiveRecommendation.getAttribute('data-recommended-skill-id');
  const recommendedReactiveTelemetry = await reactiveRecommendation.evaluate((element) => ({
    characterId: element.getAttribute('data-recommended-character-id'),
    skillId: element.getAttribute('data-recommended-skill-id'),
    reason: element.getAttribute('data-recommended-reactive-reason'),
    power: element.getAttribute('data-recommended-reactive-power'),
    energyCost: element.getAttribute('data-recommended-reactive-energy-cost'),
    visibleReason: element.querySelector('[data-testid="branch-reactive-reason"]')?.textContent,
  }));
  if (!recommendedReactiveCharacterId || !recommendedReactiveSkillId || !recommendedReactiveTelemetry.reason?.startsWith('Recommended: highest available Reactive power') || recommendedReactiveTelemetry.reason !== recommendedReactiveTelemetry.visibleReason || !/^\d+$/.test(recommendedReactiveTelemetry.power ?? '') || !/^\d+$/.test(recommendedReactiveTelemetry.energyCost ?? '')) {
    throw new Error(`Branch event REC CTA is missing stable reason telemetry: ${JSON.stringify({ recommendedReactiveCharacterId, recommendedReactiveSkillId, recommendedReactiveTelemetry })}`);
  }
  const weatherBeforeBranch = Number((await page.locator('.resource-meter.weather b').innerText()).replace('%', ''));
  await reactiveRecommendation.click();
  const weatherAfterBranch = Number((await page.locator('.resource-meter.weather b').innerText()).replace('%', ''));
  const mitigatedWeatherLoss = weatherBeforeBranch - weatherAfterBranch;
  if (!(mitigatedWeatherLoss > 0 && mitigatedWeatherLoss < 6)) {
    throw new Error(`Reactive skill did not mitigate weather branch loss: ${weatherBeforeBranch} -> ${weatherAfterBranch}`);
  }
  if (await branchPanel.isVisible()) throw new Error('Branch response window did not close after Reactive skill.');
  const reactiveLog = await page.locator('.log-list').innerText();
  if (!reactiveLog.includes('Reactive 減傷')) throw new Error(`Reactive result was not logged: ${reactiveLog}`);
  const reactiveStatus = await page.getByTestId('runtime-statuses').innerText();
  if (!reactiveStatus.includes('BranchGuard')) throw new Error(`Reactive status was not applied: ${reactiveStatus}`);
  await page.screenshot({ path: screenshots.operation, fullPage: true });

  // 輪流使用三名角色可用技能，驗證六階段可一路推進到結算。
  let reachedDebrief = false;
  let diagnosisCaptured = false;
  for (let round = 0; round < 12 && !reachedDebrief; round += 1) {
    const pendingBranch = page.getByTestId('branch-event-panel');
    if (await pendingBranch.isVisible()) {
      const availableReactions = page.locator('[data-testid^="branch-reactive-"]:not(:disabled)');
      const availableReactionCount = await availableReactions.count();
      if (availableReactionCount > 0) await availableReactions.first().click();
      else await page.getByTestId('branch-accept').click();
    }
    const diagnosisRecommendation = page.getByTestId('diagnosis-rec-cta');
    if (await diagnosisRecommendation.isVisible()) {
      if (!diagnosisCaptured) {
        await page.screenshot({ path: screenshots.diagnosis, fullPage: true });
        diagnosisCaptured = true;
      }
      const recommendedDiagnosisId = await diagnosisRecommendation.getAttribute('data-recommended-diagnosis-id');
      const recommendedDiagnosisReason = await diagnosisRecommendation.getAttribute('data-recommended-diagnosis-reason');
      const visibleDiagnosisReason = await page.getByTestId('diagnosis-rec-reason').innerText();
      if (!recommendedDiagnosisId || !recommendedDiagnosisReason?.startsWith('Recommended: evidence-backed answer') || recommendedDiagnosisReason !== visibleDiagnosisReason) {
        throw new Error(`Diagnosis REC CTA is missing stable reason telemetry: ${JSON.stringify({ recommendedDiagnosisId, recommendedDiagnosisReason, visibleDiagnosisReason })}`);
      }
      await diagnosisRecommendation.click();
      const evidence = Number((await page.locator('.resource-meter.evidence b').innerText()).replace('%', ''));
      if (evidence < 15) throw new Error(`Diagnosis REC CTA did not add evidence: ${evidence}`);
    }

    const teamTabs = page.locator('.team-tabs button');
    const teamCount = await teamTabs.count();
    if (teamCount !== 3) throw new Error(`Expected 3 team tabs, received ${teamCount}.`);

    for (let memberIndex = 0; memberIndex < teamCount && !reachedDebrief; memberIndex += 1) {
      await teamTabs.nth(memberIndex).click();
      for (let action = 0; action < 4; action += 1) {
        const enabledSkills = page.locator('.skill-button:not(:disabled)');
        if ((await enabledSkills.count()) === 0) break;
        await enabledSkills.first().click();
        reachedDebrief = await page.getByTestId('mission-debrief').isVisible();
        if (reachedDebrief) break;
      }
    }

    if (!reachedDebrief) {
      if (!(await endRoundButton.isVisible())) break;
      await commitEndRound(page);
      reachedDebrief = await page.getByTestId('mission-debrief').isVisible();
    }
  }

  if (!reachedDebrief) {
    throw new Error('The six-stage mission did not reach debrief within 12 rounds.');
  }
  await page.getByTestId('mission-debrief').waitFor({ state: 'visible' });
  const reviewText = await page.getByTestId('mission-result-review').innerText();
  if (!reviewText.includes('XP') || !reviewText.includes('MNT') || !reviewText.includes('RST') || !reviewText.includes('WTG-001') || !reviewText.includes('KNOWLEDGE CODEX') || !reviewText.includes('本次') || !reviewText.includes('任務前 BEST') || !reviewText.includes('任務後 BEST') || !reviewText.includes('首次 BEST') || !reviewText.includes('下一步') || !reviewText.includes('下一個任務') || (!reviewText.includes('返回 Route') && !reviewText.includes('返回 ROUTE')) || !reviewText.includes('重玩本任務')) {
    throw new Error(`Mission Result Review default tab is incomplete: ${reviewText}`);
  }
  const scoreCompare = await page.getByTestId('score-compare-reward').innerText();
  if (!scoreCompare.includes('本次') || !scoreCompare.includes('NONE') || !scoreCompare.includes('首次 BEST')) {
    throw new Error(`Mission Replay Compare card is incomplete for first clear: ${scoreCompare}`);
  }
  await page.getByTestId('campaign-reward').waitFor({ state: 'visible' });
  await page.getByTestId('codex-reward').waitFor({ state: 'visible' });
  await page.locator('.card-panel .portrait-placeholder.has-source-art').waitFor({ state: 'visible' });
  const debriefReviewTab = page.getByTestId('debrief-tab-review');
  const debriefScoreTab = page.getByTestId('debrief-tab-score');
  const debriefLogTab = page.getByTestId('debrief-tab-log');
  if ((await debriefReviewTab.getAttribute('role')) !== 'tab' || (await debriefReviewTab.getAttribute('aria-controls')) !== 'debrief-panel-review') {
    throw new Error('Debrief review tab is missing tab role or aria-controls metadata.');
  }
  if ((await page.getByTestId('mission-result-review').getAttribute('role')) !== 'tabpanel') {
    throw new Error('Debrief review panel is missing tabpanel role.');
  }
  await debriefReviewTab.press('ArrowRight');
  if ((await debriefScoreTab.getAttribute('aria-selected')) !== 'true' || !(await page.getByTestId('debrief-score-panel').isVisible())) {
    throw new Error('Debrief tabs do not support ArrowRight keyboard navigation.');
  }
  await debriefScoreTab.press('ArrowRight');
  if ((await debriefLogTab.getAttribute('aria-selected')) !== 'true' || !(await page.getByTestId('debrief-log-panel').isVisible())) {
    throw new Error('Debrief tabs do not support second ArrowRight keyboard navigation.');
  }
  await debriefLogTab.press('Home');
  if ((await debriefReviewTab.getAttribute('aria-selected')) !== 'true' || !(await page.getByTestId('mission-result-review').isVisible())) {
    throw new Error('Debrief tabs do not support Home keyboard navigation.');
  }
  await assertSingleScreen(page, 'Operation debrief review', '.game-grid');
  await page.screenshot({ path: screenshots.debrief, fullPage: true });
  await page.getByTestId('debrief-tab-score').click();
  const scorePanel = await page.getByTestId('debrief-score-panel').innerText();
  if (!scorePanel.includes('完成度') || !scorePanel.includes('安全') || !scorePanel.includes('證據') || !scorePanel.includes('時間') || !scorePanel.includes('疲勞') || !scorePanel.includes('成本')) {
    throw new Error(`Mission Result Score tab is incomplete: ${scorePanel}`);
  }
  await assertSingleScreen(page, 'Operation debrief score', '.game-grid');
  await page.screenshot({ path: screenshots.debriefScore, fullPage: true });
  await page.getByTestId('debrief-tab-log').click();
  const debriefLog = await page.getByTestId('debrief-log-panel').innerText();
  if (!debriefLog.includes('快速處置') || !debriefLog.includes('階段完成') || !debriefLog.includes('⚠')) {
    throw new Error(`Mission Result Log tab is incomplete: ${debriefLog}`);
  }
  await assertSingleScreen(page, 'Operation debrief log', '.game-grid');
  await page.screenshot({ path: screenshots.debriefLog, fullPage: true });
  await page.getByTestId('debrief-tab-review').click();

  const rewardText = await page.getByTestId('campaign-reward').innerText();
  if (!rewardText.includes('XP') || !rewardText.includes('解鎖')) {
    throw new Error(`Campaign reward did not unlock the next mission: ${rewardText}`);
  }
  const trackXpReward = await page.getByTestId('track-xp-reward').innerText();
  const careerUnlockReward = await page.getByTestId('career-unlock-reward').innerText();
  if (!trackXpReward.includes('TRK001 95→') || !trackXpReward.includes('TRK036 95→') || !careerUnlockReward.includes('Career 解鎖') || (careerUnlockReward.match(/L2/g) ?? []).length < 2) {
    throw new Error(`Career Track reward is incomplete: ${trackXpReward} | ${careerUnlockReward}`);
  }
  const maintenanceReward = await page.getByTestId('maintenance-reward').innerText();
  if (!maintenanceReward.includes('MNT') || !maintenanceReward.includes('EQ 100→92 (-8)') || !maintenanceReward.includes('SP 100→95 (-5)') || !maintenanceReward.includes('gameplay abstraction')) {
    throw new Error(`Mission wear reward is incomplete: ${maintenanceReward}`);
  }
  const recoveryReward = await page.getByTestId('crew-recovery-reward').innerText();
  if (!recoveryReward.includes('RST') || !recoveryReward.includes('→') || !recoveryReward.includes('gameplay abstraction')) {
    throw new Error(`Crew recovery reward is incomplete: ${recoveryReward}`);
  }
  const windFarmReward = await page.getByTestId('wind-farm-reward').innerText();
  if (!windFarmReward.includes('WTG-001') || !windFarmReward.includes('Reliability') || !windFarmReward.includes('Backlog') || !windFarmReward.includes('gameplay abstraction')) {
    throw new Error(`Wind farm settlement reward is incomplete: ${windFarmReward}`);
  }
  const continueActions = await page.getByTestId('campaign-continue-actions').innerText();
  if (!continueActions.includes('下一步') || !continueActions.includes('MSN-TUT-002') || !continueActions.includes('下一個任務') || (!continueActions.includes('返回 Route') && !continueActions.includes('返回 ROUTE')) || !continueActions.includes('重玩本任務')) {
    throw new Error(`Campaign Continue CTA is incomplete: ${continueActions}`);
  }
  const savedProgress = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (!savedProgress || !savedProgress.includes('MSN-TUT-002')) {
    throw new Error('Campaign progress was not persisted to localStorage.');
  }
  const parsedProgress = JSON.parse(savedProgress);
  if (parsedProgress.schemaVersion !== 5 || parsedProgress.ownedEquipmentIds?.length !== 40 || parsedProgress.maintenanceCredits <= 80 || parsedProgress.equipmentCondition?.EQ0051 !== 92 || parsedProgress.equipmentCondition?.EQ0126 !== 95 || parsedProgress.recoveryTokens <= 3 || typeof parsedProgress.crewFatigue !== 'object' || Object.keys(parsedProgress.windFarm ?? {}).length !== 6 || parsedProgress.windFarm?.['WTG-OWM-001']?.lastMissionId !== 'MSN-TUT-001') {
    throw new Error(`Campaign v5 maintenance/readiness state was not persisted: ${savedProgress}`);
  }
  const continueNextMission = page.getByTestId('continue-next-mission');
  const continueSummaryMetadata = await page.getByTestId('campaign-continue-summary').evaluate((element) => ({
    recommendedAction: element.getAttribute('data-recommended-continue-action'),
    nextMissionId: element.getAttribute('data-next-mission-id'),
    copy: element.textContent,
  }));
  const continueGroupMetadata = await page.getByTestId('campaign-continue-actions').evaluate((element) => ({
    recommendedAction: element.getAttribute('data-recommended-continue-action'),
    currentMissionId: element.getAttribute('data-current-mission-id'),
    nextMissionId: element.getAttribute('data-next-mission-id'),
    availableMissionCount: element.getAttribute('data-available-mission-count'),
  }));
  if (
    continueSummaryMetadata.recommendedAction !== 'next-mission'
    || continueSummaryMetadata.nextMissionId !== 'MSN-TUT-002'
    || !continueSummaryMetadata.copy?.includes('Recommended: continue to unlocked mission MSN-TUT-002')
    || continueGroupMetadata.recommendedAction !== 'next-mission'
    || continueGroupMetadata.currentMissionId !== 'MSN-TUT-001'
    || continueGroupMetadata.nextMissionId !== 'MSN-TUT-002'
    || continueGroupMetadata.availableMissionCount !== '1'
  ) {
    throw new Error(`Campaign Continue recommendation metadata is incorrect: ${JSON.stringify({ continueSummaryMetadata, continueGroupMetadata })}`);
  }
  const recommendedContinueMissionId = await continueNextMission.getAttribute('data-recommended-mission-id');
  const continueNextAction = await continueNextMission.getAttribute('data-continue-action');
  const continueNextCurrentMissionId = await continueNextMission.getAttribute('data-current-mission-id');
  const continueNextReason = await continueNextMission.getAttribute('data-continue-reason');
  if (recommendedContinueMissionId !== 'MSN-TUT-002' || continueNextAction !== 'next-mission' || continueNextCurrentMissionId !== 'MSN-TUT-001' || !continueNextReason?.includes('Recommended: continue to unlocked mission MSN-TUT-002')) {
    throw new Error(`Campaign Continue next metadata is incorrect: ${JSON.stringify({ recommendedContinueMissionId, continueNextAction, continueNextCurrentMissionId, continueNextReason })}`);
  }
  const continueReturnMetadata = await page.getByTestId('continue-return-route').evaluate((element) => ({
    action: element.getAttribute('data-continue-action'),
    currentMissionId: element.getAttribute('data-current-mission-id'),
    reason: element.getAttribute('data-continue-reason'),
  }));
  if (continueReturnMetadata.action !== 'return-route' || continueReturnMetadata.currentMissionId !== 'MSN-TUT-001' || !continueReturnMetadata.reason?.includes('Review fleet')) {
    throw new Error(`Campaign Continue return metadata is incorrect: ${JSON.stringify(continueReturnMetadata)}`);
  }
  const continueReplayMetadata = await page.getByTestId('continue-replay-mission').evaluate((element) => ({
    action: element.getAttribute('data-continue-action'),
    replayMissionId: element.getAttribute('data-replay-mission-id'),
    currentMissionId: element.getAttribute('data-current-mission-id'),
    reason: element.getAttribute('data-continue-reason'),
  }));
  if (
    continueReplayMetadata.action !== 'replay-mission'
    || continueReplayMetadata.replayMissionId !== 'MSN-TUT-001'
    || continueReplayMetadata.currentMissionId !== 'MSN-TUT-001'
    || !continueReplayMetadata.reason?.includes('Replay MSN-TUT-001')
  ) {
    throw new Error(`Campaign Continue replay metadata is incorrect: ${JSON.stringify(continueReplayMetadata)}`);
  }
  await continueNextMission.click();
  await openCampaignRouteMissions(page);
  const ctaSelectedMission = page.getByTestId('mission-node-MSN-TUT-002');
  if (!((await ctaSelectedMission.getAttribute('class')) ?? '').includes('selected')) {
    throw new Error('Campaign Continue CTA did not route to the next available mission.');
  }
  await openCampaignRouteBriefing(page);
  const routeReadinessCarryover = await page.getByTestId('route-readiness-carryover').innerText();
  if (!routeReadinessCarryover.includes('下一關整備提醒') || !routeReadinessCarryover.includes('工作許可') || !routeReadinessCarryover.includes('PPE') || !routeReadinessCarryover.includes('進場條件') || !routeReadinessCarryover.includes('PENDING')) {
    throw new Error(`Debrief Route Readiness Carryover is incomplete after CTA: ${routeReadinessCarryover}`);
  }
  const routeNextStep = page.getByTestId('route-readiness-next-step');
  const pendingGap = await routeNextStep.getAttribute('data-next-readiness-gap');
  const pendingAction = await routeNextStep.getAttribute('data-next-readiness-action');
  const pendingTab = await routeNextStep.getAttribute('data-next-readiness-tab');
  const pendingReason = await routeNextStep.getAttribute('data-next-readiness-reason');
  const pendingReasonCopy = await page.getByTestId('route-readiness-next-reason').innerText();
  if (pendingGap !== 'permit' || pendingAction !== 'confirm-permit' || pendingTab !== 'readiness' || !pendingReason?.includes('apply the required planning confirmation') || pendingReasonCopy !== pendingReason) {
    throw new Error(`Route readiness next-step metadata is incorrect before shortcuts: ${JSON.stringify({ pendingGap, pendingAction, pendingTab, pendingReason, pendingReasonCopy })}`);
  }
  const saveBeforeShortcuts = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  await routeNextStep.click();
  let shortcutCarryover = await page.getByTestId('route-readiness-carryover').innerText();
  if (!shortcutCarryover.includes('5/7') || !shortcutCarryover.includes('PENDING')) {
    throw new Error(`Route readiness primary shortcut did not confirm the first gap: ${shortcutCarryover}`);
  }
  const nextShortcutGap = await routeNextStep.getAttribute('data-next-readiness-gap');
  const nextShortcutAction = await routeNextStep.getAttribute('data-next-readiness-action');
  const nextShortcutReason = await routeNextStep.getAttribute('data-next-readiness-reason');
  if (nextShortcutGap !== 'ppe' || nextShortcutAction !== 'confirm-ppe' || !nextShortcutReason?.includes('apply the required planning confirmation')) {
    throw new Error(`Route readiness next-step metadata did not advance after permit confirmation: ${JSON.stringify({ nextShortcutGap, nextShortcutAction, nextShortcutReason })}`);
  }
  await page.getByTestId('route-readiness-shortcut-ppe').click();
  await page.getByTestId('route-readiness-shortcut-access').click();
  shortcutCarryover = await page.getByTestId('route-readiness-carryover').innerText();
  if (!shortcutCarryover.includes('7/7') || !shortcutCarryover.includes('READY')) {
    throw new Error(`Route readiness shortcuts did not resolve planning confirmations: ${shortcutCarryover}`);
  }
  const readySaveBeforeDeploy = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  const saveAfterShortcuts = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (saveAfterShortcuts !== saveBeforeShortcuts) {
    throw new Error('Route readiness shortcuts unexpectedly mutated Campaign save.');
  }
  await page.getByTestId('route-readiness-loadout').locator('.route-readiness-open').click();
  await page.getByTestId('deployment-tab-panel-loadout').waitFor({ state: 'visible' });
  await openCampaignRouteBriefing(page);
  await page.getByTestId('route-readiness-permit').locator('.route-readiness-open').click();
  await page.getByTestId('operation-readiness').waitFor({ state: 'visible' });
  const ctaReadinessPanel = await page.getByTestId('operation-readiness').innerText();
  if (!ctaReadinessPanel.includes('OPERATION READINESS') || !ctaReadinessPanel.includes('5/5') || !ctaReadinessPanel.includes('READY')) {
    throw new Error(`Route Readiness Carryover did not open the readiness tab after all shortcuts: ${ctaReadinessPanel}`);
  }
  await openCampaignRouteBriefing(page);
  const routeDeployLabel = await page.getByTestId('route-readiness-next-step').innerText();
  if (!routeDeployLabel.includes('部署任務') && !routeDeployLabel.includes('Deploy now')) {
    throw new Error(`Ready Route Deploy CTA is not visible when route is ready: ${routeDeployLabel}`);
  }
  const readyGap = await page.getByTestId('route-readiness-next-step').getAttribute('data-next-readiness-gap');
  const readyAction = await page.getByTestId('route-readiness-next-step').getAttribute('data-next-readiness-action');
  const readyTab = await page.getByTestId('route-readiness-next-step').getAttribute('data-next-readiness-tab');
  const readyReason = await page.getByTestId('route-readiness-next-step').getAttribute('data-next-readiness-reason');
  if (readyGap !== 'READY' || readyAction !== 'deploy' || readyTab !== 'operation' || readyReason !== 'Ready: deploy with existing campaign dispatch flow') {
    throw new Error(`Ready Route Deploy CTA metadata is incorrect: ${JSON.stringify({ readyGap, readyAction, readyTab, readyReason })}`);
  }
  await page.getByTestId('route-readiness-next-step').click();
  await page.getByTestId('mission-operation').waitFor({ state: 'visible' });
  const readyRouteOperation = await page.getByTestId('mission-operation').innerText();
  if (!readyRouteOperation.includes('MSN-TUT-002') && !readyRouteOperation.includes('變槳系統失效')) {
    throw new Error(`Ready Route Deploy CTA did not start the selected mission operation: ${readyRouteOperation}`);
  }
  const saveAfterRouteDeploy = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (saveAfterRouteDeploy === readySaveBeforeDeploy || !saveAfterRouteDeploy?.includes('DISPATCH')) {
    throw new Error('Ready Route Deploy CTA did not use the existing campaign dispatch flow.');
  }
  await page.getByTestId('operation-info-tab-summary').click();
  const desktopDecisionPrompt = await page.getByTestId('operation-decision-prompt').innerText();
  if (!desktopDecisionPrompt.includes('NEXT DECISION') || !/(ACT|DIAG|EVENT|RISK|ROUND)/.test(desktopDecisionPrompt)) {
    throw new Error(`Desktop Operation decision prompt is incomplete: ${desktopDecisionPrompt}`);
  }
  const desktopDecisionTelemetry = await page.getByTestId('operation-decision-prompt').evaluate((element) => ({
    code: element.getAttribute('data-decision-code'),
    action: element.getAttribute('data-decision-action'),
    reason: element.getAttribute('data-decision-reason'),
    meta: element.getAttribute('data-decision-meta'),
    visibleAction: element.querySelector('[data-testid="operation-decision-action"]')?.textContent,
    visibleReason: element.querySelector('[data-testid="operation-decision-detail"]')?.textContent,
  }));
  if (!['ACT', 'DIAG', 'EVENT', 'RISK', 'ROUND'].includes(desktopDecisionTelemetry.code ?? '') || !desktopDecisionTelemetry.action || !desktopDecisionTelemetry.reason || !desktopDecisionTelemetry.meta || !desktopDecisionTelemetry.visibleAction?.includes(desktopDecisionTelemetry.code ?? '') || desktopDecisionTelemetry.visibleReason !== desktopDecisionTelemetry.reason) {
    throw new Error(`Desktop Operation decision telemetry is incomplete: ${JSON.stringify(desktopDecisionTelemetry)}`);
  }
  if (desktopDecisionPrompt.includes('ACT')) {
    const recommendedSkillCtas = page.locator('[data-testid="recommended-skill-cta"]');
    const recommendedSkillCtaCount = await recommendedSkillCtas.count();
    const recommendedSkillId = recommendedSkillCtaCount === 1 ? await recommendedSkillCtas.getAttribute('data-recommended-skill-id') : '';
    const recommendedSkillTelemetry = recommendedSkillCtaCount === 1
      ? await recommendedSkillCtas.evaluate((element) => ({
        actorIndex: element.getAttribute('data-recommended-actor-index'),
        characterId: element.getAttribute('data-recommended-character-id'),
        id: element.getAttribute('data-recommended-skill-id'),
        reason: element.getAttribute('data-recommended-skill-reason'),
        power: element.getAttribute('data-recommended-skill-power'),
        stageResult: element.getAttribute('data-recommended-skill-stage-result'),
        visibleReason: element.querySelector('[data-testid="recommended-skill-reason"]')?.textContent,
      }))
      : {};
    if (recommendedSkillCtaCount !== 1 || !recommendedSkillId || !/^\d+$/.test(recommendedSkillTelemetry.actorIndex ?? '') || !recommendedSkillTelemetry.characterId || !recommendedSkillTelemetry.reason?.startsWith('Recommended: highest available team power') || recommendedSkillTelemetry.reason !== recommendedSkillTelemetry.visibleReason || !/^\d+$/.test(recommendedSkillTelemetry.power ?? '') || !['clear', 'remains'].includes(recommendedSkillTelemetry.stageResult ?? '')) {
      throw new Error(`Desktop ACT decision should expose exactly one recommended skill CTA with reason telemetry: ${JSON.stringify({ recommendedSkillCtaCount, recommendedSkillId, recommendedSkillTelemetry })}`);
    }
  }
  if (!(await page.getByTestId('operation-summary').isVisible())) {
    throw new Error('Operation summary tab did not open before return-route redeploy check.');
  }
  await page.getByTestId('operation-info-tab-objectives').click();
  const desktopObjectives = await page.getByTestId('operation-objectives').innerText();
  if (!desktopObjectives.includes('STAGE TARGET') || !desktopObjectives.includes('SKILL FORECAST') || !/\+\d+[\s\S]*AP -1[\s\S]*E -\d+[\s\S]*Fatigue/.test(desktopObjectives) || !desktopObjectives.includes('END ROUND FORECAST') || !/F \+\d+[\s\S]*S -\d+[\s\S]*W -\d+/.test(desktopObjectives) || !desktopObjectives.includes('LEARNING OBJECTIVE') || !desktopObjectives.includes('DIAGNOSIS GATE')) {
    throw new Error(`Desktop Operation objectives tab is incomplete: ${desktopObjectives}`);
  }
  if (desktopDecisionPrompt.includes('ACT')) {
    await page.getByTestId('operation-info-tab-summary').click();
    const recommendedSkillCtas = page.locator('[data-testid="recommended-skill-cta"]');
    const recommendedCharacterId = await recommendedSkillCtas.getAttribute('data-recommended-character-id');
    const activeCharacterBefore = await page.locator('.portrait-placeholder').getAttribute('data-source-art-character-id');
    const ctaText = await recommendedSkillCtas.innerText();
    const energyCost = Number(ctaText.match(/E -(\d+)/)?.[1] ?? NaN);
    const stageBefore = await page.getByTestId('operation-summary-stage').innerText();
    const progressBefore = Number((await page.getByTestId('operation-summary-progress').innerText()).split('/')[0]);
    const apBefore = Number(await page.getByTestId('active-runtime-ap').innerText());
    const energyBefore = Number(await page.getByTestId('active-runtime-energy').innerText());
    await recommendedSkillCtas.click();
    await page.waitForFunction(
      ({ activeCharacterBefore, recommendedCharacterId, apBefore, energyBefore, energyCost }) => {
        const activeCharacterId = document.querySelector('.portrait-placeholder')?.getAttribute('data-source-art-character-id');
        const energy = Number(document.querySelector('[data-testid="active-runtime-energy"]')?.textContent ?? 'NaN');
        const progress = Number(document.querySelector('[data-testid="operation-summary-progress"]')?.textContent?.split('/')[0] ?? 'NaN');
        const ap = Number(document.querySelector('[data-testid="active-runtime-ap"]')?.textContent ?? 'NaN');
        const sameActor = activeCharacterBefore === recommendedCharacterId;
        return Number.isFinite(progress)
          && (!recommendedCharacterId || activeCharacterId === recommendedCharacterId)
          && (sameActor ? ap === apBefore - 1 && energy === energyBefore - energyCost : Number.isFinite(ap) && Number.isFinite(energy));
      },
      { activeCharacterBefore, recommendedCharacterId, apBefore, energyBefore, energyCost },
      { timeout: 5000 },
    );
    const stageAfter = await page.getByTestId('operation-summary-stage').innerText();
    const progressAfter = Number((await page.getByTestId('operation-summary-progress').innerText()).split('/')[0]);
    const apAfter = Number(await page.getByTestId('active-runtime-ap').innerText());
    const energyAfter = Number(await page.getByTestId('active-runtime-energy').innerText());
    const activeCharacterAfter = await page.locator('.portrait-placeholder').getAttribute('data-source-art-character-id');
    const sameActor = activeCharacterBefore === recommendedCharacterId;
    if (!(progressAfter > progressBefore || stageAfter !== stageBefore) || Number.isNaN(energyCost) || activeCharacterAfter !== recommendedCharacterId || (sameActor && (apAfter !== apBefore - 1 || energyAfter !== energyBefore - energyCost))) {
      throw new Error(`Desktop recommended team skill CTA did not execute settlement: ${JSON.stringify({ recommendedCharacterId, activeCharacterBefore, activeCharacterAfter, stageBefore, stageAfter, progressBefore, progressAfter, apBefore, apAfter, energyBefore, energyAfter, energyCost })}`);
    }
  }
  await page.getByTestId('abort-operation-open').click();
  await page.getByTestId('abort-operation-confirmation').waitFor({ state: 'visible' });
  const abortCopy = await page.getByTestId('abort-operation-copy').innerText();
  if (!abortCopy.includes('未結算') || !abortCopy.includes('未寫任務結果') || !abortCopy.includes('mission outcome history')) {
    throw new Error(`Desktop abort confirmation copy is incomplete: ${abortCopy}`);
  }
  await page.getByTestId('abort-operation-cancel').click();
  await page.getByTestId('mission-operation').waitFor({ state: 'visible' });
  if (!(await page.getByTestId('next-round').isVisible())) {
    throw new Error('Cancelling Operation abort did not keep the active sortie on screen.');
  }
  if ((await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== saveAfterRouteDeploy) {
    throw new Error('Desktop abort cancel unexpectedly mutated Campaign save.');
  }
  await page.getByTestId('abort-operation-open').click();
  await page.getByTestId('abort-operation-confirm').click();
  await openCampaignRouteBriefing(page);
  const operationReturnNotice = await page.getByTestId('operation-return-notice').innerText();
  if (!operationReturnNotice.includes('MSN-TUT-002') || !operationReturnNotice.includes('未結算') || !operationReturnNotice.includes('mission outcome history')) {
    throw new Error(`Operation return notice did not explain the abort context: ${operationReturnNotice}`);
  }
  const operationReturnMetadata = await page.getByTestId('operation-return-notice').evaluate((element) => ({
    missionId: element.getAttribute('data-return-mission-id'),
    reason: element.getAttribute('data-return-reason'),
    selected: element.getAttribute('data-return-selected'),
    canRedeploy: element.getAttribute('data-return-can-redeploy'),
  }));
  if (
    operationReturnMetadata.missionId !== 'MSN-TUT-002'
    || operationReturnMetadata.reason !== 'abort'
    || operationReturnMetadata.selected !== 'true'
    || operationReturnMetadata.canRedeploy !== 'false'
  ) {
    throw new Error(`Operation return notice metadata is incorrect: ${JSON.stringify(operationReturnMetadata)}`);
  }
  if (!(await page.getByTestId('operation-return-route').isVisible())) {
    throw new Error('Operation return notice did not expose the same-mission route shortcut.');
  }
  const operationReturnRouteMetadata = await page.getByTestId('operation-return-route').evaluate((element) => ({
    action: element.getAttribute('data-return-action'),
    targetMissionId: element.getAttribute('data-target-mission-id'),
    selected: element.getAttribute('data-target-selected'),
  }));
  if (
    operationReturnRouteMetadata.action !== 'select-route'
    || operationReturnRouteMetadata.targetMissionId !== 'MSN-TUT-002'
    || operationReturnRouteMetadata.selected !== 'true'
  ) {
    throw new Error(`Operation return route metadata is incorrect: ${JSON.stringify(operationReturnRouteMetadata)}`);
  }
  if (await page.getByTestId('operation-return-redeploy').count()) {
    throw new Error('Operation return notice must not expose a direct redeploy shortcut.');
  }
  const saveAfterAbortReturn = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (saveAfterAbortReturn !== saveAfterRouteDeploy) {
    throw new Error('Operation return notice unexpectedly mutated Campaign save.');
  }
  const abortedSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  const abortedMissionOutcomes = (abortedSave?.fleetOperationsHistory ?? []).filter((item) => item.kind === 'MISSION' && item.missionId === 'MSN-TUT-002');
  if (
    abortedSave?.completedMissionIds?.includes('MSN-TUT-002')
    || abortedSave?.bestScores?.['MSN-TUT-002']
    || abortedMissionOutcomes.length > 0
  ) {
    throw new Error(`Operation abort wrote mission settlement data: ${JSON.stringify(abortedSave)}`);
  }
  await page.getByTestId('operation-return-dismiss').click();
  if (await page.getByTestId('operation-return-notice').count()) {
    throw new Error('Operation return notice dismiss did not clear the session-only notice.');
  }
  const saveAfterNoticeDismiss = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (saveAfterNoticeDismiss !== saveAfterRouteDeploy) {
    throw new Error('Operation return notice dismiss unexpectedly mutated Campaign save.');
  }
  await page.getByTestId('route-readiness-next-step').click();
  await page.getByTestId('mission-operation').waitFor({ state: 'visible' });
  const secondOperationLogSelected = await page.getByTestId('operation-info-tab-log').getAttribute('aria-selected');
  if (secondOperationLogSelected !== 'true' || !(await page.getByTestId('operation-log-list').isVisible())) {
    throw new Error('New Operation did not reset info tab to LOG after previous SUMMARY state.');
  }
  const saveAfterSecondRouteDeploy = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (saveAfterSecondRouteDeploy === saveAfterNoticeDismiss || !saveAfterSecondRouteDeploy?.includes('DISPATCH')) {
    throw new Error('Second Route Deploy did not use the existing campaign dispatch flow.');
  }
  await page.getByTestId('abort-operation-open').click();
  await page.getByTestId('abort-operation-confirm').click();
  await openCampaignRouteBriefing(page);
  await page.getByTestId('operation-return-notice').waitFor({ state: 'visible' });
  const saveAfterSecondAbortReturn = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (saveAfterSecondAbortReturn !== saveAfterSecondRouteDeploy) {
    throw new Error('Second Operation return notice unexpectedly mutated Campaign save.');
  }
  await page.getByTestId('nav-collection').click();
  await page.getByTestId('collection-screen').waitFor({ state: 'visible' });
  await page.getByTestId('nav-campaign').click();
  await openCampaignRouteBriefing(page);
  if (await page.getByTestId('operation-return-notice').count()) {
    throw new Error('Operation return notice survived main mode switch.');
  }
  const saveAfterNoticeModeSwitch = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (saveAfterNoticeModeSwitch !== saveAfterSecondRouteDeploy) {
    throw new Error('Operation return notice mode switch unexpectedly mutated Campaign save.');
  }
  await page.reload({ waitUntil: 'networkidle' });
  await openCampaignRouteBriefing(page);
  if (await page.getByTestId('operation-return-notice').count()) {
    throw new Error('Session-only Operation return notice survived reload.');
  }
  await openCampaignRouteMissions(page);
  const restoredProgress = await page.getByTestId('campaign-progress').innerText();
  if (!restoredProgress.includes('1/15') || /(^|\n)0 XP($|\n)/.test(restoredProgress)) {
    throw new Error(`Campaign progress did not restore after reload: ${restoredProgress}`);
  }
  await page.getByTestId('deployment-tab-loadout').click();
  const restoredMaintenance = await page.getByTestId('equipment-maintenance').innerText();
  if (!restoredMaintenance.includes('92%') || !restoredMaintenance.includes('95%') || !(await page.getByTestId('repair-equipment').isEnabled())) {
    throw new Error(`Equipment wear did not restore after reload: ${restoredMaintenance}`);
  }
  await page.getByTestId('repair-equipment').click();
  const repairedMaintenance = await page.getByTestId('equipment-maintenance').innerText();
  const repairedSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  if (!repairedMaintenance.includes('100%') || repairedSave?.equipmentCondition?.EQ0051 !== undefined || !(repairedSave?.maintenanceCredits < parsedProgress.maintenanceCredits)) {
    throw new Error(`Equipment repair did not restore full condition and deduct MNT: ${repairedMaintenance} | ${JSON.stringify(repairedSave)}`);
  }
  await page.getByTestId('deployment-tab-crew').click();
  const restoredCrewReadiness = await page.getByTestId('crew-readiness').innerText();
  if (!restoredCrewReadiness.includes(`${parsedProgress.recoveryTokens} RST`) || !restoredCrewReadiness.includes('gameplay abstraction')) {
    throw new Error(`Crew readiness did not restore after reload: ${restoredCrewReadiness}`);
  }
  await openCampaignRouteMissions(page);
  const restoredMissionNodes = await page.locator('[data-testid^="mission-node-"]').evaluateAll((nodes) => nodes.map((node) => ({
    id: node.getAttribute('data-testid'),
    className: node.getAttribute('class'),
    status: node.getAttribute('data-status'),
    text: node.textContent?.replace(/\s+/g, ' ').trim().slice(0, 120),
  })));
  const firstMissionNode = restoredMissionNodes.find((node) => node.id === 'mission-node-MSN-TUT-001');
  const secondMissionNode = restoredMissionNodes.find((node) => node.id === 'mission-node-MSN-TUT-002');
  const thirdMissionNode = restoredMissionNodes.find((node) => node.id === 'mission-node-MSN-TUT-003');
  if (!firstMissionNode || !secondMissionNode || !thirdMissionNode) {
    throw new Error(`Restored Campaign map is missing MSN-TUT-002: ${JSON.stringify(restoredMissionNodes)}`);
  }
  if (firstMissionNode.status !== 'completed') throw new Error(`Completed mission is not marked completed on the map: ${JSON.stringify(firstMissionNode)}`);
  if (secondMissionNode.status !== 'available') throw new Error(`Next mission is not available on the map: ${JSON.stringify(secondMissionNode)}`);
  if (thirdMissionNode.status !== 'locked') throw new Error(`Prerequisite-locked mission is unexpectedly selectable: ${JSON.stringify(thirdMissionNode)}`);
  if (!firstMissionNode.text?.includes('BEST')) throw new Error(`Completed mission does not expose its best score: ${JSON.stringify(firstMissionNode)}`);
  await openCampaignRouteMissions(page);
  await page.getByTestId('mission-node-MSN-TUT-002').click();
  await page.getByTestId('route-readiness-carryover').waitFor({ state: 'visible' });
  await page.getByTestId('deployment-tab-loadout').click();
  if (!(await page.getByTestId('loadout-quality').innerText()).includes('3/3')) {
    throw new Error('Selecting a mission node did not restore its recommended loadout.');
  }
  await openCampaignRouteMissions(page);
  await page.screenshot({ path: screenshots.missionMap, fullPage: true });

  await page.getByTestId('nav-codex').click();
  await page.getByTestId('codex-screen').waitFor({ state: 'visible' });
  const codexCards = page.locator('.codex-card');
  if ((await codexCards.count()) !== 3 || !(await page.getByTestId('codex-pagination').innerText()).includes('1/5')) {
    throw new Error(`Codex first page did not render 3 of 15 entries: ${await codexCards.count()}`);
  }
  const unlockedCodexCards = page.locator('.codex-card[data-unlocked="true"]');
  if ((await unlockedCodexCards.count()) !== 1) {
    throw new Error(`Codex reload state expected 1 unlocked entry, received ${await unlockedCodexCards.count()}.`);
  }
  const codexCount = await page.getByTestId('codex-unlock-count').innerText();
  const firstCodex = await page.getByTestId('codex-entry-KDX-001').innerText();
  if (!codexCount.includes('1/15') || !firstCodex.includes('主軸承趨勢與多源證據')) {
    throw new Error(`Codex unlock content is incomplete: ${codexCount} | ${firstCodex}`);
  }
  await page.screenshot({ path: screenshots.codex, fullPage: true });

  await page.getByTestId('nav-collection').click();
  await page.getByTestId('collection-screen').waitFor({ state: 'visible' });
  if ((await page.getByTestId('collection-career-unlocked-count').innerText()).trim() !== '64/300 Career') {
    throw new Error(`Career unlocks did not persist into Collection: ${await page.getByTestId('collection-career-unlocked-count').innerText()}`);
  }
  const collectionCards = page.locator('.collection-card');
  if ((await collectionCards.count()) !== 5 || !(await page.getByTestId('collection-page-status').innerText()).includes('1/60 · 300 CREW')) {
    throw new Error(`Collection first page did not render 5 of 300 characters: ${await collectionCards.count()}`);
  }
  const rewardedCharacter = await page.getByTestId('collection-character-CHR-GOV-001').innerText();
  if (!rewardedCharacter.includes('TRK001 · TRACK L2') || !rewardedCharacter.includes('MASTERY L2') || !/\b1\d{2}\s*\/\s*250\s*XP\b/.test(rewardedCharacter)) {
    throw new Error(`Character XP was not reflected in collection: ${rewardedCharacter}`);
  }
  await page.getByTestId('collection-tab-resources').click();
  const collectionInventory = await page.getByTestId('collection-equipment-inventory').innerText();
  if (!collectionInventory.includes('40/200') || !collectionInventory.includes('L1\n40/40') || !collectionInventory.includes('SENSOR\n5/25')) {
    throw new Error(`Collection Equipment inventory is incomplete: ${collectionInventory}`);
  }
  const collectionMaintenance = await page.getByTestId('collection-maintenance-summary').innerText();
  if (!collectionMaintenance.includes('MNT') || !collectionMaintenance.includes('40/40') || !collectionMaintenance.includes('已有損耗\n1')) {
    throw new Error(`Collection maintenance summary is incomplete: ${collectionMaintenance}`);
  }
  const collectionCrewReadiness = await page.getByTestId('collection-crew-readiness').innerText();
  if (!collectionCrewReadiness.includes('CREW READINESS') || !collectionCrewReadiness.includes('RST') || !collectionCrewReadiness.includes('穩定')) {
    throw new Error(`Collection Crew readiness summary is incomplete: ${collectionCrewReadiness}`);
  }
  await page.getByTestId('save-generate').click();
  const generatedSave = await page.getByTestId('save-export-text').inputValue();
  const parsedSave = JSON.parse(generatedSave);
  if (parsedSave.format !== 'OWM_CAMPAIGN_SAVE' || parsedSave.schemaVersion !== 5 || !parsedSave.progress || parsedSave.progress.ownedEquipmentIds?.length !== 40 || parsedSave.progress.equipmentCondition?.EQ0126 !== 95 || typeof parsedSave.progress.crewFatigue !== 'object') {
    throw new Error('Collection save manager did not generate a valid campaign envelope.');
  }
  if (!(await page.getByTestId('save-download').isVisible())) {
    throw new Error('Generated campaign save is not downloadable.');
  }
  await page.getByTestId('collection-tab-crew').click();
  await page.getByTestId('collection-search').fill('CHR-MAR-204');
  await assertSourceArtSurface(page, '[data-testid="collection-character-CHR-MAR-204"]', 'Collection Batch021 source-art card', 'CHR-MAR-204');
  await page.getByTestId('collection-search').fill('');
  const collectionImages = page.locator('.collection-art img');
  const visibleImageCount = Math.min(6, await collectionImages.count());
  for (let index = 0; index < visibleImageCount; index += 1) {
    await collectionImages.nth(index).evaluate((image) => image.decode());
  }
  await page.screenshot({ path: screenshots.collection });

  const campaignBeforeSandbox = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  await page.getByTestId('nav-sandbox').click();
  const sandboxBoss = page.getByTestId('sandbox-boss');
  await sandboxBoss.waitFor({ state: 'visible' });
  if ((await sandboxBoss.locator('option').count()) !== 100) {
    throw new Error('Sandbox does not expose all 100 bosses.');
  }
  await sandboxBoss.selectOption('BOSS100');
  await page.getByTestId('deployment-tab-loadout').click();
  if ((await page.getByTestId('deployment-equipment').locator('option:disabled').count()) !== 0 || (await page.getByTestId('deployment-spare').locator('option:disabled').count()) !== 0) {
    throw new Error('Sandbox did not unlock all 200 equipment items.');
  }
  await page.getByTestId('deploy-mission').click();
  await page.locator('.phaser-host canvas').waitFor({ state: 'visible', timeout: 15000 });
  const sandboxOperationLogSelected = await page.getByTestId('operation-info-tab-log').getAttribute('aria-selected');
  if (sandboxOperationLogSelected !== 'true' || !(await page.getByTestId('operation-log-list').isVisible())) {
    throw new Error('Sandbox Operation did not default info tab to LOG.');
  }
  const sandboxClassRule = await page.getByTestId('boss-class-rule').innerText();
  if (!sandboxClassRule.includes('STR') || !sandboxClassRule.includes('結構共振')) {
    throw new Error(`Sandbox Boss class rule is missing: ${sandboxClassRule}`);
  }
  const sandboxSkillNames = await page.locator('.skill-copy b').allTextContents();
  if (sandboxSkillNames.some((name) => name.includes('🔒'))) {
    throw new Error(`Sandbox unexpectedly applied mastery locks: ${sandboxSkillNames.join(' | ')}`);
  }
  const campaignAfterSandbox = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (campaignAfterSandbox !== campaignBeforeSandbox) {
    throw new Error('Sandbox modified campaign persistence.');
  }
  await page.screenshot({ path: screenshots.sandbox, fullPage: true });

  // 以 768px 實際部署並觸發事件，確認沒有橫向溢位且底部 touch action 可操作。
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
  });
  await mobilePage.reload({ waitUntil: 'networkidle' });
  await openCampaignRouteMissions(mobilePage);
  if ((await mobilePage.locator('.campaign-chapter').count()) !== 5) throw new Error('Mobile Campaign map does not expose all five chapters.');
  const mobileMapLayout = await mobilePage.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (mobileMapLayout.scrollWidth > mobileMapLayout.width + 1) {
    throw new Error(`Mobile mission map overflows horizontally: ${mobileMapLayout.width} / ${mobileMapLayout.scrollWidth}`);
  }
  await mobilePage.screenshot({ path: screenshots.mobileMissionMap, fullPage: true });
  await mobilePage.getByTestId('deployment-tab-crew').click();
  if (!(await mobilePage.getByTestId('crew-roster-filters').isVisible()) || !(await mobilePage.getByTestId('crew-rotation-advisor').isVisible())) {
    throw new Error('Mobile Crew tab is missing roster filters or rotation advisor.');
  }
  const mobileCrewLayout = await mobilePage.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (mobileCrewLayout.scrollWidth > mobileCrewLayout.width + 1) throw new Error(`Mobile Crew tab overflows horizontally: ${mobileCrewLayout.width} / ${mobileCrewLayout.scrollWidth}`);
  await mobilePage.screenshot({ path: screenshots.mobileCrewRotation, fullPage: true });
  await mobilePage.getByTestId('deployment-tab-forecast').click();
  if (!(await mobilePage.getByTestId('forecast-rotation-advisor').isVisible())) throw new Error('Mobile Dispatch Forecast is missing Crew Rotation Advisor.');
  const mobileForecastLayout = await mobilePage.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (mobileForecastLayout.scrollWidth > mobileForecastLayout.width + 1) throw new Error(`Mobile Dispatch Forecast overflows horizontally: ${mobileForecastLayout.width} / ${mobileForecastLayout.scrollWidth}`);
  await mobilePage.screenshot({ path: screenshots.mobileForecast, fullPage: true });
  const motionToggle = mobilePage.getByTestId('motion-toggle');
  await motionToggle.click();
  if ((await motionToggle.getAttribute('aria-pressed')) !== 'true') {
    throw new Error('Reduced-motion preference did not activate.');
  }
  await confirmOperationPlanning(mobilePage);
  await mobilePage.getByTestId('deploy-mission').click();
  await mobilePage.locator('.phaser-host canvas').waitFor({ state: 'visible', timeout: 15000 });
  const mobileDock = mobilePage.getByTestId('mobile-action-dock');
  if (!(await mobileDock.isVisible())) throw new Error('Mobile action dock is not visible at 768px.');
  const mobileLayout = await mobilePage.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (mobileLayout.scrollWidth > mobileLayout.width + 1) {
    throw new Error(`Mobile layout overflows horizontally: ${mobileLayout.width} / ${mobileLayout.scrollWidth}`);
  }
  if (!(await mobilePage.getByTestId('operation-info-tab-log').isVisible()) || !(await mobilePage.getByTestId('operation-info-tab-summary').isVisible()) || !(await mobilePage.getByTestId('operation-info-tab-objectives').isVisible())) {
    throw new Error('Mobile Operation info tabs are not visible.');
  }
  if ((await mobilePage.getByRole('tab', { name: 'SUMMARY' }).getAttribute('aria-controls')) !== 'operation-info-panel-summary') {
    throw new Error('Mobile Operation SUMMARY tab does not control the summary tabpanel.');
  }
  await mobilePage.getByRole('tab', { name: 'SUMMARY' }).click();
  if (!(await mobilePage.getByRole('tabpanel', { name: 'SUMMARY' }).isVisible())) {
    throw new Error('Mobile Operation SUMMARY tabpanel is not exposed with a role.');
  }
  const mobileOperationSummary = await mobilePage.getByTestId('operation-summary').innerText();
  if (!mobileOperationSummary.includes('STAGE') || !mobileOperationSummary.includes('PROGRESS') || !mobileOperationSummary.includes('SCENE') || !mobileOperationSummary.includes('SOURCE') || !mobileOperationSummary.includes('QA') || !mobileOperationSummary.includes('SCN003') || !mobileOperationSummary.includes('INTEGRATED') || !mobileOperationSummary.includes('V004') || !mobileOperationSummary.includes('ENGINEERING QA PASSED') || !mobileOperationSummary.includes('TURBINE') || !mobileOperationSummary.includes('WTG-001')) {
    throw new Error(`Mobile Operation summary is incomplete: ${mobileOperationSummary}`);
  }
  const mobileSummaryLayout = await mobilePage.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (mobileSummaryLayout.scrollWidth > mobileSummaryLayout.width + 1) {
    throw new Error(`Mobile Operation summary overflows horizontally: ${mobileSummaryLayout.width} / ${mobileSummaryLayout.scrollWidth}`);
  }
  await mobilePage.getByRole('tab', { name: 'OBJECTIVES' }).click();
  if (!(await mobilePage.getByRole('tabpanel', { name: 'OBJECTIVES' }).isVisible())) {
    throw new Error('Mobile Operation OBJECTIVES tabpanel is not exposed with a role.');
  }
  const mobileObjectives = await mobilePage.getByTestId('operation-objectives').innerText();
  if (!mobileObjectives.includes('STAGE TARGET') || !mobileObjectives.includes('SKILL FORECAST') || !/\+\d+[\s\S]*AP -1[\s\S]*E -\d+[\s\S]*Fatigue/.test(mobileObjectives) || !mobileObjectives.includes('END ROUND FORECAST') || !/F \+\d+[\s\S]*S -\d+[\s\S]*W -\d+/.test(mobileObjectives) || !mobileObjectives.includes('LEARNING OBJECTIVE') || !mobileObjectives.includes('DIAGNOSIS GATE') || !mobileObjectives.includes('RISK FLOOR')) {
    throw new Error(`Mobile Operation objectives are incomplete: ${mobileObjectives}`);
  }
  const mobileObjectivesLayout = await mobilePage.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (mobileObjectivesLayout.scrollWidth > mobileObjectivesLayout.width + 1) {
    throw new Error(`Mobile Operation objectives overflow horizontally: ${mobileObjectivesLayout.width} / ${mobileObjectivesLayout.scrollWidth}`);
  }
  await mobilePage.getByRole('tab', { name: 'LOG' }).click();
  if (!(await mobilePage.getByRole('tabpanel', { name: 'LOG' }).isVisible())) {
    throw new Error('Mobile Operation LOG tabpanel is not exposed with a role.');
  }
  if (!(await mobilePage.getByTestId('operation-log-list').isVisible())) throw new Error('Mobile Operation log tab did not restore the log list.');
  await commitEndRound(mobilePage, { buttonTestId: 'mobile-next-round', promptTestId: 'mobile-round-commit-copy', expectPrompt: true });
  const mobileHazard = await mobilePage.getByTestId('hazard-event').innerText();
  if (!mobileHazard.includes('傳動衝擊')) throw new Error(`Mobile hazard telegraph is missing: ${mobileHazard}`);
  const mobileBranch = mobilePage.getByTestId('branch-event-panel');
  if (!(await mobileBranch.isVisible())) throw new Error('Mobile branch response window is not visible.');
  const mobileReactiveChoices = mobilePage.locator('[data-testid^="branch-reactive-"]:not(:disabled)');
  const mobileReactiveCount = await mobileReactiveChoices.count();
  if (mobileReactiveCount !== 0) throw new Error('Fresh L1 mobile team unexpectedly exposes a Reactive response before Track L3.');
  await mobilePage.getByTestId('branch-accept').click();
  if (await mobileBranch.isVisible()) throw new Error('Mobile full-consequence response did not resolve the branch event.');
  await mobilePage.screenshot({ path: screenshots.mobile, fullPage: true });
  const mobileSaveBeforeAbort = await mobilePage.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  await mobilePage.getByTestId('mobile-abort-operation-open').click();
  if (!(await mobilePage.getByTestId('mobile-abort-operation-confirm').isVisible()) || !(await mobilePage.getByTestId('mobile-abort-operation-cancel').isVisible())) {
    throw new Error('Mobile abort confirmation controls are not visible.');
  }
  const mobileAbortCopy = await mobilePage.getByTestId('mobile-abort-operation-copy').innerText();
  if (!mobileAbortCopy.includes('未結算') || !mobileAbortCopy.includes('未寫任務結果')) {
    throw new Error(`Mobile abort confirmation copy is incomplete: ${mobileAbortCopy}`);
  }
  await mobilePage.getByTestId('mobile-abort-operation-cancel').click();
  await mobilePage.getByTestId('mission-operation').waitFor({ state: 'visible' });
  if (!(await mobilePage.getByTestId('mobile-next-round').isVisible())) throw new Error('Mobile abort cancel did not keep the active Operation.');
  if ((await mobilePage.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== mobileSaveBeforeAbort) throw new Error('Mobile abort cancel unexpectedly mutated Campaign save.');
  await mobilePage.getByTestId('mobile-abort-operation-open').click();
  await mobilePage.getByTestId('mobile-abort-operation-confirm').click();
  await openCampaignRouteBriefing(mobilePage);
  const mobileReturnNotice = await mobilePage.getByTestId('operation-return-notice').innerText();
  const mobileReturnFlags = await mobilePage.getByTestId('operation-return-flags').innerText();
  if (!mobileReturnNotice.includes('未結算') || !mobileReturnNotice.includes('mission outcome history') || !mobileReturnFlags.includes('未寫存檔') || !mobileReturnFlags.includes('僅回 Route')) {
    throw new Error(`Mobile return notice copy is incomplete: ${mobileReturnNotice} | ${mobileReturnFlags}`);
  }
  const mobileReturnMetadata = await mobilePage.getByTestId('operation-return-notice').evaluate((element) => ({
    missionId: element.getAttribute('data-return-mission-id'),
    reason: element.getAttribute('data-return-reason'),
    selected: element.getAttribute('data-return-selected'),
    canRedeploy: element.getAttribute('data-return-can-redeploy'),
  }));
  if (
    mobileReturnMetadata.missionId !== 'MSN-TUT-001'
    || mobileReturnMetadata.reason !== 'abort'
    || mobileReturnMetadata.selected !== 'true'
    || mobileReturnMetadata.canRedeploy !== 'false'
  ) {
    throw new Error(`Mobile return notice metadata is incorrect: ${JSON.stringify(mobileReturnMetadata)}`);
  }
  const mobileReturnRouteMetadata = await mobilePage.getByTestId('operation-return-route').evaluate((element) => ({
    action: element.getAttribute('data-return-action'),
    targetMissionId: element.getAttribute('data-target-mission-id'),
    selected: element.getAttribute('data-target-selected'),
  }));
  if (
    mobileReturnRouteMetadata.action !== 'select-route'
    || mobileReturnRouteMetadata.targetMissionId !== 'MSN-TUT-001'
    || mobileReturnRouteMetadata.selected !== 'true'
  ) {
    throw new Error(`Mobile return route metadata is incorrect: ${JSON.stringify(mobileReturnRouteMetadata)}`);
  }
  const mobileNoticeLayout = await mobilePage.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (mobileNoticeLayout.scrollWidth > mobileNoticeLayout.width + 1) throw new Error(`Mobile return notice overflows horizontally: ${mobileNoticeLayout.width} / ${mobileNoticeLayout.scrollWidth}`);
  const mobileSaveAfterAbortNotice = await mobilePage.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (mobileSaveAfterAbortNotice !== mobileSaveBeforeAbort) throw new Error('Mobile return notice unexpectedly mutated Campaign save.');
  await mobilePage.screenshot({ path: screenshots.mobileReturnNotice, fullPage: true });
  await mobilePage.getByTestId('operation-return-dismiss').click();
  if (await mobilePage.getByTestId('operation-return-notice').count()) throw new Error('Mobile return notice dismiss did not clear the notice.');
  if ((await mobilePage.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== mobileSaveBeforeAbort) throw new Error('Mobile return notice dismiss unexpectedly mutated Campaign save.');
  await mobilePage.close();

  // 直接載入已完成前三章的合法 Campaign progress，驗證 Chapter 04 有獨立 deck 與較高 escalation。
  const s4Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  s4Page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`s4: ${message.text()}`);
  });
  s4Page.on('pageerror', (error) => errors.push(`s4: ${error.message}`));
  await s4Page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await s4Page.evaluate(() => {
    // 只提供 v1 舊存檔，驗證 App 會依已完成的章末任務重建 inventory 並寫入 v5。
    localStorage.removeItem('owm.campaign.v5');
    localStorage.removeItem('owm.campaign.v3');
    localStorage.removeItem('owm.campaign.v2');
    localStorage.setItem('owm.campaign.v1', JSON.stringify({
      schemaVersion: 1,
      totalXp: 4200,
      completedMissionIds: ['MSN-TUT-001', 'MSN-TUT-002', 'MSN-TUT-003', 'MSN-ADV-004', 'MSN-ADV-005', 'MSN-ADV-006', 'MSN-ELT-007', 'MSN-ELT-008', 'MSN-ELT-009'],
      unlockedMissionIds: ['MSN-TUT-001', 'MSN-TUT-002', 'MSN-TUT-003', 'MSN-ADV-004', 'MSN-ADV-005', 'MSN-ADV-006', 'MSN-ELT-007', 'MSN-ELT-008', 'MSN-ELT-009', 'MSN-MST-010'],
      bestScores: {},
      characterXp: { 'CHR-GOV-001': 250, 'CHR-MAR-176': 250, 'CHR-OMI-223': 250 },
    }));
  });
  await s4Page.reload({ waitUntil: 'networkidle' });
  await s4Page.getByTestId('deployment-tab-loadout').click();
  const migratedInventory = await s4Page.getByTestId('equipment-inventory').innerText();
  const migratedSave = await s4Page.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  if (!migratedInventory.includes('160/200') || migratedSave?.schemaVersion !== 5 || migratedSave?.ownedEquipmentIds?.length !== 160 || migratedSave?.maintenanceCredits !== 80 || migratedSave?.recoveryTokens !== 3 || Object.keys(migratedSave?.crewFatigue ?? {}).length !== 0 || Object.keys(migratedSave?.equipmentCondition ?? {}).length !== 0) {
    throw new Error(`Legacy v1 inventory migration failed: ${migratedInventory} | ${JSON.stringify(migratedSave)}`);
  }
  await openCampaignRouteMissions(s4Page);
  const s4MissionNode = s4Page.getByTestId('mission-node-MSN-MST-010');
  if (!(await s4MissionNode.isEnabled())) throw new Error('Chapter 04 first mission is not selectable with valid prerequisite progress.');
  await s4MissionNode.click();
  await openCampaignRouteBriefing(s4Page);
  const s4DeckText = await s4Page.getByTestId('mission-event-deck').innerText();
  if (!s4DeckText.includes('R01') || !s4DeckText.includes('天候惡化') || !s4DeckText.includes('×1.15') || !s4DeckText.includes('備品延誤') || !s4DeckText.includes('×1.35') || !s4DeckText.includes('二次故障') || !s4DeckText.includes('×1.55')) {
    throw new Error(`Chapter 04 event deck is incomplete: ${s4DeckText}`);
  }
  await s4Page.screenshot({ path: screenshots.s4EventDeck, fullPage: true });
  await confirmOperationPlanning(s4Page);
  await s4Page.getByTestId('deploy-mission').click();
  await s4Page.locator('.phaser-host canvas').waitFor({ state: 'visible', timeout: 15000 });
  await commitEndRound(s4Page, { expectPrompt: true });
  const s4BranchPanel = s4Page.getByTestId('branch-event-panel');
  await s4BranchPanel.waitFor({ state: 'visible' });
  const s4BranchText = await s4BranchPanel.innerText();
  if (!s4BranchText.includes('天候惡化') || !s4BranchText.includes('×1.15') || !s4BranchText.includes('-9')) {
    throw new Error(`Chapter 04 first escalation is incorrect: ${s4BranchText}`);
  }
  await s4Page.screenshot({ path: screenshots.s4Branch, fullPage: true });
  const s4WeatherBefore = Number((await s4Page.locator('.resource-meter.weather b').innerText()).replace('%', ''));
  await s4Page.getByTestId('branch-accept').click();
  const s4WeatherAfter = Number((await s4Page.locator('.resource-meter.weather b').innerText()).replace('%', ''));
  if (s4WeatherBefore - s4WeatherAfter !== 9) throw new Error(`Chapter 04 ×1.15 weather penalty should be 9: ${s4WeatherBefore} -> ${s4WeatherAfter}`);
  await s4Page.close();

  // 完成前四章後驗證 Chapter 05 S5 終局任務、獨立 deck 與 15 關鏈結。
  const s5Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  s5Page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`s5: ${message.text()}`);
  });
  s5Page.on('pageerror', (error) => errors.push(`s5: ${error.message}`));
  await s5Page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await s5Page.evaluate(() => {
    localStorage.removeItem('owm.campaign.v5');
    localStorage.setItem('owm.campaign.v3', JSON.stringify({
      schemaVersion: 3,
      totalXp: 6000,
      completedMissionIds: ['MSN-TUT-001', 'MSN-TUT-002', 'MSN-TUT-003', 'MSN-ADV-004', 'MSN-ADV-005', 'MSN-ADV-006', 'MSN-ELT-007', 'MSN-ELT-008', 'MSN-ELT-009', 'MSN-MST-010', 'MSN-MST-011', 'MSN-MST-012'],
      unlockedMissionIds: ['MSN-TUT-001', 'MSN-TUT-002', 'MSN-TUT-003', 'MSN-ADV-004', 'MSN-ADV-005', 'MSN-ADV-006', 'MSN-ELT-007', 'MSN-ELT-008', 'MSN-ELT-009', 'MSN-MST-010', 'MSN-MST-011', 'MSN-MST-012', 'MSN-FNL-013'],
      bestScores: {},
      characterXp: {},
      ownedEquipmentIds: [],
      maintenanceCredits: 80,
      equipmentCondition: {},
    }));
  });
  await s5Page.reload({ waitUntil: 'networkidle' });
  const migratedV3Save = await s5Page.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  if (migratedV3Save?.schemaVersion !== 5 || migratedV3Save?.recoveryTokens !== 3 || Object.keys(migratedV3Save?.crewFatigue ?? {}).length !== 0) {
    throw new Error(`Legacy v3 Crew readiness migration failed: ${JSON.stringify(migratedV3Save)}`);
  }
  await openCampaignRouteMissions(s5Page);
  const s5MissionNode = s5Page.getByTestId('mission-node-MSN-FNL-013');
  if (!(await s5MissionNode.isEnabled()) || !(await s5MissionNode.innerText()).includes('S5')) throw new Error('Chapter 05 first S5 mission is not available after Chapter 04 completion.');
  await s5MissionNode.click();
  await openCampaignRouteBriefing(s5Page);
  const s5DeckText = await s5Page.getByTestId('mission-event-deck').innerText();
  if (!s5DeckText.includes('天候惡化') || !s5DeckText.includes('×1.35') || !s5DeckText.includes('二次故障') || !s5DeckText.includes('×1.60') || !s5DeckText.includes('備品延誤') || !s5DeckText.includes('×1.85')) {
    throw new Error(`Chapter 05 event deck is incomplete: ${s5DeckText}`);
  }
  await s5Page.screenshot({ path: screenshots.s5EventDeck, fullPage: true });
  await s5Page.close();

  // 注入合法的全完成進度，驗證終局摘要、全部可重玩節點與 15/15 Codex。
  const completePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  completePage.on('console', (message) => {
    if (message.type() === 'error') errors.push(`complete: ${message.text()}`);
  });
  completePage.on('pageerror', (error) => errors.push(`complete: ${error.message}`));
  await completePage.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await completePage.evaluate(() => localStorage.setItem('owm.campaign.v5', JSON.stringify({
    schemaVersion: 5,
    totalXp: 9200,
    completedMissionIds: ['MSN-TUT-001', 'MSN-TUT-002', 'MSN-TUT-003', 'MSN-ADV-004', 'MSN-ADV-005', 'MSN-ADV-006', 'MSN-ELT-007', 'MSN-ELT-008', 'MSN-ELT-009', 'MSN-MST-010', 'MSN-MST-011', 'MSN-MST-012', 'MSN-FNL-013', 'MSN-FNL-014', 'MSN-FNL-015'],
    unlockedMissionIds: ['MSN-TUT-001', 'MSN-TUT-002', 'MSN-TUT-003', 'MSN-ADV-004', 'MSN-ADV-005', 'MSN-ADV-006', 'MSN-ELT-007', 'MSN-ELT-008', 'MSN-ELT-009', 'MSN-MST-010', 'MSN-MST-011', 'MSN-MST-012', 'MSN-FNL-013', 'MSN-FNL-014', 'MSN-FNL-015'],
    bestScores: { 'MSN-TUT-001': 94, 'MSN-TUT-002': 92, 'MSN-TUT-003': 90, 'MSN-ADV-004': 88, 'MSN-ADV-005': 86, 'MSN-ADV-006': 84, 'MSN-ELT-007': 82, 'MSN-ELT-008': 80, 'MSN-ELT-009': 78, 'MSN-MST-010': 76, 'MSN-MST-011': 74, 'MSN-MST-012': 72, 'MSN-FNL-013': 70, 'MSN-FNL-014': 68, 'MSN-FNL-015': 66 },
    characterXp: { 'CHR-GOV-001': 900 },
  })));
  await completePage.reload({ waitUntil: 'networkidle' });
  await openCampaignRouteMissions(completePage);
  const completionText = await completePage.getByTestId('campaign-completion-summary').innerText();
  if (!completionText.includes('CAMPAIGN COMPLETE') || !completionText.includes('15/15') || !completionText.includes('5/5') || !completionText.includes('80') || !completionText.includes('3') || !completionText.includes('L5 技師')) {
    throw new Error(`Campaign completion summary is incomplete: ${completionText}`);
  }
  const completionMetadata = await completePage.getByTestId('campaign-completion-summary').evaluate((element) => ({
    complete: element.getAttribute('data-campaign-complete'),
    completedMissions: element.getAttribute('data-completed-missions'),
    totalMissions: element.getAttribute('data-total-missions'),
    completedChapters: element.getAttribute('data-completed-chapters'),
    totalChapters: element.getAttribute('data-total-chapters'),
    averageBestScore: element.getAttribute('data-average-best-score'),
    scoredMissions: element.getAttribute('data-scored-missions'),
    campaignGrade: element.getAttribute('data-campaign-grade'),
    sGradeCount: element.getAttribute('data-s-grade-count'),
    masteredCharacterCount: element.getAttribute('data-mastered-character-count'),
  }));
  if (
    completionMetadata.complete !== 'true'
    || completionMetadata.completedMissions !== '15'
    || completionMetadata.totalMissions !== '15'
    || completionMetadata.completedChapters !== '5'
    || completionMetadata.totalChapters !== '5'
    || completionMetadata.averageBestScore !== '80'
    || completionMetadata.scoredMissions !== '15'
    || completionMetadata.campaignGrade !== 'A'
    || completionMetadata.sGradeCount !== '3'
    || completionMetadata.masteredCharacterCount !== '1'
  ) {
    throw new Error(`Campaign completion metadata is incorrect: ${JSON.stringify(completionMetadata)}`);
  }
  if ((await completePage.locator('.mission-node[data-status="completed"]').count()) !== 15 || (await completePage.locator('.mission-node[data-status="locked"]').count()) !== 0) {
    throw new Error('Completed Campaign does not retain all 15 missions as replayable completed nodes.');
  }
  await completePage.getByTestId('mission-node-MSN-FNL-015').click();
  const finalDeckText = await completePage.getByTestId('mission-event-deck').innerText();
  if (!finalDeckText.includes('×1.45') || !finalDeckText.includes('×1.70') || !finalDeckText.includes('×2.00')) throw new Error(`Final mission deck is incomplete: ${finalDeckText}`);
  await completePage.screenshot({ path: screenshots.campaignComplete, fullPage: true });
  await completePage.getByTestId('nav-codex').click();
  await completePage.getByTestId('codex-screen').waitFor({ state: 'visible' });
  if ((await completePage.locator('.codex-card[data-unlocked="true"]').count()) !== 3 || !(await completePage.getByTestId('codex-unlock-count').innerText()).includes('15/15')) {
    throw new Error('Completed Campaign did not unlock all 15 Codex entries.');
  }
  await completePage.close();

  // 注入合法角色 XP，驗證 L4/L5 perk 從部署 bonus 一路進入角色 runtime 與 Collection。
  const perkPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  perkPage.on('console', (message) => {
    if (message.type() === 'error') errors.push(`perks: ${message.text()}`);
  });
  perkPage.on('pageerror', (error) => errors.push(`perks: ${error.message}`));
  await perkPage.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await perkPage.evaluate(() => localStorage.setItem('owm.campaign.v5', JSON.stringify({
    schemaVersion: 5,
    totalXp: 1400,
    completedMissionIds: [],
    unlockedMissionIds: ['MSN-TUT-001'],
    bestScores: {},
    characterXp: { 'CHR-GOV-001': 900, 'CHR-MAR-176': 500 },
  }))); 
  await perkPage.reload({ waitUntil: 'networkidle' });
  await perkPage.getByTestId('deployment-tab-crew').click();
  const teamPerkSummary = await perkPage.getByTestId('team-perk-summary').innerText();
  if (!teamPerkSummary.includes('3/6') || !teamPerkSummary.includes('Evidence +6') || !teamPerkSummary.includes('Reliability +4')) {
    throw new Error(`Team Mastery perk summary is incorrect: ${teamPerkSummary}`);
  }
  await perkPage.screenshot({ path: screenshots.masteryDeployment, fullPage: true });
  await confirmOperationPlanning(perkPage);
  await perkPage.getByTestId('deploy-mission').click();
  await perkPage.locator('.phaser-host canvas').waitFor({ state: 'visible', timeout: 15000 });
  const activePerks = await perkPage.getByTestId('active-character-perks').innerText();
  const perkStatuses = await perkPage.getByTestId('runtime-statuses').innerText();
  const perkEnergy = await perkPage.locator('.resource-row div').nth(1).innerText();
  const perkEvidence = Number((await perkPage.locator('.resource-meter.evidence b').innerText()).replace('%', ''));
  if (!activePerks.includes('專家整備') || !activePerks.includes('資深防護') || !perkStatuses.includes('專家整備') || !perkStatuses.includes('資深防護 -2') || !perkEnergy.includes('6') || perkEvidence !== 18) {
    throw new Error(`L4/L5 perks did not enter runtime: ${activePerks} | ${perkStatuses} | ${perkEnergy} | Evidence ${perkEvidence}`);
  }
  await perkPage.screenshot({ path: screenshots.masteryRuntime, fullPage: true });
  await perkPage.getByTestId('nav-collection').click();
  await perkPage.getByTestId('collection-screen').waitFor({ state: 'visible' });
  const l5CollectionPerks = await perkPage.getByTestId('collection-perks-CHR-GOV-001').innerText();
  await perkPage.getByTestId('collection-search').fill('CHR-MAR-176');
  const l4CollectionPerks = await perkPage.getByTestId('collection-perks-CHR-MAR-176').innerText();
  if ((l5CollectionPerks.match(/已啟用/g) ?? []).length !== 2 || (l4CollectionPerks.match(/已啟用/g) ?? []).length !== 1 || !l4CollectionPerks.includes('900 XP')) {
    throw new Error(`Collection perk unlock states are incorrect: ${l5CollectionPerks} | ${l4CollectionPerks}`);
  }
  await perkPage.screenshot({ path: screenshots.masteryCollection });
  await perkPage.close();

  // 使用獨立 context 驗證低於 25% 會鎖定部署，且完整維修可立即恢復出勤。
  const maintenanceContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const maintenancePage = await maintenanceContext.newPage();
  maintenancePage.on('console', (message) => { if (message.type() === 'error') errors.push(`maintenance: ${message.text()}`); });
  maintenancePage.on('pageerror', (error) => errors.push(`maintenance: ${error.message}`));
  await maintenancePage.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await maintenancePage.evaluate(() => {
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
    localStorage.setItem('owm.campaign.v5', JSON.stringify({
      schemaVersion: 5, totalXp: 0, completedMissionIds: [], unlockedMissionIds: ['MSN-TUT-001'], bestScores: {}, characterXp: {},
      ownedEquipmentIds: [], maintenanceCredits: 100, equipmentCondition: { EQ0051: 20 },
    }));
  });
  await maintenancePage.reload({ waitUntil: 'networkidle' });
  await confirmOperationPlanning(maintenancePage);
  await maintenancePage.getByTestId('deployment-tab-loadout').click();
  const groundedStatus = await maintenancePage.getByTestId('repair-equipment-status').innerText();
  if (!groundedStatus.includes('20%') || !groundedStatus.includes('不可出勤') || await maintenancePage.getByTestId('deploy-mission').isEnabled()) {
    throw new Error(`Unserviceable equipment did not ground deployment: ${groundedStatus}`);
  }
  await maintenancePage.screenshot({ path: screenshots.maintenance, fullPage: true });
  await maintenancePage.getByTestId('repair-equipment').click();
  const repairedStatus = await maintenancePage.getByTestId('repair-equipment-status').innerText();
  if (!repairedStatus.includes('100%') || !(await maintenancePage.getByTestId('deploy-mission').isEnabled())) {
    throw new Error(`Full repair did not restore deployment readiness: ${repairedStatus}`);
  }
  await maintenanceContext.close();

  // 注入一名 100% Exhausted 技師，驗證 Deployment 會阻擋，消耗 1 RST 後才恢復出勤。
  const crewContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const crewPage = await crewContext.newPage();
  crewPage.on('console', (message) => { if (message.type() === 'error') errors.push(`crew: ${message.text()}`); });
  crewPage.on('pageerror', (error) => errors.push(`crew: ${error.message}`));
  await crewPage.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await crewPage.evaluate(() => {
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
    localStorage.setItem('owm.campaign.v5', JSON.stringify({
      schemaVersion: 5, totalXp: 0, completedMissionIds: [], unlockedMissionIds: ['MSN-TUT-001'], bestScores: {}, characterXp: {},
      ownedEquipmentIds: [], maintenanceCredits: 80, equipmentCondition: {}, recoveryTokens: 1, crewFatigue: { 'CHR-GOV-001': 100 },
    }));
  });
  await crewPage.reload({ waitUntil: 'networkidle' });
  await confirmOperationPlanning(crewPage);
  await crewPage.getByTestId('deployment-tab-crew').click();
  const exhaustedCrew = await crewPage.getByTestId('crew-readiness-0').innerText();
  const crewBlockedReason = await crewPage.getByTestId('crew-blocked-reason').innerText();
  if (!exhaustedCrew.includes('100/100') || !exhaustedCrew.includes('耗竭') || !crewBlockedReason.includes('Exhausted') || await crewPage.getByTestId('deploy-mission').isEnabled()) {
    throw new Error(`Exhausted Crew did not block deployment: ${exhaustedCrew} | ${crewBlockedReason}`);
  }
  await crewPage.screenshot({ path: screenshots.crewReadiness, fullPage: true });
  await crewPage.getByTestId('rest-crew-0').click();
  const restedCrew = await crewPage.getByTestId('crew-readiness-0').innerText();
  const restedSave = await crewPage.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  if (!restedCrew.includes('60/100') || restedSave?.recoveryTokens !== 0 || restedSave?.crewFatigue?.['CHR-GOV-001'] !== 60 || !(await crewPage.getByTestId('deploy-mission').isEnabled())) {
    throw new Error(`Crew Rest did not restore deployment readiness: ${restedCrew} | ${JSON.stringify(restedSave)}`);
  }
  await crewContext.close();

  if (errors.length > 0) {
    throw new Error(`Browser console errors: ${errors.join(' | ')}`);
  }

  console.log('Gameplay smoke passed: Wind Farm Board + Campaign save v5 + v1/v2/v3/v4 migration -> Crew fatigue/RST/Rest gate -> Equipment condition wear/repair -> Operation readiness 5/5 -> runtime weather/cost consequences -> Mission Result Review tabs -> L4/L5 Mastery perks -> 15 mission-specific event decks -> Chapter 05 S5 escalation -> Campaign completion -> Codex -> Collection -> Sandbox -> 768px touch flow.');
  console.log(`Deployment screenshot: ${screenshots.deployment}`);
  console.log(`Mission map screenshot: ${screenshots.missionMap}`);
  console.log(`Operation screenshot: ${screenshots.operation}`);
  console.log(`Branch event screenshot: ${screenshots.branch}`);
  console.log(`Diagnosis screenshot: ${screenshots.diagnosis}`);
  console.log(`Debrief screenshot: ${screenshots.debrief}`);
  console.log(`Debrief score screenshot: ${screenshots.debriefScore}`);
  console.log(`Debrief log screenshot: ${screenshots.debriefLog}`);
  console.log(`Codex screenshot: ${screenshots.codex}`);
  console.log(`Collection screenshot: ${screenshots.collection}`);
  console.log(`Sandbox screenshot: ${screenshots.sandbox}`);
  console.log(`Mobile screenshot: ${screenshots.mobile}`);
  console.log(`Mobile mission map screenshot: ${screenshots.mobileMissionMap}`);
  console.log(`Mobile Crew Rotation screenshot: ${screenshots.mobileCrewRotation}`);
  console.log(`Mobile Dispatch Forecast screenshot: ${screenshots.mobileForecast}`);
  console.log(`Mobile return notice screenshot: ${screenshots.mobileReturnNotice}`);
  console.log(`S4 event deck screenshot: ${screenshots.s4EventDeck}`);
  console.log(`S4 branch screenshot: ${screenshots.s4Branch}`);
  console.log(`S5 event deck screenshot: ${screenshots.s5EventDeck}`);
  console.log(`Campaign completion screenshot: ${screenshots.campaignComplete}`);
  console.log(`Mastery deployment screenshot: ${screenshots.masteryDeployment}`);
  console.log(`Mastery runtime screenshot: ${screenshots.masteryRuntime}`);
  console.log(`Mastery collection screenshot: ${screenshots.masteryCollection}`);
  console.log(`Equipment maintenance screenshot: ${screenshots.maintenance}`);
  console.log(`Crew readiness screenshot: ${screenshots.crewReadiness}`);
} finally {
  await browser.close();
}
