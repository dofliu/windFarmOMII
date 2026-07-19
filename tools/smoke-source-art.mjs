import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(import.meta.dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.join(projectRoot, '.codex_qa');
const mfgScreenshotPath = path.join(outputDirectory, 'owm-source-art-mfg-v002.png');
const omiScreenshotPath = path.join(outputDirectory, 'owm-source-art-omi-v002.png');
const digScreenshotPath = path.join(outputDirectory, 'owm-source-art-dig-v002.png');
const mar177ScreenshotPath = path.join(outputDirectory, 'owm-source-art-mar-177-v002.png');
const dig272ScreenshotPath = path.join(outputDirectory, 'owm-source-art-dig-272-v002.png');
const gov005ScreenshotPath = path.join(outputDirectory, 'owm-source-art-gov-005-v001.png');
const aca045ScreenshotPath = path.join(outputDirectory, 'owm-source-art-aca-045-v001.png');
const dev090ScreenshotPath = path.join(outputDirectory, 'owm-source-art-dev-090-v002.png');
const aca046ScreenshotPath = path.join(outputDirectory, 'owm-source-art-aca-046-v002.png');
const mfg131ScreenshotPath = path.join(outputDirectory, 'owm-source-art-mfg-131-v002.png');
const omi226ScreenshotPath = path.join(outputDirectory, 'owm-source-art-omi-226-v001.png');
const dig276ScreenshotPath = path.join(outputDirectory, 'owm-source-art-dig-276-v001.png');
const gov008ScreenshotPath = path.join(outputDirectory, 'owm-source-art-gov-008-v001.png');
const mfg137ScreenshotPath = path.join(outputDirectory, 'owm-source-art-mfg-137-v001.png');
const dev098ScreenshotPath = path.join(outputDirectory, 'owm-source-art-dev-098-v001.png');
const omi233ScreenshotPath = path.join(outputDirectory, 'owm-source-art-omi-233-v001.png');
const omi246ScreenshotPath = path.join(outputDirectory, 'owm-source-art-omi-246-v001.png');
const gov028ScreenshotPath = path.join(outputDirectory, 'owm-source-art-gov-028-v001.png');
const artIndex = JSON.parse(await readFile(path.join(projectRoot, 'public', 'assets', 'source-art', 'p01', 'index.json'), 'utf8'));
const expectedCharacters = Object.keys(artIndex.items);

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

try {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('owm.onboarding.v1', JSON.stringify({ schemaVersion: 1, status: 'completed', stepIndex: 4 })));
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('nav-collection').click();

  const artSelector = page.getByTestId('collection-search');
  for (const characterId of expectedCharacters) {
    await artSelector.fill(characterId);
    const card = page.getByTestId(`collection-character-${characterId}`);
    await card.waitFor({ state: 'visible' });
    const image = card.locator('.collection-art img');
    await image.waitFor({ state: 'visible' });
    await page.waitForFunction((id) => {
      const element = document.querySelector(`[data-testid="collection-character-${id}"] .collection-art img`);
      return element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0 && element.naturalHeight > 0;
    }, characterId);
    const imageState = await image.evaluate((element) => ({
      src: element.getAttribute('src'),
      naturalWidth: element.naturalWidth,
      naturalHeight: element.naturalHeight,
    }));
    if (!imageState.src?.includes(characterId) || imageState.naturalWidth === 0 || imageState.naturalHeight === 0) {
      throw new Error(`${characterId} source art did not load correctly: ${JSON.stringify(imageState)}`);
    }
    if (!imageState.src.includes(artIndex.items[characterId].file)) {
      throw new Error(`${characterId} did not use active art index file: ${imageState.src}`);
    }
    const cardMetadata = await card.evaluate((element) => ({
      characterId: element.getAttribute('data-source-art-character-id'),
      version: element.getAttribute('data-source-art-version'),
      file: element.getAttribute('data-source-art-file'),
      qaStatus: element.getAttribute('data-source-art-qa-status'),
      engineeringQaStatus: element.getAttribute('data-source-art-engineering-qa-status'),
    }));
    const activeArt = artIndex.items[characterId];
    const expectedMetadata = {
      characterId,
      version: activeArt.version,
      file: activeArt.file,
      qaStatus: activeArt.qaStatus,
      engineeringQaStatus: activeArt.engineeringQaStatus,
    };
    if (JSON.stringify(cardMetadata) !== JSON.stringify(expectedMetadata)) {
      throw new Error(`${characterId} source-art card metadata mismatch: ${JSON.stringify({ expectedMetadata, cardMetadata })}`);
    }
    if (characterId === 'CHR-MFG-126') {
      await page.screenshot({ path: mfgScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-OMI-221') {
      await page.screenshot({ path: omiScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-DIG-271') {
      await page.screenshot({ path: digScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-MAR-177') {
      await page.screenshot({ path: mar177ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-DIG-272') {
      await page.screenshot({ path: dig272ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-GOV-005') {
      await page.screenshot({ path: gov005ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-ACA-045') {
      await page.screenshot({ path: aca045ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-DEV-090') {
      await page.screenshot({ path: dev090ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-ACA-046') {
      await page.screenshot({ path: aca046ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-MFG-131') {
      await page.screenshot({ path: mfg131ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-OMI-226') {
      await page.screenshot({ path: omi226ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-DIG-276') {
      await page.screenshot({ path: dig276ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-GOV-008') {
      await page.screenshot({ path: gov008ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-MFG-137') {
      await page.screenshot({ path: mfg137ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-DEV-098') {
      await page.screenshot({ path: dev098ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-OMI-233') {
      await page.screenshot({ path: omi233ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-OMI-246') {
      await page.screenshot({ path: omi246ScreenshotPath, fullPage: true });
    }
    if (characterId === 'CHR-GOV-028') {
      await page.screenshot({ path: gov028ScreenshotPath, fullPage: true });
    }
  }

  if (errors.length > 0) {
    throw new Error(`Browser console errors: ${errors.join(' | ')}`);
  }

  console.log(`Source-art smoke passed for ${expectedCharacters.length} characters.`);
  console.log(`MFG screenshot: ${mfgScreenshotPath}`);
  console.log(`OMI screenshot: ${omiScreenshotPath}`);
  console.log(`DIG screenshot: ${digScreenshotPath}`);
  console.log(`MAR-177 screenshot: ${mar177ScreenshotPath}`);
  console.log(`DIG-272 screenshot: ${dig272ScreenshotPath}`);
  console.log(`GOV-005 screenshot: ${gov005ScreenshotPath}`);
  console.log(`ACA-045 screenshot: ${aca045ScreenshotPath}`);
  console.log(`DEV-090 screenshot: ${dev090ScreenshotPath}`);
  console.log(`ACA-046 screenshot: ${aca046ScreenshotPath}`);
  console.log(`MFG-131 screenshot: ${mfg131ScreenshotPath}`);
  console.log(`OMI-226 screenshot: ${omi226ScreenshotPath}`);
  console.log(`DIG-276 screenshot: ${dig276ScreenshotPath}`);
  console.log(`GOV-008 screenshot: ${gov008ScreenshotPath}`);
  console.log(`MFG-137 screenshot: ${mfg137ScreenshotPath}`);
  console.log(`DEV-098 screenshot: ${dev098ScreenshotPath}`);
  console.log(`OMI-233 screenshot: ${omi233ScreenshotPath}`);
  console.log(`OMI-246 screenshot: ${omi246ScreenshotPath}`);
  console.log(`GOV-028 screenshot: ${gov028ScreenshotPath}`);
} finally {
  await browser.close();
}
