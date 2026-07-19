import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const screenshot = (name) => path.join(outputDirectory, `owm-challenge-${name}.png`);
const campaignSeed = {
  schemaVersion: 5,
  totalXp: 321,
  completedMissionIds: [],
  unlockedMissionIds: ['MSN-TUT-001'],
  bestScores: {},
  characterXp: { 'CHR-GOV-001': 123 },
  ownedEquipmentIds: ['EQ0051', 'EQ0126'],
  maintenanceCredits: 77,
  equipmentCondition: { EQ0051: 88 },
  recoveryTokens: 2,
  crewFatigue: { 'CHR-GOV-001': 45 },
};

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

async function assertSingleScreen(label, selector) {
  const metrics = await page.evaluate((rootSelector) => {
    const scrolling = document.scrollingElement;
    const root = document.querySelector(rootSelector);
    const rect = root?.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: scrolling?.scrollWidth ?? 0,
      scrollHeight: scrolling?.scrollHeight ?? 0,
      rootTop: rect?.top ?? null,
      rootBottom: rect?.bottom ?? null,
    };
  }, selector);
  if (metrics.scrollWidth > metrics.viewportWidth + 1 || metrics.scrollHeight > metrics.viewportHeight + 1) {
    throw new Error(`${label} document overflow: ${JSON.stringify(metrics)}`);
  }
  if (metrics.rootTop === null || metrics.rootBottom === null || metrics.rootTop < -1 || metrics.rootBottom > metrics.viewportHeight + 1) {
    throw new Error(`${label} root is clipped: ${JSON.stringify(metrics)}`);
  }
}

async function settlePendingBranch() {
  const branch = page.getByTestId('branch-event-panel');
  if (!(await branch.isVisible())) return;
  const reactions = page.locator('[data-testid^="branch-reactive-"]:not(:disabled)');
  if ((await reactions.count()) > 0) await reactions.first().click();
  else await page.getByTestId('branch-accept').click();
}

try {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate((seed) => {
    localStorage.clear();
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
    localStorage.setItem('owm.campaign.v5', JSON.stringify(seed));
  }, campaignSeed);
  await page.reload({ waitUntil: 'networkidle' });
  const campaignBefore = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));

  await page.getByTestId('nav-challenge').click();
  await page.getByTestId('boss-challenge-briefing').waitFor({ state: 'visible' });
  const briefing = await page.getByTestId('boss-challenge-briefing').innerText();
  if (!briefing.includes('0/100') || !briefing.includes('MASTERY L3') || !briefing.includes('250 XP') || !briefing.includes('10 ROUNDS') || !briefing.includes('EQ0051 · EQ0126 · VES002') || !briefing.includes('GRD RESERVE') || !briefing.includes('owm.challenge.v3')) {
    throw new Error(`Challenge briefing is incomplete: ${briefing}`);
  }
  if ((await page.getByTestId('challenge-boss').locator('option').count()) !== 100) throw new Error('Challenge does not expose all 100 bosses.');
  if (!(await page.getByTestId('challenge-selected-best').innerText()).includes('尚無紀錄')) throw new Error('Fresh Challenge incorrectly restored a best score.');
  if ((await page.getByTestId('challenge-source-operation').innerText()) !== '0/0' || (await page.getByTestId('challenge-source-draft-confirmation').innerText()) !== '0/0') throw new Error('Fresh Challenge source summary is incorrect.');
  const initialAudit = await page.getByTestId('challenge-audit-selected').innerText();
  if (!initialAudit.includes('DETERMINISTIC AUDIT') || !initialAudit.includes('24/24 TEAMS') || !initialAudit.includes('100/100 GATE PASS')) throw new Error(`Challenge audit snapshot is missing: ${initialAudit}`);
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-status"]')?.textContent?.includes('DRAFT DEFAULT'));
  const initialDraft = await page.getByTestId('challenge-draft-status').innerText();
  if (!initialDraft.includes('CHR-GOV-001') || !initialDraft.includes('CHR-MAR-176') || !initialDraft.includes('CHR-OMI-221')) throw new Error(`BOSS001 default draft is incorrect: ${initialDraft}`);
  const initialRouteDraft = await page.getByTestId('challenge-route-draft-summary').innerText();
  if (!initialRouteDraft.includes('UNDRAFTED') || !initialRouteDraft.includes('尚未建立規劃隊伍')) throw new Error(`Fresh Boss was incorrectly marked drafted: ${initialRouteDraft}`);
  if ((await page.getByTestId('challenge-portfolio-drafted').innerText()) !== '0/100' || (await page.getByTestId('challenge-portfolio-gap-free').innerText()) !== '0' || (await page.getByTestId('challenge-portfolio-has-gaps').innerText()) !== '0') {
    throw new Error(`Fresh Challenge draft portfolio is incorrect: ${await page.getByTestId('challenge-draft-portfolio').innerText()}`);
  }
  if ((await page.getByTestId('challenge-repair-queue-position').innerText()) !== '—/0'
    || (await page.getByTestId('challenge-repair-queue-session').innerText()) !== '0'
    || !(await page.getByTestId('challenge-repair-queue-next').isDisabled())) {
    throw new Error(`Fresh Challenge repair queue is incorrect: ${await page.getByTestId('challenge-repair-queue').innerText()}`);
  }

  await page.getByTestId('challenge-boss').selectOption('BOSS002');
  await page.getByTestId('deployment-tab-crew').click();
  await page.getByTestId('art-preview-character').selectOption('CHR-GOV-003');
  await page.getByTestId('deployment-tab-route').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS003');
  await page.getByTestId('deployment-tab-crew').click();
  await page.getByTestId('art-preview-character').selectOption('CHR-GOV-004');
  await page.getByTestId('deployment-tab-route').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS002');
  if (!(await page.getByTestId('challenge-draft-status').innerText()).includes('CHR-GOV-003')) throw new Error('BOSS002 draft did not restore after switching Bosses.');
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-challenge').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS002');
  if (!(await page.getByTestId('challenge-draft-status').innerText()).includes('CHR-GOV-003')) throw new Error('BOSS002 draft did not restore after reload.');
  const draftSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (draftSave?.schemaVersion !== 3 || Object.keys(draftSave.bestByBossId ?? {}).length !== 0 || draftSave.draftByBossId?.BOSS002?.teamIds?.[0] !== 'CHR-GOV-003' || draftSave.draftByBossId?.BOSS003?.teamIds?.[0] !== 'CHR-GOV-004') {
    throw new Error(`Boss-specific draft persistence/provenance is incorrect: ${JSON.stringify(draftSave)}`);
  }
  if ((await page.getByTestId('challenge-portfolio-drafted').innerText()) !== '2/100') throw new Error('Draft portfolio did not update to 2/100 after manual planning.');
  if ((await page.getByTestId('challenge-repair-queue-position').innerText()) !== '—/1'
    || !(await page.getByTestId('challenge-repair-queue-next').innerText()).includes('BOSS003')) {
    throw new Error(`Repair queue did not expose the one remaining HAS-GAPS draft: ${await page.getByTestId('challenge-repair-queue').innerText()}`);
  }
  await page.screenshot({ path: screenshot('draft-restored') });
  await page.getByTestId('challenge-boss').selectOption('BOSS001');

  await page.getByTestId('challenge-filter-draft').selectOption('DRAFTED');
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-route-count"]')?.textContent === '2/100');
  if ((await page.getByTestId('challenge-boss').locator('option').count()) !== 2 || (await page.getByTestId('challenge-boss').inputValue()) !== 'BOSS002') {
    throw new Error('DRAFTED filter did not expose the two planned Bosses in stable-ID order.');
  }
  const draftedSummary = await page.getByTestId('challenge-route-draft-summary').innerText();
  if (!draftedSummary.includes('DRAFTED') || !draftedSummary.includes('CHR-GOV-003') || !draftedSummary.includes('COUNTER') || !draftedSummary.includes('STAGE')) {
    throw new Error(`Draft Route summary is incomplete: ${draftedSummary}`);
  }
  await page.getByTestId('challenge-resume-draft').click();
  await page.getByTestId('challenge-filter-draft').selectOption('UNDRAFTED');
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-route-count"]')?.textContent === '98/100');
  const undraftedSummary = await page.getByTestId('challenge-route-draft-summary').innerText();
  if (!undraftedSummary.includes('UNDRAFTED') || !undraftedSummary.includes('尚未建立規劃隊伍')) throw new Error(`UNDRAFTED summary is incorrect: ${undraftedSummary}`);
  const afterUndraftedBrowse = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (Object.keys(afterUndraftedBrowse?.draftByBossId ?? {}).length !== 2) throw new Error('Browsing UNDRAFTED Bosses created unwanted drafts.');
  await page.getByTestId('challenge-boss').selectOption('BOSS004');
  const auditSeedIds = await page.getByTestId('challenge-audit-seed-ids').innerText();
  if (!auditSeedIds.includes('AUDIT VERIFIED') || !auditSeedIds.includes('CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270')) {
    throw new Error(`BOSS004 audit seed preview is incorrect: ${auditSeedIds}`);
  }
  await page.getByTestId('challenge-seed-audit-draft').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-route-draft-summary"]')?.textContent?.includes('SQUAD DRAFT · DRAFTED'));
  const seededSummary = await page.getByTestId('challenge-route-draft-summary').innerText();
  if (!seededSummary.includes('CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270') || !seededSummary.includes('COUNTER') || !seededSummary.includes('3/3') || !seededSummary.includes('STAGE') || !seededSummary.includes('6/6') || !seededSummary.includes('無 Reactive 事件回應')) {
    throw new Error(`Audit-seeded Route summary is incorrect: ${seededSummary}`);
  }
  const seededSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (Object.keys(seededSave?.draftByBossId ?? {}).length !== 3 || Object.keys(seededSave?.bestByBossId ?? {}).length !== 0 || seededSave.draftByBossId?.BOSS004?.teamIds?.join('|') !== 'CHR-MAR-200|CHR-MAR-220|CHR-OMI-270') {
    throw new Error(`Audit seed changed best provenance or saved the wrong team: ${JSON.stringify(seededSave)}`);
  }
  const seededSaveBeforeVerification = await page.evaluate(() => localStorage.getItem('owm.challenge.v3'));
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'UNVERIFIED') throw new Error('Fresh audit draft incorrectly has a runtime verification result.');
  const seededStaticAudit = await page.getByTestId('challenge-audit-selected').innerText();
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'VERIFIED CLEAR');
  const seededVerification = await page.getByTestId('challenge-draft-verification').innerText();
  if (!seededVerification.includes('RUNTIME ONLY') || !seededVerification.includes('B · 76 · R4/10')) throw new Error(`Audit draft verification result is incomplete: ${seededVerification}`);
  if ((await page.getByTestId('challenge-route-draft-summary').innerText()).includes('VERIFICATION INPUT') === false) throw new Error('Draft verification does not expose its stable-ID input row.');
  if ((await page.getByTestId('challenge-audit-selected').innerText()) !== seededStaticAudit) throw new Error('Draft verification mutated the static audit recommendation.');
  if ((await page.evaluate(() => localStorage.getItem('owm.challenge.v3'))) !== seededSaveBeforeVerification) throw new Error('Draft verification mutated Challenge best/draft save data.');
  if ((await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== campaignBefore) throw new Error('Draft verification mutated Campaign save data.');
  await page.screenshot({ path: screenshot('draft-verification-clear') });
  await page.screenshot({ path: screenshot('audit-seeded-draft') });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-challenge').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS004');
  if (!(await page.getByTestId('challenge-route-draft-ids').innerText()).includes('CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270')) throw new Error('Audit-seeded draft did not restore after reload.');
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'UNVERIFIED') throw new Error('Draft verification result was incorrectly persisted across reload.');
  await page.getByTestId('challenge-filter-draft').selectOption('DRAFTED');
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-route-count"]')?.textContent === '3/100');
  if ((await page.getByTestId('challenge-portfolio-drafted').innerText()) !== '3/100') throw new Error('Audit seed did not update the portfolio to 3/100.');
  const routeRepair = await page.getByTestId('challenge-route-repair').innerText();
  if (!routeRepair.includes('TOP STRUCTURAL REPAIR') || !routeRepair.includes('NOT AUDIT VERIFIED') || !routeRepair.includes('無 Reactive 事件回應') || !routeRepair.includes('60 CREW / 180 SWAPS')) {
    throw new Error(`Route top-repair provenance/routing is incomplete: ${routeRepair}`);
  }
  if (!(await page.getByTestId('challenge-route-repair-gaps').innerText()).includes('1→0')
    || !(await page.getByTestId('challenge-route-repair-stage').innerText()).includes('6→6/6')) {
    throw new Error(`Route top-repair metrics are incorrect: ${routeRepair}`);
  }
  const repairGapFreeBefore = Number(await page.getByTestId('challenge-portfolio-gap-free').innerText());
  const repairHasGapsBefore = Number(await page.getByTestId('challenge-portfolio-has-gaps').innerText());
  if ((await page.getByTestId('challenge-repair-queue-position').innerText()) !== '2/2'
    || (await page.getByTestId('challenge-repair-queue-gaps').innerText()) !== '2/0/0/0'
    || !(await page.getByTestId('challenge-repair-queue-next').innerText()).includes('BOSS003')) {
    throw new Error(`Seeded repair queue order/counts are incorrect: ${await page.getByTestId('challenge-repair-queue').innerText()}`);
  }
  const auditSeedTeam = ['CHR-MAR-200', 'CHR-MAR-220', 'CHR-OMI-270'];
  await page.screenshot({ path: screenshot('route-repair-preview') });
  await page.getByTestId('challenge-route-apply-repair').click();
  await page.waitForFunction(([gapFree, hasGaps]) => document.querySelector('[data-testid="challenge-portfolio-gap-free"]')?.textContent === String(gapFree + 1)
    && document.querySelector('[data-testid="challenge-portfolio-has-gaps"]')?.textContent === String(hasGaps - 1), [repairGapFreeBefore, repairHasGapsBefore]);
  if (!(await page.getByTestId('challenge-route-draft-gaps').innerText()).includes('NO STRUCTURAL GAP')) throw new Error('Applying Route repair did not close the selected structural gap.');
  if (!(await page.getByTestId('challenge-route-undo-repair').isVisible())) throw new Error('Applying Route repair did not expose one-level undo.');
  if (!(await page.getByTestId('challenge-route-repair').innerText()).includes('NOT AUDIT VERIFIED')) throw new Error('Applied Route repair lost its structural-only provenance.');
  if ((await page.getByTestId('challenge-repair-queue-position').innerText()) !== '—/1'
    || (await page.getByTestId('challenge-repair-queue-session').innerText()) !== '1') {
    throw new Error(`Route repair did not update queue/session counters: ${await page.getByTestId('challenge-repair-queue').innerText()}`);
  }
  await page.screenshot({ path: screenshot('route-repair-applied') });
  await page.getByTestId('challenge-route-undo-repair').click();
  await page.waitForFunction(([gapFree, hasGaps]) => document.querySelector('[data-testid="challenge-portfolio-gap-free"]')?.textContent === String(gapFree)
    && document.querySelector('[data-testid="challenge-portfolio-has-gaps"]')?.textContent === String(hasGaps), [repairGapFreeBefore, repairHasGapsBefore]);
  const undoSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (undoSave.draftByBossId?.BOSS004?.teamIds?.join('|') !== auditSeedTeam.join('|')) throw new Error('Route repair undo did not restore the exact previous draft.');
  if ((await page.getByTestId('challenge-repair-queue-position').innerText()) !== '2/2'
    || (await page.getByTestId('challenge-repair-queue-session').innerText()) !== '0') {
    throw new Error('Route repair undo did not restore queue/session counters.');
  }
  await page.getByTestId('challenge-route-apply-repair').click();
  const appliedRepairSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  const appliedRepairTeam = appliedRepairSave.draftByBossId?.BOSS004?.teamIds;
  if (!appliedRepairTeam || appliedRepairTeam.join('|') === auditSeedTeam.join('|')) throw new Error('Route repair did not persist its one-slot replacement.');
  const campaignAfterRouteRepair = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (campaignAfterRouteRepair !== campaignBefore) throw new Error('Applying/undoing Route repair mutated Campaign save data.');
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-challenge').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS004');
  if ((await page.getByTestId('challenge-route-draft-ids').innerText()) !== appliedRepairTeam.join(' / ')) throw new Error('Applied Route repair did not restore after reload.');
  if ((await page.getByTestId('challenge-portfolio-gap-free').innerText()) !== String(repairGapFreeBefore + 1)) throw new Error('Route repair portfolio result did not survive reload.');
  if ((await page.getByTestId('challenge-repair-queue-session').innerText()) !== '0') throw new Error('Repair queue session counter was incorrectly persisted across reload.');
  await page.getByTestId('challenge-filter-severity').selectOption('S5');
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-route-count"]')?.textContent === '20/100');
  await page.getByTestId('challenge-repair-queue-next').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-boss"]')?.value === 'BOSS003');
  if ((await page.getByTestId('challenge-filter-severity').inputValue()) !== 'ALL'
    || (await page.getByTestId('challenge-filter-draft').inputValue()) !== 'DRAFTED'
    || (await page.getByTestId('challenge-filter-readiness').inputValue()) !== 'HAS_GAPS') {
    throw new Error('Repair queue navigation did not clear incompatible filters and focus HAS-GAPS drafts.');
  }
  if (!(await page.getByTestId('challenge-route-draft-ids').innerText()).includes('CHR-GOV-004')) throw new Error('Repair queue navigation modified the next Boss draft before confirmation.');
  await page.screenshot({ path: screenshot('repair-queue') });
  await page.getByTestId('challenge-route-apply-repair').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-repair-queue-position"]')?.textContent === '—/0');
  if ((await page.getByTestId('challenge-repair-queue-session').innerText()) !== '1') throw new Error('Consecutive queue repair did not increment the current session count.');
  await page.getByTestId('challenge-route-undo-repair').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-repair-queue-position"]')?.textContent === '1/1');
  if ((await page.getByTestId('challenge-repair-queue-session').innerText()) !== '0') throw new Error('Consecutive queue undo did not decrement the current session count.');
  const campaignAfterQueueNavigation = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (campaignAfterQueueNavigation !== campaignBefore) throw new Error('Repair queue navigation/apply/undo mutated Campaign save data.');
  await page.getByTestId('challenge-route-reset').click();

  await page.getByTestId('challenge-boss').selectOption('BOSS002');
  const gapFreeBeforeEdit = Number(await page.getByTestId('challenge-portfolio-gap-free').innerText());
  const hasGapsBeforeEdit = Number(await page.getByTestId('challenge-portfolio-has-gaps').innerText());
  if (gapFreeBeforeEdit < 1 || gapFreeBeforeEdit + hasGapsBeforeEdit !== 3) throw new Error('Draft portfolio does not partition all three drafts.');
  await page.getByTestId('deployment-tab-crew').click();
  await page.getByTestId('art-preview-character').selectOption('CHR-GOV-001');
  await page.getByTestId('deployment-tab-route').click();
  await page.waitForFunction(([gapFree, hasGaps]) => document.querySelector('[data-testid="challenge-portfolio-gap-free"]')?.textContent === String(gapFree - 1)
    && document.querySelector('[data-testid="challenge-portfolio-has-gaps"]')?.textContent === String(hasGaps + 1), [gapFreeBeforeEdit, hasGapsBeforeEdit]);
  if (!(await page.getByTestId('challenge-route-draft-gaps').innerText()).includes('無 Reactive 事件回應')) throw new Error('Manual crew edit did not update the selected Route structural gap.');
  await page.getByTestId('deployment-tab-crew').click();
  await page.getByTestId('art-preview-character').selectOption('CHR-GOV-003');
  await page.getByTestId('deployment-tab-route').click();
  await page.waitForFunction(([gapFree, hasGaps]) => document.querySelector('[data-testid="challenge-portfolio-gap-free"]')?.textContent === String(gapFree)
    && document.querySelector('[data-testid="challenge-portfolio-has-gaps"]')?.textContent === String(hasGaps), [gapFreeBeforeEdit, hasGapsBeforeEdit]);

  await page.getByTestId('challenge-filter-readiness').selectOption('GAP_FREE');
  await page.waitForFunction((count) => document.querySelector('[data-testid="challenge-route-count"]')?.textContent === `${count}/100`, gapFreeBeforeEdit);
  await page.getByTestId('challenge-filter-readiness').selectOption('HAS_GAPS');
  await page.waitForFunction((count) => document.querySelector('[data-testid="challenge-route-count"]')?.textContent === `${count}/100`, hasGapsBeforeEdit);
  await page.getByTestId('challenge-filter-readiness').selectOption('NO_REACTIVE');
  const noReactiveCount = Number((await page.getByTestId('challenge-route-count').innerText()).split('/')[0]);
  if (noReactiveCount < 1 || noReactiveCount > hasGapsBeforeEdit || !(await page.getByTestId('challenge-route-draft-gaps').innerText()).includes('無 Reactive 事件回應')) {
    throw new Error('NO_REACTIVE readiness filter returned an invalid draft set.');
  }
  await page.getByTestId('challenge-route-reset').click();
  await page.getByTestId('challenge-route-sort').selectOption('READINESS');
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-boss"] option')?.value === 'BOSS002');
  await page.getByTestId('challenge-boss').selectOption('BOSS002');
  await page.screenshot({ path: screenshot('draft-readiness') });
  await page.getByTestId('challenge-route-reset').click();
  await page.getByTestId('challenge-route-sort').selectOption('DRAFTED_FIRST');
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-boss"] option')?.value === 'BOSS002');
  await page.getByTestId('challenge-boss').selectOption('BOSS002');
  await page.screenshot({ path: screenshot('draft-route') });
  await page.getByTestId('challenge-route-reset').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS001');

  await page.getByTestId('challenge-filter-severity').selectOption('S5');
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-route-count"]')?.textContent === '20/100');
  if ((await page.getByTestId('challenge-boss').locator('option').count()) !== 20) throw new Error('S5 filter does not reduce Route to 20 bosses.');
  await page.getByTestId('challenge-filter-class').selectOption('GRD');
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-route-count"]')?.textContent === '1/100');
  if ((await page.getByTestId('challenge-boss').inputValue()) !== 'BOSS080') throw new Error('S5 + GRD filter did not select BOSS080.');
  const hardAudit = await page.getByTestId('challenge-audit-selected').innerText();
  if (!hardAudit.includes('HARD OUTLIER') || !hardAudit.includes('8/24 TEAMS')) throw new Error(`BOSS080 audit signal is incorrect: ${hardAudit}`);
  const grdStrategy = await page.getByTestId('challenge-strategy-briefing').innerText();
  if (!grdStrategy.includes('GRD') || !grdStrategy.includes('電網擾動') || !grdStrategy.includes('安全 -2/R') || !grdStrategy.includes('Energy -2/R') || !grdStrategy.includes('R01') || !grdStrategy.includes('R04') || !grdStrategy.includes('R07')) {
    throw new Error(`BOSS080 Strategy Briefing is incorrect: ${grdStrategy}`);
  }
  await page.getByTestId('challenge-seed-audit-draft').click();
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'VERIFIED CLEAR');
  if (!(await page.getByTestId('challenge-draft-verification-result').innerText()).includes('D · 58 · R8/10')) throw new Error('BOSS080 audit-team verification does not match its static audit result.');
  await page.getByTestId('deployment-tab-crew').click();
  await page.getByTestId('art-preview-character').selectOption('CHR-GOV-001');
  await page.getByTestId('deployment-team-1').selectOption('CHR-MAR-176');
  await page.getByTestId('deployment-team-2').selectOption('CHR-OMI-221');
  await page.getByTestId('deployment-tab-route').click();
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'UNVERIFIED') throw new Error('Changing the draft did not invalidate its previous verification result.');
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'VERIFIED FAILED');
  if ((await page.getByTestId('challenge-audit-selected').innerText()) !== hardAudit) throw new Error('Failed draft verification mutated the BOSS080 static audit snapshot.');
  const failedVerificationSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (Object.keys(failedVerificationSave?.bestByBossId ?? {}).length !== 0) throw new Error('Failed draft verification incorrectly created a local best record.');
  if ((await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== campaignBefore) throw new Error('Failed draft verification mutated Campaign save data.');
  await page.screenshot({ path: screenshot('draft-verification-failed') });
  const b080PriorityRepair = await page.getByTestId('challenge-route-draft-gaps').innerText();
  if (!b080PriorityRepair.includes('PRIORITY') || !b080PriorityRepair.includes('CHR-MFG-128') || !b080PriorityRepair.includes('CHR-GOV-001')) throw new Error(`BOSS080 failed verification did not expose its priority repair: ${b080PriorityRepair}`);
  await page.getByTestId('challenge-route-apply-repair').click();
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'RE-VERIFY REQUIRED') throw new Error('BOSS080 repair did not require a fresh runtime verification.');
  if (!(await page.getByTestId('challenge-draft-verification-before-ids').innerText()).includes('CHR-GOV-001 / CHR-MAR-176 / CHR-OMI-221')) throw new Error('BOSS080 repair did not preserve the before stable IDs.');
  if ((await page.getByTestId('challenge-route-draft-ids').innerText()) !== 'CHR-MFG-128 / CHR-MAR-176 / CHR-OMI-221') throw new Error('BOSS080 repair did not expose the after stable IDs.');
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'STILL FAILED');
  if (!(await page.getByTestId('challenge-draft-verification-result').innerText()).includes('→') || !(await page.getByTestId('challenge-draft-verification-result').innerText()).includes('Δ')) throw new Error('BOSS080 still-failed comparison is missing before/after deltas.');
  await page.screenshot({ path: screenshot('draft-reverify-still-failed') });
  const beforeEscalationEvaluation = await page.evaluate(() => localStorage.getItem('owm.challenge.v3'));
  const escalationPrompt = await page.getByTestId('challenge-route-repair-target').innerText();
  if (!escalationPrompt.includes('結構修補後仍失敗')) throw new Error(`BOSS080 did not expose Runtime Repair Escalation: ${escalationPrompt}`);
  await page.getByTestId('challenge-evaluate-runtime-repairs').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-route-repair-target"]')?.textContent?.includes('0 CLEAR / 59 EVALUATED'));
  const escalationSummary = await page.getByTestId('challenge-route-repair-target').innerText();
  if (!escalationSummary.includes('#1 IMPROVED FAILED') || !escalationSummary.includes('SCORE 33→34 (+1)') || !escalationSummary.includes('R8→8 (+0)')) throw new Error(`BOSS080 runtime escalation selected preview is incorrect: ${escalationSummary}`);
  const defaultRuntimeRepair = await page.getByTestId('challenge-runtime-repair-candidates').locator('option:checked').innerText();
  if (!defaultRuntimeRepair.includes('#1') || !defaultRuntimeRepair.includes('CHR-ACA-043') || !defaultRuntimeRepair.includes('IMPROVED FAILED')) throw new Error(`Runtime Repair did not default to its best improving candidate: ${defaultRuntimeRepair}`);
  const runtimeRepairDetail = await page.getByTestId('challenge-runtime-repair-detail').innerText();
  if (!runtimeRepairDetail.includes('SLOT 1') || !runtimeRepairDetail.includes('CHR-MFG-128') || !runtimeRepairDetail.includes('CHR-ACA-043')) throw new Error(`Runtime Repair slot replacement preview is incorrect: ${runtimeRepairDetail}`);
  const runtimeRepairProvenance = await page.getByTestId('challenge-runtime-repair-provenance').innerText();
  if (!runtimeRepairProvenance.includes('ON_DEMAND_RUNTIME_SHORTLIST') || !runtimeRepairProvenance.includes('COUNTER 1/3') || !runtimeRepairProvenance.includes('STAGE 6/6') || !runtimeRepairProvenance.includes('GAPS 0') || !runtimeRepairProvenance.includes('TOP 6')) throw new Error(`Runtime Repair structural metrics are missing: ${runtimeRepairProvenance}`);
  const runtimeRepairOptions = page.getByTestId('challenge-runtime-repair-candidates').locator('option');
  if ((await runtimeRepairOptions.count()) !== 6) throw new Error('Runtime Repair Escalation does not expose all six shortlisted candidates.');
  const runtimeRepairOptionLabels = await runtimeRepairOptions.allTextContents();
  const noImprovementIndex = runtimeRepairOptionLabels.findIndex((label) => label.includes('NO IMPROVEMENT'));
  if (noImprovementIndex < 0) throw new Error(`Runtime Repair shortlist did not retain an honest no-improvement comparison: ${runtimeRepairOptionLabels.join(' | ')}`);
  const noImprovementValue = await runtimeRepairOptions.nth(noImprovementIndex).getAttribute('value');
  if (!noImprovementValue || noImprovementValue === '1') throw new Error('A no-improvement candidate was incorrectly selected as the default repair.');
  await page.getByTestId('challenge-runtime-repair-candidates').selectOption(noImprovementValue);
  const selectedRuntimeRepair = await page.getByTestId('challenge-runtime-repair-candidates').locator('option:checked').innerText();
  const selectedRuntimeRepairId = selectedRuntimeRepair.match(/CHR-[A-Z]{3}-\d{3}/)?.[0];
  if (!selectedRuntimeRepairId || !selectedRuntimeRepair.includes('NO IMPROVEMENT')) throw new Error(`Selecting a runtime repair candidate did not expose its honest stable ID/verdict: ${selectedRuntimeRepair}`);
  const noImprovementSummary = await page.getByTestId('challenge-route-repair-target').innerText();
  if (!noImprovementSummary.includes('NO IMPROVEMENT') || !noImprovementSummary.includes('SCORE 33→33 (+0)')) throw new Error(`Selected no-improvement deltas are incorrect: ${noImprovementSummary}`);
  if ((await page.evaluate(() => localStorage.getItem('owm.challenge.v3'))) !== beforeEscalationEvaluation) throw new Error('Evaluating runtime repair candidates mutated Challenge save data.');
  await page.screenshot({ path: screenshot('runtime-repair-escalation') });
  await assertSingleScreen('Runtime Repair Escalation', '.deployment-shell');
  await page.getByTestId('challenge-apply-runtime-repair').click();
  if (!(await page.getByTestId('challenge-route-draft-ids').innerText()).includes(selectedRuntimeRepairId)) throw new Error('Applying the selected runtime repair did not use its stable IDs.');
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'STILL FAILED') throw new Error('Applying a failed runtime repair candidate was incorrectly promoted to CLEAR.');
  if (!(await page.getByTestId('challenge-draft-verification-result').innerText()).includes('33→33 · Δ+0')) throw new Error('Applying the selected no-improvement candidate did not preserve its exact runtime delta.');
  if ((await page.getByTestId('challenge-confirm-draft-settlement').count()) !== 0) throw new Error('FAILED runtime repair candidate incorrectly exposed local-best confirmation.');
  const escalationAppliedSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (Object.keys(escalationAppliedSave?.bestByBossId ?? {}).length !== 0 || escalationAppliedSave.draftByBossId?.BOSS080?.teamIds?.[0] !== selectedRuntimeRepairId) throw new Error('Runtime repair apply changed best provenance or saved the wrong draft.');
  if ((await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== campaignBefore) throw new Error('Runtime repair escalation mutated Campaign save data.');
  await page.screenshot({ path: screenshot('runtime-repair-applied') });
  await page.getByTestId('challenge-route-undo-repair').click();
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'STILL FAILED' || (await page.getByTestId('challenge-route-draft-ids').innerText()) !== 'CHR-MFG-128 / CHR-MAR-176 / CHR-OMI-221') throw new Error('Runtime repair undo did not restore its exact previous comparison and team.');
  const restoredRuntimeRepairOptions = await page.getByTestId('challenge-runtime-repair-candidates').locator('option').allTextContents();
  if (JSON.stringify(restoredRuntimeRepairOptions) !== JSON.stringify(runtimeRepairOptionLabels)) throw new Error('Runtime repair undo did not restore the exact previous shortlist.');
  if (!(await page.getByTestId('challenge-runtime-repair-candidates').locator('option:checked').innerText()).includes('IMPROVED FAILED')) throw new Error('Runtime repair undo did not return selection to the recommended improving candidate.');

  const beforeRuntimeRepairReload = await page.evaluate(() => localStorage.getItem('owm.challenge.v3'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-challenge').click();
  await page.getByTestId('challenge-filter-severity').selectOption('S5');
  await page.getByTestId('challenge-filter-class').selectOption('GRD');
  if ((await page.getByTestId('challenge-route-draft-ids').innerText()) !== 'CHR-MFG-128 / CHR-MAR-176 / CHR-OMI-221') throw new Error('Reload did not preserve the last explicitly applied draft team.');
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'UNVERIFIED' || (await page.getByTestId('challenge-runtime-repair-candidates').count()) !== 0) throw new Error('Runtime Repair comparison/shortlist leaked across reload.');
  if ((await page.evaluate(() => localStorage.getItem('owm.challenge.v3'))) !== beforeRuntimeRepairReload) throw new Error('Runtime Repair reload isolation mutated Challenge save data.');

  await page.getByTestId('challenge-route-reset').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS015');
  await page.getByTestId('challenge-seed-audit-draft').click();
  const b015StaticAudit = await page.getByTestId('challenge-audit-selected').innerText();
  await page.getByTestId('deployment-tab-crew').click();
  await page.getByTestId('art-preview-character').selectOption('CHR-GOV-001');
  await page.getByTestId('deployment-team-1').selectOption('CHR-MAR-176');
  await page.getByTestId('deployment-team-2').selectOption('CHR-OMI-221');
  await page.getByTestId('deployment-tab-route').click();
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'VERIFIED FAILED');
  const b015PriorityRepair = await page.getByTestId('challenge-route-draft-gaps').innerText();
  if (!b015PriorityRepair.includes('PRIORITY') || !b015PriorityRepair.includes('CHR-MFG-128') || !b015PriorityRepair.includes('CHR-GOV-001')) throw new Error(`BOSS015 failed verification did not expose its priority repair: ${b015PriorityRepair}`);
  await page.getByTestId('challenge-route-apply-repair').click();
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'RE-VERIFY REQUIRED') throw new Error('BOSS015 repair did not enter the re-verification state.');
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'REPAIR CLEAR');
  const b015Comparison = await page.getByTestId('challenge-draft-verification-result').innerText();
  if (!b015Comparison.includes('→') || !b015Comparison.includes('Δ')) throw new Error(`BOSS015 clear comparison is missing before/after deltas: ${b015Comparison}`);
  if ((await page.getByTestId('challenge-audit-selected').innerText()) !== b015StaticAudit) throw new Error('BOSS015 repair/reverify mutated the static audit snapshot.');
  const repairVerificationSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (Object.keys(repairVerificationSave?.bestByBossId ?? {}).length !== 0) throw new Error('Repair/reverify incorrectly created a local best record.');
  if ((await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== campaignBefore) throw new Error('Repair/reverify mutated Campaign save data.');
  const pendingSettlementTarget = await page.getByTestId('challenge-route-repair-target').innerText();
  if (!pendingSettlementTarget.includes('BEST NONE→') || !(await page.getByTestId('challenge-draft-settlement-team').innerText()).includes('NO SAVE UNTIL CONFIRMED')) throw new Error(`CLEAR repair did not expose an uncommitted settlement preview: ${pendingSettlementTarget}`);
  if (!(await page.getByTestId('challenge-draft-settlement-provenance').innerText()).includes('DRAFT_RUNTIME_CONFIRMATION_REQUIRED · CAMPAIGN ISOLATED')) throw new Error('CLEAR repair settlement provenance is missing.');
  await assertSingleScreen('Draft repair verification', '.deployment-shell');
  await page.screenshot({ path: screenshot('draft-settlement-pending') });
  await page.getByTestId('challenge-cancel-draft-settlement').click();
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'VERIFIED FAILED' || (await page.getByTestId('challenge-route-draft-ids').innerText()) !== 'CHR-GOV-001 / CHR-MAR-176 / CHR-OMI-221') throw new Error('Canceling CLEAR settlement did not restore before IDs/result.');
  if (Object.keys((await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null')))?.bestByBossId ?? {}).length !== 0) throw new Error('Canceling CLEAR settlement wrote a local best.');

  await page.getByTestId('challenge-route-apply-repair').click();
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'REPAIR CLEAR');
  await page.getByTestId('challenge-confirm-draft-settlement').click();
  if (!(await page.getByTestId('challenge-route-repair-target').innerText()).includes('LOCAL BEST') || !(await page.getByTestId('challenge-draft-settlement-team').innerText()).includes('NEW LOCAL BEST SAVED')) throw new Error('Confirming CLEAR settlement did not expose the saved local best.');
  if (!(await page.getByTestId('challenge-draft-settlement-provenance').innerText()).includes('SAVED TO owm.challenge.v3 · DRAFT 確認')) throw new Error('Confirmed CLEAR settlement did not expose permanent source provenance.');
  const confirmedDraftSettlementSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (Object.keys(confirmedDraftSettlementSave?.bestByBossId ?? {}).join(',') !== 'BOSS015' || confirmedDraftSettlementSave.bestByBossId.BOSS015.completed !== true || confirmedDraftSettlementSave.bestByBossId.BOSS015.source !== 'DRAFT_CONFIRMATION' || confirmedDraftSettlementSave.bestByBossId.BOSS015.teamIds.join('|') !== 'CHR-MFG-128|CHR-MAR-176|CHR-OMI-221') throw new Error(`Confirmed CLEAR settlement saved incorrect provenance: ${JSON.stringify(confirmedDraftSettlementSave?.bestByBossId)}`);
  if ((await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== campaignBefore || (await page.getByTestId('challenge-audit-selected').innerText()) !== b015StaticAudit) throw new Error('Confirmed CLEAR settlement mutated Campaign or static audit state.');
  await assertSingleScreen('Draft settlement confirmed', '.deployment-shell');
  await page.screenshot({ path: screenshot('draft-settlement-confirmed') });

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-challenge').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS015');
  if ((await page.getByTestId('challenge-draft-verification-status').innerText()) !== 'UNVERIFIED' || (await page.getByTestId('challenge-confirm-draft-settlement').count()) !== 0) throw new Error('Draft settlement preview leaked across reload.');
  if (!(await page.getByTestId('challenge-audit-selected').innerText()).includes('DETERMINISTIC AUDIT')) throw new Error('Draft settlement reload lost the static audit snapshot.');
  const restoredDraftSource = await page.getByTestId('challenge-selected-best-source').innerText();
  if (!restoredDraftSource.includes('DRAFT 確認')) throw new Error(`Draft-confirmation source did not restore after reload: ${restoredDraftSource}`);
  if ((await page.getByTestId('challenge-source-operation').innerText()) !== '0/0' || (await page.getByTestId('challenge-source-draft-confirmation').innerText()) !== '1/1') throw new Error('Draft-confirmation source summary is incorrect after reload.');
  await page.screenshot({ path: screenshot('draft-source-reload') });

  await page.getByTestId('challenge-route-reset').click();
  await page.getByTestId('challenge-route-sort').selectOption('AUDIT_HARDEST');
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-boss"] option')?.value === 'BOSS079');
  await page.screenshot({ path: screenshot('route-filters') });
  await page.getByTestId('challenge-filter-status').selectOption('FAILED');
  await page.getByTestId('challenge-route-empty').waitFor({ state: 'visible' });
  if (await page.getByTestId('deploy-mission').isEnabled()) throw new Error('Challenge Deploy remains enabled when Route filters have no matches.');
  await page.getByTestId('challenge-route-reset').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS001');
  if ((await page.getByTestId('strategy-class-code').innerText()) !== 'WEA' || !(await page.getByTestId('strategy-impact-weather').innerText()).includes('天候 -4/R')) {
    throw new Error('BOSS001 Strategy Briefing did not switch to official WEA pressure.');
  }
  await assertSingleScreen('Challenge route', '.deployment-shell');
  await page.screenshot({ path: screenshot('deployment') });
  await page.screenshot({ path: screenshot('strategy-route') });

  if (!(await page.getByTestId('strategy-find-reactive').isVisible())) throw new Error('Strategy Reactive gap does not expose the Crew filter action.');
  await page.getByTestId('strategy-find-reactive').click();
  await page.getByTestId('crew-roster-filters').waitFor({ state: 'visible' });
  if ((await page.getByTestId('crew-filter-capability').inputValue()) !== 'REACTIVE') throw new Error('Strategy gap action did not switch to the Reactive Crew filter.');
  const reactiveCrewCount = (await page.getByTestId('crew-filter-count').innerText()).replace(/\s+/g, ' ').trim();
  if (reactiveCrewCount !== '60/300 · 300/300') throw new Error(`Reactive Crew filter count is incorrect: ${reactiveCrewCount}`);
  const gapCandidates = await page.getByTestId('challenge-gap-candidates').innerText();
  if (!gapCandidates.includes('60 CREW / 180 SWAPS') || !gapCandidates.includes('NOT AUDIT VERIFIED')) throw new Error(`Strategy Gap Candidate Preview provenance is incomplete: ${gapCandidates}`);
  const candidateMetrics = {
    reactive: await page.getByTestId('gap-candidate-0-reactive').innerText(),
    counter: await page.getByTestId('gap-candidate-0-counter').innerText(),
    stage: await page.getByTestId('gap-candidate-0-stage').innerText(),
  };
  if (!candidateMetrics.reactive.includes('0→1') || !candidateMetrics.counter.includes('2→3/3') || !candidateMetrics.stage.includes('6→6/6')) {
    throw new Error(`Strategy Gap Candidate Preview metrics are incorrect: ${JSON.stringify(candidateMetrics)}`);
  }
  await assertSingleScreen('Challenge capability filter', '.deployment-shell');
  await page.screenshot({ path: screenshot('capability-filter') });
  await page.getByTestId('apply-gap-candidate-0').click();
  const candidateTeam = await page.locator('.team-selectors select').evaluateAll((selects) => selects.map((select) => select.value));
  if (JSON.stringify(candidateTeam) !== JSON.stringify(['CHR-MAR-178', 'CHR-MAR-176', 'CHR-OMI-221'])) throw new Error(`Strategy Gap Candidate was not applied as a one-slot swap: ${JSON.stringify(candidateTeam)}`);
  if (!(await page.getByTestId('strategy-reactive').innerText()).includes('READY')) throw new Error('Applying a Reactive gap candidate did not update Strategy readiness.');
  if (!(await page.getByTestId('restore-gap-candidate').isVisible())) throw new Error('Strategy Gap Candidate Preview does not expose previous-team restore.');
  if ((await page.getByTestId('challenge-gap-candidates').innerText()).includes('AUDIT VERIFIED') && !(await page.getByTestId('challenge-gap-candidates').innerText()).includes('NOT AUDIT VERIFIED')) {
    throw new Error('Strategy Gap Candidate was incorrectly labeled as audit verified.');
  }
  await page.screenshot({ path: screenshot('candidate-applied') });
  await page.getByTestId('restore-gap-candidate').click();
  const restoredCandidateTeam = await page.locator('.team-selectors select').evaluateAll((selects) => selects.map((select) => select.value));
  if (JSON.stringify(restoredCandidateTeam) !== JSON.stringify(['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'])) throw new Error(`Strategy Gap Candidate previous team was not restored: ${JSON.stringify(restoredCandidateTeam)}`);
  if (!(await page.getByTestId('strategy-reactive').innerText()).includes('GAP')) throw new Error('Restoring the previous team did not restore the Reactive gap.');
  await page.getByTestId('crew-filter-capability').selectOption('TEAM_RECOVERY');
  await page.waitForFunction(() => document.querySelector('[data-testid="crew-filter-count"]')?.textContent?.includes('300/300'));
  await page.getByTestId('crew-filter-capability').selectOption('LOW_ENERGY');
  await page.waitForFunction(() => document.querySelector('[data-testid="crew-filter-count"]')?.textContent?.includes('240/300'));
  await page.getByTestId('crew-filter-capability').selectOption('ALL');
  await page.waitForFunction(() => document.querySelector('[data-testid="crew-filter-count"]')?.textContent?.includes('300/300'));
  const crewCount = (await page.getByTestId('crew-filter-count').innerText()).replace(/\s+/g, ' ').trim();
  if (crewCount !== '300/300 · 300/300') throw new Error(`Challenge roster is not 300/300: ${crewCount}`);
  if ((await page.getByTestId('art-preview-character').locator('option').count()) !== 300) throw new Error('Challenge first crew selector does not expose 300 characters.');
  const firstCrewOptions = await page.getByTestId('art-preview-character').innerText();
  if (!firstCrewOptions.includes('M3')) throw new Error('Challenge crew selector does not show fixed Mastery L3.');
  if (!(await page.getByTestId('team-perk-summary').innerText()).includes('0/6')) throw new Error('L4/L5 perks leaked into fixed Mastery L3 Challenge.');
  const squadAdvisor = await page.getByTestId('challenge-squad-advisor').innerText();
  if (!squadAdvisor.includes('BOSS001') || !squadAdvisor.includes('VERIFIED') || !squadAdvisor.includes('80') || !squadAdvisor.includes('R2') || !squadAdvisor.includes('100%') || !squadAdvisor.includes('3/3') || !squadAdvisor.includes('6/6')) {
    throw new Error(`Challenge Squad Advisor is incomplete: ${squadAdvisor}`);
  }
  const initialCompare = {
    currentCounter: await page.getByTestId('challenge-compare-current-counter').innerText(),
    auditCounter: await page.getByTestId('challenge-compare-audit-counter').innerText(),
    currentStage: await page.getByTestId('challenge-compare-current-stage').innerText(),
    auditStage: await page.getByTestId('challenge-compare-audit-stage').innerText(),
    sharedMembers: await page.getByTestId('challenge-compare-shared-members').innerText(),
  };
  if (JSON.stringify(initialCompare) !== JSON.stringify({ currentCounter: '2/3', auditCounter: '3/3', currentStage: '6/6', auditStage: '6/6', sharedMembers: '0/3' })) {
    throw new Error(`Challenge Squad Compare initial state is incorrect: ${JSON.stringify(initialCompare)}`);
  }
  const initialStrategy = await page.getByTestId('challenge-strategy-briefing').innerText();
  if (!initialStrategy.includes('WEA') || !initialStrategy.includes('R01') || !initialStrategy.includes('R04') || !initialStrategy.includes('R07') || !initialStrategy.includes('無 Reactive 事件回應')) {
    throw new Error(`Challenge Crew Strategy Briefing is incomplete: ${initialStrategy}`);
  }
  if (!(await page.getByTestId('strategy-reactive').innerText()).includes('0') || !(await page.getByTestId('strategy-reactive').innerText()).includes('GAP')) {
    throw new Error('Challenge Strategy Briefing does not expose the initial Reactive gap.');
  }
  if (await page.getByTestId('apply-challenge-squad').isDisabled()) throw new Error('Challenge Squad Advisor is incorrectly marked as applied before selection.');
  if (!(await page.getByTestId('apply-challenge-squad').innerText()).includes('恢復')) throw new Error('Challenge Squad Compare does not offer audit-team restore.');
  await assertSingleScreen('Challenge squad compare', '.deployment-shell');
  await page.screenshot({ path: screenshot('squad-compare') });
  await page.getByTestId('apply-challenge-squad').click();
  const appliedTeam = await page.locator('.team-selectors select').evaluateAll((selects) => selects.map((select) => select.value));
  const expectedTeam = ['CHR-MAR-200', 'CHR-MAR-220', 'CHR-OMI-270'];
  if (JSON.stringify(appliedTeam) !== JSON.stringify(expectedTeam)) throw new Error(`Challenge audit squad was not applied: ${JSON.stringify(appliedTeam)}`);
  if (!(await page.getByTestId('apply-challenge-squad').isDisabled()) || !(await page.getByTestId('apply-challenge-squad').innerText()).includes('已套用')) {
    throw new Error('Challenge Squad Advisor does not confirm the applied state.');
  }
  if ((await page.getByTestId('challenge-compare-current-counter').innerText()) !== '3/3' || (await page.getByTestId('challenge-compare-shared-members').innerText()) !== '3/3') {
    throw new Error('Challenge Squad Compare did not update after applying the audit team.');
  }
  await page.getByTestId('art-preview-character').selectOption('CHR-GOV-003');
  if ((await page.getByTestId('challenge-compare-current-counter').innerText()) !== '2/3' || (await page.getByTestId('challenge-compare-shared-members').innerText()) !== '2/3') {
    throw new Error('Challenge Squad Compare did not update after a manual crew change.');
  }
  const reactiveReady = await page.getByTestId('strategy-reactive').innerText();
  if (!reactiveReady.includes('1') || !reactiveReady.includes('READY') || !(await page.getByTestId('strategy-gap-signals').innerText()).includes('STRUCTURE READY')) {
    throw new Error(`Challenge Strategy Briefing did not update after selecting a Reactive crew member: ${reactiveReady}`);
  }
  if (await page.getByTestId('apply-challenge-squad').isDisabled()) throw new Error('Challenge Squad restore remains disabled after a manual crew change.');
  await page.getByTestId('apply-challenge-squad').click();
  const restoredTeam = await page.locator('.team-selectors select').evaluateAll((selects) => selects.map((select) => select.value));
  if (JSON.stringify(restoredTeam) !== JSON.stringify(expectedTeam)) throw new Error(`Challenge audit squad was not restored after manual change: ${JSON.stringify(restoredTeam)}`);
  if (!(await page.getByTestId('strategy-reactive').innerText()).includes('GAP')) throw new Error('Challenge Strategy Briefing did not restore the audit team Reactive gap.');
  const deploymentStats = await page.locator('.deployment-stats').innerText();
  if (!deploymentStats.includes('10') || deploymentStats.includes('11')) throw new Error(`Challenge Crew summary does not show the fixed 10-round limit: ${deploymentStats}`);
  const campaignAfterSquadApply = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  if (campaignAfterSquadApply !== campaignBefore) throw new Error('Applying a Challenge audit squad mutated Campaign save data.');
  await assertSingleScreen('Challenge crew', '.deployment-shell');
  await page.screenshot({ path: screenshot('squad-advisor') });

  await page.getByTestId('deployment-tab-loadout').click();
  const fixedLoadout = await page.evaluate(() => {
    const value = (testId) => document.querySelector(`[data-testid="${testId}"]`)?.value;
    const disabled = (testId) => document.querySelector(`[data-testid="${testId}"]`)?.disabled;
    return {
      equipment: value('deployment-equipment'),
      spare: value('deployment-spare'),
      vessel: value('deployment-vessel'),
      disabled: ['deployment-equipment', 'deployment-spare', 'deployment-vessel'].every(disabled),
    };
  });
  if (fixedLoadout.equipment !== 'EQ0051' || fixedLoadout.spare !== 'EQ0126' || fixedLoadout.vessel !== 'VES002' || !fixedLoadout.disabled) {
    throw new Error(`Challenge fixed loadout is incorrect: ${JSON.stringify(fixedLoadout)}`);
  }
  const loadoutText = await page.getByTestId('loadout-quality').innerText();
  if (!loadoutText.includes('MASTERY L3') || !loadoutText.includes('10 ROUNDS') || !loadoutText.includes('LOCAL BEST') || !loadoutText.includes('FIXED L1')) {
    throw new Error(`Challenge loadout contract is missing: ${loadoutText}`);
  }
  await assertSingleScreen('Challenge loadout', '.deployment-shell');

  await page.getByTestId('deploy-mission').click();
  await page.locator('.phaser-host canvas').waitFor({ state: 'visible', timeout: 15000 });
  if (!(await page.locator('.locked-mission').innerText()).includes('Boss 挑戰')) throw new Error('Operation header does not identify Boss Challenge mode.');
  const challengeOperationLogSelected = await page.getByTestId('operation-info-tab-log').getAttribute('aria-selected');
  if (challengeOperationLogSelected !== 'true' || !(await page.getByTestId('operation-log-list').isVisible())) {
    throw new Error('Boss Challenge Operation did not default info tab to LOG.');
  }
  const mastery = await page.getByTestId('active-character-mastery').innerText();
  if (!mastery.includes('L3') || !mastery.includes('250 XP')) throw new Error(`Runtime Mastery is not fixed at L3: ${mastery}`);
  if (!(await page.locator('.round-box').innerText()).includes('/ 10')) throw new Error('Challenge runtime round limit is not 10.');
  await assertSingleScreen('Challenge operation', '.game-grid');
  await page.screenshot({ path: screenshot('operation') });

  let reachedResult = false;
  for (let cycle = 0; cycle < 12 && !reachedResult; cycle += 1) {
    await settlePendingBranch();
    const teamTabs = page.locator('.team-tabs button');
    const teamCount = await teamTabs.count();
    for (let memberIndex = 0; memberIndex < teamCount && !reachedResult; memberIndex += 1) {
      await teamTabs.nth(memberIndex).click();
      for (let action = 0; action < 5; action += 1) {
        const enabledSkills = page.locator('.skill-button:not(:disabled)');
        if ((await enabledSkills.count()) === 0) break;
        await enabledSkills.first().click();
        reachedResult = await page.getByTestId('challenge-result').isVisible();
        if (reachedResult) break;
      }
    }
    if (!reachedResult) {
      await settlePendingBranch();
      const nextRound = page.getByTestId('next-round');
      if (!(await nextRound.isVisible())) break;
      await nextRound.click();
      await settlePendingBranch();
      reachedResult = await page.getByTestId('challenge-result').isVisible();
    }
  }
  if (!reachedResult) throw new Error('Challenge did not settle within its fixed 10-round runtime.');
  await page.getByTestId('challenge-result').waitFor({ state: 'visible' });
  const resultText = await page.getByTestId('challenge-result').innerText();
  if (!resultText.includes('NEW LOCAL BEST') || !resultText.includes('owm.challenge.v3') || !resultText.includes('Campaign XP／MNT／RST／疲勞／裝備 Condition 均未變更')) {
    throw new Error(`Challenge result is incomplete: ${resultText}`);
  }
  if ((await page.getByTestId('challenge-result-attempt-source').innerText()) !== 'OPERATION' || (await page.getByTestId('challenge-result-best-source').innerText()) !== 'OPERATION') throw new Error('Operation result did not expose permanent source provenance.');
  const campaignAfter = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));
  const challengeSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (campaignAfter !== campaignBefore) throw new Error(`Challenge mutated Campaign save: ${campaignBefore} -> ${campaignAfter}`);
  if (challengeSave?.schemaVersion !== 3 || Object.keys(challengeSave.bestByBossId ?? {}).length !== 2 || Object.keys(challengeSave.draftByBossId ?? {}).length < 3) {
    throw new Error(`Challenge best score was not persisted independently: ${JSON.stringify(challengeSave)}`);
  }
  if (challengeSave.bestByBossId.BOSS001.source !== 'OPERATION' || challengeSave.bestByBossId.BOSS001.teamIds.join('|') !== expectedTeam.join('|') || challengeSave.bestByBossId.BOSS015.source !== 'DRAFT_CONFIRMATION' || challengeSave.bestByBossId.BOSS015.teamIds.join('|') !== 'CHR-MFG-128|CHR-MAR-176|CHR-OMI-221' || challengeSave.draftByBossId.BOSS002.teamIds[0] !== 'CHR-GOV-003') throw new Error('Challenge operation/draft-confirmation best teams and per-Boss draft provenance were not preserved independently.');
  await assertSingleScreen('Challenge result', '.game-grid');
  await page.screenshot({ path: screenshot('result') });

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-challenge').click();
  const restoredBest = await page.getByTestId('challenge-selected-best').innerText();
  if (!restoredBest.includes('BEST') || restoredBest.includes('尚無紀錄')) throw new Error(`Challenge best did not restore after reload: ${restoredBest}`);
  const restoredOperationSource = await page.getByTestId('challenge-selected-best-source').innerText();
  if (!restoredOperationSource.includes('OPERATION')) throw new Error(`Operation source did not restore after reload: ${restoredOperationSource}`);
  if ((await page.getByTestId('challenge-source-operation').innerText()) !== '1/1' || (await page.getByTestId('challenge-source-draft-confirmation').innerText()) !== '1/1') throw new Error('Coexisting source summary did not restore correctly.');

  await page.getByTestId('challenge-filter-source').selectOption('DRAFT_CONFIRMATION');
  if ((await page.getByTestId('challenge-route-count').innerText()) !== '1/100' || (await page.getByTestId('challenge-boss').inputValue()) !== 'BOSS015') throw new Error('DRAFT_CONFIRMATION source filter is incorrect.');
  await page.getByTestId('challenge-filter-status').selectOption('CLEARED');
  if ((await page.getByTestId('challenge-route-count').innerText()) !== '1/100') throw new Error('Source/status intersection filter is incorrect.');
  await page.getByTestId('challenge-filter-source').selectOption('OPERATION');
  if ((await page.getByTestId('challenge-route-count').innerText()) !== '1/100' || (await page.getByTestId('challenge-boss').inputValue()) !== 'BOSS001') throw new Error('OPERATION source filter is incorrect.');
  await page.getByTestId('challenge-route-reset').click();

  await page.getByTestId('deployment-tab-backup').click();
  await page.getByTestId('challenge-save-manager').waitFor({ state: 'visible' });
  const sourceBackupSummary = await page.getByTestId('challenge-save-source-summary').innerText();
  if (!sourceBackupSummary.includes('OPERATION\n1 BEST · 1 CLEAR') || !sourceBackupSummary.includes('DRAFT CONFIRMATION\n1 BEST · 1 CLEAR')) throw new Error(`Challenge backup source summary is incomplete: ${sourceBackupSummary}`);
  await page.getByTestId('challenge-save-generate').click();
  const challengeBackupText = await page.getByTestId('challenge-save-export-text').inputValue();
  const challengeBackupEnvelope = JSON.parse(challengeBackupText);
  const challengeBeforeBackup = await page.evaluate(() => localStorage.getItem('owm.challenge.v3'));
  if (challengeBackupEnvelope.format !== 'OWM_CHALLENGE_SAVE' || challengeBackupEnvelope.schemaVersion !== 3 || challengeBackupEnvelope.progress.bestByBossId.BOSS001.source !== 'OPERATION' || challengeBackupEnvelope.progress.bestByBossId.BOSS015.source !== 'DRAFT_CONFIRMATION') throw new Error(`Generated Challenge backup is incorrect: ${challengeBackupText}`);
  if ((await page.getByTestId('challenge-save-download').getAttribute('download')) !== 'OWM_challenge_save.json') throw new Error('Challenge backup download contract is missing.');

  await page.getByTestId('challenge-save-export-text').fill(campaignBefore ?? '');
  await page.getByTestId('challenge-save-import').click();
  if (!(await page.getByTestId('challenge-save-status').innerText()).includes('不是 Challenge 存檔')) throw new Error('Challenge importer did not reject Campaign JSON.');
  if ((await page.getByTestId('challenge-import-preview').count()) !== 0) throw new Error('Rejected Campaign JSON exposed an import preview.');
  if ((await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== campaignBefore) throw new Error('Rejected Challenge import mutated Campaign save.');

  const emptyChallengeBackup = JSON.stringify({ format: 'OWM_CHALLENGE_SAVE', schemaVersion: 3, exportedAt: 'SMOKE', progress: { schemaVersion: 3, bestByBossId: {}, draftByBossId: {} } });
  await page.getByTestId('challenge-save-export-text').fill(emptyChallengeBackup);
  await page.getByTestId('challenge-save-import').click();
  await page.getByTestId('challenge-import-preview').waitFor({ state: 'visible' });
  const emptyPreview = await page.getByTestId('challenge-import-preview').innerText();
  if (!emptyPreview.includes('IMPORT PREFLIGHT · V3→V3') || !emptyPreview.includes('BEST\n2→0') || !emptyPreview.includes('SQUAD DRAFT\n6→0') || !(await page.getByTestId('challenge-import-removed-bosses').innerText()).includes('BOSS001')) throw new Error(`Empty Challenge preflight diff is incomplete: ${emptyPreview}`);
  if ((await page.evaluate(() => localStorage.getItem('owm.challenge.v3'))) !== challengeBeforeBackup) throw new Error('Challenge preflight mutated localStorage before confirmation.');
  await page.getByTestId('challenge-import-cancel').click();
  if ((await page.getByTestId('challenge-import-preview').count()) !== 0 || !(await page.getByTestId('challenge-save-status').innerText()).includes('已取消')) throw new Error('Canceling Challenge import preview did not return to no-op state.');
  if ((await page.evaluate(() => localStorage.getItem('owm.challenge.v3'))) !== challengeBeforeBackup) throw new Error('Canceling Challenge import preview mutated localStorage.');

  const legacyChallengeBackup = JSON.stringify({
    format: 'OWM_CHALLENGE_SAVE',
    schemaVersion: 2,
    exportedAt: 'SMOKE-V2',
    progress: {
      schemaVersion: 2,
      bestByBossId: { BOSS015: challengeBackupEnvelope.progress.bestByBossId.BOSS015 },
      draftByBossId: { BOSS015: challengeBackupEnvelope.progress.draftByBossId.BOSS015 },
    },
  });
  await page.getByTestId('challenge-save-export-text').fill(legacyChallengeBackup);
  await page.getByTestId('challenge-save-import').click();
  await page.getByTestId('challenge-import-preview').waitFor({ state: 'visible' });
  const legacyPreview = await page.getByTestId('challenge-import-preview').innerText();
  if (!legacyPreview.includes('IMPORT PREFLIGHT · V2→V3') || !legacyPreview.includes('舊版正規化') || !legacyPreview.includes('BEST\n2→1') || !legacyPreview.includes('OPERATION\n1→1') || !legacyPreview.includes('DRAFT CONFIRM\n1→0') || !legacyPreview.includes('SQUAD DRAFT\n6→1')) throw new Error(`Legacy Challenge preflight is incomplete: ${legacyPreview}`);
  if (!(await page.getByTestId('challenge-import-affected-ids').innerText()).includes('BOSS015') || !(await page.getByTestId('challenge-import-removed-bosses').innerText()).includes('BOSS001')) throw new Error('Legacy Challenge preflight did not expose affected/removed stable IDs.');
  if ((await page.evaluate(() => localStorage.getItem('owm.challenge.v3'))) !== challengeBeforeBackup) throw new Error('Legacy Challenge preflight wrote before confirmation.');
  await assertSingleScreen('Challenge import preflight', '.deployment-shell');
  await page.screenshot({ path: screenshot('backup-preflight') });
  await page.getByTestId('challenge-import-confirm').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-save-source-summary"]')?.textContent?.includes('OPERATION1 BEST'));
  const importedLegacyChallengeSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (Object.keys(importedLegacyChallengeSave.bestByBossId ?? {}).join(',') !== 'BOSS015' || importedLegacyChallengeSave.bestByBossId.BOSS015.source !== 'OPERATION' || Object.keys(importedLegacyChallengeSave.draftByBossId ?? {}).join(',') !== 'BOSS015') throw new Error('Confirmed legacy Challenge import did not normalize/replace correctly.');
  if ((await page.getByTestId('challenge-import-undo').count()) !== 1 || !(await page.getByTestId('challenge-save-status').innerText()).includes('可 Undo')) throw new Error('Confirmed Challenge import did not expose session Undo.');
  if ((await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== campaignBefore) throw new Error('Confirmed Challenge import mutated Campaign save.');
  await page.screenshot({ path: screenshot('backup-confirmed') });

  await page.getByTestId('deployment-tab-route').click();
  await page.getByTestId('deployment-tab-backup').click();
  if ((await page.getByTestId('challenge-import-undo').count()) !== 1) throw new Error('Challenge import session Undo did not survive tab switching.');
  await page.getByTestId('challenge-import-undo-button').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-save-source-summary"]')?.textContent?.includes('DRAFT CONFIRMATION1 BEST'));
  const restoredChallengeSave = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.challenge.v3') ?? 'null'));
  if (restoredChallengeSave.bestByBossId.BOSS001.source !== 'OPERATION' || restoredChallengeSave.bestByBossId.BOSS015.source !== 'DRAFT_CONFIRMATION' || Object.keys(restoredChallengeSave.draftByBossId ?? {}).length !== 6) throw new Error('Challenge import Undo lost source or draft provenance.');
  if ((await page.getByTestId('challenge-import-undo').count()) !== 0 || !(await page.getByTestId('challenge-save-status').innerText()).includes('已復原')) throw new Error('Challenge import Undo did not clear its one-level session state.');
  if ((await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== campaignBefore) throw new Error('Challenge import Undo mutated Campaign save.');
  await assertSingleScreen('Challenge backup', '.deployment-shell');
  await page.screenshot({ path: screenshot('backup') });

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-challenge').click();
  await page.getByTestId('deployment-tab-backup').click();
  const reloadedBackupSummary = await page.getByTestId('challenge-save-source-summary').innerText();
  if (!reloadedBackupSummary.includes('1 BEST · 1 CLEAR') || (await page.getByTestId('challenge-import-undo').count()) !== 0 || (await page.evaluate(() => localStorage.getItem('owm.campaign.v5'))) !== campaignBefore) throw new Error('Challenge import Undo restore did not survive reload cleanly or changed Campaign.');
  await page.getByTestId('deployment-tab-route').click();

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-challenge').click();
  await page.getByTestId('boss-challenge-briefing').waitFor({ state: 'visible' });
  const mobileMetrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.scrollingElement?.scrollWidth ?? 0 }));
  if (mobileMetrics.scrollWidth > mobileMetrics.width + 1) throw new Error(`Challenge 768px layout has horizontal overflow: ${JSON.stringify(mobileMetrics)}`);
  await page.getByTestId('challenge-route-repair').waitFor({ state: 'visible' });
  const repairMobileMetrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.scrollingElement?.scrollWidth ?? 0 }));
  if (repairMobileMetrics.scrollWidth > repairMobileMetrics.width + 1) throw new Error(`Route Repair 768px layout has horizontal overflow: ${JSON.stringify(repairMobileMetrics)}`);
  await page.screenshot({ path: screenshot('route-repair-768'), fullPage: true });
  await page.getByTestId('challenge-boss').selectOption('BOSS080');
  await page.getByTestId('deployment-tab-crew').click();
  await page.getByTestId('art-preview-character').selectOption('CHR-GOV-001');
  await page.getByTestId('deployment-tab-route').click();
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'VERIFIED FAILED');
  await page.getByTestId('challenge-route-apply-repair').click();
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'STILL FAILED');
  await page.getByTestId('challenge-evaluate-runtime-repairs').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-route-repair-target"]')?.textContent?.includes('59 EVALUATED'));
  const mobileEscalationPreview = await page.getByTestId('challenge-route-repair').innerText();
  if (!mobileEscalationPreview.includes('IMPROVED FAILED') || !mobileEscalationPreview.includes('SLOT 1') || !mobileEscalationPreview.includes('COUNTER 1/3') || !mobileEscalationPreview.includes('STAGE 6/6') || !mobileEscalationPreview.includes('GAPS 0')) throw new Error(`Runtime Repair 768px preview is incomplete: ${mobileEscalationPreview}`);
  const escalationMobileMetrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.scrollingElement?.scrollWidth ?? 0 }));
  if (escalationMobileMetrics.scrollWidth > escalationMobileMetrics.width + 1) throw new Error(`Runtime Repair Escalation 768px layout has horizontal overflow: ${JSON.stringify(escalationMobileMetrics)}`);
  await page.screenshot({ path: screenshot('runtime-repair-escalation-768'), fullPage: true });
  await page.getByTestId('challenge-boss').selectOption('BOSS015');
  await page.getByTestId('deployment-tab-crew').click();
  await page.getByTestId('art-preview-character').selectOption('CHR-GOV-001');
  await page.getByTestId('deployment-tab-route').click();
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'VERIFIED FAILED');
  await page.getByTestId('challenge-route-apply-repair').click();
  await page.getByTestId('challenge-run-draft-verification').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="challenge-draft-verification-status"]')?.textContent === 'REPAIR CLEAR');
  if (!(await page.getByTestId('challenge-draft-settlement-team').innerText()).includes('NO SAVE UNTIL CONFIRMED')) throw new Error('Draft settlement 768px preview is missing.');
  const reverifyMobileMetrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.scrollingElement?.scrollWidth ?? 0 }));
  if (reverifyMobileMetrics.scrollWidth > reverifyMobileMetrics.width + 1) throw new Error(`Draft Re-Verify 768px layout has horizontal overflow: ${JSON.stringify(reverifyMobileMetrics)}`);
  await page.screenshot({ path: screenshot('draft-reverify-768'), fullPage: true });
  await page.getByTestId('challenge-cancel-draft-settlement').click();
  await page.getByTestId('challenge-boss').selectOption('BOSS001');
  await page.getByTestId('strategy-find-reactive').click();
  await page.getByTestId('challenge-gap-candidates').waitFor({ state: 'visible' });
  const candidateMobileMetrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.scrollingElement?.scrollWidth ?? 0 }));
  if (candidateMobileMetrics.scrollWidth > candidateMobileMetrics.width + 1) throw new Error(`Strategy Gap Candidate 768px layout has horizontal overflow: ${JSON.stringify(candidateMobileMetrics)}`);
  await page.screenshot({ path: screenshot('candidate-768'), fullPage: true });
  await page.getByTestId('deployment-tab-loadout').click();
  if (!(await page.getByTestId('loadout-quality').innerText()).includes('FIXED L1')) throw new Error('Challenge fixed rules disappeared at 768px.');
  await page.screenshot({ path: screenshot('768'), fullPage: true });
  await page.getByTestId('deployment-tab-backup').click();
  await page.getByTestId('challenge-save-export-text').fill(emptyChallengeBackup);
  await page.getByTestId('challenge-save-import').click();
  await page.getByTestId('challenge-import-preview').waitFor({ state: 'visible' });
  const backupMobileMetrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.scrollingElement?.scrollWidth ?? 0 }));
  if (backupMobileMetrics.scrollWidth > backupMobileMetrics.width + 1) throw new Error(`Challenge backup 768px layout has horizontal overflow: ${JSON.stringify(backupMobileMetrics)}`);
  await page.screenshot({ path: screenshot('backup-preflight-768'), fullPage: true });
  await page.getByTestId('challenge-import-cancel').click();
  await page.screenshot({ path: screenshot('backup-768'), fullPage: true });

  if (errors.length > 0) throw new Error(`Browser console errors: ${errors.join(' | ')}`);
  console.log('Boss Challenge smoke passed: 100 bosses + Route record/draft/readiness/gap/source filters and deterministic sorts + OPERATION/DRAFT_CONFIRMATION source statistics + Challenge-only v3 generate/reject/preflight/cancel/confirm/session-undo/reload backup + v2→v3 import normalization + no-save-before-confirm + Campaign isolation + live drafted/gap-free/has-gaps portfolio + stable-ID Repair Queue/position/gap/session counters + filter-safe next navigation + manual-edit recomputation + selected draft IDs/Counter/Stage/gaps + deterministic Route top-repair routing/apply/undo/reload + deterministic Draft Verification clear/failed/reload isolation + FAILED priority repair + repair/reverify CLEAR and still-failed comparisons + CLEAR settlement preview/cancel/confirm/reload + permanent best-source provenance + Runtime Repair selected score/round/slot/structure preview + improved/no-improvement verdicts + 59-candidate evaluation/top-6 shortlist + failed-candidate no-settlement + apply/exact undo/reload isolation + before/after stable IDs + one-click draft resume + no draft-on-browse mutation + one-click audit recommendation seed/reload/provenance + audit outliers + per-Boss squad drafts/switch/reload + official 14-class Strategy Briefing/live skill gaps + one-click Crew Skill Capability filters + deterministic one-slot Gap Candidate preview/apply/restore + current-vs-audit Squad Compare/restore + fixed L3/10-round/L1 runtime + 1440 single-screen + 768 no-horizontal-overflow.');
  console.log(`Route filters screenshot: ${screenshot('route-filters')}`);
  console.log(`Deployment screenshot: ${screenshot('deployment')}`);
  console.log(`Draft Restored screenshot: ${screenshot('draft-restored')}`);
  console.log(`Draft Route screenshot: ${screenshot('draft-route')}`);
  console.log(`Audit-seeded Draft screenshot: ${screenshot('audit-seeded-draft')}`);
  console.log(`Draft Verification Clear screenshot: ${screenshot('draft-verification-clear')}`);
  console.log(`Draft Verification Failed screenshot: ${screenshot('draft-verification-failed')}`);
  console.log(`Draft Settlement Pending screenshot: ${screenshot('draft-settlement-pending')}`);
  console.log(`Draft Settlement Confirmed screenshot: ${screenshot('draft-settlement-confirmed')}`);
  console.log(`Draft Source Reload screenshot: ${screenshot('draft-source-reload')}`);
  console.log(`Draft Re-Verify Still Failed screenshot: ${screenshot('draft-reverify-still-failed')}`);
  console.log(`Draft Re-Verify 768px screenshot: ${screenshot('draft-reverify-768')}`);
  console.log(`Runtime Repair Escalation screenshot: ${screenshot('runtime-repair-escalation')}`);
  console.log(`Runtime Repair Applied screenshot: ${screenshot('runtime-repair-applied')}`);
  console.log(`Runtime Repair Escalation 768px screenshot: ${screenshot('runtime-repair-escalation-768')}`);
  console.log(`Draft Readiness screenshot: ${screenshot('draft-readiness')}`);
  console.log(`Route Repair Preview screenshot: ${screenshot('route-repair-preview')}`);
  console.log(`Route Repair Applied screenshot: ${screenshot('route-repair-applied')}`);
  console.log(`Route Repair 768px screenshot: ${screenshot('route-repair-768')}`);
  console.log(`Repair Queue screenshot: ${screenshot('repair-queue')}`);
  console.log(`Strategy Route screenshot: ${screenshot('strategy-route')}`);
  console.log(`Capability Filter screenshot: ${screenshot('capability-filter')}`);
  console.log(`Gap Candidate Applied screenshot: ${screenshot('candidate-applied')}`);
  console.log(`Squad Compare screenshot: ${screenshot('squad-compare')}`);
  console.log(`Squad Advisor screenshot: ${screenshot('squad-advisor')}`);
  console.log(`Operation screenshot: ${screenshot('operation')}`);
  console.log(`Result screenshot: ${screenshot('result')}`);
  console.log(`Challenge Backup screenshot: ${screenshot('backup')}`);
  console.log(`Challenge Backup Preflight screenshot: ${screenshot('backup-preflight')}`);
  console.log(`Challenge Backup Confirmed screenshot: ${screenshot('backup-confirmed')}`);
  console.log(`Challenge Backup Preflight 768px screenshot: ${screenshot('backup-preflight-768')}`);
  console.log(`Challenge Backup 768px screenshot: ${screenshot('backup-768')}`);
  console.log(`768px screenshot: ${screenshot('768')}`);
  console.log(`Gap Candidate 768px screenshot: ${screenshot('candidate-768')}`);
} finally {
  await context.close();
  await browser.close();
}
