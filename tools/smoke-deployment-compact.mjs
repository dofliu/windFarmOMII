import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const shot = (name) => path.join(outputDirectory, `owm-deployment-compact-${name}.png`);

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

async function assertCompactSingleScreen(label) {
  const metrics = await page.evaluate(() => {
    const scrolling = document.scrollingElement;
    const measure = (selector) => {
      const element = document.querySelector(selector);
      const rect = element?.getBoundingClientRect();
      return rect ? {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      } : null;
    };
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: scrolling?.scrollWidth ?? 0,
      scrollHeight: scrolling?.scrollHeight ?? 0,
      shell: measure('.deployment-shell'),
      tabs: measure('.deployment-tabs'),
      form: measure('.deployment-form'),
      analysis: measure('.deployment-analysis'),
    };
  });

  if (metrics.scrollWidth > metrics.viewportWidth + 1 || metrics.scrollHeight > metrics.viewportHeight + 1) {
    throw new Error(`${label} document overflow: ${JSON.stringify(metrics)}`);
  }
  if (!metrics.shell || metrics.shell.top < -1 || metrics.shell.bottom > metrics.viewportHeight + 1) {
    throw new Error(`${label} shell clipped outside viewport: ${JSON.stringify(metrics)}`);
  }
  for (const key of ['shell', 'tabs', 'form', 'analysis']) {
    const rect = metrics[key];
    if (!rect) continue;
    if (rect.scrollWidth > rect.clientWidth + 1 || rect.scrollHeight > rect.clientHeight + 1) {
      throw new Error(`${label} ${key} internal overflow: ${JSON.stringify(metrics)}`);
    }
  }
  return metrics;
}

async function openDeploymentTab(testId, name) {
  await page.getByTestId(testId).click();
  await page.getByTestId(`deployment-tab-panel-${name}`).waitFor({ state: 'visible' });
  const metrics = await assertCompactSingleScreen(`Deployment compact ${name}`);
  await page.screenshot({ path: shot(name), fullPage: false });
  return metrics;
}

try {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
  });
  await page.reload({ waitUntil: 'networkidle' });

  const deploymentTabs = [
    ['deployment-tab-route', 'route'],
    ['deployment-tab-readiness', 'readiness'],
    ['deployment-tab-crew', 'crew'],
    ['deployment-tab-loadout', 'loadout'],
    ['deployment-tab-forecast', 'forecast'],
  ];

  const tabBarLabels = await page.locator('.deployment-tabs button').evaluateAll((buttons) => buttons.map((button) => button.textContent?.trim()).filter(Boolean));
  if (tabBarLabels.length !== 5) {
    throw new Error(`Deployment compact should expose five information tabs instead of stacking sections: ${tabBarLabels.join(' | ')}`);
  }

  const results = [];
  for (const [testId, name] of deploymentTabs) {
    results.push([name, await openDeploymentTab(testId, name)]);
    if (name === 'route') {
      if ((await page.locator('[data-testid^="campaign-route-tab-"]').count()) !== 3) {
        throw new Error('Campaign compact Route should expose FLEET / MISSIONS / BRIEFING subtabs.');
      }
      await page.getByTestId('campaign-route-tab-missions').click();
      results.push(['route-missions', await assertCompactSingleScreen('Deployment compact route missions')]);
      await page.screenshot({ path: shot('route-missions'), fullPage: false });
      if ((await page.locator('[data-testid^="mission-node-"]').count()) !== 15) {
        throw new Error('Campaign compact MISSIONS subtab should expose all 15 mission nodes without stacking Fleet Board above it.');
      }
      await page.getByTestId('campaign-route-tab-briefing').click();
      results.push(['route-briefing', await assertCompactSingleScreen('Deployment compact route briefing')]);
      await page.screenshot({ path: shot('route-briefing'), fullPage: false });
      if (!(await page.getByTestId('route-readiness-carryover').isVisible())) {
        throw new Error('Campaign compact BRIEFING subtab should keep selected mission readiness guidance visible.');
      }
      await page.getByTestId('campaign-route-tab-fleet').click();
    }
  }

  await page.getByTestId('deployment-tab-route').click();
  await page.getByTestId('fleet-board-tab-history').click();
  if (!(await page.getByTestId('fleet-history-panel').isVisible())) {
    throw new Error('Fleet history should remain behind the Fleet Board tab instead of expanding the Route page.');
  }
  const historyMetrics = await assertCompactSingleScreen('Deployment compact route fleet history');
  await page.screenshot({ path: shot('route-history'), fullPage: false });

  if (errors.length > 0) throw new Error(`Browser console errors: ${errors.join(' | ')}`);
  console.log('Compact Deployment smoke passed at 1366x768: five Deployment tabs and Fleet Board tabs stay inside one viewport without document or panel overflow.');
  for (const [name, metrics] of results) {
    console.log(`${name}: ${JSON.stringify({ scrollHeight: metrics.scrollHeight, shell: metrics.shell?.height, form: metrics.form?.height, analysis: metrics.analysis?.height ?? null })}`);
  }
  console.log(`route-history: ${JSON.stringify({ scrollHeight: historyMetrics.scrollHeight, shell: historyMetrics.shell?.height, form: historyMetrics.form?.height })}`);
  console.log(`Route screenshot: ${shot('route')}`);
  console.log(`History screenshot: ${shot('route-history')}`);
} finally {
  await browser.close();
}
