import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const shot = (name) => path.join(outputDirectory, `owm-operation-compact-${name}.png`);

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

async function assertCompactOperationScreen(label) {
  const metrics = await page.evaluate(() => {
    const rectMetric = (element) => {
      const rect = element?.getBoundingClientRect();
      if (!rect) return null;
      return {
        top: Math.round(rect.top * 10) / 10,
        bottom: Math.round(rect.bottom * 10) / 10,
        left: Math.round(rect.left * 10) / 10,
        right: Math.round(rect.right * 10) / 10,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      };
    };
    const scrolling = document.scrollingElement;
    const selectors = {
      gameGrid: '.game-grid',
      missionPanel: '.mission-panel',
      centerColumn: '.center-column',
      fieldPanel: '.field-panel',
      phaserHost: '.phaser-host',
      eventPanel: '.event-panel',
      cardPanel: '.card-panel',
      operationTabs: '.operation-info-tabs',
    };
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: scrolling?.scrollWidth ?? 0,
      scrollHeight: scrolling?.scrollHeight ?? 0,
      elements: Object.fromEntries(
        Object.entries(selectors).map(([key, selector]) => [key, rectMetric(document.querySelector(selector))]),
      ),
    };
  });

  if (metrics.scrollHeight > metrics.viewportHeight + 1 || metrics.scrollWidth > metrics.viewportWidth + 1) {
    throw new Error(`${label} document overflow: ${JSON.stringify(metrics)}`);
  }

  for (const [key, rect] of Object.entries(metrics.elements)) {
    if (!rect) throw new Error(`${label} missing element: ${key}`);
    if (rect.top < -1 || rect.bottom > metrics.viewportHeight + 1 || rect.left < -1 || rect.right > metrics.viewportWidth + 1) {
      throw new Error(`${label} ${key} clipped outside viewport: ${JSON.stringify(metrics)}`);
    }
    if (['missionPanel', 'fieldPanel', 'eventPanel', 'cardPanel'].includes(key)
      && (rect.scrollHeight > rect.clientHeight + 1 || rect.scrollWidth > rect.clientWidth + 1)) {
      throw new Error(`${label} ${key} internal overflow: ${JSON.stringify(metrics)}`);
    }
  }

  if (metrics.elements.phaserHost.height < 230) {
    throw new Error(`${label} field feed became too small for useful play: ${JSON.stringify(metrics)}`);
  }

  return metrics;
}

try {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
  });
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByTestId('deployment-tab-readiness').click();
  for (const testId of ['planning-confirm-permit', 'planning-confirm-ppe', 'planning-confirm-access']) {
    await page.getByTestId(testId).check();
  }
  await page.getByTestId('deploy-mission').click();
  await page.locator('.phaser-host[data-scene-ready="true"] canvas').waitFor({ state: 'visible', timeout: 15000 });
  const rotorTelemetry = await page.locator('.phaser-host').evaluate((element) => ({
    bladeCount: element.getAttribute('data-rotor-blade-count'),
    shaftLocked: element.getAttribute('data-rotor-shaft-locked'),
    axisConsistent: element.getAttribute('data-rotor-axis-consistent'),
    hubLocked: element.getAttribute('data-rotor-hub-locked'),
    bladeAngles: element.getAttribute('data-rotor-blade-angles'),
    transformOrigin: element.getAttribute('data-rotor-transform-origin'),
    hubX: element.getAttribute('data-rotor-hub-x'),
    hubY: element.getAttribute('data-rotor-hub-y'),
    shaftStartX: element.getAttribute('data-rotor-shaft-start-x'),
    shaftEndX: element.getAttribute('data-rotor-shaft-end-x'),
    nacelle: element.getAttribute('data-rotor-nacelle'),
    tower: element.getAttribute('data-rotor-tower'),
  }));
  const sceneTelemetry = await page.locator('.phaser-host').evaluate((element) => ({
    ready: element.getAttribute('data-scene-ready'),
    requestedId: element.getAttribute('data-scene-requested-id'),
    sourceId: element.getAttribute('data-scene-source-id'),
    assetUrl: element.getAttribute('data-scene-asset-url'),
    fallbackUrl: element.getAttribute('data-scene-fallback-url'),
    version: element.getAttribute('data-scene-asset-version'),
    qaStatus: element.getAttribute('data-scene-qa-status'),
    availability: element.getAttribute('data-scene-availability'),
  }));
  if (sceneTelemetry.ready !== 'true' || sceneTelemetry.requestedId !== 'SCN003' || sceneTelemetry.sourceId !== 'SCN003' || sceneTelemetry.assetUrl !== '/assets/environment/offshore-field-feed_ai_v004.png' || sceneTelemetry.fallbackUrl !== '/assets/environment/offshore-field-feed_ai_v004.png' || sceneTelemetry.version !== 'v004' || sceneTelemetry.qaStatus !== 'ENGINEERING_QA_PASSED' || sceneTelemetry.availability !== 'INTEGRATED') {
    throw new Error(`Compact Operation scene asset telemetry is incomplete: ${JSON.stringify(sceneTelemetry)}`);
  }
  if (rotorTelemetry.bladeCount !== '3' || rotorTelemetry.shaftLocked !== 'true' || rotorTelemetry.axisConsistent !== 'true' || rotorTelemetry.hubLocked !== 'true' || rotorTelemetry.bladeAngles !== '0,120,240' || rotorTelemetry.transformOrigin !== `${rotorTelemetry.hubX},${rotorTelemetry.hubY}` || rotorTelemetry.hubX !== rotorTelemetry.shaftStartX || Number(rotorTelemetry.shaftEndX) <= Number(rotorTelemetry.hubX) || rotorTelemetry.nacelle !== 'true' || rotorTelemetry.tower !== 'true') {
    throw new Error(`Compact Operation rotor telemetry structure is incomplete: ${JSON.stringify(rotorTelemetry)}`);
  }
  const decisionAction = await page.getByTestId('operation-decision-action').innerText();
  const decisionTelemetry = await page.getByTestId('operation-decision-prompt').evaluate((element) => ({
    code: element.getAttribute('data-decision-code'),
    action: element.getAttribute('data-decision-action'),
    reason: element.getAttribute('data-decision-reason'),
    meta: element.getAttribute('data-decision-meta'),
    guideTarget: element.getAttribute('data-decision-guide-target'),
    guideLabel: element.getAttribute('data-decision-guide-label'),
    guideButtonTarget: element.querySelector('[data-testid="operation-decision-guide-cta"]')?.getAttribute('data-decision-guide-target'),
    visibleAction: element.querySelector('[data-testid="operation-decision-action"]')?.textContent,
    visibleReason: element.querySelector('[data-testid="operation-decision-detail"]')?.textContent,
  }));
  if (!['ACT', 'DIAG', 'EVENT', 'RISK', 'ROUND'].includes(decisionTelemetry.code ?? '') || !decisionTelemetry.action || !decisionTelemetry.reason || !decisionTelemetry.meta || !decisionTelemetry.guideTarget || decisionTelemetry.guideButtonTarget !== decisionTelemetry.guideTarget || !decisionTelemetry.visibleAction?.includes(decisionTelemetry.code ?? '') || decisionTelemetry.visibleReason !== decisionTelemetry.reason) {
    throw new Error(`Compact Operation decision telemetry is incomplete: ${JSON.stringify(decisionTelemetry)}`);
  }
  await page.getByTestId('operation-decision-guide-cta').click();
  const guidedTargetState = await page.locator(`[data-testid="${decisionTelemetry.guideTarget}"]`).evaluate((element) => ({
    testId: element.getAttribute('data-testid'),
    guideFocus: element.getAttribute('data-guide-focus'),
  }));
  if (guidedTargetState.guideFocus !== 'true') {
    throw new Error(`Decision guide did not highlight its target: ${JSON.stringify({ decisionTelemetry, guidedTargetState })}`);
  }
  const guideNotice = await page.getByTestId('operation-decision-guide-notice').evaluate((element) => ({
    text: element.textContent,
    target: element.getAttribute('data-decision-guide-notice-target'),
    label: element.getAttribute('data-decision-guide-notice-label'),
    promptActive: element.closest('[data-testid="operation-decision-prompt"]')?.getAttribute('data-decision-guide-active'),
    promptTarget: element.closest('[data-testid="operation-decision-prompt"]')?.getAttribute('data-decision-guide-active-target'),
    promptLabel: element.closest('[data-testid="operation-decision-prompt"]')?.getAttribute('data-decision-guide-active-label'),
    promptPulse: element.closest('[data-testid="operation-decision-prompt"]')?.getAttribute('data-decision-guide-pulse'),
  }));
  if (guideNotice.promptActive !== 'true' || guideNotice.target !== decisionTelemetry.guideTarget || guideNotice.promptTarget !== decisionTelemetry.guideTarget || guideNotice.label !== decisionTelemetry.guideLabel || guideNotice.promptLabel !== decisionTelemetry.guideLabel || !guideNotice.promptPulse || !guideNotice.text?.includes(decisionTelemetry.guideTarget ?? '') || !guideNotice.text?.includes(decisionTelemetry.guideLabel ?? '')) {
    throw new Error(`Decision guide notice metadata is incomplete: ${JSON.stringify({ decisionTelemetry, guideNotice })}`);
  }
  if (decisionAction.includes('ACT')) {
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
      throw new Error(`ACT decision should expose exactly one recommended skill CTA with reason telemetry: ${JSON.stringify({ recommendedSkillCtaCount, recommendedSkillId, recommendedSkillTelemetry })}`);
    }
  }
  await page.getByTestId('operation-info-tab-summary').click();
  const summaryHeading = await page.getByTestId('operation-info-heading').innerText();
  if (summaryHeading !== 'OPERATION SUMMARY') throw new Error(`SUMMARY tab did not update the Operation info heading: ${summaryHeading}`);
  const summaryMetrics = await assertCompactOperationScreen('Operation compact summary');
  await page.screenshot({ path: shot('summary') });

  await page.getByTestId('operation-info-tab-objectives').click();
  const objectivesHeading = await page.getByTestId('operation-info-heading').innerText();
  if (objectivesHeading !== 'OPERATION OBJECTIVES') throw new Error(`OBJECTIVES tab did not update the Operation info heading: ${objectivesHeading}`);
  const objectiveText = await page.getByTestId('operation-objectives').innerText();
  if (!objectiveText.includes('STAGE TARGET') || !objectiveText.includes('SKILL FORECAST') || !/\+\d+[\s\S]*AP -1[\s\S]*E -\d+[\s\S]*Fatigue/.test(objectiveText) || !objectiveText.includes('END ROUND FORECAST') || !/F \+\d+[\s\S]*S -\d+[\s\S]*W -\d+/.test(objectiveText) || !objectiveText.includes('LEARNING OBJECTIVE') || !objectiveText.includes('DIAGNOSIS GATE')) {
    throw new Error(`Compact Operation objectives are incomplete: ${objectiveText}`);
  }
  const objectivesMetrics = await assertCompactOperationScreen('Operation compact objectives');
  await page.screenshot({ path: shot('objectives') });

  await page.getByTestId('operation-info-tab-log').click();
  const logHeading = await page.getByTestId('operation-info-heading').innerText();
  if (logHeading !== 'OPERATION LOG') throw new Error(`LOG tab did not restore the Operation info heading: ${logHeading}`);
  const logMetrics = await assertCompactOperationScreen('Operation compact log');
  await page.screenshot({ path: shot('log') });

  if (decisionAction.includes('ACT')) {
    const logCountBefore = await page.locator('[data-testid="operation-log-list"] p').count();
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
    await page.getByTestId('operation-info-tab-log').click();
    const logCountAfter = await page.locator('[data-testid="operation-log-list"] p').count();
    const sameActor = activeCharacterBefore === recommendedCharacterId;
    if (!(progressAfter > progressBefore || stageAfter !== stageBefore) || Number.isNaN(energyCost) || activeCharacterAfter !== recommendedCharacterId || (sameActor && (apAfter !== apBefore - 1 || energyAfter !== energyBefore - energyCost)) || logCountAfter <= logCountBefore) {
      throw new Error(`Recommended team skill CTA did not execute settlement: ${JSON.stringify({ recommendedCharacterId, activeCharacterBefore, activeCharacterAfter, stageBefore, stageAfter, progressBefore, progressAfter, apBefore, apAfter, energyBefore, energyAfter, energyCost, logCountBefore, logCountAfter })}`);
    }
  }

  for (let attempt = 0; attempt < 9; attempt += 1) {
    const currentDecision = await page.getByTestId('operation-decision-action').innerText();
    if (/\b(ROUND|RISK)\b/.test(currentDecision)) break;
    if (currentDecision.includes('DIAG')) {
      const diagnosisRecommendation = page.getByTestId('diagnosis-rec-cta');
      if (!(await diagnosisRecommendation.isVisible().catch(() => false))) break;
      const diagnosisId = await diagnosisRecommendation.getAttribute('data-recommended-diagnosis-id');
      const diagnosisReason = await diagnosisRecommendation.getAttribute('data-recommended-diagnosis-reason');
      const visibleDiagnosisReason = await page.getByTestId('diagnosis-rec-reason').innerText();
      if (!diagnosisId || !diagnosisReason?.startsWith('Recommended: evidence-backed answer') || diagnosisReason !== visibleDiagnosisReason) {
        throw new Error(`Compact Operation diagnosis REC CTA is missing stable reason telemetry: ${JSON.stringify({ diagnosisId, diagnosisReason, visibleDiagnosisReason })}`);
      }
      await diagnosisRecommendation.click();
    } else if (currentDecision.includes('ACT')) {
      const actionRecommendation = page.getByTestId('recommended-skill-cta');
      if (!(await actionRecommendation.isVisible().catch(() => false))) break;
      await actionRecommendation.click();
    } else {
      break;
    }
    await page.waitForTimeout(80);
  }

  const roundDecision = await page.getByTestId('operation-decision-action').innerText();
  if (/\b(ROUND|RISK)\b/.test(roundDecision)) {
    await page.getByTestId('operation-info-tab-log').click();
    const roundBefore = Number(await page.locator('.round-box strong').innerText());
    const roundLogCountBefore = await page.locator('[data-testid="operation-log-list"] p').count();
    const roundDecisionCta = page.getByTestId('round-decision-cta');
    await roundDecisionCta.waitFor({ state: 'visible' });
    const confirmationRequired = await roundDecisionCta.getAttribute('data-round-confirmation-required');
    await roundDecisionCta.click();
    if (confirmationRequired === 'true') {
      await page.waitForFunction(() => document.querySelector('[data-testid="round-decision-cta"]')?.getAttribute('data-round-confirming') === 'true');
      await roundDecisionCta.click();
      await page.waitForFunction(
        ({ roundBefore, roundLogCountBefore }) => {
          const round = Number(document.querySelector('.round-box strong')?.textContent ?? 'NaN');
          const logCount = document.querySelectorAll('[data-testid="operation-log-list"] p').length;
          const branchVisible = Boolean(document.querySelector('[data-testid="branch-event-panel"]'));
          const debriefVisible = Boolean(document.querySelector('[data-testid="mission-debrief"]'));
          return logCount > roundLogCountBefore && (round > roundBefore || branchVisible || debriefVisible);
        },
        { roundBefore, roundLogCountBefore },
        { timeout: 5000 },
      );
    } else {
      await page.waitForFunction(
        ({ roundBefore, roundLogCountBefore }) => {
          const round = Number(document.querySelector('.round-box strong')?.textContent ?? 'NaN');
          const logCount = document.querySelectorAll('[data-testid="operation-log-list"] p').length;
          const branchVisible = Boolean(document.querySelector('[data-testid="branch-event-panel"]'));
          const debriefVisible = Boolean(document.querySelector('[data-testid="mission-debrief"]'));
          return logCount > roundLogCountBefore && (round > roundBefore || branchVisible || debriefVisible);
        },
        { roundBefore, roundLogCountBefore },
        { timeout: 5000 },
      );
    }
    const roundAfter = Number(await page.locator('.round-box strong').innerText().catch(() => '0'));
    const roundLogCountAfter = await page.locator('[data-testid="operation-log-list"] p').count();
    if (roundLogCountAfter <= roundLogCountBefore || roundAfter < roundBefore) {
      throw new Error(`Round decision CTA did not execute End Round settlement: ${JSON.stringify({ roundBefore, roundAfter, roundLogCountBefore, roundLogCountAfter, confirmationRequired })}`);
    }
    await assertCompactOperationScreen('Operation compact round decision CTA settlement');
  } else {
    throw new Error(`Compact Operation never reached ROUND/RISK decision for CTA verification: ${roundDecision}`);
  }

  if (errors.length > 0) throw new Error(`Browser console errors: ${errors.join(' | ')}`);
  console.log('Compact Operation smoke passed at 1366x768 with LOG/SUMMARY/OBJECTIVES tabs and no document overflow.');
  console.log(`Summary metrics: ${JSON.stringify(summaryMetrics)}`);
  console.log(`Objectives metrics: ${JSON.stringify(objectivesMetrics)}`);
  console.log(`Log metrics: ${JSON.stringify(logMetrics)}`);
  console.log(`Summary screenshot: ${shot('summary')}`);
  console.log(`Objectives screenshot: ${shot('objectives')}`);
  console.log(`Log screenshot: ${shot('log')}`);
} finally {
  await browser.close();
}
