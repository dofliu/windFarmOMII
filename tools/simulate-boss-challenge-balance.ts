import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BalanceDatabase } from '../src/domain/balance.ts';
import type { BossChallengeAuditData } from '../src/domain/types.ts';
import {
  evaluateBossChallengeBalanceGates,
  simulateBossChallengeBalance,
  type BossChallengeBalanceGateResult,
  type BossChallengeBalanceReport,
} from '../src/domain/bossChallengeBalance.ts';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonDirectory = path.join(projectRoot, 'json');
const outputDirectory = path.join(projectRoot, 'balance');

const database: BalanceDatabase = {
  missions: await loadJson('missions.json'),
  bosses: await loadJson('bosses.json'),
  characters: await loadJson('characters.json'),
  skills: await loadJson('skills.json'),
  equipment: await loadJson('equipment.json'),
  vessels: await loadJson('vessels.json'),
};

const report = simulateBossChallengeBalance(database);
const gates = evaluateBossChallengeBalanceGates(report);
const auditData: BossChallengeAuditData = {
  schemaVersion: 1,
  model: report.model,
  gatesPassed: gates.passed,
  summary: {
    auditedBosses: report.summary.totalBosses,
    completedBosses: report.summary.completedBosses,
    averageScore: report.summary.averageScore,
  },
  hardOutlierBossIds: [...report.outliers.overHardBossIds],
  items: report.results.map((result) => ({
    bossId: result.bossId,
    recommendedTeamIds: [...result.teamIds],
    severity: result.severity,
    class: result.class,
    success: result.success,
    pressure: result.pressure,
    round: result.round,
    score: result.score,
    grade: result.grade,
    candidateTeamsEvaluated: result.candidateTeamsEvaluated,
    successfulCandidateTeams: result.successfulCandidateTeams,
    candidateCompletionRate: result.candidateCompletionRate,
  })),
};
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, 'boss-challenge-balance-report.json'), `${JSON.stringify({ ...report, gates }, null, 2)}\n`, 'utf8');
await writeFile(path.join(outputDirectory, 'boss-challenge-balance-report.md'), renderMarkdown(report, gates), 'utf8');
await writeFile(path.join(jsonDirectory, 'bossChallengeAudit.json'), `${JSON.stringify(auditData, null, 2)}\n`, 'utf8');

console.log(`Challenge: ${report.summary.completedBosses}/${report.summary.totalBosses} cleared | avg ${report.summary.averageScore} | range ${report.summary.minimumScore}-${report.summary.maximumScore} | round ${report.summary.averageRound}`);
for (const summary of report.bySeverity) {
  console.log(`${summary.severity}: ${summary.completed}/${summary.bosses} | avg ${summary.averageScore} | candidates ${summary.averageCandidateCompletionRate}% | pressure C${summary.pressureCounts.comfortable}/T${summary.pressureCounts.tight}/X${summary.pressureCounts.critical}/F${summary.pressureCounts.failed}`);
}
console.log(`Outliers: unclearable ${report.outliers.unclearableBossIds.length} | fragile ${report.outliers.fragileBossIds.length} | hard ${report.outliers.overHardBossIds.length} | easy-S5 ${report.outliers.overEasyBossIds.length} | inversions ${report.outliers.severityInversions.length}`);
console.log(`Challenge balance report: ${path.join(outputDirectory, 'boss-challenge-balance-report.md')}`);
if (!gates.passed) {
  console.error(`Challenge balance gates failed:\n- ${gates.errors.join('\n- ')}`);
  process.exitCode = 1;
}

async function loadJson<T>(fileName: string): Promise<T> {
  return JSON.parse(await readFile(path.join(jsonDirectory, fileName), 'utf8')) as T;
}

function renderMarkdown(report: BossChallengeBalanceReport, gates: BossChallengeBalanceGateResult): string {
  const checks = Object.entries(gates.checks);
  const lines = [
    '# OWM Boss Challenge Balance Audit',
    '',
    '> 這是 deterministic gameplay simulation，只反映目前 Challenge 規則、候選隊伍評分與 autoplay 策略；不是實際風場、SCADA、人因或實驗數據。',
    '',
    `Gate：**${gates.passed ? 'PASS' : 'FAIL'}**`,
    '',
    '## Fixed contract',
    '',
    '| Mastery | Round limit | Equipment | Spare | Vessel | Eligible crew | Counter sets | Exact C(300,3) / set |',
    '|---:|---:|---|---|---|---:|---:|---:|',
    `| L${report.contract.masteryLevel} / ${report.contract.masteryXp} XP | ${report.contract.roundLimit} | ${report.contract.equipmentId} | ${report.contract.spareId} | ${report.contract.vesselId} | ${report.candidatePolicy.eligibleCharacters} | ${report.candidatePolicy.counterSets} | ${report.candidatePolicy.exactThreePersonCombinationsPerCounterSet.toLocaleString('en-US')} |`,
    '',
    `候選策略：${report.candidatePolicy.policies.join(' / ')}，每個 counter set 與策略保留前 ${report.candidatePolicy.topTeamsPerPolicy} 隊；重複隊伍合併後逐 Boss 實跑正式 runtime。`,
    `Challenge-only GRD reserve：S4 Weather Protection +${report.contract.gridWeatherProtectionBonusBySeverity.S4 ?? 0}；S5 Weather Protection +${report.contract.gridWeatherProtectionBonusBySeverity.S5 ?? 0}、每回合 Energy reserve +${report.contract.gridEnergyReserveBonusBySeverity.S5 ?? 0}。Campaign 數值不變。`,
    '',
    '## Fairness gates',
    '',
    '| Check | Result |',
    '|---|---|',
    ...checks.map(([name, passed]) => `| ${name} | ${passed ? 'PASS' : 'FAIL'} |`),
    '',
    '## Overall',
    '',
    '| Cleared | Completion | Avg score | Score range | Avg round | Grades S/A/B/C/D | Pressure comfortable/tight/critical/failed |',
    '|---:|---:|---:|---:|---:|---|---|',
    `| ${report.summary.completedBosses}/${report.summary.totalBosses} | ${report.summary.completionRate}% | ${report.summary.averageScore} | ${report.summary.minimumScore}-${report.summary.maximumScore} | ${report.summary.averageRound} | ${gradeCounts(report.summary.gradeCounts)} | ${pressureCounts(report.summary.pressureCounts)} |`,
    '',
    '## Severity distribution',
    '',
    '| Severity | Cleared | Avg score | Range | Avg round | Candidate clear | Grades S/A/B/C/D | Pressure C/T/X/F |',
    '|---|---:|---:|---:|---:|---:|---|---|',
    ...report.bySeverity.map((summary) => `| ${summary.severity} | ${summary.completed}/${summary.bosses} | ${summary.averageScore} | ${summary.minimumScore}-${summary.maximumScore} | ${summary.averageRound} | ${summary.averageCandidateCompletionRate}% | ${gradeCounts(summary.gradeCounts)} | ${pressureCounts(summary.pressureCounts)} |`),
    '',
    '## Outliers',
    '',
    `- Unclearable：${list(report.outliers.unclearableBossIds)}`,
    `- Candidate fragile（少於三隊成功）：${list(report.outliers.fragileBossIds)}`,
    `- Over-hard：${list(report.outliers.overHardBossIds)}`,
    `- Comfortable S5：${list(report.outliers.overEasyBossIds)}`,
    `- Severity inversion > 8：${report.outliers.severityInversions.length > 0 ? report.outliers.severityInversions.map((item) => `${item.class} ${item.easierBossId} ${item.easierScore} → ${item.harderBossId} ${item.harderScore}`).join('；') : 'None'}`,
    '',
    '## Per-Boss results',
    '',
    '| Boss | Severity | Class | Result | Pressure | Round | Safety | Weather | Avg fatigue | Score | Grade | Candidate clear | Branch mitigation | Team |',
    '|---|---|---|---|---|---:|---:|---:|---:|---:|---|---:|---:|---|',
    ...report.results.map((result) => `| ${result.bossId} | ${result.severity} | ${result.class} | ${result.success ? 'PASS' : `FAIL:${result.failureReason ?? 'Unknown'}`} | ${result.pressure} | ${result.round}/${result.roundLimit} | ${result.safety} | ${result.weatherWindow} | ${result.averageFatiguePercent}% | ${result.score} | ${result.grade} | ${result.successfulCandidateTeams}/${result.candidateTeamsEvaluated} (${result.candidateCompletionRate}%) | ${result.mitigatedBranchEvents}/${result.branchEvents} | ${result.teamIds.join(' / ')} |`),
    '',
  ];
  if (!gates.passed) lines.push('## Failed gates', '', ...gates.errors.map((error) => `- ${error}`), '');
  return `${lines.join('\n')}\n`;
}

function gradeCounts(counts: BossChallengeBalanceReport['summary']['gradeCounts']): string {
  return `${counts.S}/${counts.A}/${counts.B}/${counts.C}/${counts.D}`;
}

function pressureCounts(counts: BossChallengeBalanceReport['summary']['pressureCounts']): string {
  return `${counts.comfortable}/${counts.tight}/${counts.critical}/${counts.failed}`;
}

function list(values: string[]): string {
  return values.length > 0 ? values.join(', ') : 'None';
}
