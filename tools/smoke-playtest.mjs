import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const shot = (name) => path.join(outputDirectory, `owm-playtest-${name}.png`);

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
  if (metrics.document > metrics.viewport + 1) {
    throw new Error(`${label} horizontally overflows: ${JSON.stringify(metrics)}`);
  }
}

try {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
  });
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByTestId('nav-playtest').click();
  await page.getByTestId('playtest-learning-path').waitFor();
  await page.getByTestId('playtest-start-practice').click();
  await page.getByTestId('onboarding-practice-mode').waitFor();
  if ((await page.getByTestId('onboarding-guide').getAttribute('data-step')) !== 'DEPLOYMENT') {
    throw new Error('Guided practice did not start at DEPLOYMENT.');
  }
  const practiceStorage = await page.evaluate(() => localStorage.getItem('owm.playtest.v1'));
  if (practiceStorage !== null) {
    throw new Error('Guided practice incorrectly created formal playtest data.');
  }
  const practiceGuideText = await page.getByTestId('onboarding-guide').innerText();
  for (const requiredText of ['現在請做', '完成條件', 'Fatigue', 'RST', 'MNT']) {
    if (!practiceGuideText.includes(requiredText)) throw new Error(`Guided practice is missing ${requiredText}.`);
  }
  await assertNoHorizontalOverflow('Desktop guided practice');
  await page.screenshot({ path: shot('guided-practice-desktop'), fullPage: true });
  await page.getByTestId('onboarding-collapse').click();
  await page.getByTestId('onboarding-guide').waitFor({ state: 'hidden' });
  await page.getByTestId('deployment-tab-readiness').click();
  if ((await page.getByTestId('deployment-tab-readiness').getAttribute('aria-selected')) !== 'true') {
    throw new Error('Underlying Deployment option could not be clicked after collapsing the guide.');
  }
  await page.getByTestId('deployment-tab-route').click();
  await page.screenshot({ path: shot('guided-practice-collapsed-desktop'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await assertNoHorizontalOverflow('Mobile guided practice');
  if (await page.getByTestId('onboarding-guide').isVisible()) {
    throw new Error('Collapsed mobile guide still occupies the gameplay screen.');
  }
  await page.getByTestId('onboarding-replay').click();
  await page.screenshot({ path: shot('guided-practice-mobile'), fullPage: true });
  await page.getByTestId('onboarding-collapse').click();
  await page.getByTestId('onboarding-guide').waitFor({ state: 'hidden' });
  await page.getByTestId('deployment-tab-readiness').click();
  if ((await page.getByTestId('deployment-tab-readiness').getAttribute('aria-selected')) !== 'true') {
    throw new Error('Underlying mobile Deployment option could not be clicked after collapsing the guide.');
  }
  await page.getByTestId('deployment-tab-route').click();
  await page.screenshot({ path: shot('guided-practice-collapsed-mobile'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.getByTestId('nav-playtest').click();
  await assertNoHorizontalOverflow('Desktop playtest start');
  await page.screenshot({ path: shot('start-desktop'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await assertNoHorizontalOverflow('Mobile playtest start');
  await page.screenshot({ path: shot('start-mobile'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByTestId('playtest-participant-code').fill(' d-01 ');
  await page.getByTestId('playtest-platform').selectOption('desktop');
  await page.getByTestId('playtest-start').click();
  if ((await page.getByTestId('playtest-screen').getAttribute('data-playtest-status')) !== 'active') {
    throw new Error('Playtest did not enter active status.');
  }
  await page.getByTestId('playtest-note-rotation').fill('先觀察疲勞，再決定是否換班。');
  await page.getByTestId('playtest-open-campaign').click();
  await page.getByTestId('nav-playtest').click();

  const activeSession = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.playtest.v1') ?? 'null'));
  if (activeSession?.participantCode !== 'D-01' || activeSession?.notes?.rotationDecision !== '先觀察疲勞，再決定是否換班。') {
    throw new Error(`Playtest session or notes were not persisted: ${JSON.stringify(activeSession)}`);
  }
  if (!activeSession.events.some((event) => event.kind === 'VIEW_CHANGED')) {
    throw new Error('Playtest view changes were not recorded.');
  }
  if (!(await page.getByTestId('playtest-download').getAttribute('href'))?.startsWith('data:application/json')) {
    throw new Error('Playtest JSON download is unavailable.');
  }
  await assertNoHorizontalOverflow('Desktop playtest');
  await page.screenshot({ path: shot('desktop'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await assertNoHorizontalOverflow('Mobile playtest');
  const touchTargets = await page.locator('.playtest-actions > *').evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
  if (touchTargets.some((height) => height < 44)) {
    throw new Error(`Mobile playtest actions have undersized touch targets: ${touchTargets.join(', ')}`);
  }
  await page.screenshot({ path: shot('mobile'), fullPage: true });

  await page.getByTestId('playtest-complete').click();
  if ((await page.getByTestId('playtest-screen').getAttribute('data-playtest-status')) !== 'completed') {
    throw new Error('Playtest did not enter completed status.');
  }
  const completedSession = await page.evaluate(() => JSON.parse(localStorage.getItem('owm.playtest.v1') ?? 'null'));
  if (completedSession?.events?.at(-1)?.kind !== 'SESSION_COMPLETED') {
    throw new Error('Completed playtest is missing its terminal event.');
  }
  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
  console.log(`Playtest smoke passed. Screenshots: ${shot('desktop')}, ${shot('mobile')}`);
} finally {
  await browser.close();
}
