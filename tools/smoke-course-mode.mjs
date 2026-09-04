import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { parseCourseExport } from './summarize-course-records.mjs';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = process.env.CHROME_PATH
  ?? [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
  ].find((candidate) => existsSync(candidate));
if (!chromePath) throw new Error('Chrome executable not found. Set CHROME_PATH.');
const courseBaseUrl = process.env.COURSE_BASE_URL ?? 'http://127.0.0.1:4173';
const courseBaseWithSlash = courseBaseUrl.endsWith('/') ? courseBaseUrl : `${courseBaseUrl}/`;
const outputDirectory = path.join(projectRoot, '.codex_qa');
const shot = (name) => path.join(outputDirectory, `owm-course-${name}.png`);

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

async function assertNoHorizontalOverflow(label) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  if (metrics.document > metrics.viewport + 1) throw new Error(`${label} horizontally overflows: ${JSON.stringify(metrics)}`);
}

try {
  // 斷言以部署站上的 course-config.json 為準：教師每週解鎖不得使 smoke 失效。
  const configResponse = await page.request.get(new URL('course/course-config.json', courseBaseWithSlash).href);
  if (!configResponse.ok()) throw new Error(`Course config fetch failed: ${configResponse.status()}`);
  const courseConfig = await configResponse.json();
  const unlockedAssignments = courseConfig.assignments.filter((assignment) => courseConfig.unlockedWeekIds.includes(assignment.weekId));

  await page.goto(courseBaseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-course').click();
  await page.getByTestId('course-mode-screen').waitFor();

  if ((await page.getByTestId('course-mode-screen').getAttribute('data-course-version')) !== courseConfig.releaseVersion) {
    throw new Error('Course release version is not synchronized.');
  }
  const unlockedCountText = (await page.getByTestId('course-unlocked-count').innerText()).trim();
  if (!unlockedCountText.startsWith(`${unlockedAssignments.length}/${courseConfig.assignments.length}`)) {
    throw new Error(`Course Mode did not reflect the teacher-controlled release: ${unlockedCountText}`);
  }
  for (const assignment of courseConfig.assignments) {
    const unlocked = courseConfig.unlockedWeekIds.includes(assignment.weekId) ? 'true' : 'false';
    if ((await page.getByTestId(`course-assignment-${assignment.weekId}`).getAttribute('data-course-unlocked')) !== unlocked) {
      throw new Error(`Manual weekly unlock state is incorrect for ${assignment.weekId}.`);
    }
  }
  const courseNavChallenge = await page.getByTestId('nav-challenge').innerText();
  if (!courseNavChallenge.includes('重大事故演練')) {
    throw new Error(`Course Mode did not rename Boss Challenge: ${courseNavChallenge}`);
  }
  if (await page.getByTestId('nav-collection').count()) {
    throw new Error('Course Mode still emphasizes the collection surface.');
  }

  if (unlockedAssignments.length === 0) {
    if (!(await page.getByTestId('course-lab-empty').count())) {
      throw new Error('Engineering Lab must show the locked-week empty state when no week is unlocked.');
    }
  } else {
    if ((await page.locator('.course-scada-table tbody tr').count()) !== 12) {
      throw new Error('The fixed mission SCADA/CMS pack does not contain 12 samples.');
    }
    if (!(await page.locator('.course-scada-table tbody tr.missing').count())) {
      throw new Error('The SCADA/CMS pack does not expose missing data.');
    }
    if ((await page.getByTestId('course-kpi-grid').locator('article').count()) !== 5) {
      throw new Error('Availability/MTBF/MTTR/Downtime/OPEX calculations are incomplete.');
    }
    if (!(await page.getByTestId('course-data-provenance').innerText()).includes('SYNTHETIC')) {
      throw new Error('Synthetic SCADA/CMS provenance is not visible.');
    }
    const labOptions = await page.getByTestId('course-lab-assignment').locator('option').count();
    if (labOptions !== unlockedAssignments.length) {
      throw new Error(`Engineering Lab must only expose unlocked weeks: ${labOptions}/${unlockedAssignments.length}.`);
    }
    await page.getByTestId('course-lab-tab-procedures').click();
    for (const step of ['shutdown', 'isolate', 'lock-tag', 'control-residual-energy', 'verify-zero-energy']) {
      await page.getByTestId(`course-procedure-loto-${step}`).click();
    }
    for (const step of ['trigger', 'acknowledge', 'dispatch', 'execute', 'verify', 'close-out']) {
      await page.getByTestId(`course-procedure-work-order-${step}`).click();
    }
    await page.getByTestId('course-lab-tab-control').click();
    const generatedSt = await page.getByTestId('course-generated-st').innerText();
    if (!generatedSt.includes('PersistCounter') || !generatedSt.includes('AlarmDelay') || !generatedSt.includes('InterlockTrip')) {
      throw new Error('Alarm/Interlock tester did not generate the IEC 61131-3 ST reference logic.');
    }
    await page.getByTestId('course-lab-tab-cases').click();
    if ((await page.getByTestId('course-case-library').locator('article').count()) !== 12) {
      throw new Error('P2 elective Course case library is incomplete.');
    }
    await page.getByTestId('course-lab-tab-data').click();
  }

  await page.getByTestId('course-generate-code').click();
  const learnerCode = await page.getByTestId('course-learner-code').inputValue();
  if (!/^OWM-[A-F0-9]{4}-[A-F0-9]{4}$/.test(learnerCode)) throw new Error(`Anonymous learner code is invalid: ${learnerCode}`);
  await assertNoHorizontalOverflow('Desktop Course Mode');
  await page.screenshot({ path: shot('desktop'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await assertNoHorizontalOverflow('Mobile Course Mode');
  await page.screenshot({ path: shot('mobile'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });

  if (unlockedAssignments.length > 0) {
    const targetAssignment = unlockedAssignments[0];
    await page.getByTestId(`course-start-assessment-${targetAssignment.weekId}`).click();
    await page.getByTestId('operation-decision-prompt').waitFor();
    if (await page.getByTestId('operation-decision-guide-cta').count()) throw new Error('Assessment still exposes GUIDE.');
    if (await page.getByTestId('recommended-skill-cta').count()) throw new Error('Assessment still exposes a recommended skill.');
    if (await page.getByTestId('onboarding-guide').count()) throw new Error('Assessment still exposes onboarding guidance.');
    if (await page.getByTestId('onboarding-replay').count()) throw new Error('Assessment topbar still exposes guide replay.');
    if (!(await page.getByTestId('nav-course').isDisabled())) throw new Error('Assessment can still discard its runtime through the active Course navigation button.');
    if ((await page.getByTestId('operation-decision-prompt').getAttribute('data-decision-guide-target')) !== null) {
      throw new Error('Assessment decision prompt still exposes the guide target attribute.');
    }
    await page.evaluate(() => document.querySelector('[data-testid="operation-crew-tab-profile"]')?.click());
    if (!(await page.getByTestId('shift-character').isDisabled())) throw new Error('Assessment crew is not fixed.');
    const assessmentPrompt = await page.getByTestId('operation-decision-prompt').innerText();
    if (assessmentPrompt.includes('Recommended:') || assessmentPrompt.includes('SKILL REC')) {
      throw new Error(`Assessment leaks a recommendation: ${assessmentPrompt}`);
    }

    const startedRecord = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null'));
    const attempt = startedRecord?.attempts?.[0];
    if (
      startedRecord?.learnerCode !== learnerCode
      || startedRecord?.schemaVersion !== 2
      || startedRecord?.integrityOrigin !== 'native_v2'
      || attempt?.missionId !== targetAssignment.missionId
      || attempt?.randomSeed !== targetAssignment.randomSeed
      || attempt?.configVersion !== courseConfig.configVersion
      || JSON.stringify(startedRecord.events.map((event) => event.kind)) !== JSON.stringify(['MODE_SELECTED', 'JSA_COMPLETED', 'MISSION_DEPLOYED'])
    ) {
      throw new Error(`Course Record start contract is incorrect: ${JSON.stringify(startedRecord)}`);
    }
    const deployed = startedRecord.events.find((event) => event.kind === 'MISSION_DEPLOYED');
    const fixedPreflight = startedRecord.events.find((event) => event.kind === 'JSA_COMPLETED');
    if (JSON.stringify(deployed?.details?.teamIds) !== JSON.stringify(targetAssignment.teamIds)) {
      throw new Error('Assessment fixed team does not match the teacher manifest.');
    }
    if (
      deployed?.context !== 'assessment_runtime'
      || deployed?.actor !== 'system'
      || fixedPreflight?.context !== 'assessment_runtime'
      || fixedPreflight?.actor !== 'system'
      || attempt?.decisionOrder?.length !== 0
    ) {
      throw new Error('System-derived Assessment events lack explicit provenance or polluted decisionOrder.');
    }

    await page.getByTestId('operation-info-tab-objectives').click();
    await page.locator('.phaser-host[data-scene-ready="true"]').waitFor({ state: 'visible', timeout: 30_000 });
    const objectivesText = await page.getByTestId('operation-objectives').innerText();
    if (objectivesText.includes('SKILL FORECAST') || objectivesText.includes('END ROUND FORECAST')) {
      throw new Error('Assessment OBJECTIVES tab still leaks the skill or end-round forecast.');
    }
    if (!objectivesText.includes('STAGE TARGET') || !objectivesText.includes('LEARNING OBJECTIVE')) {
      throw new Error(`Assessment OBJECTIVES tab is missing its teaching rows: ${objectivesText}`);
    }
    const evidenceRecord = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null'));
    if (!evidenceRecord.events.some((event) => event.kind === 'EVIDENCE_VIEWED' && event.context === 'assessment_runtime' && event.actor === 'learner')) {
      throw new Error('Assessment did not record EVIDENCE_VIEWED.');
    }
    await page.screenshot({ path: shot('assessment-no-hints'), fullPage: true });

    await page.evaluate(() => {
      const button = document.querySelector('[data-testid="nav-course"]');
      if (button instanceof HTMLButtonElement) button.disabled = false;
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    if (!(await page.getByTestId('operation-decision-prompt').count())) {
      throw new Error('Assessment runtime was discarded by navigation.');
    }
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('nav-course').click();
    await page.getByTestId('course-record-panel').waitFor();
    if (!(await page.getByTestId('course-export-record').isDisabled())) throw new Error('Incomplete Assessment can still be exported.');

    // Engineering Lab 事件必須反映實際操作：LOTO 帶違序次數，Work Order 只在 CLOSE_OUT 才記錄。
    const beforeLabRecord = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null'));
    await page.getByTestId('course-lab-tab-procedures').click();
    await page.getByTestId('course-procedure-loto-isolate').click(); // 違序：應被拒絕並計數
    for (const step of ['shutdown', 'isolate', 'lock-tag', 'control-residual-energy', 'verify-zero-energy']) {
      await page.getByTestId(`course-procedure-loto-${step}`).click();
    }
    await page.getByTestId('course-procedure-work-order-trigger').click();
    const afterTrigger = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null'));
    if (afterTrigger.events.some((event) => event.kind === 'WORK_ORDER_CREATED' && event.details?.source === 'COURSE_ENGINEERING_LAB')) {
      throw new Error('Work Order event was recorded at TRIGGER instead of CLOSE_OUT.');
    }
    for (const step of ['acknowledge', 'dispatch', 'execute', 'verify', 'close-out']) {
      await page.getByTestId(`course-procedure-work-order-${step}`).click();
    }
    const afterLab = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null'));
    const labLoto = afterLab.events.find((event) => event.kind === 'LOTO_VERIFIED' && event.details?.source === 'COURSE_ENGINEERING_LAB');
    const labWorkOrder = afterLab.events.find((event) => event.kind === 'WORK_ORDER_CREATED' && event.details?.source === 'COURSE_ENGINEERING_LAB');
    if (labLoto?.details?.rejectedActions !== 1 || labLoto?.details?.zeroEnergy !== true || labLoto?.details?.procedure?.length !== 5) {
      throw new Error(`Lab LOTO event does not carry the actual procedure evidence: ${JSON.stringify(labLoto?.details)}`);
    }
    if (labWorkOrder?.details?.closed !== true || labWorkOrder?.details?.rejectedActions !== 0 || labWorkOrder?.details?.lifecycle?.length !== 6) {
      throw new Error(`Lab Work Order event does not carry the actual lifecycle evidence: ${JSON.stringify(labWorkOrder?.details)}`);
    }
    if (
      JSON.stringify(afterLab.attempts[0].decisionOrder) !== JSON.stringify(beforeLabRecord.attempts[0].decisionOrder)
      || [labLoto, labWorkOrder].some((event) => event?.context !== 'practice_lab' || event?.actor !== 'learner')
    ) {
      throw new Error('Practice Lab polluted formal Assessment decisions or lost v2 provenance.');
    }
    await page.getByTestId('course-lab-tab-data').click();

    await page.evaluate(() => {
      const record = JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null');
      const activeAttempt = record.attempts.at(-1);
      const scores = { completion: 100, safety: 90, evidence: 80, time: 70, fatigue: 60, cost: 50, total: 83, grade: 'A' };
      activeAttempt.completedAt = '2026-09-04T00:00:00.000Z';
      activeAttempt.scores = scores;
      activeAttempt.studentExplanation = {
        conclusion: 'Main bearing anomaly',
        evidence: 'Temperature and vibration trends',
        uncertainty: 'One missing vibration sample',
        residualRisk: 'Confirm with oil debris analysis',
      };
      record.events.push({
        sequence: record.events.length + 1,
        recordedAt: activeAttempt.completedAt,
        kind: 'MISSION_SETTLED',
        context: 'assessment_runtime',
        actor: 'system',
        assignmentId: activeAttempt.assignmentId,
        missionId: activeAttempt.missionId,
        attemptNumber: activeAttempt.attemptNumber,
        details: { success: true, round: 1, scores },
      });
      record.updatedAt = activeAttempt.completedAt;
      localStorage.setItem('owm.course.v1', JSON.stringify(record));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('nav-course').click();
    await page.getByTestId('course-record-panel').waitFor();
    if (await page.getByTestId('course-export-record').isDisabled()) throw new Error('Completed v2 Assessment is not exportable.');

    const download = page.waitForEvent('download');
    await page.getByTestId('course-export-record').click();
    const exportedFile = await (await download).path();
    const exportedRecord = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null'));
    if (exportedRecord.events.at(-1)?.kind !== 'DEBRIEF_EXPORTED') throw new Error('Course export event was not recorded.');
    const exportedJson = JSON.parse(await readFile(exportedFile, 'utf8'));
    if (
      exportedJson.schemaVersion !== 2
      || exportedJson.integrityPolicy?.decisionOrder !== 'LEARNER_ASSESSMENT_RUNTIME_ONLY'
      || exportedJson.integrityPolicy?.authenticity !== 'CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT'
    ) throw new Error('Course export lost the v2 integrity boundary.');
    const verified = parseCourseExport(exportedJson, 'smoke-export.json', { unlockedWeekIds: courseConfig.unlockedWeekIds, assignments: courseConfig.assignments });
    if (!verified.ok || verified.export.digestStatus !== 'VERIFIED') {
      throw new Error(`Exported Course Record failed teacher verification: ${JSON.stringify(verified.errors)}`);
    }
    if (verified.export.attempts[0]?.weekId !== targetAssignment.weekId || JSON.stringify(exportedJson.unlockedWeekIdsAtExport) !== JSON.stringify(courseConfig.unlockedWeekIds)) {
      throw new Error('Exported Course Record is missing the week or unlock snapshot.');
    }
    if (!/^[0-9a-f]{64}$/.test(exportedJson.recordDigest)) throw new Error('Exported Course Record has no SHA-256 recordDigest.');

    // 更換匿名代碼需要二次確認，且會先匯出既有紀錄再重建。
    await page.getByTestId('course-learner-code').fill('OWM-SWAP-TEST');
    const startButton = page.getByTestId(`course-start-assessment-${targetAssignment.weekId}`);
    await startButton.click();
    if ((await startButton.getAttribute('data-course-code-switch')) !== 'armed') {
      throw new Error('Learner-code switch did not require confirmation.');
    }
    const unchangedRecord = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null'));
    if (unchangedRecord?.learnerCode !== learnerCode) {
      throw new Error('Learner-code switch replaced the record before confirmation.');
    }
    const switchExport = page.waitForEvent('download');
    await startButton.click();
    await switchExport;
    await page.getByTestId('operation-decision-prompt').waitFor();
    const switchedRecord = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null'));
    if (switchedRecord?.learnerCode !== 'OWM-SWAP-TEST' || switchedRecord?.attempts?.length !== 1) {
      throw new Error(`Learner-code switch did not rebuild a fresh record: ${JSON.stringify(switchedRecord?.learnerCode)}`);
    }

    // 一鍵重設改為二段式：第一次點擊不得刪除紀錄。
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('nav-course').click();
    await page.getByTestId('course-record-panel').waitFor();
    await page.getByTestId('course-reset').click();
    if ((await page.evaluate(() => localStorage.getItem('owm.course.v1'))) === null) {
      throw new Error('Course reset deleted the record without confirmation.');
    }
    await page.getByTestId('course-reset-confirm').click();
    if ((await page.evaluate(() => localStorage.getItem('owm.course.v1'))) !== null) throw new Error('Course reset confirmation did not clear the Course Record.');
  }

  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);

  // course-config.json 載入失敗只降級隱藏課程分頁，戰役／演練必須照常可用（不得整站死路）。
  const degraded = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const degradedErrors = [];
  degraded.on('pageerror', (error) => degradedErrors.push(error.message));
  await degraded.route('**/course/course-config.json', (route) => route.fulfill({ status: 500, body: 'unavailable' }));
  await degraded.goto(courseBaseUrl, { waitUntil: 'networkidle' });
  await degraded.getByTestId('nav-campaign').waitFor({ timeout: 30_000 });
  if (await degraded.getByTestId('nav-course').count()) throw new Error('Course tab is still offered while the course config failed to load.');
  if (await degraded.locator('.center-state h1').count()) throw new Error('Course config failure blocked the whole app.');
  await degraded.getByTestId('nav-challenge').click();
  if (degradedErrors.length) throw new Error(`Degraded-mode page errors:\n${degradedErrors.join('\n')}`);
  await degraded.close();

  console.log(`Course Mode smoke passed (${unlockedAssignments.length}/${courseConfig.assignments.length} unlocked). Screenshots: ${shot('desktop')}, ${shot('mobile')}${unlockedAssignments.length ? `, ${shot('assessment-no-hints')}` : ''}`);
} finally {
  await browser.close();
}
