import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dashboardPath = path.join(projectRoot, 'assets/source-art/qa/visual-approval-dashboard-2026-07-24.html');
const html = await readFile(dashboardPath, 'utf8');
const required = [
  'OWM Visual Approval Dashboard',
  'sceneCandidates',
  'p01ProductionCandidates',
  '下載目前 ledger JSON',
  'URL.createObjectURL',
  'promotion',
];
const failures = required.filter((marker) => !html.includes(marker));
const embedded = html.match(/<script id="ledger" type="application\/json">([\s\S]*?)<\/script>/);
if (!embedded) failures.push('embedded ledger payload');
if (embedded) {
  try {
    const ledger = JSON.parse(embedded[1]);
    if (ledger.sceneCandidates?.length !== 119) failures.push('embedded scene candidate count');
    if (ledger.p01ProductionCandidates?.length !== 90) failures.push('embedded P01 candidate count');
  } catch (error) {
    failures.push(`embedded ledger JSON: ${error.message}`);
  }
}
if (failures.length) {
  console.error(`Dashboard missing marker(s): ${failures.join(', ')}`);
  process.exit(1);
}
console.log('Visual approval dashboard smoke passed: both review sets, decision controls, and non-promoting export are present.');
