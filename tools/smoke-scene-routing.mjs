import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const screenshots = {
  campaignRoute: path.join(outputDirectory, 'owm-scene-routing-campaign-route.png'),
  campaignOperation: path.join(outputDirectory, 'owm-scene-routing-campaign-integrated.png'),
  sandboxRoute: path.join(outputDirectory, 'owm-scene-routing-sandbox-route.png'),
  sandboxOperation: path.join(outputDirectory, 'owm-scene-routing-sandbox-integrated.png'),
  mobile: path.join(outputDirectory, 'owm-scene-routing-768.png'),
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

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await prepare(page);
  let campaignRaw = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));

  const campaignSceneBadges = page.locator('[data-testid^="mission-scene-"]');
  if (await campaignSceneBadges.count() !== 15) throw new Error('Campaign map must expose all 15 Mission scene routes.');
  const campaignSceneTexts = await campaignSceneBadges.allTextContents();
  if (!campaignSceneTexts[0].includes('SCN003') || !campaignSceneTexts[0].includes('INTEGRATED')) {
    throw new Error(`First Mission scene route is wrong: ${campaignSceneTexts[0]}`);
  }
  if (campaignSceneTexts.some((text) => !text.includes('SCN') || !text.includes('INTEGRATED'))) {
    throw new Error(`Campaign scene route badges are incomplete: ${campaignSceneTexts.join(' | ')}`);
  }
  await assertDesktopSingleScreen(page, 'Campaign Mission Scene Route', '.deployment-shell');
  await page.screenshot({ path: screenshots.campaignRoute });

  await page.getByTestId('deployment-tab-readiness').click();
  await page.getByTestId('planning-confirm-permit').check();
  await page.getByTestId('planning-confirm-ppe').check();
  await page.getByTestId('planning-confirm-access').check();
  await page.getByTestId('deploy-mission').click();
  await page.getByTestId('scene-route-status').waitFor({ state: 'visible' });
  await page.locator('.phaser-host[data-scene-ready="true"] canvas').waitFor({ state: 'visible', timeout: 15000 });
  const campaignOperationRoute = await page.getByTestId('scene-route-status').innerText();
  const campaignProvenance = await page.getByTestId('scene-route-status').getAttribute('title');
  if (!campaignOperationRoute.includes('SCN003') || !campaignOperationRoute.includes('INTEGRATED')) {
    throw new Error(`Campaign operation did not preserve requested Scene metadata: ${campaignOperationRoute}`);
  }
  if (!campaignProvenance?.includes('專屬場景資產') && !campaignProvenance?.includes('Dedicated scene asset')) throw new Error(`Campaign integrated provenance is missing: ${campaignProvenance}`);
  await assertDesktopSingleScreen(page, 'Campaign Scene Integrated Operation', '.game-grid');
  await page.screenshot({ path: screenshots.campaignOperation });
  campaignRaw = await page.evaluate(() => localStorage.getItem('owm.campaign.v5'));

  await page.getByTestId('nav-sandbox').click();
  const defaultSandboxScene = await page.getByTestId('sandbox-scene').inputValue();
  if (defaultSandboxScene !== 'SCN002') throw new Error(`Sandbox default Scene should use integrated field feed: ${defaultSandboxScene}`);
  const sandboxCoverage = await page.getByTestId('sandbox-scene-coverage').innerText();
  if (!sandboxCoverage.includes('29/150 INTEGRATED') || !sandboxCoverage.includes('121 FALLBACK')) {
    throw new Error(`Sandbox Scene coverage summary is wrong: ${sandboxCoverage}`);
  }
  const defaultPreview = await page.getByTestId('sandbox-scene-preview').innerText();
  if (!defaultPreview.includes('SCN002') || !defaultPreview.includes('INTEGRATED') || !defaultPreview.includes('ENGINEERING_QA_PASSED')) {
    throw new Error(`Sandbox integrated Scene preview is incomplete: ${defaultPreview}`);
  }

  await page.getByTestId('sandbox-scene-filter-integrated').click();
  const integratedOptionCount = await page.locator('[data-testid="sandbox-scene"] option').count();
  if (integratedOptionCount !== 29) throw new Error(`Sandbox integrated filter should expose 29 direct Scene assets: ${integratedOptionCount}`);
  await page.getByTestId('sandbox-scene').selectOption('SCN011');
  const jacketPreview = await page.getByTestId('sandbox-scene-preview').innerText();
  if (!jacketPreview.includes('SCN011') || !jacketPreview.includes('INTEGRATED') || !jacketPreview.includes('ENGINEERING_QA_PASSED')) {
    throw new Error(`Sandbox jacket foundation Scene preview is incomplete: ${jacketPreview}`);
  }
  await page.getByTestId('sandbox-scene').selectOption('SCN003');
  const rainyPreview = await page.getByTestId('sandbox-scene-preview').innerText();
  if (!rainyPreview.includes('SCN003') || !rainyPreview.includes('INTEGRATED') || !rainyPreview.includes('ENGINEERING_QA_PASSED')) {
    throw new Error(`Sandbox rainy integrated Scene preview is incomplete: ${rainyPreview}`);
  }
  await page.getByTestId('sandbox-scene-filter-fallback').click();
  const fallbackOptionCount = await page.locator('[data-testid="sandbox-scene"] option').count();
  if (fallbackOptionCount !== 122) throw new Error(`Sandbox fallback filter should expose current integrated Scene plus 121 fallback routes: ${fallbackOptionCount}`);
  const hiddenSelectionPreview = await page.getByTestId('sandbox-scene-preview').innerText();
  if (!hiddenSelectionPreview.includes('SCN003') || !hiddenSelectionPreview.includes('INTEGRATED')) {
    throw new Error(`Sandbox filter should preserve hidden current selection: ${hiddenSelectionPreview}`);
  }
  await page.getByTestId('sandbox-scene').selectOption('SCN006');
  const fallbackPreview = await page.getByTestId('sandbox-scene-preview').innerText();
  if (!fallbackPreview.includes('SCN006') || !fallbackPreview.includes('FALLBACK') || !fallbackPreview.includes('SCN002')) {
    throw new Error(`Sandbox fallback Scene preview is incomplete: ${fallbackPreview}`);
  }
  await page.getByTestId('sandbox-scene-filter-integrated').click();
  await page.getByTestId('sandbox-scene').selectOption('SCN011');
  await assertDesktopSingleScreen(page, 'Sandbox Scene Route', '.deployment-shell');
  await page.screenshot({ path: screenshots.sandboxRoute });

  await page.getByTestId('deploy-mission').click();
  await page.getByTestId('scene-route-status').waitFor({ state: 'visible' });
  await page.locator('.phaser-host[data-scene-ready="true"] canvas').waitFor({ state: 'visible', timeout: 15000 });
  const sandboxOperationRoute = await page.getByTestId('scene-route-status').innerText();
  const sandboxProvenance = await page.getByTestId('scene-route-status').getAttribute('title');
  if (!sandboxOperationRoute.includes('SCN011') || !sandboxOperationRoute.includes('INTEGRATED')) {
    throw new Error(`Sandbox operation did not load integrated Scene: ${sandboxOperationRoute}`);
  }
  if (!sandboxProvenance?.includes('專屬場景資產') && !sandboxProvenance?.includes('Dedicated scene asset')) throw new Error(`Sandbox integrated provenance is missing: ${sandboxProvenance}`);
  if (await page.evaluate(() => localStorage.getItem('owm.campaign.v5')) !== campaignRaw) {
    throw new Error('Sandbox Scene selection mutated Campaign save.');
  }
  await assertDesktopSingleScreen(page, 'Sandbox Integrated Scene Operation', '.game-grid');
  await page.screenshot({ path: screenshots.sandboxOperation });

  const mobile = await browser.newPage({ viewport: { width: 768, height: 900 } });
  await prepare(mobile);
  await mobile.getByTestId('nav-sandbox').click();
  await mobile.getByTestId('sandbox-scene-filter-fallback').click();
  await mobile.getByTestId('sandbox-scene').selectOption('SCN006');
  const mobileMetrics = await documentMetrics(mobile, '.deployment-shell');
  if (mobileMetrics.scrollWidth > mobileMetrics.viewportWidth + 1) {
    throw new Error(`Mission Scene Routing has mobile horizontal overflow: ${JSON.stringify(mobileMetrics)}`);
  }
  if (!(await mobile.getByTestId('sandbox-scene-preview').innerText()).includes('FALLBACK')) {
    throw new Error('Sandbox fallback provenance is missing at 768px.');
  }
  await mobile.screenshot({ path: screenshots.mobile, fullPage: true });

  if (errors.length > 0) throw new Error(`Browser console errors: ${errors.join(' | ')}`);
  console.log('Mission Scene Routing smoke passed: 15 Campaign scene routes are integrated, Sandbox fallback provenance remains verified, Phaser switching, Campaign isolation, 1440 single-screen, and 768px no-horizontal-overflow.');
  for (const [label, file] of Object.entries(screenshots)) console.log(`${label}: ${file}`);
} finally {
  await browser.close();
}
