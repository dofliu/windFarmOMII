import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const screenshots = {
  scenario: path.join(outputDirectory, 'owm-sandbox-scenario-lab.png'),
  operation: path.join(outputDirectory, 'owm-sandbox-scenario-operation.png'),
  mobile: path.join(outputDirectory, 'owm-sandbox-scenario-768.png'),
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

async function assertDesktopSingleScreen(page, label, rootSelector) {
  const metrics = await documentMetrics(page, rootSelector);
  if (metrics.scrollWidth > metrics.viewportWidth + 1 || metrics.scrollHeight > metrics.viewportHeight + 1) {
    throw new Error(`${label} document overflow: ${JSON.stringify(metrics)}`);
  }
  if (metrics.rootTop === null || metrics.rootBottom === null || metrics.rootTop < -1 || metrics.rootBottom > metrics.viewportHeight + 1) {
    throw new Error(`${label} root clipped: ${JSON.stringify(metrics)}`);
  }
}

async function setRange(page, testId, value) {
  const input = page.getByTestId(testId);
  const minimum = Number(await input.getAttribute('min'));
  const step = Number(await input.getAttribute('step')) || 1;
  await input.press('Home');
  for (let current = minimum; current < value; current += step) await input.press('ArrowRight');
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await prepare(page);
  const campaignRaw = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));

  await page.getByTestId('nav-sandbox').click();
  await page.getByTestId('deployment-tab-readiness').click();
  await page.getByTestId('sandbox-scenario-panel').waitFor({ state: 'visible' });
  const defaultPanel = await page.getByTestId('sandbox-scenario-panel').innerText();
  if (!defaultPanel.includes('STANDARD') || !defaultPanel.includes('100%') || !defaultPanel.includes('12R')) {
    throw new Error(`Sandbox STANDARD preset is incomplete: ${defaultPanel}`);
  }

  await page.getByTestId('sandbox-preset-storm').click();
  const stormPanel = await page.getByTestId('sandbox-scenario-panel').innerText();
  const projection = await page.getByTestId('sandbox-vessel-projection').innerText();
  if (!stormPanel.includes('STORM') || !stormPanel.includes('5/6') || !stormPanel.includes('55%') || !stormPanel.includes('65%') || !stormPanel.includes('9R')) {
    throw new Error(`Sandbox STORM preset did not apply: ${stormPanel}`);
  }
  if (!projection.includes('5 → 3') || !projection.includes('3 → 2') || !projection.includes('3 → 2')) {
    throw new Error(`Sea State 5 vessel projection is incomplete: ${projection}`);
  }

  await setRange(page, 'sandbox-evidence', 20);
  await setRange(page, 'sandbox-round-limit', 10);
  const customPanel = await page.getByTestId('sandbox-scenario-panel').innerText();
  if (!customPanel.includes('CUSTOM') || !customPanel.includes('20') || !customPanel.includes('10R')) {
    throw new Error(`Custom Sandbox resources did not apply: ${customPanel}`);
  }
  await assertDesktopSingleScreen(page, 'Sandbox Scenario Lab', '.deployment-shell');
  await page.screenshot({ path: screenshots.scenario });

  await page.getByTestId('deploy-mission').click();
  await page.getByTestId('sandbox-operation-scenario').waitFor({ state: 'visible' });
  await page.locator('.phaser-host canvas').waitFor({ state: 'visible', timeout: 15000 });
  const sessionScenario = await page.getByTestId('sandbox-operation-scenario').innerText();
  if (!sessionScenario.includes('SEA STATE') || !sessionScenario.includes('5') || !sessionScenario.includes('55') || !sessionScenario.includes('65') || !sessionScenario.includes('20') || !sessionScenario.includes('W3 / S2 / F2')) {
    throw new Error(`Sandbox session did not snapshot scenario values: ${sessionScenario}`);
  }
  const roundText = await page.locator('.round-box').innerText();
  if (!roundText.includes('/ 10')) throw new Error(`Custom round limit not applied: ${roundText}`);
  const initialWeather = Number((await page.locator('.resource-meter.weather b').innerText()).replace('%', ''));
  const initialSafety = Number((await page.locator('.resource-meter.safety b').innerText()).replace('%', ''));
  const initialEvidence = Number((await page.locator('.resource-meter.evidence b').innerText()).replace('%', ''));
  if (initialWeather !== 55 || initialSafety !== 65 || initialEvidence !== 20) {
    throw new Error(`Custom resources not applied: W${initialWeather} S${initialSafety} E${initialEvidence}`);
  }
  await page.getByTestId('next-round').click();
  const settledWeather = Number((await page.locator('.resource-meter.weather b').innerText()).replace('%', ''));
  if (settledWeather !== 44) throw new Error(`Sea State 5 projected weather loss should be 11: ${initialWeather} -> ${settledWeather}`);
  if (await page.evaluate(() => localStorage.getItem('owm.campaign.v5')) !== campaignRaw) {
    throw new Error('Sandbox Scenario Lab mutated Campaign save.');
  }
  await assertDesktopSingleScreen(page, 'Sandbox Operation', '.game-grid');
  await page.screenshot({ path: screenshots.operation });

  const mobile = await browser.newPage({ viewport: { width: 768, height: 900 } });
  await prepare(mobile);
  await mobile.getByTestId('nav-sandbox').click();
  await mobile.getByTestId('deployment-tab-readiness').click();
  await mobile.getByTestId('sandbox-preset-extreme').click();
  const mobileMetrics = await documentMetrics(mobile, '.deployment-shell');
  if (mobileMetrics.scrollWidth > mobileMetrics.viewportWidth + 1) {
    throw new Error(`Sandbox Scenario Lab has mobile horizontal overflow: ${JSON.stringify(mobileMetrics)}`);
  }
  if (!(await mobile.getByTestId('sandbox-scenario-panel').innerText()).includes('EXTREME')) {
    throw new Error('EXTREME preset did not apply at 768px.');
  }
  await mobile.screenshot({ path: screenshots.mobile, fullPage: true });

  if (errors.length > 0) throw new Error(`Browser console errors: ${errors.join(' | ')}`);
  console.log('Sandbox Scenario Lab smoke passed: presets, custom resource sliders, Sea State vessel projection, session snapshot, Campaign isolation, 1440 single-screen, and 768px no-horizontal-overflow.');
  console.log(`Scenario screenshot: ${screenshots.scenario}`);
  console.log(`Operation screenshot: ${screenshots.operation}`);
  console.log(`Mobile screenshot: ${screenshots.mobile}`);
} finally {
  await browser.close();
}
