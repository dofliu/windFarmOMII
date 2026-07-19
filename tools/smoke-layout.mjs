import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const shot = (name) => path.join(outputDirectory, `owm-layout-${name}.png`);

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

async function assertSingleScreen(label, rootSelector) {
  const metrics = await page.evaluate((selector) => {
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
      rootWidth: rect?.width ?? null,
    };
  }, rootSelector);
  if (metrics.scrollHeight > metrics.viewportHeight + 1 || metrics.scrollWidth > metrics.viewportWidth + 1) {
    throw new Error(`${label} document overflow: ${JSON.stringify(metrics)}`);
  }
  if (metrics.rootTop === null || metrics.rootBottom === null || metrics.rootTop < -1 || metrics.rootBottom > metrics.viewportHeight + 1) {
    throw new Error(`${label} root is clipped outside viewport: ${JSON.stringify(metrics)}`);
  }
  return metrics;
}

async function captureDeploymentTab(testId, name) {
  await page.getByTestId(testId).click();
  await assertSingleScreen(`Deployment ${name}`, '.deployment-shell');
  await page.screenshot({ path: shot(`deployment-${name}`) });
}

try {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
  });
  await page.reload({ waitUntil: 'networkidle' });

  const routeTab = page.getByTestId('deployment-tab-route');
  const readinessTab = page.getByTestId('deployment-tab-readiness');
  if ((await routeTab.getAttribute('role')) !== 'tab' || (await routeTab.getAttribute('aria-controls')) !== 'deployment-tab-panel-route') {
    throw new Error('Deployment route tab is missing tab role or aria-controls metadata.');
  }
  if ((await page.getByTestId('deployment-tab-panel-route').getAttribute('role')) !== 'tabpanel') {
    throw new Error('Deployment active panel is missing tabpanel role.');
  }
  await routeTab.press('ArrowRight');
  if ((await readinessTab.getAttribute('aria-selected')) !== 'true' || !(await page.getByTestId('deployment-tab-panel-readiness').isVisible())) {
    throw new Error('Deployment tabs do not support ArrowRight keyboard navigation.');
  }
  await readinessTab.press('ArrowLeft');
  if ((await routeTab.getAttribute('aria-selected')) !== 'true' || !(await page.getByTestId('deployment-tab-panel-route').isVisible())) {
    throw new Error('Deployment tabs do not support ArrowLeft keyboard navigation.');
  }

  await captureDeploymentTab('deployment-tab-route', 'route');
  if ((await page.locator('[data-testid^="campaign-route-tab-"]').count()) !== 3) {
    throw new Error('Campaign Route should expose FLEET / MISSIONS / BRIEFING subtabs instead of stacking all route information.');
  }
  await page.getByTestId('campaign-route-tab-missions').click();
  await assertSingleScreen('Deployment route missions subtab', '.deployment-shell');
  await page.screenshot({ path: shot('deployment-route-missions') });
  await page.getByTestId('campaign-route-tab-briefing').click();
  await assertSingleScreen('Deployment route briefing subtab', '.deployment-shell');
  const routeCarryover = await page.getByTestId('route-readiness-carryover').innerText();
  if (!routeCarryover.includes('下一關整備提醒') || !routeCarryover.includes('工作許可') || !routeCarryover.includes('PPE') || !routeCarryover.includes('進場條件') || !routeCarryover.includes('PENDING')) {
    throw new Error(`Route readiness carryover is incomplete on initial route: ${routeCarryover}`);
  }
  if ((await page.getByTestId('route-readiness-shortcut-permit').count()) !== 1 || (await page.getByTestId('route-readiness-shortcut-ppe').count()) !== 1 || (await page.getByTestId('route-readiness-shortcut-access').count()) !== 1) {
    throw new Error('Route readiness action shortcuts are missing from the initial route.');
  }
  await page.getByTestId('campaign-route-tab-fleet').click();
  await page.getByTestId('fleet-board-tab-history').click();
  const emptyHistory = await page.getByTestId('fleet-history-panel').innerText();
  if (!emptyHistory.includes('FLEET OPERATIONS HISTORY') || !emptyHistory.includes('0/30') || !emptyHistory.includes('尚無紀錄')) {
    throw new Error(`Initial Fleet Operations History tab is incomplete: ${emptyHistory}`);
  }
  await assertSingleScreen('Deployment route fleet history empty', '.deployment-shell');
  await page.screenshot({ path: shot('fleet-history-empty') });
  await page.getByTestId('fleet-board-tab-dispatch').click();
  await captureDeploymentTab('deployment-tab-readiness', 'readiness');
  const readinessFleet = await page.getByTestId('fleet-condition-readiness').innerText();
  if (!readinessFleet.includes('FLEET CONDITION') || !readinessFleet.includes('WTG-001') || !readinessFleet.includes('ELEVATED') || !readinessFleet.includes('DEGRADED') || !readinessFleet.includes('R88') || !readinessFleet.includes('B1')
    || !/\+2[\s\S]*\+7/.test(readinessFleet) || !/100[\s\S]*95/.test(readinessFleet) || !/15[\s\S]*12/.test(readinessFleet) || !readinessFleet.includes('Gameplay abstraction')) {
    throw new Error(`Readiness Fleet Condition dispatch modifier is incomplete: ${readinessFleet}`);
  }
  await page.screenshot({ path: shot('fleet-condition-readiness') });
  await captureDeploymentTab('deployment-tab-crew', 'crew');
  const initialRotation = await page.getByTestId('crew-rotation-advisor').innerText();
  if (!initialRotation.includes('建議輪調') || !initialRotation.includes('3/2') || !initialRotation.includes('6/6') || !initialRotation.includes('2/3') || !initialRotation.includes('3→3') || !initialRotation.includes('完整搜尋 60 名')) {
    throw new Error(`Initial Crew Rotation recommendation is incomplete: ${initialRotation}`);
  }
  const initialCrewCount = (await page.getByTestId('crew-filter-count').innerText()).replace(/\s+/g, ' ').trim();
  if (initialCrewCount !== '60/60 · 60/300') throw new Error(`Crew roster filter did not start at 60 unlocked L1 crew: ${initialCrewCount}`);
  await page.getByTestId('crew-filter-search').fill('CHR-OMI-223');
  if ((await page.getByTestId('crew-filter-count').innerText()).replace(/\s+/g, ' ').trim() !== '0/60 · 60/300') throw new Error('Locked L3 career card leaked into the Campaign selector.');
  await page.getByTestId('crew-filter-search').fill('CHR-OMI-221');
  if ((await page.getByTestId('crew-filter-count').innerText()).replace(/\s+/g, ' ').trim() !== '1/60 · 60/300') throw new Error('Unlocked L1 roster ID search did not narrow to one character.');
  await page.getByTestId('crew-filter-search').fill('');
  await page.getByTestId('crew-filter-faction').selectOption('OMI');
  const omiFilterCount = Number((await page.getByTestId('crew-filter-count').innerText()).split('/')[0]);
  if (!(omiFilterCount > 0 && omiFilterCount < 60)) throw new Error(`Crew faction filter count is invalid: ${omiFilterCount}`);
  await page.getByTestId('crew-filter-faction').selectOption('ALL');
  const beforeRotationIds = await page.evaluate(() => Array.from(document.querySelectorAll('.team-selectors select'), (element) => element.value));
  await page.getByTestId('apply-crew-rotation').click();
  await page.getByTestId('apply-crew-rotation').waitFor({ state: 'visible' });
  const afterRotationIds = await page.evaluate(() => Array.from(document.querySelectorAll('.team-selectors select'), (element) => element.value));
  if (beforeRotationIds.join('|') === afterRotationIds.join('|') || new Set(afterRotationIds).size !== 3) {
    throw new Error(`Crew Rotation recommendation was not applied: ${beforeRotationIds} -> ${afterRotationIds}`);
  }
  const appliedRotation = await page.getByTestId('crew-rotation-advisor').innerText();
  if (!appliedRotation.includes('目前隊伍已是最佳建議') || await page.getByTestId('apply-crew-rotation').isEnabled()) {
    throw new Error(`Applied Crew Rotation did not settle as optimal: ${appliedRotation}`);
  }
  await assertSingleScreen('Deployment crew after rotation', '.deployment-shell');
  await page.screenshot({ path: shot('deployment-crew-rotation-applied') });
  await captureDeploymentTab('deployment-tab-loadout', 'loadout');
  await captureDeploymentTab('deployment-tab-forecast', 'forecast');
  const forecastText = await page.getByTestId('dispatch-forecast').innerText();
  const forecastFleet = await page.getByTestId('forecast-fleet-condition').innerText();
  const equipmentForecast = await page.getByTestId('forecast-equipment').innerText();
  const maintenanceForecast = await page.getByTestId('forecast-maintenance').innerText();
  const rstForecast = await page.getByTestId('forecast-rst').innerText();
  if (!forecastFleet.includes('FLEET CONDITION') || !forecastFleet.includes('WTG-001') || !forecastFleet.includes('ELEVATED') || !forecastFleet.includes('DEGRADED') || !forecastFleet.includes('R88') || !forecastFleet.includes('B1')
    || !/\+2[\s\S]*\+7/.test(forecastFleet) || !/100[\s\S]*95/.test(forecastFleet) || !/15[\s\S]*12/.test(forecastFleet) || !forecastFleet.includes('Gameplay abstraction')) {
    throw new Error(`Forecast Fleet Condition dispatch modifier is incomplete: ${forecastFleet}`);
  }
  if (!equipmentForecast.includes('100%') || !equipmentForecast.includes('92%') || !equipmentForecast.includes('86%') || !equipmentForecast.includes('95%') || !equipmentForecast.includes('91%')) {
    throw new Error(`Dispatch Equipment forecast is incomplete: ${equipmentForecast}`);
  }
  if (!maintenanceForecast.includes('+24–34') || !maintenanceForecast.includes('+11') || !maintenanceForecast.includes('97–107 MNT') || !maintenanceForecast.includes('79 MNT')) {
    throw new Error(`Dispatch MNT forecast is incomplete: ${maintenanceForecast}`);
  }
  if (!rstForecast.includes('3 → 5 RST') || !forecastText.includes('1 回合 baseline') || !forecastText.includes('11R')) {
    throw new Error(`Dispatch Crew/RST forecast is incomplete: ${forecastText}`);
  }
  const forecastRotation = await page.getByTestId('forecast-rotation-advisor').innerText();
  if (!forecastRotation.includes('目前隊伍已是最佳建議') || !forecastRotation.includes('3→3') || await page.getByTestId('apply-forecast-rotation').isEnabled()) {
    throw new Error(`Dispatch Forecast did not receive applied Crew Rotation: ${forecastRotation}`);
  }
  await page.screenshot({ path: shot('fleet-condition-forecast') });

  await page.getByTestId('nav-collection').click();
  const collectionCrewTab = page.getByTestId('collection-tab-crew');
  const collectionResourcesTab = page.getByTestId('collection-tab-resources');
  if ((await collectionCrewTab.getAttribute('role')) !== 'tab' || (await collectionCrewTab.getAttribute('aria-controls')) !== 'collection-panel-crew') {
    throw new Error('Collection crew tab is missing tab role or aria-controls metadata.');
  }
  if ((await page.getByTestId('collection-crew-pane').getAttribute('role')) !== 'tabpanel') {
    throw new Error('Collection crew panel is missing tabpanel role.');
  }
  await collectionCrewTab.press('ArrowRight');
  if ((await collectionResourcesTab.getAttribute('aria-selected')) !== 'true' || !(await page.getByTestId('collection-resource-pane').isVisible())) {
    throw new Error('Collection tabs do not support ArrowRight keyboard navigation.');
  }
  await collectionResourcesTab.press('ArrowLeft');
  if ((await collectionCrewTab.getAttribute('aria-selected')) !== 'true' || !(await page.getByTestId('collection-crew-pane').isVisible())) {
    throw new Error('Collection tabs do not support ArrowLeft keyboard navigation.');
  }
  await assertSingleScreen('Collection crew', '.collection-shell');
  if ((await page.locator('.collection-card').count()) !== 5) throw new Error('Collection desktop page must show exactly five crew cards.');
  await page.screenshot({ path: shot('collection-crew') });
  await page.getByTestId('collection-tab-resources').click();
  await assertSingleScreen('Collection resources', '.collection-shell');
  await page.screenshot({ path: shot('collection-resources') });

  await page.getByTestId('nav-codex').click();
  await assertSingleScreen('Codex', '.codex-shell');
  if ((await page.locator('.codex-card').count()) !== 3) throw new Error('Codex desktop page must show exactly three entries.');
  await page.screenshot({ path: shot('codex') });

  await page.getByTestId('nav-campaign').click();
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
  if (rotorTelemetry.bladeCount !== '3' || rotorTelemetry.shaftLocked !== 'true' || rotorTelemetry.axisConsistent !== 'true' || rotorTelemetry.hubLocked !== 'true' || rotorTelemetry.bladeAngles !== '0,120,240' || rotorTelemetry.transformOrigin !== `${rotorTelemetry.hubX},${rotorTelemetry.hubY}` || rotorTelemetry.hubX !== rotorTelemetry.shaftStartX || Number(rotorTelemetry.shaftEndX) <= Number(rotorTelemetry.hubX) || rotorTelemetry.nacelle !== 'true' || rotorTelemetry.tower !== 'true') {
    throw new Error(`Rotor telemetry structure is incomplete: ${JSON.stringify(rotorTelemetry)}`);
  }
  const campaignSaveAfterDeploy = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  const dispatchHistory = campaignSaveAfterDeploy?.fleetOperationsHistory?.at?.(-1);
  if (dispatchHistory?.kind !== 'DISPATCH' || dispatchHistory?.missionId !== 'MSN-TUT-001' || dispatchHistory?.turbineId !== 'WTG-OWM-001' || dispatchHistory?.pressure !== 'ELEVATED'
    || dispatchHistory?.costBefore !== 2 || dispatchHistory?.costAfter !== 7 || dispatchHistory?.safetyBefore !== 100 || dispatchHistory?.safetyAfter !== 95 || dispatchHistory?.reliabilityBefore !== 15 || dispatchHistory?.reliabilityAfter !== 12) {
    throw new Error(`Fleet Condition dispatch history was not persisted on deploy: ${JSON.stringify(campaignSaveAfterDeploy?.fleetOperationsHistory)}`);
  }
  const operationFleet = await page.getByTestId('field-fleet-condition').innerText();
  if (!operationFleet.includes('FLEET CONDITION') || !operationFleet.includes('WTG-001') || !operationFleet.includes('ELEVATED')
    || !/\+2[\s\S]*\+7/.test(operationFleet) || !/100[\s\S]*95/.test(operationFleet) || !/15[\s\S]*12/.test(operationFleet) || !operationFleet.includes('Gameplay abstraction')) {
    throw new Error(`Operation Fleet Condition field feed is incomplete: ${operationFleet}`);
  }
  const decisionPrompt = await page.getByTestId('operation-decision-prompt').innerText();
  if (!decisionPrompt.includes('NEXT DECISION') || !/(ACT|DIAG|EVENT|RISK|ROUND)/.test(decisionPrompt)) {
    throw new Error(`Operation decision prompt is incomplete: ${decisionPrompt}`);
  }
  if (!(await page.getByTestId('operation-info-tab-log').isVisible()) || !(await page.getByTestId('operation-info-tab-summary').isVisible()) || !(await page.getByTestId('operation-info-tab-objectives').isVisible())) {
    throw new Error('Operation info tabs are missing from the active Operation panel.');
  }
  const summaryTab = page.getByRole('tab', { name: 'SUMMARY' });
  if ((await summaryTab.getAttribute('aria-controls')) !== 'operation-info-panel-summary') {
    throw new Error('Operation SUMMARY tab does not control the summary tabpanel.');
  }
  await summaryTab.click();
  if (!(await page.getByRole('tabpanel', { name: 'SUMMARY' }).isVisible())) {
    throw new Error('Operation SUMMARY tabpanel is not exposed with a role.');
  }
  const operationSummary = await page.getByTestId('operation-summary').innerText();
  if (!operationSummary.includes('STAGE') || !operationSummary.includes('PROGRESS') || !operationSummary.includes('SCENE') || !operationSummary.includes('SOURCE') || !operationSummary.includes('QA') || !operationSummary.includes('SCN003') || !operationSummary.includes('INTEGRATED') || !operationSummary.includes('V004') || !operationSummary.includes('ENGINEERING QA PASSED') || !operationSummary.includes('TURBINE') || !operationSummary.includes('WTG-001') || !operationSummary.includes('ELEVATED')) {
    throw new Error(`Operation summary tab is incomplete: ${operationSummary}`);
  }
  await assertSingleScreen('Operation summary tab', '.game-grid');
  const objectivesTab = page.getByRole('tab', { name: 'OBJECTIVES' });
  if ((await objectivesTab.getAttribute('aria-controls')) !== 'operation-info-panel-objectives') {
    throw new Error('Operation OBJECTIVES tab does not control the objectives tabpanel.');
  }
  await objectivesTab.click();
  if (!(await page.getByRole('tabpanel', { name: 'OBJECTIVES' }).isVisible())) {
    throw new Error('Operation OBJECTIVES tabpanel is not exposed with a role.');
  }
  const operationObjectives = await page.getByTestId('operation-objectives').innerText();
  if (!operationObjectives.includes('STAGE TARGET') || !operationObjectives.includes('SKILL FORECAST') || !/\+\d+[\s\S]*AP -1[\s\S]*E -\d+[\s\S]*Fatigue/.test(operationObjectives) || !operationObjectives.includes('END ROUND FORECAST') || !/F \+\d+[\s\S]*S -\d+[\s\S]*W -\d+/.test(operationObjectives) || !operationObjectives.includes('LEARNING OBJECTIVE') || !operationObjectives.includes('DIAGNOSIS GATE') || !operationObjectives.includes('BRANCH EVENT') || !operationObjectives.includes('RISK FLOOR')) {
    throw new Error(`Operation objectives tab is incomplete: ${operationObjectives}`);
  }
  await assertSingleScreen('Operation objectives tab', '.game-grid');
  const logTab = page.getByRole('tab', { name: 'LOG' });
  if ((await logTab.getAttribute('aria-controls')) !== 'operation-info-panel-log') {
    throw new Error('Operation LOG tab does not control the log tabpanel.');
  }
  await logTab.click();
  if (!(await page.getByRole('tabpanel', { name: 'LOG' }).isVisible())) {
    throw new Error('Operation LOG tabpanel is not exposed with a role.');
  }
  if (!(await page.getByTestId('operation-log-list').isVisible())) {
    throw new Error('Operation log tab did not restore the log list.');
  }
  await logTab.press('ArrowRight');
  if (!(await page.getByRole('tabpanel', { name: 'SUMMARY' }).isVisible()) || (await summaryTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Operation info tabs do not support ArrowRight keyboard navigation.');
  }
  await summaryTab.press('ArrowLeft');
  if (!(await page.getByRole('tabpanel', { name: 'LOG' }).isVisible()) || (await logTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Operation info tabs do not support ArrowLeft keyboard navigation.');
  }
  const operationMissionPanelMetrics = await page.evaluate(() => {
    const panel = document.querySelector('.mission-panel');
    const nextRound = document.querySelector('[data-testid="next-round"]');
    const abort = document.querySelector('[data-testid="abort-operation-open"]');
    const rect = (element) => element?.getBoundingClientRect();
    const panelRect = rect(panel);
    const nextRoundRect = rect(nextRound);
    const abortRect = rect(abort);
    return {
      panelBottom: panelRect?.bottom ?? null,
      nextRoundBottom: nextRoundRect?.bottom ?? null,
      abortBottom: abortRect?.bottom ?? null,
      clientHeight: panel?.clientHeight ?? 0,
      scrollHeight: panel?.scrollHeight ?? 0,
    };
  });
  if (operationMissionPanelMetrics.panelBottom === null
    || operationMissionPanelMetrics.nextRoundBottom === null
    || operationMissionPanelMetrics.abortBottom === null
    || operationMissionPanelMetrics.nextRoundBottom > operationMissionPanelMetrics.panelBottom + 1
    || operationMissionPanelMetrics.abortBottom > operationMissionPanelMetrics.panelBottom + 1
    || operationMissionPanelMetrics.scrollHeight > operationMissionPanelMetrics.clientHeight + 1) {
    throw new Error(`Operation mission panel clips its primary actions: ${JSON.stringify(operationMissionPanelMetrics)}`);
  }
  await assertSingleScreen('Operation', '.game-grid');
  await page.screenshot({ path: shot('operation') });
  await page.screenshot({ path: shot('fleet-condition-operation') });

  if (errors.length > 0) throw new Error(`Browser console errors: ${errors.join(' | ')}`);
  console.log('Single-screen layout smoke passed at 1440x900 for five Deployment tabs including roster filters, Crew Rotation Advisor, Fleet Condition Dispatch Modifier, Fleet Operations History, Dispatch Forecast, Collection tabs, Codex, and Operation.');
  console.log(`Route screenshot: ${shot('deployment-route')}`);
  console.log(`Fleet condition screenshot: ${shot('fleet-condition-operation')}`);
  console.log(`Operation screenshot: ${shot('operation')}`);
} finally {
  await browser.close();
}
