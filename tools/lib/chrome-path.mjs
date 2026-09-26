import { existsSync } from 'node:fs';

const FALLBACK_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

export function resolveChromePath() {
  const explicit = process.env.CHROME_PATH;
  if (explicit) return explicit;
  const found = FALLBACK_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) throw new Error('Chrome executable not found. Set CHROME_PATH.');
  return found;
}
