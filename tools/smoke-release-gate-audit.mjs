import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const auditPath = path.join(projectRoot, 'assets/source-art/qa/release-gate-audit-2026-07-24.json');
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
const failures = [];
if (audit.scene.total !== 150 || audit.scene.integratedRoutes !== 148 || audit.scene.sharedFallbackRoutes !== 2 || audit.scene.visualReviewRequired < 0 || audit.scene.visualReviewRequired > 119) failures.push('scene coverage mismatch');
if (audit.scene.dedicatedRuntimeFiles !== 146) failures.push('dedicated scene file count mismatch');
if (audit.p01.activePreview !== 300) failures.push('active P01 count mismatch');
if (audit.p01.queue.upscalePending !== 210 || audit.p01.queue.productionQaPending !== 90 || audit.p01.queue.productionApproved !== 0) failures.push('P01 queue mismatch');
if (audit.approvalLedger.sceneCandidates !== 119 || audit.approvalLedger.p01ProductionCandidates !== 90) failures.push('approval ledger candidate count mismatch');
if (audit.approvalLedger.scenePending + audit.approvalLedger.sceneApproved + audit.approvalLedger.sceneRejected !== 119) failures.push('scene approval decision totals mismatch');
if (audit.approvalLedger.p01Pending + audit.approvalLedger.p01Approved + audit.approvalLedger.p01Rejected !== 90) failures.push('P01 approval decision totals mismatch');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Release-gate audit smoke passed: current scene coverage, P01 queue, and manual-gate counts are consistent.');
