import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const screenshots = {
  priority: path.join(outputDirectory, 'owm-fleet-dispatch-priority.png'),
  planPreview: path.join(outputDirectory, 'owm-fleet-maintenance-plan-preview.png'),
  planConfirmation: path.join(outputDirectory, 'owm-fleet-maintenance-plan-confirmation.png'),
  planSettlement: path.join(outputDirectory, 'owm-fleet-maintenance-plan-settlement.png'),
  planHistory: path.join(outputDirectory, 'owm-fleet-operations-history-plan.png'),
  quote: path.join(outputDirectory, 'owm-fleet-maintenance-quote.png'),
  confirmation: path.join(outputDirectory, 'owm-fleet-maintenance-confirmation.png'),
  settlement: path.join(outputDirectory, 'owm-fleet-maintenance-settlement.png'),
  history: path.join(outputDirectory, 'owm-fleet-operations-history.png'),
  mobile: path.join(outputDirectory, 'owm-fleet-maintenance-768.png'),
};

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const errors = [];

async function prepare(page) {
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
  });
  await page.reload({ waitUntil: 'networkidle' });
}

async function documentMetrics(page, rootSelector) {
  return page.evaluate((selector) => {
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
}

async function assertDesktopSingleScreen(page, label) {
  const metrics = await documentMetrics(page, '.deployment-shell');
  if (metrics.scrollWidth > metrics.viewportWidth + 1 || metrics.scrollHeight > metrics.viewportHeight + 1) {
    throw new Error(`${label} document overflow: ${JSON.stringify(metrics)}`);
  }
  if (metrics.rootTop === null || metrics.rootBottom === null || metrics.rootTop < -1 || metrics.rootBottom > metrics.viewportHeight + 1) {
    throw new Error(`${label} root clipped: ${JSON.stringify(metrics)}`);
  }
  const action = await page.locator('.fleet-maintenance-action').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, width: rect.width };
  });
  if (action.top < 0 || action.bottom > metrics.viewportHeight || action.width <= 0) throw new Error(`${label} maintenance action is clipped: ${JSON.stringify(action)}`);
}

try {
  const planPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await prepare(planPage);
  const beforePlan = await planPage.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  await planPage.getByTestId('fleet-maintenance-mode-plan').click();
  await planPage.getByTestId('wind-turbine-WTG-OWM-004').click();
  await planPage.getByTestId('fleet-plan-add').click();
  await planPage.getByTestId('wind-turbine-WTG-OWM-001').click();
  await planPage.getByTestId('fleet-plan-add').click();
  const planSummary = await planPage.getByTestId('fleet-plan-summary').innerText();
  const planSteps = await planPage.getByTestId('fleet-plan-steps').innerText();
  if (!planSummary.includes('2 ACTIONS') || !planSummary.includes('WTG-001 → WTG-004')) throw new Error(`Fleet plan did not normalize to stable-ID order: ${planSummary}`);
  if (!planSteps.includes('#01 WTG-001') || !planSteps.includes('R 88→96') || !planSteps.includes('B 1→0') || !planSteps.includes('AVL 2→3') || !planSteps.includes('80→55 MNT')
    || !planSteps.includes('#02 WTG-004') || !planSteps.includes('R 76→86') || !planSteps.includes('B 2→1') || !planSteps.includes('AVL 3→3') || !planSteps.includes('55→23 MNT')) {
    throw new Error(`Fleet plan stepwise projection is incomplete: ${planSteps}`);
  }
  if (await planPage.evaluate(() => localStorage.getItem('owm.campaign.v5')) !== beforePlan) throw new Error('Adding Fleet plan steps mutated Campaign save.');
  await planPage.getByTestId('wind-turbine-WTG-OWM-006').click();
  if (await planPage.getByTestId('fleet-plan-add').isEnabled() || !(await planPage.getByTestId('fleet-plan-add').innerText()).includes('PLAN SHORT')) {
    throw new Error('Over-budget Fleet plan candidate was not blocked.');
  }
  await assertDesktopSingleScreen(planPage, 'Fleet maintenance plan preview');
  await planPage.screenshot({ path: screenshots.planPreview });

  await planPage.getByTestId('fleet-plan-prepare').click();
  if (!(await planPage.getByTestId('fleet-plan-confirmation').innerText()).includes('NO SAVE UNTIL CONFIRMED')) throw new Error('Fleet plan confirmation boundary is missing.');
  if (await planPage.evaluate(() => localStorage.getItem('owm.campaign.v5')) !== beforePlan) throw new Error('Preparing Fleet plan mutated Campaign save.');
  await assertDesktopSingleScreen(planPage, 'Fleet maintenance plan confirmation');
  await planPage.screenshot({ path: screenshots.planConfirmation });
  await planPage.getByTestId('fleet-plan-cancel-confirmation').click();
  if (await planPage.evaluate(() => localStorage.getItem('owm.campaign.v5')) !== beforePlan) throw new Error('Cancelling Fleet plan mutated Campaign save.');
  await planPage.getByTestId('fleet-plan-prepare').click();
  await planPage.getByTestId('fleet-plan-confirm').click();
  const planSettlement = await planPage.getByTestId('fleet-plan-settlement').innerText();
  const planSaved = await planPage.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  if (!planSettlement.includes('COMPLETE · 2 ACTIONS · 80→23 MNT')) throw new Error(`Fleet plan settlement is incomplete: ${planSettlement}`);
  if (planSaved?.maintenanceCredits !== 23
    || planSaved?.windFarm?.['WTG-OWM-001']?.reliability !== 96
    || planSaved?.windFarm?.['WTG-OWM-001']?.openFaults !== 0
    || planSaved?.windFarm?.['WTG-OWM-001']?.maintenanceActions !== 1
    || planSaved?.windFarm?.['WTG-OWM-004']?.reliability !== 86
    || planSaved?.windFarm?.['WTG-OWM-004']?.openFaults !== 1
    || planSaved?.windFarm?.['WTG-OWM-004']?.maintenanceActions !== 1
    || planSaved?.windFarm?.['WTG-OWM-006']?.reliability !== 69) {
    throw new Error(`Fleet plan was not persisted atomically: ${JSON.stringify(planSaved)}`);
  }
  const planHistory = planSaved?.fleetOperationsHistory?.[0];
  if (planHistory?.kind !== 'MAINTENANCE_PLAN' || planHistory?.actionCount !== 2 || planHistory?.creditsBefore !== 80 || planHistory?.creditsAfter !== 23
    || planHistory?.turbineIds?.join('|') !== 'WTG-OWM-001|WTG-OWM-004' || planHistory?.backlogBefore !== 6 || planHistory?.backlogAfter !== 4) {
    throw new Error(`Fleet plan history was not persisted: ${JSON.stringify(planSaved?.fleetOperationsHistory)}`);
  }
  await assertDesktopSingleScreen(planPage, 'Fleet maintenance plan settlement');
  await planPage.screenshot({ path: screenshots.planSettlement });
  await planPage.getByTestId('fleet-board-tab-history').click();
  const planHistoryText = await planPage.getByTestId('fleet-history-panel').innerText();
  if (!planHistoryText.includes('FLEET OPERATIONS HISTORY') || !planHistoryText.includes('1/30') || !planHistoryText.includes('MAINTENANCE PLAN')
    || !planHistoryText.includes('2 ACTIONS') || !planHistoryText.includes('WTG-001 → WTG-004') || !planHistoryText.includes('MNT 80→23')) {
    throw new Error(`Fleet plan history tab is incomplete: ${planHistoryText}`);
  }
  await planPage.screenshot({ path: screenshots.planHistory });
  await planPage.reload({ waitUntil: 'networkidle' });
  const planReloaded = await planPage.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  if (planReloaded?.maintenanceCredits !== 23 || planReloaded?.windFarm?.['WTG-OWM-001']?.reliability !== 96 || planReloaded?.windFarm?.['WTG-OWM-004']?.reliability !== 86 || planReloaded?.fleetOperationsHistory?.[0]?.kind !== 'MAINTENANCE_PLAN') {
    throw new Error('Fleet plan settlement did not survive reload.');
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await prepare(page);

  const expectedRanks = [
    ['WTG-OWM-006', '1'],
    ['WTG-OWM-004', '2'],
    ['WTG-OWM-002', '3'],
    ['WTG-OWM-001', '4'],
    ['WTG-OWM-005', '5'],
    ['WTG-OWM-003', '6'],
  ];
  for (const [turbineId, rank] of expectedRanks) {
    const actual = await page.getByTestId(`wind-turbine-${turbineId}`).getAttribute('data-rank');
    if (actual !== rank) throw new Error(`Initial Fleet Dispatch rank mismatch for ${turbineId}: ${actual}`);
  }
  const counts = await page.getByTestId('fleet-dispatch-counts').innerText();
  if (!counts.includes('4 ACTION') || !counts.includes('4 READY') || !counts.includes('2 AVL') || !counts.includes('6 B')) {
    throw new Error(`Initial Fleet Dispatch counts are incomplete: ${counts}`);
  }
  if ((await page.locator('[data-testid^="fleet-turbine-icon-WTG-OWM-"]').count()) !== 6) {
    throw new Error('Fleet Board should render six physical turbine SVG icons.');
  }
  for (const [turbineId] of expectedRanks) {
    const icon = page.getByTestId(`fleet-turbine-icon-${turbineId}`);
    const iconTelemetry = {
      bladeCount: await icon.getAttribute('data-blade-count'),
      shaftLocked: await icon.getAttribute('data-shaft-locked'),
      axisConsistent: await icon.getAttribute('data-rotor-axis-consistent'),
      hubCx: await icon.getAttribute('data-hub-cx'),
      hubCy: await icon.getAttribute('data-hub-cy'),
      shaftStartX: await icon.getAttribute('data-shaft-start-x'),
      shaftStartY: await icon.getAttribute('data-shaft-start-y'),
      shaftEndX: await icon.getAttribute('data-shaft-end-x'),
      shaftEndY: await icon.getAttribute('data-shaft-end-y'),
      towerCenterX: await icon.getAttribute('data-tower-center-x'),
      nacelleAxisY: await icon.getAttribute('data-nacelle-axis-y'),
      nacelle: await icon.getAttribute('data-nacelle'),
      tower: await icon.getAttribute('data-tower'),
      rotorTransformOrigin: await icon.getAttribute('data-rotor-transform-origin'),
      iconRevision: await icon.getAttribute('data-icon-revision'),
      foundation: await icon.getAttribute('data-foundation'),
      accessPlatform: await icon.getAttribute('data-access-platform'),
      axisLockLabel: await icon.getAttribute('data-hub-shaft-tower-axis-lock'),
    };
    if (
      iconTelemetry.bladeCount !== '3'
      || iconTelemetry.shaftLocked !== 'true'
      || iconTelemetry.axisConsistent !== 'true'
      || Number(iconTelemetry.hubCx) <= 0
      || Number(iconTelemetry.hubCy) <= 0
      || iconTelemetry.shaftStartX !== iconTelemetry.hubCx
      || iconTelemetry.shaftStartY !== iconTelemetry.hubCy
      || iconTelemetry.shaftEndY !== iconTelemetry.hubCy
      || Number(iconTelemetry.shaftEndX) <= Number(iconTelemetry.hubCx)
      || iconTelemetry.towerCenterX !== iconTelemetry.hubCx
      || iconTelemetry.nacelleAxisY !== iconTelemetry.hubCy
      || iconTelemetry.nacelle !== 'true'
      || iconTelemetry.tower !== 'true'
      || iconTelemetry.rotorTransformOrigin !== `${iconTelemetry.hubCx} ${iconTelemetry.hubCy}`
      || iconTelemetry.iconRevision !== 'offshore-svg-v002'
      || iconTelemetry.foundation !== 'monopile-transition-platform'
      || iconTelemetry.accessPlatform !== 'true'
      || iconTelemetry.axisLockLabel !== 'true'
    ) {
      throw new Error(`Fleet turbine icon geometry is incomplete for ${turbineId}: ${JSON.stringify(iconTelemetry)}`);
    }
    const detailCount = await icon.locator('.fleet-turbine-foundation, .fleet-turbine-sea-line, .fleet-turbine-access-rail, .fleet-turbine-tower-highlight, .fleet-turbine-nacelle-highlight').count();
    if (detailCount !== 5) throw new Error(`Fleet turbine icon v002 should render five offshore detail layers for ${turbineId}: ${detailCount}`);
    const rotorRigging = await icon.locator('.fleet-turbine-rotor').evaluate((element) => ({
      origin: element.getAttribute('data-rotor-origin'),
      axisLock: element.getAttribute('data-rotor-axis-lock'),
      computedOrigin: getComputedStyle(element).transformOrigin,
      animationName: getComputedStyle(element).animationName,
    }));
    if (rotorRigging.origin !== `${iconTelemetry.hubCx} ${iconTelemetry.hubCy}` || rotorRigging.axisLock !== 'hub-shaft-tower' || !rotorRigging.computedOrigin.includes(`${iconTelemetry.hubCx}px`) || rotorRigging.animationName !== 'fleetTurbineRotorSpin') {
      throw new Error(`Fleet turbine icon rotor animation is not hub-locked for ${turbineId}: ${JSON.stringify(rotorRigging)}`);
    }
    const polygonCount = await icon.locator('.fleet-turbine-rotor polygon').count();
    if (polygonCount !== 3) throw new Error(`Fleet turbine icon should render exactly 3 rotor blades for ${turbineId}: ${polygonCount}`);
  }
  if (!(await page.getByTestId('fleet-dispatch-item-WTG-OWM-006').innerText()).includes('34 MNT · READY · AVL +0')) throw new Error('Top dispatch item does not show current-budget status.');
  if (!(await page.getByTestId('fleet-dispatch-item-WTG-OWM-002').innerText()).includes('25 MNT · READY · AVL +1')) throw new Error('Recoverable dispatch item does not show availability impact.');
  await assertDesktopSingleScreen(page, 'Fleet dispatch priority');
  await page.screenshot({ path: screenshots.priority });

  await page.getByTestId('wind-turbine-WTG-OWM-004').click();
  const quote = await page.getByTestId('fleet-maintenance-action').innerText();
  if (!quote.includes('WTG-004') || !quote.includes('HIGH') || !quote.includes('76→86%') || !quote.includes('2→1') || !quote.includes('80→48 (-32)')) {
    throw new Error(`WTG-004 maintenance quote is incomplete: ${quote}`);
  }
  const projection = await page.getByTestId('fleet-dispatch-projection').innerText();
  if (!projection.includes('FLEET 2→2 AVL') || !projection.includes('83→85% R') || !projection.includes('6→5 B')) {
    throw new Error(`Selected Fleet Dispatch projection is incomplete: ${projection}`);
  }
  if (!(await page.getByTestId('fleet-maintenance-prepare').isEnabled())) throw new Error('Affordable maintenance quote is not actionable.');
  await assertDesktopSingleScreen(page, 'Fleet maintenance quote');
  await page.screenshot({ path: screenshots.quote });

  const beforePrepare = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  await page.getByTestId('fleet-maintenance-prepare').click();
  const confirmation = await page.getByTestId('fleet-maintenance-confirmation').innerText();
  if (!confirmation.includes('NO SAVE UNTIL CONFIRMED')) throw new Error(`Confirmation boundary is missing: ${confirmation}`);
  if (await page.evaluate(() => localStorage.getItem('owm.campaign.v5')) !== beforePrepare) throw new Error('Preparing maintenance mutated Campaign save.');
  await assertDesktopSingleScreen(page, 'Fleet maintenance confirmation');
  await page.screenshot({ path: screenshots.confirmation });

  await page.getByTestId('fleet-maintenance-cancel').click();
  if (await page.evaluate(() => localStorage.getItem('owm.campaign.v5')) !== beforePrepare) throw new Error('Cancelling maintenance mutated Campaign save.');
  await page.getByTestId('fleet-maintenance-prepare').click();
  await page.getByTestId('fleet-maintenance-confirm').click();
  const settlement = await page.getByTestId('fleet-maintenance-settlement').innerText();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  if (!settlement.includes('COMPLETE') || !settlement.includes('ACTION 1')) throw new Error(`Maintenance settlement is incomplete: ${settlement}`);
  if (saved?.maintenanceCredits !== 48 || saved?.windFarm?.['WTG-OWM-004']?.reliability !== 86 || saved?.windFarm?.['WTG-OWM-004']?.openFaults !== 1 || saved?.windFarm?.['WTG-OWM-004']?.maintenanceActions !== 1) {
    throw new Error(`Maintenance settlement was not persisted atomically: ${JSON.stringify(saved)}`);
  }
  if (saved?.fleetOperationsHistory?.[0]?.kind !== 'MAINTENANCE' || saved?.fleetOperationsHistory?.[0]?.turbineId !== 'WTG-OWM-004' || saved?.fleetOperationsHistory?.[0]?.creditsBefore !== 80 || saved?.fleetOperationsHistory?.[0]?.creditsAfter !== 48) {
    throw new Error(`Single maintenance history was not persisted: ${JSON.stringify(saved?.fleetOperationsHistory)}`);
  }
  if (!(await page.getByTestId('wind-turbine-WTG-OWM-004').innerText()).includes('R 86→94')) throw new Error('Board did not refresh to the next-action projection after maintenance settlement.');
  await assertDesktopSingleScreen(page, 'Fleet maintenance settlement');
  await page.screenshot({ path: screenshots.settlement });

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('wind-turbine-WTG-OWM-004').click();
  const restoredQuote = await page.getByTestId('fleet-maintenance-action').innerText();
  if (!restoredQuote.includes('86→94%') || !restoredQuote.includes('1→0') || !restoredQuote.includes('48→23 (-25)')) {
    throw new Error(`Reload did not restore the first maintenance outcome: ${restoredQuote}`);
  }
  await page.getByTestId('fleet-maintenance-prepare').click();
  await page.getByTestId('fleet-maintenance-confirm').click();
  const secondSaved = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.campaign.v5') ?? 'null'));
  if (secondSaved?.maintenanceCredits !== 23 || secondSaved?.windFarm?.['WTG-OWM-004']?.reliability !== 94 || secondSaved?.windFarm?.['WTG-OWM-004']?.openFaults !== 0 || secondSaved?.windFarm?.['WTG-OWM-004']?.availability !== 'AVAILABLE' || secondSaved?.windFarm?.['WTG-OWM-004']?.maintenanceActions !== 2) {
    throw new Error(`Second maintenance action is incorrect: ${JSON.stringify(secondSaved)}`);
  }
  if (secondSaved?.fleetOperationsHistory?.length !== 2 || secondSaved.fleetOperationsHistory[0].sequence !== 1 || secondSaved.fleetOperationsHistory[1].sequence !== 2) {
    throw new Error(`Single maintenance history did not append deterministically: ${JSON.stringify(secondSaved?.fleetOperationsHistory)}`);
  }
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('fleet-board-tab-history').click();
  const historyText = await page.getByTestId('fleet-history-panel').innerText();
  if (!historyText.includes('2/30') || !historyText.includes('MAINTENANCE') || !historyText.includes('WTG-004') || !historyText.includes('MNT 48→23') || !historyText.includes('MNT 80→48')) {
    throw new Error(`Single maintenance history tab is incomplete after reload: ${historyText}`);
  }
  await page.screenshot({ path: screenshots.history });
  await page.getByTestId('fleet-board-tab-dispatch').click();
  await page.getByTestId('wind-turbine-WTG-OWM-004').click();
  if (!(await page.getByTestId('fleet-maintenance-unavailable').innerText()).includes('無可處置')) throw new Error('Cleared backlog is still actionable after reload.');
  const constrainedCounts = await page.getByTestId('fleet-dispatch-counts').innerText();
  if (!constrainedCounts.includes('3 ACTION') || !constrainedCounts.includes('0 READY')) throw new Error(`Fleet Dispatch did not recompute the constrained budget: ${constrainedCounts}`);
  for (const turbineId of ['WTG-OWM-006', 'WTG-OWM-002', 'WTG-OWM-001']) {
    if (await page.getByTestId(`wind-turbine-${turbineId}`).getAttribute('data-budget-status') !== 'INSUFFICIENT') {
      throw new Error(`${turbineId} was not marked insufficient at 23 MNT.`);
    }
  }

  const mobile = await browser.newPage({ viewport: { width: 768, height: 900 } });
  await prepare(mobile);
  await mobile.getByTestId('wind-turbine-WTG-OWM-004').click();
  await mobile.getByTestId('fleet-maintenance-prepare').click();
  const mobileMetrics = await documentMetrics(mobile, '.deployment-shell');
  if (mobileMetrics.scrollWidth > mobileMetrics.viewportWidth + 1) throw new Error(`Fleet maintenance has 768px horizontal overflow: ${JSON.stringify(mobileMetrics)}`);
  if (!(await mobile.getByTestId('fleet-maintenance-confirmation').innerText()).includes('NO SAVE UNTIL CONFIRMED')) throw new Error('Mobile maintenance confirmation is missing.');
  await mobile.getByTestId('fleet-maintenance-mode-plan').click();
  await mobile.getByTestId('fleet-plan-add').click();
  await mobile.getByTestId('wind-turbine-WTG-OWM-001').click();
  await mobile.getByTestId('fleet-plan-add').click();
  await mobile.getByTestId('fleet-plan-prepare').click();
  if (!(await mobile.getByTestId('fleet-plan-confirmation').innerText()).includes('NO SAVE UNTIL CONFIRMED')) throw new Error('Mobile Fleet plan confirmation is missing.');
  const mobilePlanMetrics = await documentMetrics(mobile, '.deployment-shell');
  if (mobilePlanMetrics.scrollWidth > mobilePlanMetrics.viewportWidth + 1) throw new Error(`Fleet plan has 768px horizontal overflow: ${JSON.stringify(mobilePlanMetrics)}`);
  await mobile.screenshot({ path: screenshots.mobile, fullPage: true });

  if (errors.length > 0) throw new Error(`Browser console errors: ${errors.join(' | ')}`);
  console.log('Fleet Dispatch + Maintenance smoke passed: six-turbine deterministic ranking, multi-action stable-ID plan, stepwise fleet/MNT preview, over-budget block, no-save prepare/cancel, confirm-only atomic single/plan settlement, queue recomputation, reload persistence, 1440 single-screen, and 768px no-horizontal-overflow.');
  for (const [label, file] of Object.entries(screenshots)) console.log(`${label}: ${file}`);
} finally {
  await browser.close();
}
