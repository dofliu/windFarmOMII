import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const outputDirectory = path.join(projectRoot, '.codex_qa');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const errors = [];

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

const shot = (step) => path.join(outputDirectory, `owm-mobile-flow-${step}.png`);

async function assertNoHorizontalOverflow(label) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    widest: [...document.querySelectorAll('body *')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, className: element.className, testId: element.getAttribute('data-testid'), width: Math.round(rect.width), right: Math.round(rect.right) };
      })
      .filter((item) => item.right > document.documentElement.clientWidth + 1)
      .sort((a, b) => b.right - a.right)
      .slice(0, 8),
  }));
  if (metrics.document > metrics.viewport + 1) {
    throw new Error(`${label} overflows horizontally: ${JSON.stringify(metrics)}`);
  }
}

async function assertFocusedStep(active) {
  const visible = await page.evaluate(() => Object.fromEntries(
    [
      ['mission', '.mission-panel'],
      ['field', '.field-panel'],
      ['decision', '.event-panel'],
      ['crew', '.card-panel'],
    ].map(([key, selector]) => [key, Boolean(document.querySelector(selector)?.getClientRects().length)]),
  ));
  const expected = active === 'field'
    ? { mission: false, field: true, decision: true, crew: false }
    : { mission: active === 'mission', field: false, decision: false, crew: active === 'crew' };
  if (JSON.stringify(visible) !== JSON.stringify(expected)) {
    throw new Error(`Mobile ${active} step is not focused: ${JSON.stringify({ visible, expected })}`);
  }
}

try {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 }));
  });
  await page.reload({ waitUntil: 'networkidle' });

  await assertNoHorizontalOverflow('390px Deployment route');
  await page.getByTestId('deployment-tab-readiness').click();
  for (const testId of ['planning-confirm-permit', 'planning-confirm-ppe', 'planning-confirm-access']) {
    await page.getByTestId(testId).check();
  }
  await page.screenshot({ path: shot('readiness'), fullPage: true });
  await page.getByTestId('deploy-mission').click();
  await page.locator('.phaser-host[data-scene-ready="true"] canvas').waitFor({ state: 'visible', timeout: 15000 });

  await assertFocusedStep('field');
  await assertNoHorizontalOverflow('390px decision step');
  await page.screenshot({ path: shot('decision'), fullPage: true });

  const nav = page.getByTestId('mobile-nav');
  const buttons = nav.getByRole('button');
  const touchHeights = await buttons.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
  if (touchHeights.some((height) => height < 44)) {
    throw new Error(`Mobile flow navigation has undersized touch targets: ${touchHeights.join(', ')}`);
  }

  await nav.getByRole('button', { name: /01.*任務/ }).click();
  await assertFocusedStep('mission');
  await assertNoHorizontalOverflow('390px mission step');
  await page.screenshot({ path: shot('mission'), fullPage: true });

  await nav.getByRole('button', { name: /03.*行動/ }).click();
  await assertFocusedStep('crew');
  await assertNoHorizontalOverflow('390px action step');
  await page.screenshot({ path: shot('action'), fullPage: true });

  await nav.getByRole('button', { name: /02.*決策/ }).click();
  await assertFocusedStep('field');
  if (!(await page.getByTestId('mobile-action-dock').isVisible())) {
    throw new Error('Mobile round controls are not reachable in the decision step.');
  }

  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
  console.log(`390px mobile flow smoke passed. Screenshots: ${shot('decision')}, ${shot('mission')}, ${shot('action')}`);
} finally {
  await browser.close();
}
