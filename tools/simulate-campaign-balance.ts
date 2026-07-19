import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluateBalanceGates,
  simulateCampaignBalance,
  type BalanceDatabase,
  type CampaignBalanceReport,
} from '../src/domain/balance.ts';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonDirectory = path.join(projectRoot, 'json');
const outputDirectory = path.join(projectRoot, 'balance');

const database: BalanceDatabase = {
  missions: await loadJson('missions.json'),
  bosses: await loadJson('bosses.json'),
  characters: await loadJson('characters.json'),
  skills: await loadJson('skills.json'),
  equipment: await loadJson('equipment.json'),
  turbines: await loadJson('turbines.json'),
  vessels: await loadJson('vessels.json'),
};

const report = simulateCampaignBalance(database);
const gates = evaluateBalanceGates(report);
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, 'campaign-balance-report.json'), `${JSON.stringify({ ...report, gates }, null, 2)}\n`, 'utf8');
await writeFile(path.join(outputDirectory, 'campaign-balance-report.md'), renderMarkdown(report, gates), 'utf8');

for (const summary of report.summaries) {
  console.log(`${summary.profile}: ${summary.passedMissions}/${summary.totalMissions} cleared | required ${summary.requiredPassedMissions}/${summary.requiredMissions} | avg ${summary.averageScore} | pressure C${summary.comfortable}/T${summary.tight}/X${summary.critical}/F${summary.failed}`);
}
console.log(`Maintenance: ${report.maintenanceEconomy.serviceableMissions}/${report.maintenanceEconomy.totalMissions} serviceable | earned ${report.maintenanceEconomy.creditsEarned} MNT | spent ${report.maintenanceEconomy.repairSpend} MNT | ending ${report.maintenanceEconomy.endingCredits} MNT | lowest ${report.maintenanceEconomy.lowestPostMissionCondition}%`);
console.log(`Crew readiness: ${report.crewReadinessEconomy.deployableMissions}/${report.crewReadinessEconomy.totalMissions} deployable | ${report.crewReadinessEconomy.completedMissions}/${report.crewReadinessEconomy.totalMissions} complete | earned ${report.crewReadinessEconomy.tokensEarned} RST | spent ${report.crewReadinessEconomy.tokensSpent} RST | ending ${report.crewReadinessEconomy.endingTokens} RST | max fatigue ${report.crewReadinessEconomy.maxPersistentFatiguePercent}%`);
console.log(`Balance report: ${path.join(outputDirectory, 'campaign-balance-report.md')}`);
if (!gates.passed) {
  console.error(`Balance gates failed:\n- ${gates.errors.join('\n- ')}`);
  process.exitCode = 1;
}

async function loadJson<T>(fileName: string): Promise<T> {
  return JSON.parse(await readFile(path.join(jsonDirectory, fileName), 'utf8')) as T;
}

function renderMarkdown(report: CampaignBalanceReport, gates: ReturnType<typeof evaluateBalanceGates>): string {
  const lines = [
    '# OWM Campaign Balance Simulation',
    '',
    '> 這是 deterministic gameplay simulation，只反映目前遊戲規則與 autoplay 策略，不是實際風場、SCADA 或實驗數據。三個 profile 使用相同的 L1/L3/L5 career-role 混合隊伍，只改變角色 Mastery XP。',
    '',
    `Gate：${gates.passed ? 'PASS' : 'FAIL'}`,
    '',
    '| Profile | Required route | Cleared | Required cleared | Avg score | Comfortable | Tight | Critical | Failed |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...report.summaries.map((summary) => `| ${summary.profile} | Ch.01-${String(summary.requiredThroughChapter).padStart(2, '0')} | ${summary.passedMissions}/${summary.totalMissions} | ${summary.requiredPassedMissions}/${summary.requiredMissions} | ${summary.averageScore} | ${summary.comfortable} | ${summary.tight} | ${summary.critical} | ${summary.failed} |`),
    '',
    '## Equipment maintenance economy',
    '',
    '> Policy: L5 deterministic route uses each Mission recommended loadout and performs a full repair after every Mission. MNT and Condition are gameplay abstractions.',
    '',
    '| Serviceable missions | Initial MNT | Earned MNT | Repair spend | Ending MNT | Lowest post-mission condition | Repair failures | Gate |',
    '|---:|---:|---:|---:|---:|---:|---:|---|',
    `| ${report.maintenanceEconomy.serviceableMissions}/${report.maintenanceEconomy.totalMissions} | ${report.maintenanceEconomy.initialCredits} | ${report.maintenanceEconomy.creditsEarned} | ${report.maintenanceEconomy.repairSpend} | ${report.maintenanceEconomy.endingCredits} | ${report.maintenanceEconomy.lowestPostMissionCondition}% | ${report.maintenanceEconomy.repairFailures} | ${report.maintenanceEconomy.gatePassed ? 'PASS' : 'FAIL'} |`,
    '',
    '## Crew readiness economy',
    '',
    '> Policy: the sequential L5 route carries Crew fatigue between Missions, rotates by recommended factions, and spends one RST only when an Exhausted crew member would block Deployment. RST and fatigue are gameplay abstractions.',
    '',
    '| Deployable missions | Completed missions | Initial RST | Earned RST | Spent RST | Ending RST | Rest actions | Exhausted blocks | Max persistent fatigue | Gate |',
    '|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|',
    `| ${report.crewReadinessEconomy.deployableMissions}/${report.crewReadinessEconomy.totalMissions} | ${report.crewReadinessEconomy.completedMissions}/${report.crewReadinessEconomy.totalMissions} | ${report.crewReadinessEconomy.initialTokens} | ${report.crewReadinessEconomy.tokensEarned} | ${report.crewReadinessEconomy.tokensSpent} | ${report.crewReadinessEconomy.endingTokens} | ${report.crewReadinessEconomy.restActions} | ${report.crewReadinessEconomy.exhaustedBlocks} | ${report.crewReadinessEconomy.maxPersistentFatiguePercent}% | ${report.crewReadinessEconomy.gatePassed ? 'PASS' : 'FAIL'} |`,
    '',
    '| Profile | Mission | Ch. | Result | Pressure | Round | Safety | Weather | Avg fatigue | Score | Grade | Branch mitigation |',
    '|---|---|---:|---|---|---:|---:|---:|---:|---:|---|---:|',
    ...report.results.map((result) => `| ${result.profile} | ${result.missionId} | ${result.chapter} | ${result.success ? 'PASS' : `FAIL:${result.failureReason ?? 'Unknown'}`} | ${result.pressure} | ${result.round}/${result.roundLimit} | ${result.safety} | ${result.weatherWindow} | ${result.averageFatiguePercent}% | ${result.score} | ${result.grade} | ${result.mitigatedBranchEvents}/${result.branchEvents} |`),
    '',
  ];
  if (!gates.passed) lines.push('## Failed gates', '', ...gates.errors.map((error) => `- ${error}`), '');
  return `${lines.join('\n')}\n`;
}
