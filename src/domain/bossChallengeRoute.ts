import type { BossChallengeProgress, BossChallengeRecord, BossChallengeRecordSource, BossChallengeSquadDraft } from './bossChallenge';
import { createBossChallengeStrategyBriefing, type ChallengeStrategyGap } from './bossChallengeStrategy';
import type { BossChallengeAuditData, BossChallengeAuditItemData, BossData, CharacterData, SkillData } from './types';

export type BossChallengeRouteSeverity = 'ALL' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
export type BossChallengeRouteStatus = 'ALL' | 'UNATTEMPTED' | 'CLEARED' | 'FAILED';
export type BossChallengeRouteSource = 'ALL' | BossChallengeRecordSource;
export type BossChallengeRouteDraftStatus = 'ALL' | 'DRAFTED' | 'UNDRAFTED';
export type BossChallengeRouteReadiness = 'UNDRAFTED' | 'GAP_FREE' | 'HAS_GAPS';
export type BossChallengeRouteReadinessFilter = 'ALL' | Exclude<BossChallengeRouteReadiness, 'UNDRAFTED'> | ChallengeStrategyGap;
export type BossChallengeRouteSort = 'ID_ASC' | 'SEVERITY_DESC' | 'BEST_DESC' | 'BEST_ASC' | 'AUDIT_HARDEST' | 'DRAFTED_FIRST' | 'READINESS';

export interface BossChallengeRouteFilters {
  severity: BossChallengeRouteSeverity;
  classCode: string;
  status: BossChallengeRouteStatus;
  source: BossChallengeRouteSource;
  draftStatus: BossChallengeRouteDraftStatus;
  readiness: BossChallengeRouteReadinessFilter;
  sort: BossChallengeRouteSort;
}

export interface BossChallengeRouteItem {
  boss: BossData;
  record?: BossChallengeRecord;
  draft?: BossChallengeSquadDraft;
  audit: BossChallengeAuditItemData;
  status: Exclude<BossChallengeRouteStatus, 'ALL'>;
  draftStatus: Exclude<BossChallengeRouteDraftStatus, 'ALL'>;
  readiness: BossChallengeRouteReadiness;
  draftSummary?: BossChallengeRouteDraftSummary;
  hardOutlier: boolean;
}

export interface BossChallengeRouteDraftSummary {
  teamIds: [string, string, string];
  counterCount: number;
  coveredStageCount: number;
  gaps: ChallengeStrategyGap[];
}

export interface BossChallengeDraftPortfolio {
  totalBosses: number;
  draftedBosses: number;
  gapFreeDrafts: number;
  draftsWithGaps: number;
  gapCounts: Record<ChallengeStrategyGap, number>;
}

export interface BossChallengeRepairQueue {
  bossIds: string[];
  remainingDrafts: number;
  currentPosition: number;
  nextBossId?: string;
  gapCounts: Record<ChallengeStrategyGap, number>;
}

export function createInitialBossChallengeRouteFilters(): BossChallengeRouteFilters {
  return { severity: 'ALL', classCode: 'ALL', status: 'ALL', source: 'ALL', draftStatus: 'ALL', readiness: 'ALL', sort: 'ID_ASC' };
}

export function bossChallengeRouteClasses(bosses: BossData[]): string[] {
  return [...new Set(bosses.map((boss) => boss.class))].sort((left, right) => left.localeCompare(right));
}

export function filterAndSortBossChallengeRoute(
  bosses: BossData[],
  progress: BossChallengeProgress,
  audit: BossChallengeAuditData,
  filters: BossChallengeRouteFilters,
  characterById: Map<string, CharacterData>,
  skillById: Map<string, SkillData>,
): BossChallengeRouteItem[] {
  const auditByBossId = new Map(audit.items.map((item) => [item.bossId, item]));
  const hardOutlierIds = new Set(audit.hardOutlierBossIds);
  const items = bosses.map((boss) => {
    const auditItem = auditByBossId.get(boss.id);
    if (!auditItem) throw new Error(`Boss Challenge Route 缺少 audit：${boss.id}`);
    const record = progress.bestByBossId[boss.id];
    const draft = progress.draftByBossId[boss.id];
    const status: BossChallengeRouteItem['status'] = !record ? 'UNATTEMPTED' : record.completed ? 'CLEARED' : 'FAILED';
    const draftStatus: BossChallengeRouteItem['draftStatus'] = draft ? 'DRAFTED' : 'UNDRAFTED';
    const draftSummary = draft ? summarizeBossChallengeDraft(boss, draft, characterById, skillById) : undefined;
    const readiness: BossChallengeRouteReadiness = !draftSummary ? 'UNDRAFTED' : draftSummary.gaps.length === 0 ? 'GAP_FREE' : 'HAS_GAPS';
    return { boss, record, draft, audit: auditItem, status, draftStatus, readiness, draftSummary, hardOutlier: hardOutlierIds.has(boss.id) };
  }).filter((item) => (
    (filters.severity === 'ALL' || item.boss.severity === filters.severity)
    && (filters.classCode === 'ALL' || item.boss.class === filters.classCode)
    && (filters.status === 'ALL' || item.status === filters.status)
    && (filters.source === 'ALL' || item.record?.source === filters.source)
    && (filters.draftStatus === 'ALL' || item.draftStatus === filters.draftStatus)
    && matchesReadinessFilter(item, filters.readiness)
  ));

  return items.sort((left, right) => compareRouteItems(left, right, filters.sort));
}

export function createBossChallengeRouteDraftSummary(
  item: BossChallengeRouteItem,
  characterById: Map<string, CharacterData>,
  skillById: Map<string, SkillData>,
): BossChallengeRouteDraftSummary | undefined {
  if (!item.draft) return undefined;
  return item.draftSummary ?? summarizeBossChallengeDraft(item.boss, item.draft, characterById, skillById);
}

export function createBossChallengeDraftPortfolio(items: BossChallengeRouteItem[]): BossChallengeDraftPortfolio {
  const drafted = items.filter((item) => item.readiness !== 'UNDRAFTED');
  const gapCounts = Object.fromEntries((['NO_REACTIVE', 'NO_TEAM_RECOVERY', 'NO_LOW_ENERGY_ACTION', 'STAGE_GAP'] as const)
    .map((gap) => [gap, drafted.filter((item) => item.draftSummary?.gaps.includes(gap)).length])) as Record<ChallengeStrategyGap, number>;
  return {
    totalBosses: items.length,
    draftedBosses: drafted.length,
    gapFreeDrafts: drafted.filter((item) => item.readiness === 'GAP_FREE').length,
    draftsWithGaps: drafted.filter((item) => item.readiness === 'HAS_GAPS').length,
    gapCounts,
  };
}

/**
 * Repair queue 永遠以 stable Boss ID 排序並由未篩選 Route 建立，避免目前 UI filter
 * 把下一筆工作藏起來；只提供導覽，不會自動套用候選或修改任何 draft。
 */
export function createBossChallengeRepairQueue(
  items: BossChallengeRouteItem[],
  selectedBossId?: string,
): BossChallengeRepairQueue {
  const queueItems = items
    .filter((item) => item.readiness === 'HAS_GAPS')
    .sort((left, right) => left.boss.id.localeCompare(right.boss.id));
  const bossIds = queueItems.map((item) => item.boss.id);
  const selectedIndex = selectedBossId ? bossIds.indexOf(selectedBossId) : -1;
  let nextBossId: string | undefined;
  if (bossIds.length > 0) {
    if (selectedIndex >= 0) {
      nextBossId = bossIds.length > 1 ? bossIds[(selectedIndex + 1) % bossIds.length] : undefined;
    } else {
      nextBossId = bossIds.find((bossId) => !selectedBossId || bossId.localeCompare(selectedBossId) > 0) ?? bossIds[0];
    }
  }
  const gapCounts = Object.fromEntries((['NO_REACTIVE', 'NO_TEAM_RECOVERY', 'NO_LOW_ENERGY_ACTION', 'STAGE_GAP'] as const)
    .map((gap) => [gap, queueItems.filter((item) => item.draftSummary?.gaps.includes(gap)).length])) as Record<ChallengeStrategyGap, number>;
  return {
    bossIds,
    remainingDrafts: bossIds.length,
    currentPosition: selectedIndex >= 0 ? selectedIndex + 1 : 0,
    nextBossId,
    gapCounts,
  };
}

function summarizeBossChallengeDraft(
  boss: BossData,
  draft: BossChallengeSquadDraft,
  characterById: Map<string, CharacterData>,
  skillById: Map<string, SkillData>,
): BossChallengeRouteDraftSummary {
  const team = draft.teamIds.map((id) => {
    const character = characterById.get(id);
    if (!character) throw new Error(`Boss Challenge draft 缺少角色 FK：${id}`);
    return character;
  }) as [CharacterData, CharacterData, CharacterData];
  const briefing = createBossChallengeStrategyBriefing(boss, team, skillById);
  return {
    teamIds: [...draft.teamIds],
    counterCount: briefing.counterCount,
    coveredStageCount: briefing.coveredStageCount,
    gaps: [...briefing.gaps],
  };
}

function matchesReadinessFilter(item: BossChallengeRouteItem, filter: BossChallengeRouteReadinessFilter): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'GAP_FREE' || filter === 'HAS_GAPS') return item.readiness === filter;
  return item.draftSummary?.gaps.includes(filter) ?? false;
}

function compareRouteItems(left: BossChallengeRouteItem, right: BossChallengeRouteItem, sort: BossChallengeRouteSort): number {
  if (sort === 'READINESS') {
    const readinessDifference = readinessRank(left.readiness) - readinessRank(right.readiness);
    if (readinessDifference !== 0) return readinessDifference;
    const gapDifference = (left.draftSummary?.gaps.length ?? 99) - (right.draftSummary?.gaps.length ?? 99);
    return gapDifference || left.boss.id.localeCompare(right.boss.id);
  }
  if (sort === 'DRAFTED_FIRST') {
    if (left.draftStatus !== right.draftStatus) return left.draftStatus === 'DRAFTED' ? -1 : 1;
    return left.boss.id.localeCompare(right.boss.id);
  }
  if (sort === 'SEVERITY_DESC') {
    return severityRank(right.boss.severity) - severityRank(left.boss.severity) || left.boss.id.localeCompare(right.boss.id);
  }
  if (sort === 'BEST_DESC' || sort === 'BEST_ASC') {
    if (Boolean(left.record) !== Boolean(right.record)) return left.record ? -1 : 1;
    const scoreDifference = (left.record?.bestScore ?? 0) - (right.record?.bestScore ?? 0);
    if (scoreDifference !== 0) return sort === 'BEST_DESC' ? -scoreDifference : scoreDifference;
    return left.boss.id.localeCompare(right.boss.id);
  }
  if (sort === 'AUDIT_HARDEST') {
    if (left.hardOutlier !== right.hardOutlier) return left.hardOutlier ? -1 : 1;
    const pressureDifference = pressureRank(right.audit.pressure) - pressureRank(left.audit.pressure);
    if (pressureDifference !== 0) return pressureDifference;
    if (left.audit.score !== right.audit.score) return left.audit.score - right.audit.score;
    if (left.audit.candidateCompletionRate !== right.audit.candidateCompletionRate) return left.audit.candidateCompletionRate - right.audit.candidateCompletionRate;
    return left.boss.id.localeCompare(right.boss.id);
  }
  return left.boss.id.localeCompare(right.boss.id);
}

function severityRank(severity: string): number {
  return Number(severity.match(/(\d+)/)?.[1] ?? 0);
}

function pressureRank(pressure: BossChallengeAuditItemData['pressure']): number {
  return { comfortable: 1, tight: 2, critical: 3, failed: 4 }[pressure];
}

function readinessRank(readiness: BossChallengeRouteReadiness): number {
  return { GAP_FREE: 0, HAS_GAPS: 1, UNDRAFTED: 2 }[readiness];
}
