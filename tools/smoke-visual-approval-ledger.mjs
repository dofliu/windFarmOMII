import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ledgerPath = path.join(projectRoot, 'assets', 'source-art', 'qa', 'visual-approval-ledger-2026-07-24.json');
const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));
const decisions = new Set(['pending', 'approved', 'rejected']);
const failures = [];

if (ledger.schemaVersion !== '1.0') failures.push(`unexpected schemaVersion=${ledger.schemaVersion}`);
if (ledger.sceneCandidates.length !== 119) failures.push(`scene candidate count=${ledger.sceneCandidates.length}`);
if (ledger.p01ProductionCandidates.length !== 90) failures.push(`P01 candidate count=${ledger.p01ProductionCandidates.length}`);
for (const item of ledger.sceneCandidates) {
  if (!decisions.has(item.decision)) failures.push(`${item.sceneId}: invalid decision=${item.decision}`);
  if (item.qaStatus !== 'VISUAL_REVIEW_REQUIRED') failures.push(`${item.sceneId}: source QA status changed=${item.qaStatus}`);
}
for (const item of ledger.p01ProductionCandidates) {
  if (!decisions.has(item.decision)) failures.push(`${item.characterId}: invalid decision=${item.decision}`);
  if (item.productionResolutionStatus !== 'Production QA Pending') failures.push(`${item.characterId}: source production status changed=${item.productionResolutionStatus}`);
}
const summary = ledger.summary;
if (summary.scenePending !== ledger.sceneCandidates.filter((item) => item.decision === 'pending').length) failures.push('scene pending summary mismatch');
if (summary.p01Pending !== ledger.p01ProductionCandidates.filter((item) => item.decision === 'pending').length) failures.push('P01 pending summary mismatch');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Visual approval ledger smoke passed: ${ledger.sceneCandidates.length} scene candidates and ${ledger.p01ProductionCandidates.length} P01 production candidates; decisions are recorded separately from promotion.`);
