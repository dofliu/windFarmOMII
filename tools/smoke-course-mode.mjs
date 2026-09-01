import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

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
      || attempt?.missionId !== targetAssignment.missionId
      || attempt?.randomSeed !== targetAssignment.randomSeed
      || attempt?.configVersion !== courseConfig.configVersion
      || JSON.stringify(startedRecord.events.map((event) => event.kind)) !== JSON.stringify(['MODE_SELECTED', 'JSA_COMPLETED', 'MISSION_DEPLOYED'])
    ) {
      throw new Error(`Course Record start contract is incorrect: ${JSON.stringify(startedRecord)}`);
    }
    const deployed = startedRecord.events.find((event) => event.kind === 'MISSION_DEPLOYED');
    if (JSON.stringify(deployed?.details?.teamIds) !== JSON.stringify(targetAssignment.teamIds)) {
      throw new Error('Assessment fixed team does not match the teacher manifest.');
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
    if (!evidenceRecord.events.some((event) => event.kind === 'EVIDENCE_VIEWED')) {
      throw new Error('Assessment did not record EVIDENCE_VIEWED.');
    }
    await page.screenshot({ path: shot('assessment-no-hints'), fullPage: true });

    await page.getByTestId('nav-course').click();
    await page.getByTestId('course-record-panel').waitFor();
    const download = page.waitForEvent('download');
    await page.getByTestId('course-export-record').click();
    await download;
    const exportedRecord = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.course.v1') ?? 'null'));
    if (exportedRecord.events.at(-1)?.kind !== 'DEBRIEF_EXPORTED') throw new Error('Course export event was not recorded.');

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
  console.log(`Course Mode smoke passed (${unlockedAssignments.length}/${courseConfig.assignments.length} unlocked). Screenshots: ${shot('desktop')}, ${shot('mobile')}${unlockedAssignments.length ? `, ${shot('assessment-no-hints')}` : ''}`);
} finally {
  await browser.close();
}
