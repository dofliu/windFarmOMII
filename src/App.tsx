import { lazy, Suspense, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { OnboardingGuide, type OnboardingSurface } from './components/OnboardingGuide';
import { characterSkillIds, loadGameDatabase } from './domain/data';
import { bossName, characterName, professionName, skillName } from './domain/localization';
import {
  advanceOnboarding,
  completeOnboarding,
  currentOnboardingStep,
  loadOnboardingProgress,
  restartOnboarding,
  resumeOnboardingAtDeployment,
  saveOnboardingProgress,
  skipOnboarding,
  type OnboardingProgress,
  type OnboardingStep,
} from './domain/onboarding';
import {
  applyLoadout,
  applyMasteryPerks,
  applyOperationReadiness,
  awardCampaignMission,
  campaignCrewFatigue,
  campaignEquipmentCondition,
  campaignCompletionSummary,
  campaignContinueTargets,
  campaignMissionGrade,
  campaignMissionStatus,
  characterMastery,
  evaluateLoadout,
  evaluateOperationReadiness,
  evaluateSandboxLoadout,
  equipmentRepairQuote,
  crewReadinessBand,
  crewRestQuote,
  isCodexEntryUnlocked,
  isEquipmentOwned,
  isEquipmentServiceable,
  isCrewMemberDeployable,
  isSkillSlotUnlocked,
  loadCampaignProgress,
  maintainCampaignTurbine,
  maintainCampaignTurbinePlan,
  MASTERY_PERKS,
  masteryPerkModifiers,
  parseCampaignSave,
  recordFleetConditionDispatch,
  repairCampaignEquipment,
  restCampaignCharacter,
  resolveDiagnosisDecision,
  saveCampaignProgress,
  serializeCampaignSave,
  teamMasteryPerks,
  unlockedMasteryPerks,
  type CampaignProgress,
  type CampaignCompletionSummary,
  type CampaignContinueTargets,
  type CampaignReward,
  type FleetOperationHistoryRecord,
  type LoadoutEvaluation,
  type OperationPlanningConfirmations,
  type OperationReadinessEvaluation,
} from './domain/campaign';
import { createDispatchForecast, type DispatchForecast } from './domain/dispatchForecast';
import {
  BOSS_CHALLENGE_EQUIPMENT_ID,
  BOSS_CHALLENGE_STORAGE_KEY,
  BOSS_CHALLENGE_MASTERY_XP,
  BOSS_CHALLENGE_ROUND_LIMIT,
  BOSS_CHALLENGE_SPARE_ID,
  BOSS_CHALLENGE_VESSEL_ID,
  bossChallengeRoundTeamProjection,
  bossChallengeSourceSummary,
  bossChallengeVesselProjection,
  bossChallengeSummary,
  confirmBossChallengeImport,
  confirmBossChallengeDraftSettlement,
  createBossChallengeCampaignProjection,
  createBossChallengeDraftSettlementPreview,
  createBossChallengeImportPreview,
  loadBossChallengeProgress,
  parseBossChallengeSave,
  recordBossChallenge,
  recordBossChallengeSquadDraft,
  saveBossChallengeProgress,
  seedBossChallengeSquadDraftFromAudit,
  serializeBossChallengeSave,
  undoBossChallengeImport,
  type BossChallengeImportPreview,
  type BossChallengeImportUndo,
  type BossChallengeProgress,
  type BossChallengeDraftSettlementPreview,
  type BossChallengeRecordSource,
  type BossChallengeSettlement,
} from './domain/bossChallenge';
import {
  compareBossChallengeDraftVerifications,
  createBossChallengeDraftRepairEvidence,
  verifyBossChallengeDraft,
  type BossChallengeDraftRepairEvidence,
  type BossChallengeDraftVerification,
  type BossChallengeDraftVerificationComparison,
} from './domain/bossChallengeVerification';
import {
  createBossChallengeRuntimeRepairEscalation,
  createBossChallengeRuntimeRepairSelectionPreview,
  selectDefaultBossChallengeRuntimeRepairCandidate,
  type BossChallengeRuntimeRepairCandidate,
  type BossChallengeRuntimeRepairEscalation,
  type BossChallengeRuntimeRepairSelectionPreview,
} from './domain/bossChallengeRepairEscalation';
import {
  bossChallengeRouteClasses,
  createBossChallengeDraftPortfolio,
  createBossChallengeRepairQueue,
  createInitialBossChallengeRouteFilters,
  filterAndSortBossChallengeRoute,
  type BossChallengeDraftPortfolio,
  type BossChallengeRepairQueue,
  type BossChallengeRouteDraftStatus,
  type BossChallengeRouteDraftSummary,
  type BossChallengeRouteFilters,
  type BossChallengeRouteItem,
  type BossChallengeRouteReadinessFilter,
  type BossChallengeRouteSeverity,
  type BossChallengeRouteSort,
  type BossChallengeRouteSource,
  type BossChallengeRouteStatus,
} from './domain/bossChallengeRoute';
import {
  compareBossChallengeSquads,
  createBossChallengeSquadRecommendation,
  type BossChallengeSquadComparison,
  type BossChallengeSquadRecommendation,
} from './domain/bossChallengeSquad';
import {
  createBossChallengeStrategyBriefing,
  type BossChallengeStrategyBriefing,
  type ChallengeStrategyGap,
} from './domain/bossChallengeStrategy';
import {
  createBossChallengeGapCandidatePreview,
  createBossChallengeRouteRepairPreview,
  type BossChallengeGapCandidatePreview,
  type BossChallengeRepairTarget,
  type BossChallengeRouteRepairPreview,
  type ChallengeStrategyStructureMetrics,
} from './domain/bossChallengeCandidate';
import {
  careerTrackProgress,
  isCareerCharacterUnlocked,
  normalizeCampaignTeamIds,
  unlockedCareerCharacters,
} from './domain/careerTrack';
import {
  createCrewRotationRecommendation,
  filterCrewRoster,
  type CrewReadinessFilter,
  type CrewRotationRecommendation,
  type CrewRosterFilters,
} from './domain/crewRotation';
import type { CrewSkillCapability } from './domain/crewCapability';
import {
  MISSION_STAGES,
  branchEventForRound,
  bossClassRule,
  bossClassTelegraph,
  canUseSkill,
  createCharacterRuntime,
  createMission,
  endRound,
  fatigueBand,
  fatigueRatio,
  missionBranchEventDefinition,
  missionDebrief,
  previewEndRound,
  resolveMissionBranch,
  resolveTeamSkill,
  stageAffinity,
  teamStageCoverage,
  type CharacterRuntimeState,
  type BranchPenalty,
  type MissionBranchEvent,
  type MissionFailureReason,
  type MissionState,
} from './domain/runtime';
import {
  applySandboxScenario,
  DEFAULT_SANDBOX_SCENARIO,
  normalizeSandboxScenario,
  SANDBOX_SCENARIO_LIMITS,
  SANDBOX_SCENARIO_PRESETS,
  sandboxScenarioPreset,
  sandboxSeaStateModifier,
  sandboxVesselProjection,
  type SandboxScenarioConfig,
  type SandboxScenarioPreset,
} from './domain/sandboxScenario';
import { resolveSceneRoute, sceneRouteName, sceneRouteProvenance, type SceneRoute } from './domain/sceneRouting';
import {
  applyFleetConditionDispatch,
  createFleetConditionDispatchModifier,
  createFleetDispatchPriority,
  createFleetMaintenancePlan,
  projectFleetConditionDispatch,
  summarizeWindFarm,
  turbineMaintenanceQuote,
  type FleetConditionDispatchProjection,
  type FleetMaintenancePlanSettlement,
  type TurbineAvailability,
  type TurbineMaintenanceSettlement,
} from './domain/windFarm';
import { THREE_BLADE_ANGLES, fleetTurbineIconGeometry, turbineBladePolygon } from './domain/turbineGeometry';
import type {
  BossData,
  CharacterData,
  CodexEntryData,
  EquipmentData,
  GameDatabase,
  Language,
  MissionData,
  SkillData,
  VesselData,
} from './domain/types';

const INITIAL_TEAM: [string, string, string] = ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'];
const OffshoreScene = lazy(() => import('./components/OffshoreScene').then((module) => ({ default: module.OffshoreScene })));
const STAGE_ZH = ['偵測', '診斷', '隔離', '修復', '驗證', '復歸'];
const FATIGUE_ZH = { Stable: '穩定', Tired: '疲憊', Critical: '臨界', Exhausted: '耗竭' };
const IMPACT_LABELS = {
  zh: { fatigue: '疲勞', safety: '安全', weather: '天候', evidence: '證據', reliability: '可靠度', progress: '進度', cost: '成本', energy: 'Energy' },
  en: { fatigue: 'Fatigue', safety: 'Safety', weather: 'Weather', evidence: 'Evidence', reliability: 'Reliability', progress: 'Progress', cost: 'Cost', energy: 'Energy' },
} as const;
type GameView = 'campaign' | 'challenge' | 'sandbox' | 'collection' | 'codex';
const UI = {
  zh: {
    characters: '角色', skills: '技能', bosses: 'Boss', riskEvent: '風險事件', stageNeed: '階段需求', fatigueHit: '疲勞衝擊',
    redeploy: '重新部署', endRound: '結束回合／承受風險', fatigue: '疲勞', missionComplete: '任務完成', missionFailed: '任務失敗', active: '執行中',
    mechanic: '', requirementFormula: '本階需求', counterBonus: '克制陣營 Power × 1.25', sourceArt: '來源原畫', shift: '換班候補',
    deployment: '任務部署', deploymentLead: '先配置跨專業隊伍與任務裝備，再進入風場作業。', team: '三人任務隊伍', equipment: '任務裝備', deploy: '開始任務',
    coverage: '六階段專業涵蓋', counterCoverage: 'Boss 克制人數', roundLimit: '回合上限', weather: '天候窗口', safety: '安全', evidence: '證據', cost: '成本', debrief: '任務結算',
    duplicateTeam: '隊伍角色不可重複', shiftRejected: '該角色已在隊伍中', mission: '教學任務', vessel: '作業船舶', spare: '任務備品', diagnosis: '診斷判斷',
    campaign: '戰役', challenge: 'Boss 挑戰', sandbox: '沙盒', collection: '收藏', codex: '知識庫', mastery: '熟練度', lockedSkill: '熟練度不足',
  },
  en: {
    characters: 'Characters', skills: 'Skills', bosses: 'Bosses', riskEvent: 'Risk event', stageNeed: 'Stage need', fatigueHit: 'Fatigue hit',
    redeploy: 'Redeploy', endRound: 'End round / accept risk', fatigue: 'Fatigue', missionComplete: 'Mission complete', missionFailed: 'Mission failed', active: 'Active',
    mechanic: 'Hazard pressure accumulates each round. Complete the six engineering stages with qualified skills.', requirementFormula: 'Stage need', counterBonus: 'Counter faction Power × 1.25', sourceArt: 'Source art', shift: 'Shift reserve',
    deployment: 'Mission deployment', deploymentLead: 'Configure a cross-functional team and mission equipment before offshore operations.', team: 'Three-person team', equipment: 'Mission equipment', deploy: 'Deploy mission',
    coverage: 'Six-stage coverage', counterCoverage: 'Boss counters', roundLimit: 'Round limit', weather: 'Weather window', safety: 'Safety', evidence: 'Evidence', cost: 'Cost', debrief: 'Mission debrief',
    duplicateTeam: 'Team members must be unique', shiftRejected: 'Character is already on the team', mission: 'Training mission', vessel: 'Operation vessel', spare: 'Mission spare', diagnosis: 'Diagnosis decision',
    campaign: 'Campaign', challenge: 'Boss Challenge', sandbox: 'Sandbox', collection: 'Collection', codex: 'Codex', mastery: 'Mastery', lockedSkill: 'Mastery level required',
  },
} as const;

interface DeploymentState {
  missionId: string;
  sandboxBossId: string;
  sandboxSceneId: string;
  teamIds: [string, string, string];
  equipmentId: string;
  spareId: string;
  vesselId: string;
  planningConfirmations: OperationPlanningConfirmations;
  sandboxScenario: SandboxScenarioConfig;
}

interface ChallengeCandidateUndo {
  bossId: string;
  source: 'crew' | 'route';
  teamIds: [string, string, string];
}

interface ChallengeDraftVerificationUndo {
  verification?: BossChallengeDraftVerification;
  baseline?: BossChallengeDraftVerification;
  repairEvidence?: BossChallengeDraftRepairEvidence;
  escalation?: BossChallengeRuntimeRepairEscalation;
}

interface SessionState {
  mode: 'campaign' | 'challenge' | 'sandbox';
  missionId?: string;
  sceneId: string;
  boss: BossData;
  equipmentId: string;
  spareId: string;
  vesselId: string;
  loadout: LoadoutEvaluation;
  mission: MissionState;
  fleetCondition?: FleetConditionDispatchProjection;
  team: CharacterRuntimeState[];
  selectedIndex: number;
  log: string[];
  diagnosisAnswerId?: string;
  diagnosisFeedback?: string;
  settled: boolean;
  reward?: CampaignReward;
  challengeSettlement?: BossChallengeSettlement;
  eventPulse: number;
  pendingBranch?: MissionBranchEvent;
  departedCrewFatigue: Record<string, number>;
  sandboxScenario?: SandboxScenarioConfig;
}

interface OperationReturnNotice {
  missionId: string;
  reason: 'abort';
}

type OperationInfoTab = 'log' | 'summary' | 'objectives';
type SandboxSceneAvailabilityFilter = 'ALL' | 'INTEGRATED' | 'FALLBACK';

export default function App() {
  const [database, setDatabase] = useState<GameDatabase | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('zh');
  const [deployment, setDeployment] = useState<DeploymentState | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [campaign, setCampaign] = useState<CampaignProgress | null>(null);
  const [challenge, setChallenge] = useState<BossChallengeProgress | null>(null);
  const [view, setView] = useState<GameView>('campaign');
  const [onboarding, setOnboarding] = useState<OnboardingProgress>(() => resumeOnboardingAtDeployment(loadOnboardingProgress()));
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [operationAbortConfirm, setOperationAbortConfirm] = useState(false);
  const [operationRoundConfirm, setOperationRoundConfirm] = useState(false);
  const [operationReturnNotice, setOperationReturnNotice] = useState<OperationReturnNotice | undefined>();
  const [operationInfoTab, setOperationInfoTab] = useState<OperationInfoTab>('log');
  const [operationGuideNotice, setOperationGuideNotice] = useState<{ targetTestId: string; label: string; pulse: number } | undefined>();

  useEffect(() => {
    // 同步 CSS 與 Phaser 的動態偏好，讓高對比事件不會只在其中一層被關閉。
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full';
  }, [reducedMotion]);

  useEffect(() => {
    loadGameDatabase()
      .then((loaded) => {
        const firstMission = [...loaded.missions].sort((a, b) => a.order - b.order)[0];
        const loadedCampaign = loadCampaignProgress(loaded.missions, loaded.equipment, loaded.characters, loaded.turbines);
        setDatabase(loaded);
        setCampaign(loadedCampaign);
        setChallenge(loadBossChallengeProgress(loaded.bosses, loaded.characters));
        setDeployment({
          missionId: firstMission.id,
          sandboxBossId: loaded.bosses[0].id,
          sandboxSceneId: loaded.sceneAssets.fallback.sourceSceneId,
          teamIds: normalizeCampaignTeamIds(INITIAL_TEAM, loadedCampaign, loaded.characters),
          equipmentId: firstMission.recommendedEquipmentId,
          spareId: firstMission.recommendedSpareId,
          vesselId: firstMission.recommendedVesselId,
          planningConfirmations: { permit: false, ppe: false, access: false },
          sandboxScenario: { ...DEFAULT_SANDBOX_SCENARIO },
        });
      })
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : String(error)));
  }, []);

  const characterMap = useMemo(
    () => new Map(database?.characters.map((item) => [item.id, item]) ?? []),
    [database],
  );

  useEffect(() => {
    if (!database || !campaign || !deployment || view !== 'campaign') return;
    const teamIds = normalizeCampaignTeamIds(deployment.teamIds, campaign, database.characters);
    if (teamIds.every((id, index) => id === deployment.teamIds[index])) return;
    // 匯入較低進度的存檔時立即降回同 Track 可用角色，避免 selector 保留幽靈鎖定值。
    setDeployment({ ...deployment, teamIds });
  }, [campaign, database, deployment, view]);

  useEffect(() => {
    if (!database || !campaign || !session || session.mode !== 'campaign' || !session.missionId || session.settled || (!session.mission.complete && !session.mission.failed)) return;
    const missionDefinition = database.missionById.get(session.missionId);
    if (!missionDefinition) return;
    const debrief = missionDebrief(session.mission, session.boss, session.team, characterMap);
    const deployedCrewFatigue = {
      ...session.departedCrewFatigue,
      ...Object.fromEntries(session.team.map((member) => [member.characterId, member.fatigue])),
    };
    const result = awardCampaignMission(
      campaign,
      missionDefinition,
      debrief,
      session.mission.complete,
      Object.keys(deployedCrewFatigue),
      database.missions,
      database.equipment,
      [session.equipmentId, session.spareId],
      database.characters,
      requiredVessel(database, session.vesselId),
      deployedCrewFatigue,
    );
    saveCampaignProgress(result.progress);
    setCampaign(result.progress);
    setSession((current) => current ? { ...current, settled: true, reward: result.reward } : current);
  }, [campaign, characterMap, database, session]);

  useEffect(() => {
    if (!database || !challenge || !session || session.mode !== 'challenge' || session.settled || (!session.mission.complete && !session.mission.failed)) return;
    const debrief = missionDebrief(session.mission, session.boss, session.team, characterMap);
    const result = recordBossChallenge(
      challenge,
      session.boss,
      debrief,
      session.mission,
      session.team.map((member) => member.characterId),
    );
    saveBossChallengeProgress(result.progress);
    setChallenge(result.progress);
    setSession((current) => current ? { ...current, settled: true, challengeSettlement: result.settlement } : current);
  }, [challenge, characterMap, database, session]);

  useEffect(() => {
    if (!session || session.mission.complete || session.mission.failed) setOperationAbortConfirm(false);
  }, [session?.mission.complete, session?.mission.failed, session?.missionId, session?.mode]);

  useEffect(() => {
    setOperationRoundConfirm(false);
  }, [session?.mission.round, session?.mission.progress, session?.mission.stageIndex, session?.pendingBranch?.code, session?.selectedIndex, session?.mission.complete, session?.mission.failed, session?.missionId, session?.mode]);

  useEffect(() => {
    setOperationGuideNotice(undefined);
  }, [session?.mission.round, session?.mission.progress, session?.mission.stageIndex, session?.pendingBranch?.code, session?.selectedIndex, session?.mission.complete, session?.mission.failed, session?.missionId, session?.mode]);

  if (loadError) {
    return <main className="center-state"><h1>資料載入失敗</h1><p>{loadError}</p></main>;
  }
  if (!database || !deployment || !campaign || !challenge) {
    return <main className="center-state"><div className="loader" /><p>載入 OWM 資料庫…</p></main>;
  }

  const ui = UI[language];
  const onboardingStep = currentOnboardingStep(onboarding);
  const updateOnboarding = (update: (current: OnboardingProgress) => OnboardingProgress) => {
    setOnboarding((current) => {
      const next = update(current);
      saveOnboardingProgress(next);
      return next;
    });
  };
  const advanceGuide = () => updateOnboarding(advanceOnboarding);
  const completeGuide = () => updateOnboarding(completeOnboarding);
  const skipGuide = () => updateOnboarding(skipOnboarding);
  const replayGuide = () => {
    const next = restartOnboarding();
    saveOnboardingProgress(next);
    setOnboarding(next);
    setSession(null);
    setView('campaign');
  };
  const returnGuideToCampaign = () => {
    updateOnboarding(resumeOnboardingAtDeployment);
    setSession(null);
    setView('campaign');
  };
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');
  const persistChallengeDraft = (bossId: string, teamIds: [string, string, string]) => {
    const boss = database.bossById.get(bossId);
    if (!boss) return;
    setChallenge((current) => {
      if (!current) return current;
      const next = recordBossChallengeSquadDraft(current, boss, teamIds);
      if (next === current) return current;
      saveBossChallengeProgress(next);
      return next;
    });
  };
  const seedChallengeDraftFromAudit = (bossId: string) => {
    const boss = database.bossById.get(bossId);
    const audit = database.bossChallengeAuditById.get(bossId);
    if (!boss || !audit) return;
    setChallenge((current) => {
      if (!current) return current;
      const next = seedBossChallengeSquadDraftFromAudit(current, boss, audit, database.characters);
      if (next === current) return current;
      saveBossChallengeProgress(next);
      return next;
    });
    setDeployment((current) => current ? {
      ...current,
      sandboxBossId: bossId,
      teamIds: [...audit.recommendedTeamIds],
    } : current);
  };
  const navigate = (nextView: GameView) => {
    setSession(null);
    setOperationReturnNotice(undefined);
    if (nextView === 'campaign') {
      setDeployment((current) => {
        if (!current) return current;
        const mission = campaign.unlockedMissionIds.includes(current.missionId)
          ? requiredMission(database, current.missionId)
          : [...database.missions].sort((left, right) => left.order - right.order).find((item) => campaign.unlockedMissionIds.includes(item.id))!;
        return {
          ...current,
          missionId: mission.id,
          equipmentId: isEquipmentOwned(campaign, current.equipmentId) ? current.equipmentId : mission.recommendedEquipmentId,
          spareId: isEquipmentOwned(campaign, current.spareId) ? current.spareId : mission.recommendedSpareId,
          vesselId: mission.recommendedVesselId,
          planningConfirmations: { permit: false, ppe: false, access: false },
        };
      });
    }
    if (nextView === 'challenge') {
      const bossId = deployment.sandboxBossId;
      const teamIds = challenge.draftByBossId[bossId]?.teamIds ?? [...INITIAL_TEAM] as [string, string, string];
      setDeployment((current) => current ? {
        ...current,
        teamIds,
        equipmentId: BOSS_CHALLENGE_EQUIPMENT_ID,
        spareId: BOSS_CHALLENGE_SPARE_ID,
        vesselId: BOSS_CHALLENGE_VESSEL_ID,
        planningConfirmations: { permit: false, ppe: false, access: false },
      } : current);
    }
    setView(nextView);
  };
  const routeCampaignMission = (missionId: string) => {
    const mission = requiredMission(database, missionId);
    setDeployment((current) => current ? {
      ...current,
      missionId: mission.id,
      equipmentId: mission.recommendedEquipmentId,
      spareId: mission.recommendedSpareId,
      vesselId: mission.recommendedVesselId,
      planningConfirmations: { permit: false, ppe: false, access: false },
    } : current);
    setSession(null);
    setOperationReturnNotice(undefined);
    setView('campaign');
  };
  const returnToCampaignRoute = () => {
    setSession(null);
    setOperationReturnNotice(undefined);
    setView('campaign');
  };
  const importCampaign = (nextProgress: CampaignProgress) => {
    saveCampaignProgress(nextProgress);
    setCampaign(nextProgress);
  };
  const importChallenge = (nextProgress: BossChallengeProgress) => {
    saveBossChallengeProgress(nextProgress);
    setChallenge(nextProgress);
    setDeployment((current) => current ? {
      ...current,
      teamIds: nextProgress.draftByBossId[current.sandboxBossId]?.teamIds ?? current.teamIds,
    } : current);
  };
  const repairEquipment = (equipmentId: string) => {
    const item = requiredEquipment(database, equipmentId);
    const result = repairCampaignEquipment(campaign, item);
    if (!result) return;
    saveCampaignProgress(result.progress);
    setCampaign(result.progress);
  };
  const maintainTurbine = (turbineId: string): TurbineMaintenanceSettlement | null => {
    const result = maintainCampaignTurbine(campaign, turbineId);
    if (!result) return null;
    saveCampaignProgress(result.progress);
    setCampaign(result.progress);
    return result.settlement;
  };
  const maintainTurbinePlan = (turbineIds: string[]): FleetMaintenancePlanSettlement | null => {
    const result = maintainCampaignTurbinePlan(campaign, turbineIds);
    if (!result) return null;
    saveCampaignProgress(result.progress);
    setCampaign(result.progress);
    return result.settlement;
  };
  const restCrewMember = (characterId: string) => {
    const character = requiredCharacter(database, characterId);
    const result = restCampaignCharacter(campaign, character);
    if (!result) return;
    saveCampaignProgress(result.progress);
    setCampaign(result.progress);
  };
  const confirmChallengeDraftClear = (preview: BossChallengeDraftSettlementPreview): BossChallengeSettlement => {
    const confirmedBoss = database.bossById.get(preview.bossId);
    if (!confirmedBoss) throw new Error(`Unknown Boss Challenge settlement ID: ${preview.bossId}`);
    const result = confirmBossChallengeDraftSettlement(challenge, confirmedBoss, preview);
    saveBossChallengeProgress(result.progress);
    setChallenge(result.progress);
    return result.settlement;
  };
  const changeDeployment = (next: DeploymentState) => {
    if (view !== 'challenge') {
      setDeployment(next);
      return;
    }
    const bossChanged = next.sandboxBossId !== deployment.sandboxBossId;
    const teamIds = bossChanged
      ? challenge.draftByBossId[next.sandboxBossId]?.teamIds ?? [...INITIAL_TEAM] as [string, string, string]
      : next.teamIds;
    const resolved = { ...next, teamIds };
    // 瀏覽 UNDRAFTED Boss 不應自動建立紀錄；只有同一 Boss 的實際隊伍變更才算玩家規劃。
    if (!bossChanged) persistChallengeDraft(resolved.sandboxBossId, resolved.teamIds);
    setDeployment(resolved);
  };
  const header = <Topbar database={database} campaign={campaign} view={view} language={language} onboarding={onboarding} reducedMotion={reducedMotion} onNavigate={navigate} onReplayOnboarding={replayGuide} onToggleLanguage={toggleLanguage} onToggleMotion={() => setReducedMotion((current) => !current)} />;

  if (!session) {
    if (view === 'collection') {
      return <main className="app-shell">{header}<CollectionScreen database={database} campaign={campaign} language={language} onImportProgress={importCampaign} /><OnboardingGuide progress={onboarding} surface="away" language={language} onAdvance={advanceGuide} onDeploy={returnGuideToCampaign} onComplete={completeGuide} onSkip={skipGuide} onReturnToCampaign={returnGuideToCampaign} /></main>;
    }
    if (view === 'codex') {
      return <main className="app-shell">{header}<CodexScreen database={database} campaign={campaign} language={language} /><OnboardingGuide progress={onboarding} surface="away" language={language} onAdvance={advanceGuide} onDeploy={returnGuideToCampaign} onComplete={completeGuide} onSkip={skipGuide} onReturnToCampaign={returnGuideToCampaign} /></main>;
    }
    const selectedMission = view === 'campaign' ? database.missionById.get(deployment.missionId) : undefined;
    const operationReadiness = selectedMission
      ? evaluateOperationReadiness(
          selectedMission,
          deployment.teamIds.map((id) => requiredCharacter(database, id)),
          campaign,
          requiredVessel(database, deployment.vesselId),
          deployment.planningConfirmations,
        )
      : undefined;
    const deploymentEquipmentReady = view !== 'campaign'
      || (isEquipmentServiceable(campaign, deployment.equipmentId) && isEquipmentServiceable(campaign, deployment.spareId));
    const deploymentCareerReady = view !== 'campaign'
      || deployment.teamIds.every((id) => isCareerCharacterUnlocked(campaign, database.characters, requiredCharacter(database, id)));
    const deploymentCrewReady = view !== 'campaign'
      || (deploymentCareerReady && deployment.teamIds.every((id) => isCrewMemberDeployable(campaign, requiredCharacter(database, id))));
    const deploy = () => {
      if (new Set(deployment.teamIds).size !== deployment.teamIds.length) return;
      if (view === 'sandbox') {
        const boss = database.bossById.get(deployment.sandboxBossId);
        if (boss) {
          setOperationReturnNotice(undefined);
          setOperationInfoTab('log');
          setSession(createSandboxSession(database, boss, deployment, campaign, language));
        }
        return;
      }
      if (view === 'challenge') {
        const boss = database.bossById.get(deployment.sandboxBossId);
        if (boss) {
          setOperationReturnNotice(undefined);
          setOperationInfoTab('log');
          setSession(createBossChallengeSession(database, boss, deployment, campaign, language));
        }
        return;
      }
      const mission = selectedMission;
      const boss = mission ? database.bossById.get(mission.bossId) : undefined;
      if (!mission || !boss || !campaign.unlockedMissionIds.includes(mission.id) || !operationReadiness?.ready) return;
      if (!deploymentEquipmentReady || !deploymentCrewReady) return;
      const nextSession = createSession(database, mission, boss, deployment, campaign, operationReadiness, language);
      if (nextSession.fleetCondition) {
        const nextCampaign = recordFleetConditionDispatch(campaign, mission, nextSession.fleetCondition);
        saveCampaignProgress(nextCampaign);
        setCampaign(nextCampaign);
      }
      setOperationReturnNotice(undefined);
      setOperationInfoTab('log');
      setSession(nextSession);
    };
    const guidedDeploy = () => {
      if (!operationReadiness?.ready || !deploymentEquipmentReady || !deploymentCrewReady) return;
      advanceGuide();
      deploy();
    };
    return (
      <main className="app-shell">
        {header}
        <DeploymentScreen
          database={database}
          deployment={deployment}
          campaign={campaign}
          challenge={challenge}
          mode={view}
          language={language}
          onboardingStep={view === 'campaign' && onboarding.status === 'active' ? onboardingStep : undefined}
          operationReadiness={operationReadiness}
          operationReturnNotice={view === 'campaign' ? operationReturnNotice : undefined}
          onDismissOperationReturnNotice={() => setOperationReturnNotice(undefined)}
          onChange={changeDeployment}
          onSeedChallengeDraft={seedChallengeDraftFromAudit}
          onConfirmChallengeDraftClear={confirmChallengeDraftClear}
          onImportChallengeProgress={importChallenge}
          onRepair={repairEquipment}
          onMaintainTurbine={maintainTurbine}
          onMaintainTurbinePlan={maintainTurbinePlan}
          onRest={restCrewMember}
          onDeploy={deploy}
        />
        <OnboardingGuide
          progress={onboarding}
          surface={view === 'campaign' ? 'deployment' : 'away'}
          language={language}
          canDeploy={view !== 'campaign' || Boolean(operationReadiness?.ready && deploymentEquipmentReady && deploymentCrewReady)}
          onAdvance={advanceGuide}
          onDeploy={guidedDeploy}
          onComplete={completeGuide}
          onSkip={skipGuide}
          onReturnToCampaign={returnGuideToCampaign}
        />
      </main>
    );
  }

  const selectedRuntime = session.team[session.selectedIndex];
  const selectedCharacter = requiredCharacter(database, selectedRuntime.characterId);
  const equipment = requiredEquipment(database, session.equipmentId);
  const spare = requiredEquipment(database, session.spareId);
  const vessel = requiredVessel(database, session.vesselId);
  const effectiveVessel = session.mode === 'sandbox' && session.sandboxScenario
    ? sandboxVesselProjection(vessel, session.sandboxScenario.seaState)
    : vessel;
  const roundForecastVessel = session.mode === 'challenge'
    ? bossChallengeVesselProjection(vessel, session.boss)
    : effectiveVessel;
  const missionDefinition = session.missionId ? requiredMission(database, session.missionId) : undefined;
  const continueTargets = session.mode === 'campaign' && session.missionId
    ? campaignContinueTargets(database.missions, campaign, session.missionId)
    : undefined;
  const runtimeTurbine = missionDefinition ? database.turbineById.get(missionDefinition.turbineId) : undefined;
  const runtimeTurbineState = runtimeTurbine ? campaign.windFarm[runtimeTurbine.id] : undefined;
  const sceneRoute = resolveSceneRoute(session.sceneId, database.sceneById, database.sceneAssets);
  const sourceArt = database.sourceArtIndex.items[selectedCharacter.id];
  const sourceArtUrl = sourceArt ? `/assets/source-art/p01/${sourceArt.file}` : null;
  const sourceArtCharacters = Object.keys(database.sourceArtIndex.items)
    .map((characterId) => requiredCharacter(database, characterId));
  const faction = database.factionById.get(selectedCharacter.factionCode)!;
  const masteryXp = sessionMasteryXp(session.mode, campaign, selectedCharacter.id);
  const mastery = characterMastery(masteryXp);
  const band = fatigueBand(selectedRuntime, selectedCharacter);
  const ratio = fatigueRatio(selectedRuntime, selectedCharacter);
  const currentStage = MISSION_STAGES[session.mission.stageIndex];
  const classRule = bossClassRule(session.boss.class);
  const telegraph = bossClassTelegraph(session.boss.class);
  const diagnosisPending = Boolean(missionDefinition) && currentStage === 'Diagnose' && !session.diagnosisAnswerId;
  const progressRatio = Math.min(1, session.mission.progress / session.mission.requirement);
  const missionEnded = session.mission.complete || session.mission.failed;
  const debrief = missionEnded
    ? missionDebrief(session.mission, session.boss, session.team, characterMap)
    : null;
  const activeCooldowns = Object.values(selectedRuntime.cooldowns).filter((value) => value > 0).length;
  const runtimeStatuses = [
    { key: 'fatigue', icon: band === 'Stable' ? '◇' : band === 'Tired' ? '△' : band === 'Critical' ? '!' : '×', label: language === 'zh' ? FATIGUE_ZH[band] : band },
    ...selectedRuntime.statuses.map((status) => ({
      key: status,
      icon: status === 'SpecialistReady' ? 'L4' : status === 'VeteranGuard' ? 'L5' : '↺',
      label: status === 'ShiftedIn'
        ? (language === 'zh' ? '換班進場' : 'Shifted in')
        : status === 'SpecialistReady'
          ? (language === 'zh' ? '專家整備' : 'Specialist readiness')
          : status === 'VeteranGuard'
            ? (language === 'zh' ? `資深防護 -${selectedRuntime.fatigueProtection}` : `Veteran guard -${selectedRuntime.fatigueProtection}`)
            : status,
    })),
    ...(activeCooldowns > 0 ? [{ key: 'cooldown', icon: 'CD', label: language === 'zh' ? `${activeCooldowns} 技能冷卻` : `${activeCooldowns} skill cooldown` }] : []),
  ];
  const reactiveOptions = session.team.flatMap((member, actorIndex) => {
    const character = requiredCharacter(database, member.characterId);
    const actorMastery = characterMastery(sessionMasteryXp(session.mode, campaign, character.id));
    return characterSkillIds(character).flatMap((skillId, skillIndex) => {
      const skill = database.skillById.get(skillId)!;
      if (skill.type !== 'Reactive') return [];
      const masteryUnlocked = isSkillSlotUnlocked(skillIndex, actorMastery);
      const availability = canUseSkill(member, character, skill);
      return [{ actorIndex, character, skill, available: masteryUnlocked && availability.ok, reason: masteryUnlocked ? availability.reason : ui.lockedSkill }];
    });
  });
  const stageRemaining = Math.max(0, session.mission.requirement - session.mission.progress);
  const endRoundForecast = previewEndRound(session.mission, session.boss, session.team, characterMap, equipment, roundForecastVessel);
  const forecastBranchEvent = !session.pendingBranch && !missionEnded
    ? branchEventForRound(session.boss, session.mission.round, missionDefinition)
    : undefined;
  const endRoundNeedsCommit = !missionEnded && !session.pendingBranch && (
    Boolean(endRoundForecast.failureReason)
    || Boolean(forecastBranchEvent)
    || endRoundForecast.safetyAfter <= 25
    || endRoundForecast.weatherAfter <= 25
  );
  const activeSkillRecommendations = !diagnosisPending && !session.pendingBranch && !missionEnded
    ? session.team.flatMap((member, actorIndex) => {
        const character = requiredCharacter(database, member.characterId);
        const actorMastery = characterMastery(sessionMasteryXp(session.mode, campaign, character.id));
        return characterSkillIds(character).flatMap((skillId, index) => {
          const skill = database.skillById.get(skillId)!;
          if (skill.type === 'Passive' || skill.type === 'Reactive' || !isSkillSlotUnlocked(index, actorMastery)) return [];
          if (!canUseSkill(member, character, skill).ok) return [];
          const forecast = resolveTeamSkill(session.mission, session.boss, session.team, characterMap, actorIndex, skill, equipment);
          return forecast.ok ? [{ actorIndex, character, skill, forecast }] : [];
        });
      })
    : [];
  const recommendedTeamSkill = activeSkillRecommendations
    .sort((left, right) => (
      right.forecast.appliedPower - left.forecast.appliedPower
      || right.skill.power - left.skill.power
      || left.skill.energyCost - right.skill.energyCost
      || left.actorIndex - right.actorIndex
      || left.skill.id.localeCompare(right.skill.id)
    ))[0];
  const recommendedSkill = recommendedTeamSkill?.skill;
  const selectedSkillForecast = recommendedTeamSkill?.forecast;
  const recommendedSkillReason = recommendedTeamSkill && selectedSkillForecast?.ok
    ? `Recommended: highest available team power ${selectedSkillForecast.appliedPower}; ${recommendedTeamSkill.actorIndex === session.selectedIndex ? 'selected crew' : `switch to ${characterName(recommendedTeamSkill.character, language)}`}; ${selectedSkillForecast.stageAdvanced ? 'clears this stage' : `${stageRemaining} power remains before action`}`
    : '';
  const availableReactiveCount = reactiveOptions.filter((option) => option.available).length;
  const operationDecision = session.pendingBranch
    ? {
        code: 'EVENT',
        action: language === 'zh' ? '先處理分支事件' : 'Resolve branch event first',
        detail: language === 'zh'
          ? `${session.pendingBranch.titleZh}：可用 Reactive ${availableReactiveCount} 個，否則承受後果。`
          : `${session.pendingBranch.titleEn}: ${availableReactiveCount} Reactive options available, or accept the consequence.`,
        meta: language === 'zh' ? '技能與結束回合暫停' : 'Skills and End Round paused',
      }
    : diagnosisPending
      ? {
          code: 'DIAG',
          action: language === 'zh' ? '先完成診斷判斷' : 'Resolve diagnosis gate',
          detail: language === 'zh' ? '選擇診斷答案後，Diagnose 技能才會開放。' : 'Choose the diagnosis answer before Diagnose skills unlock.',
          meta: missionDefinition ? `${missionDefinition.diagnosisOptions.length} OPTIONS` : 'OPTIONS',
        }
      : session.mission.weatherWindow <= 25 || session.mission.safety <= 25
        ? {
            code: 'RISK',
            action: language === 'zh' ? '先降低回合風險' : 'Reduce round risk before ending',
            detail: language === 'zh'
              ? `天候 ${session.mission.weatherWindow}%／安全 ${session.mission.safety}%。先用技能推進或回復，再考慮結束回合。`
              : `Weather ${session.mission.weatherWindow}% / Safety ${session.mission.safety}%. Use skills or recovery before End Round.`,
            meta: `${session.mission.round}/${session.mission.roundLimit} ROUND`,
          }
        : recommendedTeamSkill && recommendedSkill
          ? {
              code: 'ACT',
              action: recommendedTeamSkill.actorIndex === session.selectedIndex
                ? (language === 'zh' ? '使用目前技師技能推進' : 'Use selected crew skill')
                : (language === 'zh' ? '切換至全隊最佳技能' : 'Switch to best team skill'),
              detail: language === 'zh'
                ? `${characterName(recommendedTeamSkill.character, language)} → ${skillName(recommendedSkill, language)}，預估 +${recommendedTeamSkill.forecast.appliedPower} power。`
                : `${characterName(recommendedTeamSkill.character, language)} → ${skillName(recommendedSkill, language)}; forecast +${recommendedTeamSkill.forecast.appliedPower} power.`,
              meta: `${currentStage.toUpperCase()} ${session.mission.progress}/${session.mission.requirement}`,
            }
          : {
              code: 'ROUND',
              action: language === 'zh' ? '結束回合或切換技師' : 'End round or switch crew',
              detail: language === 'zh'
                ? `${characterName(selectedCharacter, language)} 目前沒有可用主動技能；可換人、等待 AP/Energy，或結束回合。`
                : `${characterName(selectedCharacter, language)} has no usable active skill; switch crew, wait for AP/Energy, or end the round.`,
              meta: `AP ${selectedRuntime.actionPoints} · E ${selectedRuntime.energy}`,
            };
  const operationDecisionGuide = (() => {
    if (operationDecision.code === 'EVENT') return {
      targetTestId: availableReactiveCount > 0 ? 'branch-reactive-cta' : 'branch-accept',
      label: availableReactiveCount > 0 ? 'REACTIVE' : 'ACCEPT',
    };
    if (operationDecision.code === 'DIAG') return { targetTestId: 'diagnosis-rec-cta', label: 'DIAG REC' };
    if (operationDecision.code === 'ACT') return { targetTestId: 'recommended-skill-cta', label: 'SKILL REC' };
    return { targetTestId: 'next-round', label: operationDecision.code === 'RISK' ? 'ROUND RISK' : 'END ROUND' };
  })();
  const activateOperationDecisionGuide = () => {
    const target = document.querySelector<HTMLElement>(`[data-testid="${operationDecisionGuide.targetTestId}"]`);
    if (!target) return;
    const pulse = Date.now();
    setOperationGuideNotice({ ...operationDecisionGuide, pulse });
    document.querySelectorAll<HTMLElement>('[data-guide-focus="true"]').forEach((element) => {
      delete element.dataset.guideFocus;
    });
    target.dataset.guideFocus = 'true';
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    window.setTimeout(() => {
      if (target.dataset.guideFocus === 'true') delete target.dataset.guideFocus;
    }, 1400);
    window.setTimeout(() => {
      setOperationGuideNotice((current) => current?.pulse === pulse ? undefined : current);
    }, 1600);
  };
  const operationInfoTitle = debrief
    ? 'MISSION RESULT'
    : operationInfoTab === 'summary'
      ? 'OPERATION SUMMARY'
      : operationInfoTab === 'objectives'
        ? 'OPERATION OBJECTIVES'
        : 'OPERATION LOG';
  const objectiveChecklist = [
    {
      key: 'stage',
      state: session.mission.complete ? 'done' : session.mission.failed ? 'risk' : stageRemaining <= 0 ? 'done' : 'active',
      label: 'STAGE TARGET',
      value: `${currentStage.toUpperCase()} ${session.mission.progress}/${session.mission.requirement}`,
      note: stageRemaining <= 0 ? 'Stage threshold reached' : `${stageRemaining} power still required`,
    },
    {
      key: 'skill',
      state: selectedSkillForecast?.ok ? (selectedSkillForecast.stageAdvanced ? 'done' : 'active') : 'waiting',
      label: 'SKILL FORECAST',
      value: selectedSkillForecast?.ok && recommendedSkill
        ? `${skillName(recommendedSkill, language)} +${selectedSkillForecast.appliedPower}`
        : recommendedSkill
          ? `BLOCKED ${skillName(recommendedSkill, language)}`
          : 'NO ACTIVE SKILL',
      note: selectedSkillForecast?.ok && recommendedSkill
        ? `${selectedSkillForecast.stageAdvanced ? 'Stage clear' : 'Stage remains'} / AP -1 / E -${recommendedSkill.energyCost} / Fatigue ${signed(recommendedSkill.fatigueDelta)}`
        : diagnosisPending
          ? 'Resolve diagnosis first'
          : session.pendingBranch
            ? 'Resolve event first'
            : 'Switch crew or End Round',
    },
    {
      key: 'forecast',
      state: endRoundForecast.failureReason ? 'risk' : forecastBranchEvent ? 'active' : 'done',
      label: 'END ROUND FORECAST',
      value: `F +${endRoundForecast.fatigueDamage} / S -${endRoundForecast.safetyLoss} / W -${endRoundForecast.weatherLoss}`,
      note: endRoundForecast.failureReason
        ? `Failure: ${endRoundForecast.failureReason}`
        : forecastBranchEvent
          ? `Triggers ${forecastBranchEvent.code}`
          : `Next R${endRoundForecast.nextRound}`,
    },
    {
      key: 'learning',
      state: missionDefinition ? 'active' : 'done',
      label: 'LEARNING OBJECTIVE',
      value: missionDefinition
        ? (language === 'zh' ? missionDefinition.learningObjectivesZh[0] : missionDefinition.learningObjectivesEn[0])
        : 'Sandbox runtime objective',
      note: missionDefinition ? missionDefinition.id : `${session.boss.id} sandbox`,
    },
    {
      key: 'diagnosis',
      state: !missionDefinition || session.diagnosisAnswerId ? 'done' : diagnosisPending ? 'active' : 'waiting',
      label: 'DIAGNOSIS GATE',
      value: !missionDefinition ? 'N/A' : session.diagnosisAnswerId ? 'RESOLVED' : diagnosisPending ? 'DECISION REQUIRED' : 'WAITING',
      note: missionDefinition ? `${missionDefinition.diagnosisOptions.length} options` : 'No campaign diagnosis gate',
    },
    {
      key: 'branch',
      state: session.pendingBranch ? 'risk' : 'done',
      label: 'BRANCH EVENT',
      value: session.pendingBranch ? (language === 'zh' ? session.pendingBranch.titleZh : session.pendingBranch.titleEn) : 'CLEAR',
      note: session.pendingBranch ? 'Reactive response or accept consequence' : 'No unresolved event',
    },
    {
      key: 'risk',
      state: session.mission.weatherWindow <= 25 || session.mission.safety <= 25 ? 'risk' : 'done',
      label: 'RISK FLOOR',
      value: `W ${session.mission.weatherWindow}% / S ${session.mission.safety}%`,
      note: session.mission.weatherWindow <= 25 || session.mission.safety <= 25 ? 'Stabilize before ending round' : 'Within operating margin',
    },
  ];

  const useTeamSkill = (skill: SkillData, requestedActorIndex?: number) => {
    setSession((current) => {
      if (!current) return current;
      if (current.pendingBranch) {
        return { ...current, log: pushLog(current.log, language === 'zh' ? '⛔ 先處理分支事件' : '⛔ Resolve the branch event first') };
      }
      if (current.mode === 'campaign' && MISSION_STAGES[current.mission.stageIndex] === 'Diagnose' && !current.diagnosisAnswerId) {
        return { ...current, log: pushLog(current.log, language === 'zh' ? '⛔ 先完成診斷判斷，再執行 Diagnose 技能' : '⛔ Resolve the diagnosis decision before Diagnose skills') };
      }
      const actorIndex = requestedActorIndex ?? current.selectedIndex;
      const actorRuntime = current.team[actorIndex];
      if (!actorRuntime) return current;
      const actorCharacter = requiredCharacter(database, actorRuntime.characterId);
      const activeEquipment = requiredEquipment(database, current.equipmentId);
      const resolution = resolveTeamSkill(
        current.mission,
        current.boss,
        current.team,
        characterMap,
        actorIndex,
        skill,
        activeEquipment,
      );
      if (!resolution.ok) {
        return { ...current, log: pushLog(current.log, `⛔ ${resolution.message}`) };
      }
      const multipliers = [
        resolution.stageMultiplier > 1 ? `Stage ×${resolution.stageMultiplier}` : '',
        resolution.counterMultiplier > 1 ? `Counter ×${resolution.counterMultiplier}` : '',
        resolution.equipmentBonus > 0 ? `EQ +${resolution.equipmentBonus}` : '',
        resolution.recoveredTeamFatigue > 0 ? `Recover ${resolution.recoveredTeamFatigue}` : '',
      ].filter(Boolean).join(' · ');
      const suffix = resolution.stageAdvanced
        ? `｜${language === 'zh' ? '階段完成' : 'stage cleared'}`
        : '';
      return {
        ...current,
        selectedIndex: actorIndex,
        team: resolution.team,
        mission: resolution.mission,
        log: pushLog(
          current.log,
          `${characterName(actorCharacter, language)} → ${skillName(skill, language)} +${resolution.appliedPower}${suffix}${multipliers ? `｜${multipliers}` : ''}`,
        ),
      };
    });
  };
  const useSelectedSkill = (skill: SkillData) => useTeamSkill(skill);

  const chooseDiagnosis = (optionId: string) => {
    if (!missionDefinition) return;
    const option = missionDefinition.diagnosisOptions.find((item) => item.id === optionId);
    if (!option) return;
    setSession((current) => {
      if (!current || current.diagnosisAnswerId) return current;
      const resolution = resolveDiagnosisDecision(current.mission, option);
      const feedback = language === 'zh' ? option.feedbackZh : option.feedbackEn;
      return {
        ...current,
        mission: resolution.mission,
        diagnosisAnswerId: option.id,
        diagnosisFeedback: feedback,
        log: pushLog(current.log, `${resolution.correct ? '✓' : '⚠'} ${feedback}`),
      };
    });
    if (onboarding.status === 'active' && onboardingStep === 'DIAGNOSIS_GATE') advanceGuide();
  };

  const shiftSelectedCharacter = (characterId: string) => {
    setSession((current) => {
      if (!current || current.mission.complete || current.mission.failed) return current;
      if (current.team[current.selectedIndex]?.characterId === characterId) return current;
      if (current.team.some((member, index) => index !== current.selectedIndex && member.characterId === characterId)) {
        return { ...current, log: pushLog(current.log, `⛔ ${ui.shiftRejected}`) };
      }
      const character = requiredCharacter(database, characterId);
      const perkModifiers = masteryPerkModifiers(sessionMasteryXp(current.mode, campaign, characterId));
      const carriedFatigue = current.mode === 'campaign'
        ? (current.departedCrewFatigue[characterId] ?? campaignCrewFatigue(campaign, characterId))
        : 0;
      if (current.mode === 'campaign' && carriedFatigue >= character.fatigueMax) {
        return { ...current, log: pushLog(current.log, `⛔ ${language === 'zh' ? '該技師已耗竭，需先休息' : 'Crew member is exhausted and must rest first'}`) };
      }
      const shiftedRuntime = createCharacterRuntime(character, perkModifiers, carriedFatigue);
      const team = [...current.team];
      const outgoing = team[current.selectedIndex];
      team[current.selectedIndex] = {
        ...shiftedRuntime,
        fatigue: Math.min(shiftedRuntime.fatigue + 10, character.fatigueMax),
        actionPoints: 0,
        statuses: [...shiftedRuntime.statuses, 'ShiftedIn'],
      };
      const departedCrewFatigue = { ...current.departedCrewFatigue, [outgoing.characterId]: outgoing.fatigue };
      delete departedCrewFatigue[characterId];
      return {
        ...current,
        team,
        departedCrewFatigue,
        mission: { ...current.mission, safety: Math.max(0, current.mission.safety - 1), cost: current.mission.cost + 2 },
        log: pushLog(current.log, `${language === 'zh' ? '換班' : 'Shift'} → ${characterName(character, language)}｜AP 0`),
      };
    });
  };

  const openOperationAbort = () => {
    setOperationRoundConfirm(false);
    setOperationAbortConfirm(true);
  };
  const cancelOperationAbort = () => setOperationAbortConfirm(false);
  const handleOperationInfoTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const tabs = ['log', 'summary', 'objectives'] as const;
    const currentIndex = tabs.indexOf(operationInfoTab);
    const nextTab = event.key === 'ArrowRight'
      ? tabs[(currentIndex + 1) % tabs.length]
      : event.key === 'ArrowLeft'
        ? tabs[(currentIndex - 1 + tabs.length) % tabs.length]
        : event.key === 'Home'
          ? tabs[0]
          : event.key === 'End'
            ? tabs[tabs.length - 1]
            : undefined;
    if (!nextTab) return;
    event.preventDefault();
    setOperationInfoTab(nextTab);
    window.requestAnimationFrame(() => document.getElementById(`operation-info-tab-${nextTab}-button`)?.focus());
  };
  const confirmOperationAbort = () => {
    if (session.mode === 'campaign' && session.missionId) {
      setOperationReturnNotice({ missionId: session.missionId, reason: 'abort' });
      setView('campaign');
    } else {
      setOperationReturnNotice(undefined);
    }
    setOperationAbortConfirm(false);
    setSession(null);
  };

  const nextRound = () => {
    setOperationRoundConfirm(false);
    setSession((current) => {
      if (!current || current.pendingBranch) return current;
      const vessel = requiredVessel(database, current.vesselId);
      const result = endRound(
        current.mission,
        current.boss,
        current.team,
        characterMap,
        requiredEquipment(database, current.equipmentId),
        current.mode === 'challenge'
          ? bossChallengeVesselProjection(vessel, current.boss)
          : current.mode === 'sandbox' && current.sandboxScenario
            ? sandboxVesselProjection(vessel, current.sandboxScenario.seaState)
            : vessel,
      );
      const pendingBranch = !result.mission.complete && !result.mission.failed
        ? branchEventForRound(current.boss, current.mission.round, current.missionId ? database.missionById.get(current.missionId) : undefined)
        : undefined;
      return {
        ...current,
        mission: result.mission,
        team: current.mode === 'challenge' ? bossChallengeRoundTeamProjection(result.team, current.boss) : result.team,
        eventPulse: current.eventPulse + 1,
        pendingBranch,
        log: pushLog(
          current.log,
          language === 'zh'
            ? `⚠ ${result.classEvent?.titleZh ?? '風險結算'}｜疲勞 +${result.fatigueDamage} · 安全 -${result.safetyLoss} · 天候 -${result.weatherLoss}`
            : `⚠ ${result.classEvent?.titleEn ?? 'Risk settled'} | Fatigue +${result.fatigueDamage} · Safety -${result.safetyLoss} · Weather -${result.weatherLoss}`,
        ),
      };
    });
  };
  const requestNextRound = () => {
    if (endRoundNeedsCommit && !operationRoundConfirm) {
      setOperationRoundConfirm(true);
      return;
    }
    nextRound();
  };

  const resolveBranch = (actorIndex?: number, skillId?: string) => {
    setSession((current) => {
      if (!current?.pendingBranch) return current;
      const response = actorIndex === undefined || !skillId
        ? undefined
        : {
            actorIndex,
            character: requiredCharacter(database, current.team[actorIndex].characterId),
            skill: database.skillById.get(skillId)!,
          };
      const resolution = resolveMissionBranch(current.mission, current.team, current.pendingBranch, response);
      if (!resolution.ok) return { ...current, log: pushLog(current.log, `⛔ ${resolution.message}`) };
      const title = language === 'zh' ? current.pendingBranch.titleZh : current.pendingBranch.titleEn;
      const outcome = response
        ? (language === 'zh' ? `Reactive 減傷 ${Math.round(resolution.mitigationRate * 100)}%` : `Reactive mitigation ${Math.round(resolution.mitigationRate * 100)}%`)
        : (language === 'zh' ? '承受完整後果' : 'Full consequence applied');
      return {
        ...current,
        mission: resolution.mission,
        team: resolution.team,
        selectedIndex: response?.actorIndex ?? current.selectedIndex,
        pendingBranch: undefined,
        log: pushLog(current.log, `${current.pendingBranch.icon} ${title} ×${current.pendingBranch.intensity.toFixed(2)}｜${outcome}｜${branchPenaltySummary(resolution.appliedPenalty, language)}`),
      };
    });
    if (onboarding.status === 'active' && onboardingStep === 'REACTIVE_WINDOW') advanceGuide();
  };

  const danger = Math.min(1, (100 - session.mission.weatherWindow) / 100 * 0.55 + (100 - session.mission.safety) / 100 * 0.45);

  return (
    <main className="app-shell">
      {header}
      <section className="game-grid" data-testid="mission-operation">
        <aside className="panel mission-panel">
          <div className="section-kicker">MISSION CONTROL</div>
          <span className="select-label">{ui.riskEvent}</span>
          <div className="locked-mission">{missionDefinition ? missionTitle(missionDefinition, language) : `${session.mode === 'challenge' ? ui.challenge : ui.sandbox} · ${bossName(session.boss, language)}`}</div>
          <div className="boss-title-row">
            <div><span className="severity">{session.boss.severity}</span><h2>{bossName(session.boss, language)}</h2></div>
            <div className="round-box"><strong>{session.mission.round}</strong><span>/ {session.mission.roundLimit}</span></div>
          </div>
          <p className="mechanic">{missionDefinition ? (language === 'zh' ? missionDefinition.briefingZh : missionDefinition.briefingEn) : (language === 'zh' ? session.boss.mechanic : ui.mechanic)}</p>
          {session.mode === 'sandbox' && session.sandboxScenario && <div className="sandbox-operation-strip" data-testid="sandbox-operation-scenario">
            <span><small>SEA STATE</small><b>{session.sandboxScenario.seaState}</b></span>
            <span><small>{language === 'zh' ? '初始天候' : 'INITIAL WEATHER'}</small><b>{session.sandboxScenario.weatherWindow}</b></span>
            <span><small>{language === 'zh' ? '初始安全' : 'INITIAL SAFETY'}</small><b>{session.sandboxScenario.safety}</b></span>
            <span><small>{language === 'zh' ? '初始證據' : 'INITIAL EVIDENCE'}</small><b>{session.sandboxScenario.evidence}</b></span>
            <em>{language === 'zh' ? '船舶投影' : 'VESSEL PROJECTION'} · W{effectiveVessel.weatherProtection} / S{effectiveVessel.safetyProtection} / F{effectiveVessel.fatigueRelief}</em>
          </div>}
          <div className="boss-class-rule" data-testid="boss-class-rule" style={{ '--hazard': telegraph.accent } as React.CSSProperties}>
            <span><i>{telegraph.icon}</i><em>{session.boss.class}</em></span><b>{language === 'zh' ? classRule.titleZh : classRule.titleEn}</b>
            <small>{language === 'zh' ? classRule.descriptionZh : classRule.descriptionEn}</small>
            <div className="impact-tags" aria-label={language === 'zh' ? '受影響資源' : 'Affected resources'}>
              {telegraph.impacts.map((impact) => <i key={impact}>{IMPACT_LABELS[language][impact]}</i>)}
            </div>
          </div>
          {missionDefinition && <MissionEventDeck mission={missionDefinition} currentRound={session.mission.round} activeRound={session.pendingBranch?.triggerRound} language={language} compact />}

          <div className="mission-metrics">
            <Metric label={ui.stageNeed} value={session.mission.requirement} />
            <Metric label={ui.fatigueHit} value={`+${session.boss.fatigueDamage}`} />
            <Metric label="Phase" value={`${session.mission.phase}/${session.boss.phases}`} />
          </div>
          <div className="mission-resource-grid">
            <ResourceMeter label={ui.weather} value={session.mission.weatherWindow} tone="weather" />
            <ResourceMeter label={ui.safety} value={session.mission.safety} tone="safety" />
            <ResourceMeter label={ui.evidence} value={session.mission.evidence} tone="evidence" />
          </div>

          <ol className="stage-list" aria-label="任務工程階段">
            {MISSION_STAGES.map((stage, index) => {
              const state = index < session.mission.stageIndex ? 'done' : index === session.mission.stageIndex ? 'current' : 'waiting';
              return <li key={stage} className={state}><span>{String(index + 1).padStart(2, '0')}</span><b>{language === 'zh' ? STAGE_ZH[index] : stage}</b><i>{state === 'done' ? '✓' : state === 'current' ? '●' : '—'}</i></li>;
            })}
          </ol>

          <div className="stage-progress">
            <div><span>{language === 'zh' ? STAGE_ZH[session.mission.stageIndex] : currentStage}</span><strong>{session.mission.progress} / {session.mission.requirement}</strong></div>
            <div className="progress-track"><span style={{ width: `${progressRatio * 100}%` }} /></div>
          </div>

          <div className="mission-action-stack">
            {missionEnded ? (
              <button className="primary-button" data-testid="reset-mission" onClick={() => setSession(null)}>{ui.redeploy}</button>
            ) : (
              <>
                <button className={`primary-button${operationRoundConfirm ? ' confirm' : ''}`} data-testid="next-round" disabled={Boolean(session.pendingBranch)} onClick={requestNextRound}>{session.pendingBranch ? (language === 'zh' ? '等待事件回應' : 'Awaiting event response') : operationRoundConfirm ? 'Confirm End Round' : ui.endRound}</button>
                {operationRoundConfirm && (
                  <small className="round-commit-confirmation" data-testid="round-commit-confirmation">
                    {endRoundForecast.failureReason
                      ? `Forecast failure: ${endRoundForecast.failureReason}`
                      : forecastBranchEvent
                        ? `Will trigger ${forecastBranchEvent.code}; click again to commit.`
                        : `Low margin after round: W ${endRoundForecast.weatherAfter}% / S ${endRoundForecast.safetyAfter}%.`}
                  </small>
                )}
                {operationAbortConfirm ? (
                  <div className="operation-abort-confirmation" data-testid="abort-operation-confirmation">
                    <span>{language === 'zh' ? 'Return current sortie?' : 'Return current sortie?'}</span>
                    <small data-testid="abort-operation-copy">{language === 'zh'
                      ? 'Return 只中止 sortie；未結算、未寫任務結果、reward、best score 或 mission outcome history。'
                      : 'Return aborts this sortie only; no mission result, reward, best score, or mission outcome history is written.'}</small>
                    <button type="button" data-testid="abort-operation-cancel" onClick={cancelOperationAbort}>Cancel</button>
                    <button type="button" data-testid="abort-operation-confirm" onClick={confirmOperationAbort}>Confirm return</button>
                  </div>
                ) : (
                  <button type="button" className="operation-abort-open" data-testid="abort-operation-open" onClick={openOperationAbort}>Abort / Return Route</button>
                )}
              </>
            )}
          </div>
        </aside>

        <section className="center-column">
          <div className="panel field-panel">
            <div className="field-status"><span className="live-dot" /> LIVE FIELD FEED <span className="telegraph-chip" data-testid="telegraph-chip" style={{ '--hazard': telegraph.accent } as React.CSSProperties}>{telegraph.icon} {telegraph.code}</span>{runtimeTurbine && runtimeTurbineState && <span className={`field-turbine-route ${runtimeTurbineState.availability.toLowerCase()}`} data-testid="field-turbine-status"><i>{runtimeTurbine.id.replace('WTG-OWM-', 'WTG-')}</i><b>{language === 'zh' ? runtimeTurbine.nameZh : runtimeTurbine.nameEn}</b><em>R {runtimeTurbineState.reliability}% · B {runtimeTurbineState.openFaults}</em></span>}<span className={`field-scene-route ${sceneRoute.availability.toLowerCase()}`} data-testid="scene-route-status" title={sceneRouteProvenance(sceneRoute, language)}><i>{sceneRoute.requestedScene.id}</i><b>{sceneRouteName(sceneRoute, language)}</b><em>{sceneRoute.availability}</em></span><strong>{currentStage.toUpperCase()}</strong></div>
            {session.fleetCondition && <div className={`field-fleet-condition ${session.fleetCondition.modifier.pressure.toLowerCase()}`} data-testid="field-fleet-condition">
              <span><small>FLEET CONDITION</small><b>{session.fleetCondition.modifier.turbineId.replace('WTG-OWM-', 'WTG-')} · {session.fleetCondition.modifier.pressure}</b></span>
              <span><small>COST</small><b>+{session.fleetCondition.mobilizationCostBefore}→+{session.fleetCondition.mobilizationCostAfter}</b></span>
              <span><small>SAFETY</small><b>{session.fleetCondition.safetyBefore}→{session.fleetCondition.safetyAfter}</b></span>
              <span><small>RELIABILITY</small><b>{session.fleetCondition.reliabilityBefore}→{session.fleetCondition.reliabilityAfter}</b></span>
              <em>Gameplay abstraction</em>
            </div>}
            {session.eventPulse > 0 && <div key={session.eventPulse} className="hazard-event" data-testid="hazard-event" role="status" style={{ '--hazard': telegraph.accent } as React.CSSProperties}><span>{telegraph.icon}</span><div><small>ROUND EVENT · {telegraph.pattern.toUpperCase()}</small><b>{language === 'zh' ? classRule.titleZh : classRule.titleEn}</b></div></div>}
            <Suspense fallback={<div className="scene-loading">Loading field feed…</div>}>
              <OffshoreScene accent={faction.color} danger={danger} stage={currentStage} telegraph={telegraph} eventPulse={session.eventPulse} reducedMotion={reducedMotion} sceneRoute={sceneRoute} />
            </Suspense>
            <div className="formula-strip">
              <span>{ui.requirementFormula} = ceil({session.boss.resilience} ÷ ({session.boss.phases} × 6))</span>
              <strong>= {session.mission.requirement}</strong>
              <span>{ui.counterBonus}</span>
            </div>
          </div>

          <div className="panel event-panel">
            <div className="event-title"><span data-testid="operation-info-heading">{operationInfoTitle}</span><strong>{session.mission.complete ? ui.missionComplete : session.mission.failed ? ui.missionFailed : ui.active}</strong></div>
            {session.pendingBranch && <BranchEventPanel event={session.pendingBranch} options={reactiveOptions} language={language} highlight={onboarding.status === 'active' && onboardingStep === 'REACTIVE_WINDOW'} onReact={(actorIndex, skillId) => resolveBranch(actorIndex, skillId)} onAccept={() => resolveBranch()} />}
            {diagnosisPending && missionDefinition && <DiagnosisPanel mission={missionDefinition} language={language} highlight={onboarding.status === 'active' && onboardingStep === 'DIAGNOSIS_GATE'} onChoose={chooseDiagnosis} />}
            {session.diagnosisFeedback && !diagnosisPending && <div className="diagnosis-feedback">{session.diagnosisFeedback}</div>}
            {debrief && <DebriefPanel debrief={debrief} failureReason={session.mission.failureReason} reward={session.reward} missions={database.missions} characters={database.characters} codexEntry={session.mission.complete ? database.codex.find((entry) => entry.unlockMissionId === session.missionId) : undefined} completionSummary={session.reward?.campaignCompleted ? campaignCompletionSummary(campaign, database.missions) : undefined} continueTargets={continueTargets} logEntries={session.log} language={language} highlight={onboarding.status === 'active' && onboardingStep === 'DEBRIEF'} onSelectMission={routeCampaignMission} onReturnRoute={returnToCampaignRoute} />}
            {debrief && session.mode === 'challenge' && session.challengeSettlement && <BossChallengeResultPanel settlement={session.challengeSettlement} language={language} />}
            {!debrief && <section
              className={`operation-decision-prompt ${operationDecision.code.toLowerCase()}`}
              data-testid="operation-decision-prompt"
              data-decision-code={operationDecision.code}
              data-decision-action={operationDecision.action}
              data-decision-reason={operationDecision.detail}
              data-decision-meta={operationDecision.meta}
              data-decision-guide-target={operationDecisionGuide.targetTestId}
              data-decision-guide-label={operationDecisionGuide.label}
              data-decision-guide-active={operationGuideNotice ? 'true' : 'false'}
              data-decision-guide-active-target={operationGuideNotice?.targetTestId ?? ''}
              data-decision-guide-active-label={operationGuideNotice?.label ?? ''}
              data-decision-guide-pulse={operationGuideNotice?.pulse ?? ''}
            >
              <span>NEXT DECISION</span>
              <b data-testid="operation-decision-action">{operationDecision.code} · {operationDecision.action}</b>
              <small data-testid="operation-decision-detail">{operationDecision.detail}</small>
              <div className="operation-decision-actions">
                <em>{operationDecision.meta}</em>
                <button
                  type="button"
                  className="decision-guide-cta"
                  data-testid="operation-decision-guide-cta"
                  data-decision-guide-target={operationDecisionGuide.targetTestId}
                  onClick={activateOperationDecisionGuide}
                >
                  <span>GUIDE</span>
                  <b>{operationDecisionGuide.label}</b>
                </button>
                {(operationDecision.code === 'ROUND' || operationDecision.code === 'RISK') && (
                  <button
                    type="button"
                    className={`round-decision-cta${operationRoundConfirm ? ' confirm' : ''}`}
                    data-testid="round-decision-cta"
                    data-round-confirmation-required={endRoundNeedsCommit ? 'true' : 'false'}
                    data-round-confirming={operationRoundConfirm ? 'true' : 'false'}
                    onClick={requestNextRound}
                  >
                    <span>REC</span>
                    <b>{operationRoundConfirm ? 'CONFIRM' : 'END ROUND'}</b>
                  </button>
                )}
              </div>
              {operationGuideNotice && (
                <small
                  key={operationGuideNotice.pulse}
                  className="decision-guide-notice"
                  data-testid="operation-decision-guide-notice"
                  data-decision-guide-notice-target={operationGuideNotice.targetTestId}
                  data-decision-guide-notice-label={operationGuideNotice.label}
                  aria-live="polite"
                >
                  GUIDE → {operationGuideNotice.label} · {operationGuideNotice.targetTestId}
                </small>
              )}
            </section>}
            {!debrief && <div className="operation-info-tabs" role="tablist" aria-label={language === 'zh' ? '作業資訊切換' : 'Operation information tabs'}>
              {([
                ['log', language === 'zh' ? 'LOG' : 'LOG'],
                ['summary', language === 'zh' ? 'SUMMARY' : 'SUMMARY'],
                ['objectives', language === 'zh' ? 'OBJECTIVES' : 'OBJECTIVES'],
              ] as const).map(([tab, label]) => <button key={tab} id={`operation-info-tab-${tab}-button`} role="tab" type="button" data-testid={`operation-info-tab-${tab}`} aria-selected={operationInfoTab === tab} aria-controls={`operation-info-panel-${tab}`} tabIndex={operationInfoTab === tab ? 0 : -1} className={operationInfoTab === tab ? 'active' : ''} onClick={() => setOperationInfoTab(tab)} onKeyDown={handleOperationInfoTabKey}>{label}</button>)}
            </div>}
            {!debrief && operationInfoTab === 'log' && <div id="operation-info-panel-log" role="tabpanel" aria-labelledby="operation-info-tab-log-button">
              <div className="log-list" role="log" aria-live="polite" data-testid="operation-log-list">
                {session.log.map((entry, index) => <p key={`${entry}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{entry}</p>)}
              </div>
            </div>}
            {!debrief && operationInfoTab === 'summary' && <div id="operation-info-panel-summary" role="tabpanel" aria-labelledby="operation-info-tab-summary-button" className="operation-summary-grid" data-testid="operation-summary">
              <span><small>STAGE</small><b data-testid="operation-summary-stage">{language === 'zh' ? STAGE_ZH[session.mission.stageIndex] : currentStage}</b></span>
              <span><small>PROGRESS</small><b data-testid="operation-summary-progress">{session.mission.progress}/{session.mission.requirement}</b></span>
              <span><small>WEATHER</small><b>{session.mission.weatherWindow}%</b></span>
              <span><small>SCENE</small><b>{sceneRoute.requestedScene.id} · {sceneRoute.availability}</b></span>
              <span><small>SOURCE</small><b>{sceneRoute.sourceScene.id} · {sceneRoute.version.toUpperCase()}</b></span>
              <span><small>QA</small><b>{sceneRoute.qaStatus.replaceAll('_', ' ')}</b></span>
              <span><small>TURBINE</small><b>{runtimeTurbine ? runtimeTurbine.id.replace('WTG-OWM-', 'WTG-') : 'N/A'}</b></span>
              <span><small>FLEET</small><b>{session.fleetCondition ? session.fleetCondition.modifier.pressure : 'NOMINAL'}</b></span>
            </div>}
            {!debrief && operationInfoTab === 'objectives' && <div id="operation-info-panel-objectives" role="tabpanel" aria-labelledby="operation-info-tab-objectives-button" className="operation-objective-list" data-testid="operation-objectives">
              {objectiveChecklist.map((item) => (
                <span key={item.key} className={item.state}>
                  <small>{item.label}</small>
                  <b>{item.value}</b>
                  <em>{item.note}</em>
                </span>
              ))}
            </div>}
          </div>
        </section>

        <aside className="panel card-panel" style={{ '--faction': faction.color } as React.CSSProperties}>
          <div className="team-tabs" role="tablist" aria-label="任務隊伍">
            {session.team.map((member, index) => {
              const character = requiredCharacter(database, member.characterId);
              return <button key={`${index}-${member.characterId}`} data-testid={`team-${index}-${member.characterId}`} className={index === session.selectedIndex ? 'active' : ''} onClick={() => setSession((current) => current ? { ...current, selectedIndex: index } : current)} aria-label={characterName(character, language)}>{character.factionCode}<span>{index + 1}</span></button>;
            })}
          </div>

          <label className="art-preview-select">
            <span>{ui.shift}</span>
            <select data-testid="shift-character" value={selectedCharacter.id} disabled={missionEnded} onChange={(event) => shiftSelectedCharacter(event.target.value)}>
              {sourceArtCharacters.map((character) => (
                <option key={character.id} value={character.id}>{characterName(character, language)} · {database.sourceArtIndex.items[character.id].version.toUpperCase()}</option>
              ))}
            </select>
          </label>

          <div
            key={selectedCharacter.id}
            className="portrait-placeholder"
            aria-label={sourceArt ? `角色 P01 ${sourceArt.version} 來源原畫` : '角色來源原畫待核准'}
            data-source-art-character-id={selectedCharacter.id}
            data-source-art-version={sourceArt?.version ?? ''}
            data-source-art-file={sourceArt?.file ?? ''}
            data-source-art-qa-status={sourceArt?.qaStatus ?? ''}
            data-source-art-engineering-qa-status={sourceArt?.engineeringQaStatus ?? ''}
          >
            <div className="portrait-grid" />
            <div className="portrait-silhouette"><span>◈</span></div>
            {sourceArtUrl && <img
                className="source-art-image"
                src={sourceArtUrl}
                alt=""
                onLoad={(event) => event.currentTarget.parentElement?.classList.add('has-source-art')}
                onError={(event) => event.currentTarget.parentElement?.classList.remove('has-source-art')}
              />}
            <div className="source-art-label placeholder-art-label">{ui.sourceArt.toUpperCase()} · {selectedCharacter.artStatus.toUpperCase()}</div>
            <div className="source-art-label generated-art-label">{ui.sourceArt.toUpperCase()} · P01 {sourceArt?.version.toUpperCase()}</div>
          </div>

          <div className="character-heading">
            <div><span>{selectedCharacter.factionCode} · {selectedCharacter.rarity}</span><h2>{characterName(selectedCharacter, language)}</h2><p>{professionName(selectedCharacter, language)}</p></div>
            <div className="stars">{'★'.repeat(selectedCharacter.stars)}</div>
          </div>

          <div className="mastery-strip" data-testid="active-character-mastery">
            <div><span>{ui.mastery} L{mastery.level}</span><b>{mastery.xp} XP</b></div>
            <i><span style={{ width: `${mastery.progress * 100}%` }} /></i>
          </div>
          <MasteryPerkBadges xp={masteryXp} language={language} testId="active-character-perks" />

          <div className={`fatigue-block band-${band.toLowerCase()}`}>
            <div><span>{ui.fatigue}｜{language === 'zh' ? FATIGUE_ZH[band] : band}</span><strong>{selectedRuntime.fatigue} / {selectedCharacter.fatigueMax}</strong></div>
            <div className="fatigue-track"><span style={{ width: `${ratio * 100}%` }} /></div>
          </div>
          <div className="runtime-statuses" data-testid="runtime-statuses" aria-label={language === 'zh' ? '角色狀態' : 'Character statuses'}>
            {runtimeStatuses.map((status) => <span key={status.key}><b>{status.icon}</b>{status.label}</span>)}
          </div>

          <div className="resource-row">
            <div><span>AP</span><strong data-testid="active-runtime-ap">{selectedRuntime.actionPoints}</strong></div>
            <div><span>ENERGY</span><strong data-testid="active-runtime-energy">{selectedRuntime.energy}</strong></div>
            <div><span>INT</span><strong>{selectedCharacter.intel}</strong></div>
          </div>
          <div className="equipment-chip"><span>{ui.equipment}</span><b>{equipmentName(equipment, language)}</b><small>Power +{equipment.reliabilityBonus} · Fatigue -{Math.floor(equipment.fatigueRelief / 2)}</small></div>
          <div className="loadout-mini-grid">
            <div><span>{ui.spare}</span><b>{equipmentName(spare, language)}</b></div>
            <div><span>{ui.vessel}</span><b>{vesselName(vessel, language)}</b></div>
          </div>

          {operationDecision.code === 'ACT' && recommendedSkill && selectedSkillForecast?.ok && <button
            type="button"
            className="recommended-skill-cta"
            data-testid="recommended-skill-cta"
            data-recommended-actor-index={recommendedTeamSkill?.actorIndex}
            data-recommended-character-id={recommendedTeamSkill?.character.id}
            data-recommended-skill-id={recommendedSkill.id}
            data-recommended-skill-reason={recommendedSkillReason}
            data-recommended-skill-power={selectedSkillForecast.appliedPower}
            data-recommended-skill-stage-result={selectedSkillForecast.stageAdvanced ? 'clear' : 'remains'}
            title={recommendedSkillReason}
            onClick={() => useTeamSkill(recommendedSkill, recommendedTeamSkill?.actorIndex)}
          >
            <span>REC</span>
            <b>{recommendedTeamSkill && recommendedTeamSkill.actorIndex !== session.selectedIndex ? `${characterName(recommendedTeamSkill.character, language)} → ` : ''}{skillName(recommendedSkill, language)} +{selectedSkillForecast.appliedPower}</b>
            <small>AP -1 / E -{recommendedSkill.energyCost} / {selectedSkillForecast.stageAdvanced ? 'STAGE CLEAR' : 'STAGE REMAINS'}</small>
            <small className="recommended-skill-reason" data-testid="recommended-skill-reason">{recommendedSkillReason}</small>
          </button>}

          <div className="skill-list">
            {characterSkillIds(selectedCharacter).map((skillId, index) => {
              const skill = database.skillById.get(skillId)!;
              const availability = canUseSkill(selectedRuntime, selectedCharacter, skill);
              const stageBoost = stageAffinity(selectedCharacter.factionCode, currentStage);
              const masteryUnlocked = isSkillSlotUnlocked(index, mastery);
              const reactiveOutsideWindow = skill.type === 'Reactive';
              return (
                <button key={`${skillId}-${index}`} data-testid={`skill-${skill.id}`} className="skill-button" disabled={!availability.ok || missionEnded || diagnosisPending || Boolean(session.pendingBranch) || !masteryUnlocked || reactiveOutsideWindow} onClick={() => useSelectedSkill(skill)} title={!masteryUnlocked ? `${ui.lockedSkill} · L${Math.max(1, index)}` : reactiveOutsideWindow ? (language === 'zh' ? '等待風險事件窗口' : 'Wait for a risk event window') : diagnosisPending ? ui.diagnosis : availability.reason}>
                  <span className="skill-index">{skill.type === 'Passive' ? 'AUTO' : `0${index + 1}`}</span>
                  <span className="skill-copy"><b>{masteryUnlocked ? skillName(skill, language) : `🔒 ${skillName(skill, language)}`}</b><small>{skill.type} · Power {skill.power} · Stage ×{stageBoost} · Fatigue {signed(skill.fatigueDelta)}</small></span>
                  <span className="skill-cost">{skill.type === 'Passive' ? '∞' : `${skill.energyCost}E`}</span>
                </button>
              );
            })}
          </div>
        </aside>
      </section>
      <div className="mobile-action-dock" data-testid="mobile-action-dock">
        <div><span>{language === 'zh' ? STAGE_ZH[session.mission.stageIndex] : currentStage}</span><b>{session.mission.progress} / {session.mission.requirement}</b></div>
        {missionEnded
          ? <button data-testid="mobile-reset-mission" onClick={() => setSession(null)}>{ui.redeploy}</button>
          : <div className="mobile-action-buttons">
              <button data-testid="mobile-next-round" disabled={Boolean(session.pendingBranch)} onClick={requestNextRound}>{session.pendingBranch ? (language === 'zh' ? '等待事件回應' : 'Awaiting response') : operationRoundConfirm ? 'Confirm' : ui.endRound}</button>
              {operationRoundConfirm && (
                <em className="mobile-round-commit-copy" data-testid="mobile-round-commit-copy">
                  {endRoundForecast.failureReason
                    ? `Forecast failure: ${endRoundForecast.failureReason}`
                    : forecastBranchEvent
                      ? `Will trigger ${forecastBranchEvent.code}; tap again.`
                      : `Low margin: W ${endRoundForecast.weatherAfter}% / S ${endRoundForecast.safetyAfter}%.`}
                </em>
              )}
              {operationAbortConfirm
                ? <>
                    <em className="mobile-abort-confirm-copy" data-testid="mobile-abort-operation-copy">{language === 'zh' ? 'Return 只中止 sortie；未結算、未寫任務結果。' : 'Return aborts this sortie only; no settlement or mission result is written.'}</em>
                    <button data-testid="mobile-abort-operation-cancel" onClick={cancelOperationAbort}>Cancel</button>
                    <button data-testid="mobile-abort-operation-confirm" onClick={confirmOperationAbort}>Return</button>
                  </>
                : <button data-testid="mobile-abort-operation-open" onClick={openOperationAbort}>Abort</button>}
            </div>}
      </div>
      <OnboardingGuide
        progress={onboarding}
        surface={(session.mode !== 'campaign'
          ? 'away'
          : session.pendingBranch
            ? 'branch'
            : diagnosisPending
              ? 'diagnosis'
              : debrief
                ? 'debrief'
                : 'operation') satisfies OnboardingSurface}
        language={language}
        onAdvance={advanceGuide}
        onDeploy={returnGuideToCampaign}
        onComplete={completeGuide}
        onSkip={skipGuide}
        onReturnToCampaign={returnGuideToCampaign}
      />
    </main>
  );
}

function DeploymentScreen({
  database,
  deployment,
  campaign,
  challenge,
  mode,
  language,
  onboardingStep,
  operationReadiness,
  operationReturnNotice,
  onDismissOperationReturnNotice,
  onChange,
  onSeedChallengeDraft,
  onConfirmChallengeDraftClear,
  onImportChallengeProgress,
  onRepair,
  onMaintainTurbine,
  onMaintainTurbinePlan,
  onRest,
  onDeploy,
}: {
  database: GameDatabase;
  deployment: DeploymentState;
  campaign: CampaignProgress;
  challenge: BossChallengeProgress;
  mode: 'campaign' | 'challenge' | 'sandbox';
  language: Language;
  onboardingStep?: OnboardingStep;
  operationReadiness?: OperationReadinessEvaluation;
  operationReturnNotice?: OperationReturnNotice;
  onDismissOperationReturnNotice: () => void;
  onChange: (next: DeploymentState) => void;
  onSeedChallengeDraft: (bossId: string) => void;
  onConfirmChallengeDraftClear: (preview: BossChallengeDraftSettlementPreview) => BossChallengeSettlement;
  onImportChallengeProgress: (progress: BossChallengeProgress) => void;
  onRepair: (equipmentId: string) => void;
  onMaintainTurbine: (turbineId: string) => TurbineMaintenanceSettlement | null;
  onMaintainTurbinePlan: (turbineIds: string[]) => FleetMaintenancePlanSettlement | null;
  onRest: (characterId: string) => void;
  onDeploy: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'route' | 'readiness' | 'crew' | 'loadout' | 'forecast' | 'backup'>('route');
  const [campaignRouteTab, setCampaignRouteTab] = useState<'fleet' | 'missions' | 'briefing'>('fleet');
  const [sandboxSceneFilter, setSandboxSceneFilter] = useState<SandboxSceneAvailabilityFilter>('ALL');
  const [crewFilters, setCrewFilters] = useState<CrewRosterFilters>({
    query: '',
    factionCode: 'ALL',
    readiness: 'ALL',
    minimumMastery: 0,
    capability: 'ALL',
  });
  const [challengeRouteFilters, setChallengeRouteFilters] = useState<BossChallengeRouteFilters>(() => createInitialBossChallengeRouteFilters());
  const [candidateUndo, setCandidateUndo] = useState<ChallengeCandidateUndo | undefined>();
  const [repairQueueSessionCount, setRepairQueueSessionCount] = useState(0);
  const [draftVerification, setDraftVerification] = useState<BossChallengeDraftVerification | undefined>();
  const [draftVerificationBaseline, setDraftVerificationBaseline] = useState<BossChallengeDraftVerification | undefined>();
  const [draftRepairEvidence, setDraftRepairEvidence] = useState<BossChallengeDraftRepairEvidence | undefined>();
  const [draftRepairEscalation, setDraftRepairEscalation] = useState<BossChallengeRuntimeRepairEscalation | undefined>();
  const [draftVerificationUndo, setDraftVerificationUndo] = useState<ChallengeDraftVerificationUndo | undefined>();
  const [draftSettlementPreview, setDraftSettlementPreview] = useState<BossChallengeDraftSettlementPreview | undefined>();
  const [draftSettlement, setDraftSettlement] = useState<BossChallengeSettlement | undefined>();
  const [challengeImportUndo, setChallengeImportUndo] = useState<BossChallengeImportUndo | undefined>();
  useEffect(() => {
    if ((activeTab === 'forecast' && mode !== 'campaign') || (activeTab === 'backup' && mode !== 'challenge')) setActiveTab('route');
    if (mode !== 'challenge') setChallengeImportUndo(undefined);
  }, [activeTab, mode]);
  const ui = UI[language];
  const missionDefinition = mode === 'campaign' ? requiredMission(database, deployment.missionId) : undefined;
  const operationReturnMission = operationReturnNotice ? database.missionById.get(operationReturnNotice.missionId) : undefined;
  const sandboxSceneRoute = resolveSceneRoute(deployment.sandboxSceneId, database.sceneById, database.sceneAssets);
  const sandboxSceneRoutes = useMemo(
    () => database.scenes.map((scene) => ({
      scene,
      route: resolveSceneRoute(scene.id, database.sceneById, database.sceneAssets),
    })),
    [database.sceneAssets, database.sceneById, database.scenes],
  );
  const sandboxSceneCoverage = useMemo(
    () => sandboxSceneRoutes.reduce(
      (summary, item) => ({
        total: summary.total + 1,
        integrated: summary.integrated + (item.route.availability === 'INTEGRATED' ? 1 : 0),
        fallback: summary.fallback + (item.route.availability === 'FALLBACK' ? 1 : 0),
      }),
      { total: 0, integrated: 0, fallback: 0 },
    ),
    [sandboxSceneRoutes],
  );
  const filteredSandboxSceneRoutes = sandboxSceneRoutes.filter((item) => sandboxSceneFilter === 'ALL' || item.route.availability === sandboxSceneFilter);
  const selectedSandboxSceneVisible = filteredSandboxSceneRoutes.some((item) => item.scene.id === deployment.sandboxSceneId);
  const boss = database.bossById.get(missionDefinition?.bossId ?? deployment.sandboxBossId)!;
  const equipment = requiredEquipment(database, deployment.equipmentId);
  const spare = requiredEquipment(database, deployment.spareId);
  const vessel = requiredVessel(database, deployment.vesselId);
  const loadout = missionDefinition
    ? evaluateLoadout(missionDefinition, equipment, spare, vessel)
    : evaluateSandboxLoadout(equipment, spare, vessel);
  const team = deployment.teamIds.map((id) => requiredCharacter(database, id));
  const challengeCampaign = useMemo(
    () => createBossChallengeCampaignProjection(campaign, database.characters),
    [campaign, database.characters],
  );
  const selectionCampaign = mode === 'challenge' ? challengeCampaign : campaign;
  const crewReadiness = team.map((character) => ({
    character,
    fatigue: mode === 'campaign' ? campaignCrewFatigue(campaign, character.id) : 0,
    band: mode === 'campaign' ? crewReadinessBand(campaign, character) : 'Stable' as const,
    rest: crewRestQuote(campaign, character),
  }));
  const availableCharacters = useMemo(
    () => mode === 'campaign' ? unlockedCareerCharacters(campaign, database.characters) : database.characters,
    [campaign, database.characters, mode],
  );
  const availableCharacterIds = new Set(availableCharacters.map((character) => character.id));
  const careerReady = mode !== 'campaign' || deployment.teamIds.every((id) => availableCharacterIds.has(id));
  const fatigueReady = mode !== 'campaign' || crewReadiness.every((entry) => entry.band !== 'Exhausted');
  const crewReady = careerReady && fatigueReady;
  const teamPerks = teamMasteryPerks(deployment.teamIds, selectionCampaign, mode === 'sandbox');
  const coverage = teamStageCoverage(team);
  const duplicateTeam = new Set(deployment.teamIds).size !== deployment.teamIds.length;
  const counterFactions = boss.counterFactions.split(',').map((value) => value.trim());
  const counterCoverage = team.filter((character) => counterFactions.includes(character.factionCode)).length;
  const baseMission = applyLoadout(createMission(boss), loadout);
  const mission = mode === 'sandbox' ? applySandboxScenario(baseMission, deployment.sandboxScenario) : baseMission;
  const dispatchForecast = missionDefinition
    ? createDispatchForecast(campaign, missionDefinition, boss, equipment, spare, vessel, team)
    : undefined;
  const filteredCrew = useMemo(
    () => mode !== 'sandbox'
      ? filterCrewRoster(availableCharacters, selectionCampaign, crewFilters, database.skillById)
      : availableCharacters,
    [availableCharacters, crewFilters, database.skillById, mode, selectionCampaign],
  );
  const allChallengeRouteItems = useMemo(
    () => filterAndSortBossChallengeRoute(
      database.bosses,
      challenge,
      database.bossChallengeAudit,
      createInitialBossChallengeRouteFilters(),
      database.characterById,
      database.skillById,
    ),
    [challenge, database.bossChallengeAudit, database.bosses, database.characterById, database.skillById],
  );
  const challengeDraftPortfolio = useMemo(
    () => createBossChallengeDraftPortfolio(allChallengeRouteItems),
    [allChallengeRouteItems],
  );
  const challengeRepairQueue = useMemo(
    () => createBossChallengeRepairQueue(allChallengeRouteItems, deployment.sandboxBossId),
    [allChallengeRouteItems, deployment.sandboxBossId],
  );
  const challengeRouteItems = useMemo(
    () => filterAndSortBossChallengeRoute(
      database.bosses,
      challenge,
      database.bossChallengeAudit,
      challengeRouteFilters,
      database.characterById,
      database.skillById,
    ),
    [challenge, challengeRouteFilters, database.bossChallengeAudit, database.bosses, database.characterById, database.skillById],
  );
  const selectedChallengeRouteItem = challengeRouteItems.find((item) => item.boss.id === deployment.sandboxBossId) ?? challengeRouteItems[0];
  const selectedChallengeDraftSummary = selectedChallengeRouteItem?.draftSummary;
  const challengeRouteRepairPreview = useMemo(() => {
    if (mode !== 'challenge' || selectedChallengeRouteItem?.readiness !== 'HAS_GAPS' || !selectedChallengeRouteItem.draft) return undefined;
    const currentMembers = selectedChallengeRouteItem.draft.teamIds.map((id) => requiredCharacter(database, id)) as [CharacterData, CharacterData, CharacterData];
    return createBossChallengeRouteRepairPreview(
      selectedChallengeRouteItem.boss,
      currentMembers,
      database.characters,
      database.skillById,
    );
  }, [database, mode, selectedChallengeRouteItem]);
  const draftVerificationComparison = useMemo(
    () => draftVerificationBaseline && draftVerification
      ? compareBossChallengeDraftVerifications(draftVerificationBaseline, draftVerification)
      : undefined,
    [draftVerification, draftVerificationBaseline],
  );
  const activeDraftRepairEvidence = useMemo(
    () => draftRepairEvidence ?? (draftVerification && !draftVerification.success
      ? createBossChallengeDraftRepairEvidence(draftVerification, challengeRouteRepairPreview)
      : undefined),
    [challengeRouteRepairPreview, draftRepairEvidence, draftVerification],
  );
  const firstChallengeRouteBossId = challengeRouteItems[0]?.boss.id;
  const selectedBossVisibleInRoute = challengeRouteItems.some((item) => item.boss.id === deployment.sandboxBossId);
  const teamKey = deployment.teamIds.join('|');
  const rotationRecommendation = useMemo(
    () => missionDefinition && careerReady
      ? createCrewRotationRecommendation(
          campaign,
          missionDefinition,
          boss,
          equipment,
          vessel,
          availableCharacters,
          deployment.teamIds,
        )
      : undefined,
    [availableCharacters, boss, campaign, careerReady, deployment.teamIds, equipment, missionDefinition, teamKey, vessel],
  );
  const challengeSquadRecommendation = useMemo(() => {
    if (mode !== 'challenge') return undefined;
    const audit = database.bossChallengeAuditById.get(boss.id);
    return audit ? createBossChallengeSquadRecommendation(boss, audit, database.characters) : undefined;
  }, [boss, database.bossChallengeAuditById, database.characters, mode]);
  const challengeSquadComparison = useMemo(() => {
    if (!challengeSquadRecommendation) return undefined;
    const currentMembers = deployment.teamIds.map((id) => requiredCharacter(database, id)) as [CharacterData, CharacterData, CharacterData];
    return compareBossChallengeSquads(boss, currentMembers, challengeSquadRecommendation);
  }, [boss, challengeSquadRecommendation, database, teamKey]);
  const challengeStrategyBriefing = useMemo(() => {
    if (mode !== 'challenge') return undefined;
    const currentMembers = deployment.teamIds.map((id) => requiredCharacter(database, id)) as [CharacterData, CharacterData, CharacterData];
    return createBossChallengeStrategyBriefing(boss, currentMembers, database.skillById);
  }, [boss, database, mode, teamKey]);
  const challengeGapCandidatePreview = useMemo(() => {
    if (mode !== 'challenge' || crewFilters.capability === 'ALL') return undefined;
    return createBossChallengeGapCandidatePreview(
      boss,
      team as [CharacterData, CharacterData, CharacterData],
      filteredCrew,
      database.skillById,
      crewFilters.capability,
    );
  }, [boss, crewFilters.capability, database.skillById, filteredCrew, mode, teamKey]);
  const previewCharacter = team[0];
  const previewArt = database.sourceArtIndex.items[previewCharacter.id];
  const previewUrl = previewArt ? `/assets/source-art/p01/${previewArt.file}` : null;
  const ownedEquipmentIds = new Set(campaign.ownedEquipmentIds);
  const equipmentOwned = mode !== 'campaign' || ownedEquipmentIds.has(deployment.equipmentId);
  const spareOwned = mode !== 'campaign' || ownedEquipmentIds.has(deployment.spareId);
  const equipmentServiceable = mode !== 'campaign' || isEquipmentServiceable(campaign, deployment.equipmentId);
  const spareServiceable = mode !== 'campaign' || isEquipmentServiceable(campaign, deployment.spareId);
  const inventoryReady = equipmentOwned && spareOwned && equipmentServiceable && spareServiceable;
  const equipmentRepair = equipmentRepairQuote(campaign, equipment);
  const spareRepair = equipmentRepairQuote(campaign, spare);
  const inventoryByTier = (['L1', 'L2', 'L3', 'L4', 'L5'] as const).map((tier) => ({
    tier,
    owned: database.equipment.filter((item) => item.tier === tier && ownedEquipmentIds.has(item.id)).length,
    total: database.equipment.filter((item) => item.tier === tier).length,
  }));
  const missingReadiness = operationReadiness ? [
    !operationReadiness.permitReady ? (language === 'zh' ? '工作許可' : 'work permit') : '',
    !operationReadiness.ppeReady ? 'PPE' : '',
    !operationReadiness.accessReady ? (language === 'zh' ? '進場條件' : 'access condition') : '',
    !operationReadiness.vesselReady ? (language === 'zh' ? '船舶相容性' : 'vessel compatibility') : '',
    !operationReadiness.masteryReady ? 'Mastery' : '',
  ].filter(Boolean) : [];
  const routeReadinessItems = mode === 'campaign' && operationReadiness ? [
    {
      key: 'permit',
      label: language === 'zh' ? '工作許可' : 'Work permit',
      detail: missionDefinition?.operationProfile.workPermitCode ?? 'PTW',
      ready: operationReadiness.permitReady,
      tab: 'readiness' as const,
      action: 'permit' as const,
    },
    {
      key: 'ppe',
      label: 'PPE',
      detail: language === 'zh' ? '裝備確認' : 'Equipment check',
      ready: operationReadiness.ppeReady,
      tab: 'readiness' as const,
      action: 'ppe' as const,
    },
    {
      key: 'access',
      label: language === 'zh' ? '進場條件' : 'Access',
      detail: language === 'zh' ? '海況/進場確認' : 'Site access',
      ready: operationReadiness.accessReady,
      tab: 'readiness' as const,
      action: 'access' as const,
    },
    {
      key: 'vessel',
      label: language === 'zh' ? '船舶' : 'Vessel',
      detail: vessel.class,
      ready: operationReadiness.vesselReady,
      tab: 'loadout' as const,
    },
    {
      key: 'mastery',
      label: 'Mastery',
      detail: `${operationReadiness.qualifiedMembers}/${operationReadiness.requiredQualifiedMembers}`,
      ready: operationReadiness.masteryReady && careerReady,
      tab: 'crew' as const,
    },
    {
      key: 'crew',
      label: 'Crew',
      detail: language === 'zh' ? '疲勞' : 'Fatigue',
      ready: crewReady && !duplicateTeam,
      tab: 'crew' as const,
    },
    {
      key: 'loadout',
      label: language === 'zh' ? '裝備' : 'Loadout',
      detail: `EQ ${campaignEquipmentCondition(campaign, deployment.equipmentId)} / SP ${campaignEquipmentCondition(campaign, deployment.spareId)}`,
      ready: inventoryReady,
      tab: 'loadout' as const,
    },
  ] : [];

  useEffect(() => {
    if (onboardingStep === 'DEPLOYMENT') setActiveTab('route');
    if (onboardingStep === 'EVENT_DECK') setActiveTab('readiness');
  }, [onboardingStep]);

  useEffect(() => {
    if (mode !== 'campaign') setActiveTab((current) => current === 'forecast' ? 'route' : current);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'campaign') setCampaignRouteTab('fleet');
  }, [mode]);

  useEffect(() => {
    if (mode !== 'challenge' || !firstChallengeRouteBossId || selectedBossVisibleInRoute) return;
    onChange({ ...deployment, sandboxBossId: firstChallengeRouteBossId });
  }, [deployment, firstChallengeRouteBossId, mode, onChange, selectedBossVisibleInRoute]);

  useEffect(() => {
    setCandidateUndo(undefined);
  }, [boss.id, mode]);

  useEffect(() => {
    setDraftVerification(undefined);
    setDraftVerificationBaseline(undefined);
    setDraftRepairEvidence(undefined);
    setDraftRepairEscalation(undefined);
    setDraftVerificationUndo(undefined);
    setDraftSettlementPreview(undefined);
    setDraftSettlement(undefined);
  }, [mode, selectedChallengeRouteItem?.boss.id]);

  useEffect(() => {
    if (mode !== 'challenge') setRepairQueueSessionCount(0);
  }, [mode]);

  const updateTeam = (index: number, characterId: string) => {
    setCandidateUndo(undefined);
    setDraftVerification(undefined);
    setDraftVerificationBaseline(undefined);
    setDraftRepairEvidence(undefined);
    setDraftRepairEscalation(undefined);
    setDraftVerificationUndo(undefined);
    setDraftSettlementPreview(undefined);
    setDraftSettlement(undefined);
    const teamIds = [...deployment.teamIds] as [string, string, string];
    teamIds[index] = characterId;
    onChange({ ...deployment, teamIds });
  };

  const applyRotationRecommendation = () => {
    if (!rotationRecommendation) return;
    setCandidateUndo(undefined);
    setDraftVerification(undefined);
    setDraftVerificationBaseline(undefined);
    setDraftRepairEvidence(undefined);
    setDraftRepairEscalation(undefined);
    setDraftVerificationUndo(undefined);
    setDraftSettlementPreview(undefined);
    setDraftSettlement(undefined);
    onChange({ ...deployment, teamIds: rotationRecommendation.teamIds });
  };

  const applyChallengeSquadRecommendation = () => {
    if (!challengeSquadRecommendation) return;
    setCandidateUndo(undefined);
    setDraftVerification(undefined);
    setDraftVerificationBaseline(undefined);
    setDraftRepairEvidence(undefined);
    setDraftRepairEscalation(undefined);
    setDraftVerificationUndo(undefined);
    setDraftSettlementPreview(undefined);
    setDraftSettlement(undefined);
    onChange({ ...deployment, teamIds: challengeSquadRecommendation.teamIds });
  };

  const applyGapCandidate = (teamIds: [string, string, string], source: ChallengeCandidateUndo['source'], preserveVerification = false) => {
    if (!preserveVerification) {
      setDraftVerification(undefined);
      setDraftVerificationBaseline(undefined);
      setDraftRepairEvidence(undefined);
      setDraftRepairEscalation(undefined);
      setDraftVerificationUndo(undefined);
      setDraftSettlementPreview(undefined);
      setDraftSettlement(undefined);
    }
    setCandidateUndo({ bossId: boss.id, source, teamIds: [...deployment.teamIds] });
    if (source === 'route') setRepairQueueSessionCount((current) => current + 1);
    onChange({ ...deployment, teamIds });
  };

  const restoreGapCandidateTeam = () => {
    if (!candidateUndo || candidateUndo.bossId !== boss.id) return;
    if (candidateUndo.source === 'route' && draftVerificationUndo) {
      setDraftVerification(draftVerificationUndo.verification);
      setDraftVerificationBaseline(draftVerificationUndo.baseline);
      setDraftRepairEvidence(draftVerificationUndo.repairEvidence);
      setDraftRepairEscalation(draftVerificationUndo.escalation);
    } else if (candidateUndo.source === 'route' && draftVerificationBaseline) {
      setDraftVerification(draftVerificationBaseline);
      setDraftVerificationBaseline(undefined);
      setDraftRepairEvidence(undefined);
      setDraftRepairEscalation(undefined);
    } else {
      setDraftVerification(undefined);
      setDraftVerificationBaseline(undefined);
      setDraftRepairEvidence(undefined);
      setDraftRepairEscalation(undefined);
    }
    setDraftVerificationUndo(undefined);
    setDraftSettlementPreview(undefined);
    setDraftSettlement(undefined);
    onChange({ ...deployment, teamIds: candidateUndo.teamIds });
    if (candidateUndo.source === 'route') setRepairQueueSessionCount((current) => Math.max(0, current - 1));
    setCandidateUndo(undefined);
  };

  const openNextRepairQueueBoss = () => {
    const bossId = challengeRepairQueue.nextBossId;
    if (!bossId) return;
    // Queue 導覽清除可能排除下一個 Boss 的 filter，但只載入既有 draft，不自動套用修補。
    setChallengeRouteFilters({ ...createInitialBossChallengeRouteFilters(), draftStatus: 'DRAFTED', readiness: 'HAS_GAPS' });
    setCandidateUndo(undefined);
    setDraftVerification(undefined);
    setDraftVerificationBaseline(undefined);
    setDraftRepairEvidence(undefined);
    setDraftRepairEscalation(undefined);
    setDraftVerificationUndo(undefined);
    setDraftSettlementPreview(undefined);
    setDraftSettlement(undefined);
    onChange({ ...deployment, sandboxBossId: bossId });
  };

  const verifySelectedChallengeDraft = () => {
    if (mode !== 'challenge' || !selectedChallengeDraftSummary) return;
    const verification = verifyBossChallengeDraft(
      database,
      selectedChallengeRouteItem?.boss.id ?? boss.id,
      selectedChallengeDraftSummary.teamIds,
    );
    setDraftVerification(verification);
    setDraftSettlementPreview(draftVerificationBaseline && verification.success
      ? createBossChallengeDraftSettlementPreview(challenge, boss, verification)
      : undefined);
    setDraftSettlement(undefined);
  };

  const evaluateRuntimeRepairEscalation = () => {
    if (mode !== 'challenge'
      || draftVerificationComparison?.outcome !== 'STILL_FAILED'
      || !draftRepairEvidence
      || !draftVerification) return;
    setDraftRepairEscalation(createBossChallengeRuntimeRepairEscalation(
      database,
      boss.id,
      draftRepairEvidence.failedTeamIds,
      draftRepairEvidence.priorityGap,
      draftVerification.teamIds,
    ));
  };

  const applyRuntimeRepairCandidate = (candidate: BossChallengeRuntimeRepairCandidate) => {
    if (!draftVerification || !draftRepairEscalation
      || !draftRepairEscalation.candidates.some((item) => item.teamIds.every((id, index) => id === candidate.teamIds[index]))) return;
    const before = draftVerification;
    setDraftVerificationUndo({
      verification: draftVerification,
      baseline: draftVerificationBaseline,
      repairEvidence: draftRepairEvidence,
      escalation: draftRepairEscalation,
    });
    setDraftVerificationBaseline(before);
    setDraftRepairEvidence({
      bossId: before.bossId,
      failedTeamIds: [...draftRepairEscalation.sourceTeamIds],
      priorityGap: draftRepairEscalation.priorityGap,
      repairTeamIds: [...candidate.teamIds],
      replacementCharacterId: candidate.replacementCharacterId,
      replacedCharacterId: before.teamIds[candidate.slotIndex],
    });
    setDraftVerification(candidate.verification);
    setDraftRepairEscalation(undefined);
    setDraftSettlementPreview(candidate.verification.success
      ? createBossChallengeDraftSettlementPreview(challenge, boss, candidate.verification)
      : undefined);
    setDraftSettlement(undefined);
    applyGapCandidate(candidate.teamIds, 'route', true);
    setChallengeRouteFilters((current) => ({ ...current, readiness: 'ALL' }));
  };

  const findCrewCapability = (capability: CrewSkillCapability) => {
    // Strategy gap 導引應顯示完整相符 roster，避免先前殘留的文字或 Faction 篩選把結果藏起來。
    setCrewFilters({ query: '', factionCode: 'ALL', readiness: 'ALL', minimumMastery: 0, capability });
    setActiveTab('crew');
  };

  const selectMission = (missionId: string) => {
    const selectedMission = requiredMission(database, missionId);
    onChange({
      ...deployment,
      missionId,
      equipmentId: selectedMission.recommendedEquipmentId,
      spareId: selectedMission.recommendedSpareId,
      vesselId: selectedMission.recommendedVesselId,
      planningConfirmations: { permit: false, ppe: false, access: false },
    });
  };

  const selectCampaignRouteMission = (missionId: string) => {
    selectMission(missionId);
    setCampaignRouteTab('briefing');
  };

  const handleDeploymentTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabList = event.currentTarget.closest('[role="tablist"]');
    const tabs = Array.from(tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const currentIndex = tabs.indexOf(event.currentTarget);
    if (currentIndex < 0) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : event.key === 'ArrowRight'
          ? (currentIndex + 1) % tabs.length
          : (currentIndex - 1 + tabs.length) % tabs.length;
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  };

  return (
    <section className={`deployment-shell deployment-tab-${activeTab}`}>
      <div className="deployment-heading">
        <span className="section-kicker">DEPLOYMENT</span>
        <h2>{ui.deployment}</h2>
        <p>{mode === 'campaign'
          ? ui.deploymentLead
          : mode === 'challenge'
            ? (language === 'zh' ? '固定 Mastery L3、10 回合與標準裝備，挑戰 100 個 Boss 並保存各自最佳分。' : 'Challenge 100 bosses at fixed Mastery L3, 10 rounds, and a standard loadout; each local best is saved.')
            : (language === 'zh' ? '自由選擇 100 個 Boss 與完整技能，不寫入 Campaign XP。' : 'Challenge any of 100 bosses with all skills unlocked; campaign XP is not modified.')}</p>
      </div>
      <nav className="workspace-tabs deployment-tabs" role="tablist" aria-label={language === 'zh' ? '部署資訊頁籤' : 'Deployment tabs'} data-testid="deployment-tabs">
        {([
          ['route', language === 'zh' ? '任務航線' : 'Mission route'],
          ['readiness', mode === 'sandbox' ? (language === 'zh' ? '情境設定' : 'Scenario') : (language === 'zh' ? '作業許可' : 'Readiness')],
          ['crew', 'Crew'],
          ['loadout', language === 'zh' ? '裝備' : 'Loadout'],
          ...(mode === 'campaign' ? [['forecast', language === 'zh' ? '出勤預測' : 'Dispatch forecast']] as const : []),
          ...(mode === 'challenge' ? [['backup', language === 'zh' ? '挑戰存檔' : 'Challenge save']] as const : []),
        ] as const).map(([tab, label]) => <button key={tab} id={`deployment-tab-${tab}-button`} role="tab" type="button" data-testid={`deployment-tab-${tab}`} aria-selected={activeTab === tab} aria-controls={`deployment-tab-panel-${tab}`} tabIndex={activeTab === tab ? 0 : -1} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)} onKeyDown={handleDeploymentTabKey}>{label}</button>)}
      </nav>
      <div className="deployment-grid">
        <section id={`deployment-tab-panel-${activeTab}`} role="tabpanel" aria-labelledby={`deployment-tab-${activeTab}-button`} className={`panel deployment-form deployment-tab-panel${activeTab === 'route' && mode === 'campaign' ? ' campaign-route-panel' : ''}${onboardingStep === 'DEPLOYMENT' ? ' onboarding-focus' : ''}`} data-testid={`deployment-tab-panel-${activeTab}`}>
          {activeTab === 'route' && mode === 'campaign' && (
            <nav className="campaign-route-subtabs" role="tablist" aria-label={language === 'zh' ? '航線資訊分頁' : 'Route information tabs'} data-testid="campaign-route-subtabs">
              {([
                ['fleet', language === 'zh' ? '風場' : 'FLEET'],
                ['missions', language === 'zh' ? '任務' : 'MISSIONS'],
                ['briefing', language === 'zh' ? '簡報' : 'BRIEFING'],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  className={campaignRouteTab === tab ? 'active' : ''}
                  aria-selected={campaignRouteTab === tab}
                  data-testid={`campaign-route-tab-${tab}`}
                  onClick={() => setCampaignRouteTab(tab)}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
          {activeTab === 'route' && mode === 'campaign' && campaignRouteTab !== 'briefing' && (
            <CampaignMissionMap
              database={database}
              campaign={campaign}
              selectedMissionId={deployment.missionId}
              language={language}
              focus={campaignRouteTab}
              onSelect={selectCampaignRouteMission}
              onMaintainTurbine={onMaintainTurbine}
              onMaintainTurbinePlan={onMaintainTurbinePlan}
            />
          )}
          {activeTab === 'route' && mode === 'sandbox' && <div className="campaign-progress"><span>SANDBOX MODE</span><b>{campaign.totalXp} XP</b><small>NO SAVE MUTATION</small></div>}
          {activeTab === 'route' && mode === 'sandbox' && <label>{ui.riskEvent}
              <select data-testid="sandbox-boss" value={deployment.sandboxBossId} onChange={(event) => onChange({ ...deployment, sandboxBossId: event.target.value })}>
                {database.bosses.map((item) => <option key={item.id} value={item.id}>{item.severity} · {item.class} · {bossName(item, language)}</option>)}
              </select>
            </label>}
          {activeTab === 'route' && mode === 'sandbox' && <div className="sandbox-scene-filter" data-testid="sandbox-scene-filter">
              <div>
                <span>SCENE ASSET COVERAGE</span>
                <b data-testid="sandbox-scene-coverage">{sandboxSceneCoverage.integrated}/{sandboxSceneCoverage.total} INTEGRATED · {sandboxSceneCoverage.fallback} FALLBACK</b>
              </div>
              <div role="tablist" aria-label={language === 'zh' ? '場景可用性篩選' : 'Scene availability filter'}>
                {(['ALL', 'INTEGRATED', 'FALLBACK'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    role="tab"
                    data-testid={`sandbox-scene-filter-${filter.toLowerCase()}`}
                    aria-selected={sandboxSceneFilter === filter}
                    className={sandboxSceneFilter === filter ? 'active' : ''}
                    onClick={() => setSandboxSceneFilter(filter)}
                  >
                    {filter === 'ALL' ? `ALL ${sandboxSceneCoverage.total}` : filter === 'INTEGRATED' ? `INTEGRATED ${sandboxSceneCoverage.integrated}` : `FALLBACK ${sandboxSceneCoverage.fallback}`}
                  </button>
                ))}
              </div>
            </div>}
          {activeTab === 'route' && mode === 'sandbox' && <label>{language === 'zh' ? '作業場景' : 'Operation scene'}
              <select data-testid="sandbox-scene" value={deployment.sandboxSceneId} onChange={(event) => onChange({ ...deployment, sandboxSceneId: event.target.value })}>
                {!selectedSandboxSceneVisible && <option value={deployment.sandboxSceneId}>{deployment.sandboxSceneId} · {sceneRouteName(sandboxSceneRoute, language)} · {sandboxSceneRoute.availability} · CURRENT</option>}
                {filteredSandboxSceneRoutes.map(({ scene, route }) => (
                  <option key={scene.id} value={scene.id}>{scene.id} · {sceneRouteName(route, language)} · {route.availability}</option>
                ))}
              </select>
            </label>}
          {activeTab === 'route' && mode === 'sandbox' && <SceneRouteSummary route={sandboxSceneRoute} language={language} testId="sandbox-scene-preview" />}
          {activeTab === 'route' && mode === 'challenge' && <BossChallengeRoutePanel
            challenge={challenge}
            bosses={database.bosses}
            filters={challengeRouteFilters}
            items={challengeRouteItems}
            selectedItem={selectedChallengeRouteItem}
            draftSummary={selectedChallengeDraftSummary}
            portfolio={challengeDraftPortfolio}
            repairQueue={challengeRepairQueue}
            repairQueueSessionCount={repairQueueSessionCount}
            repairPreview={challengeRouteRepairPreview}
            verification={draftVerification}
            verificationBaseline={draftVerificationBaseline}
            verificationComparison={draftVerificationComparison}
            repairEvidence={activeDraftRepairEvidence}
            repairEscalation={draftRepairEscalation}
            settlementPreview={draftSettlementPreview}
            settlement={draftSettlement}
            currentTeamIds={deployment.teamIds}
            language={language}
            canUndoRepair={candidateUndo?.bossId === boss.id}
            onFiltersChange={setChallengeRouteFilters}
            onSelectBoss={(bossId) => onChange({ ...deployment, sandboxBossId: bossId })}
            onResumeDraft={(teamIds) => {
              setCandidateUndo(undefined);
              setDraftVerification(undefined);
              setDraftVerificationBaseline(undefined);
              setDraftRepairEvidence(undefined);
              setDraftRepairEscalation(undefined);
              setDraftVerificationUndo(undefined);
              setDraftSettlementPreview(undefined);
              setDraftSettlement(undefined);
              onChange({ ...deployment, teamIds });
            }}
            onApplyRepair={(teamIds) => {
              const repairEvidence = draftVerification && !draftVerification.success
                ? createBossChallengeDraftRepairEvidence(draftVerification, challengeRouteRepairPreview)
                : undefined;
              setDraftVerificationBaseline(repairEvidence ? draftVerification : undefined);
              setDraftRepairEvidence(repairEvidence);
              setDraftRepairEscalation(undefined);
              setDraftVerificationUndo(undefined);
              setDraftSettlementPreview(undefined);
              setDraftSettlement(undefined);
              setDraftVerification(undefined);
              applyGapCandidate(teamIds, 'route', true);
              // 修補後 Boss 可能不再符合 HAS-GAPS／gap-type filter；回到 ALL 才能保留 Undo 與結果摘要。
              setChallengeRouteFilters((current) => ({ ...current, readiness: 'ALL' }));
            }}
            onUndoRepair={restoreGapCandidateTeam}
            onNextRepair={openNextRepairQueueBoss}
            onVerifyDraft={verifySelectedChallengeDraft}
            onEvaluateEscalation={evaluateRuntimeRepairEscalation}
            onApplyEscalation={applyRuntimeRepairCandidate}
            onConfirmSettlement={() => {
              if (!draftSettlementPreview) return;
              setDraftSettlement(onConfirmChallengeDraftClear(draftSettlementPreview));
            }}
            onCancelSettlement={restoreGapCandidateTeam}
            onSeedDraft={() => {
              if (!selectedChallengeRouteItem) return;
              setCandidateUndo(undefined);
              setDraftVerification(undefined);
              setDraftVerificationBaseline(undefined);
              setDraftRepairEvidence(undefined);
              setDraftRepairEscalation(undefined);
              setDraftVerificationUndo(undefined);
              setDraftSettlementPreview(undefined);
              setDraftSettlement(undefined);
              onSeedChallengeDraft(selectedChallengeRouteItem.boss.id);
              setChallengeRouteFilters((current) => ({ ...current, draftStatus: 'ALL', readiness: 'ALL' }));
            }}
          />}
          {activeTab === 'route' && ((mode === 'campaign' && campaignRouteTab === 'briefing') || (mode !== 'campaign' && (mode !== 'challenge' || challengeRouteItems.length > 0))) && <div className="deployment-boss-copy">
            <span className="severity">{boss.severity}</span><b>{bossName(boss, language)}</b><p>{missionDefinition ? (language === 'zh' ? missionDefinition.briefingZh : missionDefinition.briefingEn) : (language === 'zh' ? boss.mechanic : ui.mechanic)}</p>
            {missionDefinition && <ul>{(language === 'zh' ? missionDefinition.learningObjectivesZh : missionDefinition.learningObjectivesEn).map((objective) => <li key={objective}>{objective}</li>)}</ul>}
            {missionDefinition && mode === 'campaign' && operationReturnNotice && operationReturnMission && <OperationReturnNoticePanel
              mission={operationReturnMission}
              reason={operationReturnNotice.reason}
              selected={operationReturnNotice.missionId === missionDefinition.id}
              language={language}
              onSelect={() => {
                if (operationReturnNotice.missionId !== deployment.missionId) selectMission(operationReturnNotice.missionId);
              }}
              onDismiss={onDismissOperationReturnNotice}
            />}
            {missionDefinition && mode === 'campaign' && <RouteReadinessCarryover
              items={routeReadinessItems}
              canDeploy={!duplicateTeam && inventoryReady && crewReady && Boolean(operationReadiness?.ready)}
              language={language}
              onOpenTab={setActiveTab}
              onConfirmPlanning={(field) => onChange({
                ...deployment,
                planningConfirmations: { ...deployment.planningConfirmations, [field]: true },
              })}
              onDeploy={onDeploy}
            />}
            {missionDefinition && <MissionEventDeck mission={missionDefinition} language={language} highlight={onboardingStep === 'EVENT_DECK'} />}
          </div>}
          {activeTab === 'route' && mode === 'challenge' && challengeRouteItems.length > 0 && challengeStrategyBriefing && <ChallengeStrategyBriefingPanel briefing={challengeStrategyBriefing} language={language} onFindCapability={findCrewCapability} />}

          {activeTab === 'readiness' && missionDefinition && <MissionEventDeck mission={missionDefinition} language={language} highlight={onboardingStep === 'EVENT_DECK'} />}
          {activeTab === 'readiness' && mode === 'sandbox' && <SandboxScenarioPanel
            scenario={deployment.sandboxScenario}
            vessel={vessel}
            language={language}
            onChange={(sandboxScenario) => onChange({ ...deployment, sandboxScenario })}
          />}
          {activeTab === 'readiness' && missionDefinition && operationReadiness && <section className={`operation-readiness ${operationReadiness.ready ? 'ready' : 'blocked'}`} data-testid="operation-readiness">
            <div className="operation-readiness-heading">
              <div><span>OPERATION READINESS</span><b>{language === 'zh' ? missionDefinition.operationProfile.siteNameZh : missionDefinition.operationProfile.siteNameEn} · {missionDefinition.operationProfile.siteCode}</b></div>
              <strong>{operationReadiness.matchedChecks}/{operationReadiness.totalChecks} · {operationReadiness.ready ? 'READY' : 'BLOCKED'}</strong>
            </div>
            <div className="operation-profile-metrics">
              <span><small>{language === 'zh' ? '預報' : 'Forecast'}</small><b>{language === 'zh' ? missionDefinition.operationProfile.weatherZh : missionDefinition.operationProfile.weatherEn}</b></span>
              <span><small>SEA STATE</small><b>{missionDefinition.operationProfile.seaState}</b></span>
              <span><small>{language === 'zh' ? '初始天候' : 'Initial weather'}</small><b>{operationReadiness.initialWeatherWindow}%</b></span>
              <span><small>{language === 'zh' ? '動員成本' : 'Mobilization cost'}</small><b>{dispatchForecast?.fleetCondition ? `+${dispatchForecast.fleetCondition.mobilizationCostBefore}→+${dispatchForecast.fleetCondition.mobilizationCostAfter}` : `+${operationReadiness.mobilizationCost}`}</b></span>
            </div>
            {dispatchForecast?.fleetCondition && <div className={`fleet-condition-dispatch-preview ${dispatchForecast.fleetCondition.modifier.pressure.toLowerCase()}`} data-testid="fleet-condition-readiness">
              <span><small>FLEET CONDITION</small><b>{dispatchForecast.fleetCondition.modifier.turbineId.replace('WTG-OWM-', 'WTG-')} · {dispatchForecast.fleetCondition.modifier.pressure}</b></span>
              <span><small>SOURCE</small><b>{dispatchForecast.fleetCondition.modifier.availability} · R{dispatchForecast.fleetCondition.modifier.sourceReliability} · B{dispatchForecast.fleetCondition.modifier.openFaults}</b></span>
              <span><small>COST</small><b>+{dispatchForecast.fleetCondition.mobilizationCostBefore}→+{dispatchForecast.fleetCondition.mobilizationCostAfter}</b></span>
              <span><small>SAFETY</small><b>{dispatchForecast.fleetCondition.safetyBefore}→{dispatchForecast.fleetCondition.safetyAfter}</b></span>
              <span><small>RELIABILITY</small><b>{dispatchForecast.fleetCondition.reliabilityBefore}→{dispatchForecast.fleetCondition.reliabilityAfter}</b></span>
              <em>Gameplay abstraction</em>
            </div>}
            <div className="readiness-checks">
              <label className={operationReadiness.permitReady ? 'passed' : ''}>
                <input type="checkbox" data-testid="planning-confirm-permit" checked={deployment.planningConfirmations.permit} onChange={(event) => onChange({ ...deployment, planningConfirmations: { ...deployment.planningConfirmations, permit: event.target.checked } })} />
                <span><b>{missionDefinition.operationProfile.workPermitCode}</b><small>{language === 'zh' ? missionDefinition.operationProfile.workPermitZh : missionDefinition.operationProfile.workPermitEn}</small></span><i>{operationReadiness.permitReady ? '✓' : '○'}</i>
              </label>
              <label className={operationReadiness.ppeReady ? 'passed' : ''}>
                <input type="checkbox" data-testid="planning-confirm-ppe" checked={deployment.planningConfirmations.ppe} onChange={(event) => onChange({ ...deployment, planningConfirmations: { ...deployment.planningConfirmations, ppe: event.target.checked } })} />
                <span><b>PPE</b><small>{(language === 'zh' ? missionDefinition.operationProfile.requiredPpeZh : missionDefinition.operationProfile.requiredPpeEn).join(' · ')}</small></span><i>{operationReadiness.ppeReady ? '✓' : '○'}</i>
              </label>
              <label className={operationReadiness.accessReady ? 'passed' : ''}>
                <input type="checkbox" data-testid="planning-confirm-access" checked={deployment.planningConfirmations.access} onChange={(event) => onChange({ ...deployment, planningConfirmations: { ...deployment.planningConfirmations, access: event.target.checked } })} />
                <span><b>{language === 'zh' ? '進場條件' : 'ACCESS'}</b><small>{language === 'zh' ? missionDefinition.operationProfile.accessRequirementZh : missionDefinition.operationProfile.accessRequirementEn}</small></span><i>{operationReadiness.accessReady ? '✓' : '○'}</i>
              </label>
              <div className={operationReadiness.vesselReady ? 'passed' : ''} data-testid="planning-vessel-status"><span><b>{language === 'zh' ? '船舶相容性' : 'VESSEL'}</b><small>{missionDefinition.operationProfile.allowedVesselClasses.join(' / ')}</small></span><i>{operationReadiness.vesselReady ? '✓' : '×'}</i></div>
              <div className={operationReadiness.masteryReady ? 'passed' : ''} data-testid="planning-mastery-status"><span><b>MASTERY L{missionDefinition.operationProfile.minimumMasteryLevel}+</b><small>{language === 'zh' ? `${operationReadiness.qualifiedMembers}/${operationReadiness.requiredQualifiedMembers} 名技師合格` : `${operationReadiness.qualifiedMembers}/${operationReadiness.requiredQualifiedMembers} crew qualified`}</small></span><i>{operationReadiness.masteryReady ? '✓' : '×'}</i></div>
            </div>
            <p className="operation-disclaimer">{language === 'zh' ? 'Gameplay abstraction — 非現場作業限制或工作授權。' : 'Gameplay abstraction — not a field operating limit or work authorization.'}</p>
          </section>}

          {activeTab === 'crew' && <><span className="form-section-label">{ui.team}</span>
          {mode !== 'sandbox' && <section className="crew-roster-filters" data-testid="crew-roster-filters">
            <label><span>{language === 'zh' ? '搜尋' : 'SEARCH'}</span><input data-testid="crew-filter-search" value={crewFilters.query} placeholder={language === 'zh' ? 'ID／姓名／職種' : 'ID / name / role'} onChange={(event) => setCrewFilters({ ...crewFilters, query: event.target.value })} /></label>
            <label><span>FACTION</span><select data-testid="crew-filter-faction" value={crewFilters.factionCode} onChange={(event) => setCrewFilters({ ...crewFilters, factionCode: event.target.value })}>
              <option value="ALL">ALL</option>{database.factions.map((faction) => <option key={faction.code} value={faction.code}>{faction.code}</option>)}
            </select></label>
            <label><span>READINESS</span><select data-testid="crew-filter-readiness" value={crewFilters.readiness} onChange={(event) => setCrewFilters({ ...crewFilters, readiness: event.target.value as CrewReadinessFilter })}>
              <option value="ALL">ALL</option>{(['Stable', 'Tired', 'Critical', 'Exhausted'] as const).map((band) => <option key={band} value={band}>{language === 'zh' ? FATIGUE_ZH[band] : band}</option>)}
            </select></label>
            <label><span>MASTERY</span><select data-testid="crew-filter-mastery" value={crewFilters.minimumMastery} onChange={(event) => setCrewFilters({ ...crewFilters, minimumMastery: Number(event.target.value) as CrewRosterFilters['minimumMastery'] })}>
              <option value={0}>ALL</option>{[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>L{level}+</option>)}
            </select></label>
            <label><span>SKILL CAPABILITY</span><select data-testid="crew-filter-capability" value={crewFilters.capability} onChange={(event) => setCrewFilters({ ...crewFilters, capability: event.target.value as CrewSkillCapability })}>
              <option value="ALL">ALL</option>
              <option value="REACTIVE">REACTIVE</option>
              <option value="TEAM_RECOVERY">{language === 'zh' ? '全隊恢復' : 'TEAM RECOVERY'}</option>
              <option value="LOW_ENERGY">≤4 ENERGY</option>
            </select></label>
            <strong data-testid="crew-filter-count">{filteredCrew.length}/{availableCharacters.length} · <span data-testid="career-unlocked-count">{availableCharacters.length}/{database.characters.length}</span></strong>
          </section>}
          <div className="team-selectors">
            {deployment.teamIds.map((characterId, index) => (
              <label key={index}>0{index + 1}
                <select data-testid={index === 0 ? 'art-preview-character' : `deployment-team-${index}`} value={characterId} onChange={(event) => updateTeam(index, event.target.value)}>
                  {[
                    ...database.characters.filter((character) => character.id === characterId),
                    ...filteredCrew.filter((character) => character.id !== characterId),
                  ].map((character) => {
                    const usedByOtherSlot = deployment.teamIds.some((id, slotIndex) => slotIndex !== index && id === character.id);
                    const deployable = mode !== 'campaign' || isCrewMemberDeployable(campaign, character);
                    const masteryLevel = mode === 'sandbox' ? 5 : characterMastery(selectionCampaign.characterXp[character.id] ?? 0).level;
                    const band = mode === 'campaign' ? crewReadinessBand(campaign, character) : 'Stable';
                    return <option key={character.id} value={character.id} disabled={usedByOtherSlot || (!deployable && character.id !== characterId)}>{character.factionCode} · {character.levelCode} · M{masteryLevel} · {characterName(character, language)}{mode === 'campaign' ? ` · ${language === 'zh' ? FATIGUE_ZH[band] : band} F${campaignCrewFatigue(campaign, character.id)}/${character.fatigueMax}` : ''}</option>;
                  })}
                </select>
              </label>
            ))}
          </div>
          {duplicateTeam && <p className="form-error">⛔ {ui.duplicateTeam}</p>}

          {mode === 'campaign' && <section className="crew-readiness" data-testid="crew-readiness">
            <div className="crew-readiness-heading"><div><span>CREW READINESS</span><b>{language === 'zh' ? '任務間疲勞與輪調' : 'Inter-mission fatigue and rotation'}</b></div><strong>{campaign.recoveryTokens} RST</strong></div>
            <div className="crew-readiness-members">
              {crewReadiness.map(({ character, fatigue, band, rest }, index) => <article key={`${index}-${character.id}`} className={`band-${band.toLowerCase()}`} data-testid={`crew-readiness-${index}`}>
                <div><span>0{index + 1} · {character.factionCode}</span><b>{characterName(character, language)}</b></div><strong>{fatigue}/{character.fatigueMax}</strong>
                <i><span style={{ width: `${(fatigue / Math.max(1, character.fatigueMax)) * 100}%` }} /></i>
                <small>{language === 'zh' ? FATIGUE_ZH[band] : band}</small>
                <button data-testid={`rest-crew-${index}`} disabled={!rest.canRest} onClick={() => onRest(character.id)}>{rest.canRest ? (language === 'zh' ? `休息 -${rest.recovery} · 1 RST` : `Rest -${rest.recovery} · 1 RST`) : fatigue === 0 ? (language === 'zh' ? '已充分休息' : 'Fully rested') : (language === 'zh' ? 'RST 不足' : 'No RST')}</button>
              </article>)}
            </div>
            <p>{language === 'zh' ? '100% Exhausted 不可出勤；未出勤技師會在每次任務後自動恢復。數值為 gameplay abstraction。' : 'Exhausted crew at 100% cannot deploy; reserves recover automatically after each mission. Values are gameplay abstractions.'}</p>
          </section>}

          <div className="team-perk-summary" data-testid="team-perk-summary">
            <div className="team-perk-heading"><span>TEAM MASTERY PERKS</span><b>{teamPerks.unlockedPerkCount}/6</b></div>
            <div className="team-perk-members">
              {team.map((character, index) => {
                const perks = teamPerks.byCharacterId[character.id];
                return <div key={`${index}-${character.id}`}><span>{character.factionCode} · {characterName(character, language)}</span><i className={perks.unlockedPerkIds.includes('SPECIALIST_READINESS') ? 'unlocked' : 'locked'}>L4</i><i className={perks.unlockedPerkIds.includes('VETERAN_GUARD') ? 'unlocked' : 'locked'}>L5</i></div>;
              })}
            </div>
            <small>Evidence +{teamPerks.evidenceBonus} · Reliability +{teamPerks.reliabilityBonus}</small>
          </div></>}
          {activeTab === 'crew' && mode === 'challenge' && challengeStrategyBriefing && <ChallengeStrategyBriefingPanel briefing={challengeStrategyBriefing} language={language} compact onFindCapability={findCrewCapability} />}
          {activeTab === 'crew' && mode === 'challenge' && challengeGapCandidatePreview && <ChallengeGapCandidatePanel
            preview={challengeGapCandidatePreview}
            language={language}
            canRestore={candidateUndo?.bossId === boss.id}
            onApply={(teamIds) => applyGapCandidate(teamIds, 'crew')}
            onRestore={restoreGapCandidateTeam}
          />}

          {activeTab === 'loadout' && <><div className="loadout-select-grid">
            <label>{ui.equipment}
              <select data-testid="deployment-equipment" value={deployment.equipmentId} disabled={mode === 'challenge'} onChange={(event) => onChange({ ...deployment, equipmentId: event.target.value })}>
                {database.equipment.filter((item) => item.category !== 'SPARES').map((item) => {
                  const owned = mode !== 'campaign' || ownedEquipmentIds.has(item.id);
                  const serviceable = mode !== 'campaign' || isEquipmentServiceable(campaign, item.id);
                  const prefix = !owned ? '🔒 ' : !serviceable ? '🛠 ' : '';
                  const condition = mode === 'campaign' && owned ? ` · C${campaignEquipmentCondition(campaign, item.id)}` : '';
                  // 已持有但需維修的裝備仍可被選取，玩家才能在 Maintenance panel 指定修復；deploy guard 另行阻擋出勤。
                  return <option key={item.id} value={item.id} disabled={!owned}>{prefix}{item.tier} · {item.category} · {equipmentName(item, language)}{condition}</option>;
                })}
              </select>
            </label>
            <label>{ui.spare}
              <select data-testid="deployment-spare" value={deployment.spareId} disabled={mode === 'challenge'} onChange={(event) => onChange({ ...deployment, spareId: event.target.value })}>
                {database.equipment.filter((item) => item.category === 'SPARES').map((item) => {
                  const owned = mode !== 'campaign' || ownedEquipmentIds.has(item.id);
                  const serviceable = mode !== 'campaign' || isEquipmentServiceable(campaign, item.id);
                  const prefix = !owned ? '🔒 ' : !serviceable ? '🛠 ' : '';
                  const condition = mode === 'campaign' && owned ? ` · C${campaignEquipmentCondition(campaign, item.id)}` : '';
                  return <option key={item.id} value={item.id} disabled={!owned}>{prefix}{item.tier} · {equipmentName(item, language)}{condition}</option>;
                })}
              </select>
            </label>
            <label>{ui.vessel}
              <select data-testid="deployment-vessel" value={deployment.vesselId} disabled={mode === 'challenge'} onChange={(event) => onChange({ ...deployment, vesselId: event.target.value })}>
                {database.vessels.map((item) => <option key={item.id} value={item.id}>{item.class} · {vesselName(item, language)}</option>)}
              </select>
            </label>
          </div>
          {mode === 'campaign' && <div className="equipment-inventory" data-testid="equipment-inventory">
            <div><span>EQUIPMENT INVENTORY</span><b>{campaign.ownedEquipmentIds.length}/{database.equipment.length}</b><small>{campaign.maintenanceCredits} MNT</small></div>
            {inventoryByTier.map((entry) => <span key={entry.tier} className={entry.owned === entry.total ? 'unlocked' : 'locked'}><b>{entry.tier}</b><small>{entry.owned}/{entry.total}</small></span>)}
          </div>}
          {mode === 'campaign' && <div className="equipment-condition-grid" data-testid="equipment-maintenance">
            {[
              { slot: 'EQUIPMENT', item: equipment, quote: equipmentRepair, testId: 'repair-equipment' },
              { slot: 'SPARES', item: spare, quote: spareRepair, testId: 'repair-spare' },
            ].map(({ slot, item, quote, testId }) => <article key={slot} className={quote.serviceable ? 'serviceable' : 'grounded'} data-testid={`${testId}-status`}>
              <div><span>{slot} · {item.tier}</span><b>{equipmentName(item, language)}</b></div>
              <strong>{quote.condition}%</strong>
              <i><span style={{ width: `${quote.condition}%` }} /></i>
              <small>{quote.serviceable ? (language === 'zh' ? '可出勤' : 'Serviceable') : (language === 'zh' ? '需維修／不可出勤' : 'Maintenance required')}</small>
              <button data-testid={testId} disabled={!quote.needsRepair || !quote.canAfford} onClick={() => onRepair(item.id)}>
                {!quote.needsRepair
                  ? (language === 'zh' ? '狀態完整' : 'Full condition')
                  : quote.canAfford
                    ? (language === 'zh' ? `完整維修 · ${quote.cost} MNT` : `Full repair · ${quote.cost} MNT`)
                    : (language === 'zh' ? `整備點不足 · ${quote.cost} MNT` : `Need ${quote.cost} MNT`)}
              </button>
            </article>)}
            <p>{language === 'zh' ? 'Condition 低於 25% 時不可部署；損耗與修復費用為 gameplay abstraction。' : 'Equipment below 25% condition cannot deploy; wear and repair costs are gameplay abstractions.'}</p>
          </div>}
          {missionDefinition ? <div className="loadout-feedback" data-testid="loadout-quality">
            <span className={loadout.equipmentMatch ? 'match' : 'miss'}>{loadout.equipmentMatch ? '✓' : '△'} {ui.equipment}</span>
            <span className={loadout.spareMatch ? 'match' : 'miss'}>{loadout.spareMatch ? '✓' : '△'} {ui.spare}</span>
            <span className={loadout.vesselMatch ? 'match' : 'miss'}>{loadout.vesselMatch ? '✓' : '△'} {ui.vessel}</span>
            <b>{loadout.matchedChoices}/3 · Cost {loadout.initialCost}</b>
          </div> : mode === 'challenge' ? <div className="loadout-feedback challenge-loadout" data-testid="loadout-quality"><span>MASTERY L3</span><span>{BOSS_CHALLENGE_ROUND_LIMIT} ROUNDS</span><span>LOCAL BEST</span><b>FIXED L1 · Cost {loadout.initialCost}</b></div> : <div className="loadout-feedback sandbox-loadout" data-testid="loadout-quality"><span>ALL SKILLS</span><span>NO XP</span><span>FREE BOSS</span><b>Cost {loadout.initialCost}</b></div>}</>}

          {activeTab === 'forecast' && missionDefinition && dispatchForecast && rotationRecommendation && <DispatchForecastPanel
            forecast={dispatchForecast}
            rotationRecommendation={rotationRecommendation}
            database={database}
            team={team}
            mission={missionDefinition}
            vessel={vessel}
            language={language}
            onApplyRotation={applyRotationRecommendation}
          />}

          {activeTab === 'backup' && mode === 'challenge' && <ChallengeSavePanel
            challenge={challenge}
            bosses={database.bosses}
            characters={database.characters}
            language={language}
            importUndo={challengeImportUndo}
            onImportConfirmed={(progress, undo) => {
              setChallengeRouteFilters(createInitialBossChallengeRouteFilters());
              setCandidateUndo(undefined);
              setDraftVerification(undefined);
              setDraftVerificationBaseline(undefined);
              setDraftRepairEvidence(undefined);
              setDraftRepairEscalation(undefined);
              setDraftVerificationUndo(undefined);
              setDraftSettlementPreview(undefined);
              setDraftSettlement(undefined);
              setChallengeImportUndo(undo);
              onImportChallengeProgress(progress);
            }}
            onUndoImport={(progress) => {
              setChallengeImportUndo(undefined);
              onImportChallengeProgress(progress);
            }}
          />}

          {activeTab !== 'backup' && <div className="deployment-action-bar">
            <div>
              {mode === 'campaign' && operationReadiness && !operationReadiness.ready && <p className="readiness-blocked-reason" data-testid="readiness-blocked-reason">{language === 'zh' ? `尚未通過：${missingReadiness.join('、')}` : `Pending: ${missingReadiness.join(', ')}`}</p>}
              {mode === 'campaign' && !inventoryReady && <p className="readiness-blocked-reason" data-testid="inventory-blocked-reason">{language === 'zh' ? '目前配置包含尚未持有或 Condition 低於 25% 的裝備。' : 'The current loadout includes locked or unserviceable equipment.'}</p>}
              {mode === 'campaign' && !careerReady && <p className="readiness-blocked-reason" data-testid="career-blocked-reason">{language === 'zh' ? '隊伍包含尚未由 Career Track 解鎖的角色。' : 'The team includes a character not yet unlocked by Career Track progression.'}</p>}
              {mode === 'campaign' && !fatigueReady && <p className="readiness-blocked-reason" data-testid="crew-blocked-reason">{language === 'zh' ? '隊伍包含 100% Exhausted 技師；請先休息或輪調。' : 'The team includes exhausted crew; rest or rotate before deployment.'}</p>}
              {duplicateTeam && <p className="readiness-blocked-reason">⛔ {ui.duplicateTeam}</p>}
            </div>
            <button className="primary-button deployment-button" data-testid="deploy-mission" disabled={duplicateTeam || !inventoryReady || !crewReady || (mode === 'campaign' && !operationReadiness?.ready) || (mode === 'challenge' && challengeRouteItems.length === 0)} onClick={onDeploy}>{ui.deploy}</button>
          </div>}
        </section>

        {activeTab !== 'route' && activeTab !== 'forecast' && activeTab !== 'backup' && <section className="panel deployment-analysis">
          {activeTab === 'crew' && mode === 'challenge' && challengeSquadRecommendation
            ? <BossChallengeSquadAdvisor
                recommendation={challengeSquadRecommendation}
                comparison={challengeSquadComparison!}
                language={language}
                onApply={applyChallengeSquadRecommendation}
              />
            : activeTab === 'crew' && missionDefinition && rotationRecommendation
              ? <CrewRotationAdvisor recommendation={rotationRecommendation} language={language} onApply={applyRotationRecommendation} />
            : <>
              <div
                key={previewCharacter.id}
                className="portrait-placeholder deployment-portrait"
                aria-label={previewArt ? `角色 P01 ${previewArt.version} 來源原畫` : '角色來源原畫待核准'}
                data-source-art-character-id={previewCharacter.id}
                data-source-art-version={previewArt?.version ?? ''}
                data-source-art-file={previewArt?.file ?? ''}
                data-source-art-qa-status={previewArt?.qaStatus ?? ''}
                data-source-art-engineering-qa-status={previewArt?.engineeringQaStatus ?? ''}
              >
                <div className="portrait-grid" />
                <div className="portrait-silhouette"><span>◈</span></div>
                {previewUrl && <img className="source-art-image" src={previewUrl} alt="" onLoad={(event) => event.currentTarget.parentElement?.classList.add('has-source-art')} />}
                <div className="source-art-label placeholder-art-label">{ui.sourceArt.toUpperCase()} · {previewCharacter.artStatus.toUpperCase()}</div>
                <div className="source-art-label generated-art-label">{ui.sourceArt.toUpperCase()} · P01 {previewArt?.version.toUpperCase()}</div>
              </div>
              <h3>{characterName(previewCharacter, language)}</h3>
              <p>{professionName(previewCharacter, language)} · {previewCharacter.factionCode} · {previewCharacter.levelCode}</p>
            </>}
          <div className="deployment-stats">
            <Metric label={ui.counterCoverage} value={`${counterCoverage}/3`} />
            <Metric label={ui.roundLimit} value={mode === 'challenge' ? BOSS_CHALLENGE_ROUND_LIMIT : mission.roundLimit} />
            <Metric label={missionDefinition ? 'LOADOUT' : 'BOSS'} value={missionDefinition ? `${loadout.matchedChoices}/3` : boss.class} />
          </div>
          <span className="form-section-label">{ui.coverage}</span>
          <div className="coverage-grid">
            {MISSION_STAGES.map((stage, index) => <div key={stage} className={coverage[stage] > 0 ? 'covered' : 'gap'}><span>{language === 'zh' ? STAGE_ZH[index] : stage}</span><b>{coverage[stage]}</b></div>)}
          </div>
        </section>}
      </div>
    </section>
  );
}

function SandboxScenarioPanel({
  scenario,
  vessel,
  language,
  onChange,
}: {
  scenario: SandboxScenarioConfig;
  vessel: VesselData;
  language: Language;
  onChange: (scenario: SandboxScenarioConfig) => void;
}) {
  const normalized = normalizeSandboxScenario(scenario);
  const modifier = sandboxSeaStateModifier(normalized.seaState);
  const projectedVessel = sandboxVesselProjection(vessel, normalized.seaState);
  const presets = Object.entries(SANDBOX_SCENARIO_PRESETS) as Array<[SandboxScenarioPreset, SandboxScenarioConfig]>;
  const activePreset = presets.find(([, preset]) => Object.keys(preset).every((key) => preset[key as keyof SandboxScenarioConfig] === normalized[key as keyof SandboxScenarioConfig]))?.[0];
  const controls: Array<{
    key: keyof SandboxScenarioConfig;
    labelZh: string;
    labelEn: string;
    suffix: string;
    testId: string;
  }> = [
    { key: 'seaState', labelZh: '海況等級', labelEn: 'Sea State', suffix: '/6', testId: 'sandbox-sea-state' },
    { key: 'weatherWindow', labelZh: '初始天候窗口', labelEn: 'Initial weather window', suffix: '%', testId: 'sandbox-weather-window' },
    { key: 'safety', labelZh: '初始安全餘裕', labelEn: 'Initial safety margin', suffix: '%', testId: 'sandbox-safety' },
    { key: 'evidence', labelZh: '初始證據', labelEn: 'Initial evidence', suffix: '', testId: 'sandbox-evidence' },
    { key: 'roundLimit', labelZh: '回合限制', labelEn: 'Round limit', suffix: 'R', testId: 'sandbox-round-limit' },
  ];
  const update = (key: keyof SandboxScenarioConfig, value: number) => onChange(normalizeSandboxScenario({ ...normalized, [key]: value }));
  const formatDelta = (value: number) => value > 0 ? `+${value}` : String(value);
  return <section className="sandbox-scenario-panel" data-testid="sandbox-scenario-panel">
    <header>
      <div><span className="section-kicker">SANDBOX SCENARIO LAB</span><h3>{language === 'zh' ? '自由調整海況、故障與任務資源' : 'Tune sea state, fault, and mission resources'}</h3><p>{language === 'zh' ? 'Boss 由「任務航線」選擇；以下設定只套用下一次 Sandbox session，不會寫入 Campaign。' : 'Choose the fault on Mission route. These values apply only to the next Sandbox session and never write to Campaign.'}</p></div>
      <strong>{activePreset ?? 'CUSTOM'}</strong>
    </header>
    <div className="sandbox-scenario-presets" aria-label={language === 'zh' ? '情境預設' : 'Scenario presets'}>
      {presets.map(([preset]) => <button type="button" key={preset} data-testid={`sandbox-preset-${preset.toLowerCase()}`} className={activePreset === preset ? 'active' : ''} onClick={() => onChange(sandboxScenarioPreset(preset))}>{preset}</button>)}
    </div>
    <div className="sandbox-scenario-controls">
      {controls.map((control) => {
        const limits = SANDBOX_SCENARIO_LIMITS[control.key];
        return <label key={control.key}>
          <span><b>{language === 'zh' ? control.labelZh : control.labelEn}</b><output data-testid={`${control.testId}-value`}>{normalized[control.key]}{control.suffix}</output></span>
          <input type="range" data-testid={control.testId} min={limits.min} max={limits.max} step={control.key === 'weatherWindow' || control.key === 'safety' || control.key === 'evidence' ? 5 : 1} value={normalized[control.key]} onChange={(event) => update(control.key, Number(event.target.value))} />
          <small>{limits.min} — {limits.max}</small>
        </label>;
      })}
    </div>
    <div className="sandbox-vessel-projection" data-testid="sandbox-vessel-projection">
      <div><span>{vessel.class} · {language === 'zh' ? vessel.nameZh : vessel.nameEn}</span><b>{language === 'zh' ? `Sea State ${normalized.seaState} 單次投影` : `Sea State ${normalized.seaState} session projection`}</b></div>
      <span><small>WEATHER</small><b>{vessel.weatherProtection} → {projectedVessel.weatherProtection}</b><em>{formatDelta(modifier.weatherProtection)}</em></span>
      <span><small>SAFETY</small><b>{vessel.safetyProtection} → {projectedVessel.safetyProtection}</b><em>{formatDelta(modifier.safetyProtection)}</em></span>
      <span><small>FATIGUE</small><b>{vessel.fatigueRelief} → {projectedVessel.fatigueRelief}</b><em>{formatDelta(modifier.fatigueRelief)}</em></span>
    </div>
    <p className="operation-disclaimer">{language === 'zh' ? 'Gameplay abstraction — Sea State 會改變每回合船舶天候、安全與疲勞防護；不是現場作業限制。' : 'Gameplay abstraction — Sea State changes per-round vessel weather, safety, and fatigue protection; it is not a field operating limit.'}</p>
  </section>;
}

function ChallengeSavePanel({
  challenge,
  bosses,
  characters,
  language,
  importUndo,
  onImportConfirmed,
  onUndoImport,
}: {
  challenge: BossChallengeProgress;
  bosses: BossData[];
  characters: CharacterData[];
  language: Language;
  importUndo?: BossChallengeImportUndo;
  onImportConfirmed: (progress: BossChallengeProgress, undo: BossChallengeImportUndo) => void;
  onUndoImport: (progress: BossChallengeProgress) => void;
}) {
  const [saveText, setSaveText] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [importPreview, setImportPreview] = useState<BossChallengeImportPreview | undefined>();
  const sourceSummary = bossChallengeSourceSummary(challenge, bosses);
  const generateSave = () => {
    setImportPreview(undefined);
    setSaveText(serializeBossChallengeSave(challenge));
    setSaveStatus(language === 'zh' ? '已產生 Challenge v3 JSON；Campaign 不包含在內。' : 'Challenge v3 JSON generated; Campaign is not included.');
  };
  const importSave = () => {
    const result = parseBossChallengeSave(saveText, bosses, characters);
    if (!result.ok) {
      setImportPreview(undefined);
      const message = {
        INVALID_JSON: language === 'zh' ? 'JSON 語法無效。' : 'Invalid JSON syntax.',
        INVALID_FORMAT: language === 'zh' ? '不是 Challenge 存檔；Campaign JSON 不可匯入此處。' : 'Not a Challenge save; Campaign JSON is rejected here.',
        UNSUPPORTED_VERSION: language === 'zh' ? 'Challenge 存檔版本尚未支援。' : 'Challenge save version is not supported.',
      }[result.error];
      setSaveStatus(message);
      return;
    }
    setImportPreview(createBossChallengeImportPreview(challenge, result));
    setSaveStatus(result.migratedLegacy
      ? (language === 'zh' ? `V${result.sourceSchemaVersion} 已正規化；確認前不會寫入。` : `V${result.sourceSchemaVersion} normalized; no write until confirmed.`)
      : (language === 'zh' ? 'Preflight 完成；確認前不會寫入。' : 'Preflight ready; no write until confirmed.'));
  };
  const confirmImport = () => {
    if (!importPreview) return;
    try {
      const result = confirmBossChallengeImport(challenge, importPreview);
      onImportConfirmed(result.progress, result.undo);
      setImportPreview(undefined);
      setSaveStatus(importPreview.migratedLegacy
        ? (language === 'zh' ? `Challenge v${importPreview.sourceSchemaVersion} 已 migration 為 v3 並匯入；可 Undo。` : `Challenge v${importPreview.sourceSchemaVersion} migrated to v3 and imported; Undo available.`)
        : (language === 'zh' ? 'Challenge v3 已匯入；可 Undo。' : 'Challenge v3 imported; Undo available.'));
    } catch {
      setImportPreview(undefined);
      setSaveStatus(language === 'zh' ? '目前 Challenge 已變更，請重新產生 preflight。' : 'Challenge changed; rebuild the preflight.');
    }
  };
  const cancelImport = () => {
    setImportPreview(undefined);
    setSaveStatus(language === 'zh' ? '已取消；Challenge 存檔未變更。' : 'Canceled; Challenge save unchanged.');
  };
  const undoImport = () => {
    if (!importUndo) return;
    try {
      onUndoImport(undoBossChallengeImport(challenge, importUndo));
      setSaveStatus(language === 'zh' ? '已復原匯入前的 Challenge 存檔。' : 'Challenge save restored to its pre-import state.');
    } catch {
      setSaveStatus(language === 'zh' ? '匯入後已有新變更，Undo 已過期。' : 'Challenge changed after import; Undo is stale.');
    }
  };
  const affectedBossIds = importPreview ? [...new Set([
    ...importPreview.addedBestBossIds,
    ...importPreview.changedBestBossIds,
    ...importPreview.removedBestBossIds,
    ...importPreview.addedDraftBossIds,
    ...importPreview.changedDraftBossIds,
    ...importPreview.removedDraftBossIds,
  ])].sort((left, right) => left.localeCompare(right)) : [];
  return <section className="challenge-save-pane" data-testid="challenge-save-manager">
    <header>
      <div><span className="section-kicker">CHALLENGE SAVE V3</span><h3>{language === 'zh' ? '挑戰紀錄備份與轉移' : 'Challenge backup and transfer'}</h3><p>{language === 'zh' ? '只包含每個 Boss 的 local best、source provenance 與 squad draft；不讀寫 Campaign v5。' : 'Contains per-Boss local bests, source provenance, and squad drafts only; Campaign v5 is untouched.'}</p></div>
      <strong>{Object.keys(challenge.bestByBossId).length}/{bosses.length}</strong>
    </header>
    <div className="challenge-save-source-summary" data-testid="challenge-save-source-summary">
      <span><small>OPERATION</small><b>{sourceSummary.operationRecords} BEST · {sourceSummary.operationCompleted} CLEAR</b></span>
      <span><small>DRAFT CONFIRMATION</small><b>{sourceSummary.draftConfirmationRecords} BEST · {sourceSummary.draftConfirmationCompleted} CLEAR</b></span>
      <span><small>SQUAD DRAFT</small><b>{Object.keys(challenge.draftByBossId).length}/{bosses.length}</b></span>
      <span><small>STORAGE</small><b>{BOSS_CHALLENGE_STORAGE_KEY}</b></span>
    </div>
    <div className="save-manager challenge-save-manager">
      <div className="save-manager-copy"><span className="section-kicker">OWM_CHALLENGE_SAVE</span><b>{language === 'zh' ? '獨立 JSON envelope' : 'Isolated JSON envelope'}</b><small>{language === 'zh' ? '匯入會先驗證 schema、Boss FK、角色 FK 與三人唯一性。' : 'Import validates schema, Boss/character FKs, and three unique crew IDs.'}</small></div>
      <textarea data-testid="challenge-save-export-text" value={saveText} onChange={(event) => { setSaveText(event.target.value); setImportPreview(undefined); }} placeholder={language === 'zh' ? '按「產生 JSON」或貼上 Challenge v1／v2／v3 存檔' : 'Generate JSON or paste a Challenge v1/v2/v3 save'} aria-label={language === 'zh' ? 'Challenge 存檔 JSON' : 'Challenge save JSON'} />
      <div className="save-manager-actions">
        <button type="button" data-testid="challenge-save-generate" onClick={generateSave}>{language === 'zh' ? '產生 JSON' : 'Generate JSON'}</button>
        <button type="button" data-testid="challenge-save-import" onClick={importSave}>{language === 'zh' ? '預覽匯入' : 'Preview import'}</button>
        {saveText && <a data-testid="challenge-save-download" download="OWM_challenge_save.json" href={`data:application/json;charset=utf-8,${encodeURIComponent(saveText)}`}>{language === 'zh' ? '下載 JSON' : 'Download JSON'}</a>}
        <small data-testid="challenge-save-status" role="status">{saveStatus}</small>
      </div>
      {importPreview && <section className="challenge-import-preview" data-testid="challenge-import-preview">
        <header><div><span>IMPORT PREFLIGHT · V{importPreview.sourceSchemaVersion}→V3</span><b>{importPreview.migratedLegacy ? (language === 'zh' ? '舊版正規化 · 等待確認' : 'LEGACY NORMALIZED · CONFIRM REQUIRED') : (language === 'zh' ? '覆寫差異 · 等待確認' : 'REPLACE DIFF · CONFIRM REQUIRED')}</b></div><strong>NO SAVE YET</strong></header>
        <div className="challenge-import-metrics">
          <span><small>BEST</small><b>{importPreview.current.bestRecords}→{importPreview.incoming.bestRecords}</b></span>
          <span><small>OPERATION</small><b>{importPreview.current.operationRecords}→{importPreview.incoming.operationRecords}</b></span>
          <span><small>DRAFT CONFIRM</small><b>{importPreview.current.draftConfirmationRecords}→{importPreview.incoming.draftConfirmationRecords}</b></span>
          <span><small>SQUAD DRAFT</small><b>{importPreview.current.squadDrafts}→{importPreview.incoming.squadDrafts}</b></span>
        </div>
        <div className="challenge-import-impact">
          <span data-testid="challenge-import-best-diff">BEST +{importPreview.addedBestBossIds.length} · Δ{importPreview.changedBestBossIds.length} · −{importPreview.removedBestBossIds.length}</span>
          <span data-testid="challenge-import-draft-diff">DRAFT +{importPreview.addedDraftBossIds.length} · Δ{importPreview.changedDraftBossIds.length} · −{importPreview.removedDraftBossIds.length}</span>
          <em data-testid="challenge-import-affected-ids">AFFECTED · {affectedBossIds.length > 0 ? affectedBossIds.join(' / ') : 'NONE'}</em>
          <em data-testid="challenge-import-removed-bosses">REMOVED BOSS · {importPreview.removedBossIds.length > 0 ? importPreview.removedBossIds.join(' / ') : 'NONE'}</em>
        </div>
        <div className="challenge-import-actions"><button type="button" data-testid="challenge-import-confirm" onClick={confirmImport}>{language === 'zh' ? '確認覆寫' : 'CONFIRM REPLACE'}</button><button type="button" data-testid="challenge-import-cancel" onClick={cancelImport}>{language === 'zh' ? '取消' : 'CANCEL'}</button></div>
      </section>}
      {!importPreview && importUndo && <section className="challenge-import-undo" data-testid="challenge-import-undo"><div><span>SESSION ONLY</span><b>{language === 'zh' ? '匯入已套用，可復原上一份 Challenge 存檔' : 'Import applied; previous Challenge save can be restored'}</b></div><button type="button" data-testid="challenge-import-undo-button" onClick={undoImport}>UNDO IMPORT</button></section>}
    </div>
  </section>;
}

function BossChallengeSquadAdvisor({
  recommendation,
  comparison,
  language,
  onApply,
}: {
  recommendation: BossChallengeSquadRecommendation;
  comparison: BossChallengeSquadComparison;
  language: Language;
  onApply: () => void;
}) {
  const applied = comparison.exactOrder;
  const formatDelta = (value: number) => value === 0 ? '—' : value > 0 ? `+${value}` : String(value);
  return <section className="boss-challenge-squad-advisor" data-testid="challenge-squad-advisor">
    <header>
      <div>
        <span>CHALLENGE SQUAD ADVISOR</span>
        <b>{recommendation.bossId} · {language === 'zh' ? '確定性稽核推薦' : 'DETERMINISTIC AUDIT PICK'}</b>
      </div>
      <strong>VERIFIED · {applied ? 'AUDIT TEAM' : `${comparison.sharedMemberCount}/3 MATCH`}</strong>
    </header>
    <div className="challenge-squad-metrics">
      <span><small>SCORE</small><b>{recommendation.auditScore}</b></span>
      <span><small>ROUND</small><b>R{recommendation.auditRound}</b></span>
      <span><small>{language === 'zh' ? '候選通關' : 'CLEAR RATE'}</small><b>{recommendation.candidateCompletionRate}%</b></span>
    </div>
    <div className="challenge-squad-compare" data-testid="challenge-squad-compare">
      <header><span>COMPARE</span><b>CURRENT</b><b>AUDIT</b><em>Δ</em></header>
      <div><span>COUNTER</span><b data-testid="challenge-compare-current-counter">{comparison.current.counterCount}/3</b><b data-testid="challenge-compare-audit-counter">{comparison.audit.counterCount}/3</b><em className={comparison.counterDelta > 0 ? 'gain' : ''}>{formatDelta(comparison.counterDelta)}</em></div>
      <div><span>STAGE</span><b data-testid="challenge-compare-current-stage">{comparison.current.coveredStageCount}/6</b><b data-testid="challenge-compare-audit-stage">{comparison.audit.coveredStageCount}/6</b><em className={comparison.coveredStageDelta > 0 ? 'gain' : ''}>{formatDelta(comparison.coveredStageDelta)}</em></div>
      <div><span>MEMBERS</span><b data-testid="challenge-compare-shared-members">{comparison.sharedMemberCount}/3</b><b>3/3</b><em className={comparison.sharedMemberCount < 3 ? 'gain' : ''}>{formatDelta(3 - comparison.sharedMemberCount)}</em></div>
    </div>
    <div className="challenge-squad-members">
      {recommendation.members.map((member, index) => <article key={member.id} data-testid={`challenge-squad-member-${index}`}>
        <span><small>0{index + 1} · {member.factionCode} · M3</small><b>{characterName(member, language)}</b></span>
        <em>{member.id}</em>
        <i>{professionName(member, language)}</i>
        <strong className={comparison.auditMemberPresent[index] ? 'keep' : 'swap'}>{comparison.auditMemberPresent[index] ? 'KEEP' : 'SWAP'}</strong>
      </article>)}
    </div>
    <div className="challenge-squad-coverage" aria-label={language === 'zh' ? '推薦隊伍六階段涵蓋' : 'Recommended squad stage coverage'}>
      {MISSION_STAGES.map((stage, index) => <span key={stage} className={recommendation.stageCoverage[stage] > 0 ? 'covered' : 'gap'}>
        <small>{language === 'zh' ? STAGE_ZH[index] : stage}</small><b>{comparison.current.stageCoverage[stage]}→{comparison.audit.stageCoverage[stage]}</b><em className={comparison.stageCoverageDelta[stage] > 0 ? 'gain' : comparison.stageCoverageDelta[stage] < 0 ? 'loss' : ''}>{formatDelta(comparison.stageCoverageDelta[stage])}</em>
      </span>)}
    </div>
    <button type="button" data-testid="apply-challenge-squad" disabled={applied} onClick={onApply}>
      {applied ? (language === 'zh' ? '已套用稽核隊伍' : 'AUDIT SQUAD APPLIED') : (language === 'zh' ? '恢復稽核隊伍' : 'RESTORE AUDIT SQUAD')}
    </button>
    <p>{language === 'zh' ? 'Gameplay audit snapshot：僅比較固定 M3／標準裝備／10 回合規則下的隊伍結構，不代表現場或真實成功率。' : 'Gameplay audit snapshot: squad structure under fixed M3, standard loadout, and 10-round rules; not a real-world success rate.'}</p>
  </section>;
}

function ChallengeStrategyBriefingPanel({
  briefing,
  language,
  compact = false,
  onFindCapability,
}: {
  briefing: BossChallengeStrategyBriefing;
  language: Language;
  compact?: boolean;
  onFindCapability?: (capability: CrewSkillCapability) => void;
}) {
  const gapSet = new Set(briefing.gaps);
  const impactDelta = (resource: string, magnitude: number) => `${resource === 'fatigue' || resource === 'cost' ? '+' : '-'}${magnitude}/R`;
  return <section className={`challenge-strategy-briefing${compact ? ' compact' : ''}`} data-testid="challenge-strategy-briefing" style={{ '--hazard': briefing.telegraph.accent } as React.CSSProperties}>
    <header>
      <div><span>{briefing.telegraph.icon}</span><i data-testid="strategy-class-code">{briefing.classCode}</i><b>{language === 'zh' ? briefing.rule.titleZh : briefing.rule.titleEn}</b></div>
      <div className="strategy-impact-tags">
        <em>BASE FATIGUE +{briefing.baseFatigueDamage}/R</em>
        {briefing.classImpacts.map((impact) => <em key={impact.resource} data-testid={`strategy-impact-${impact.resource}`}>{IMPACT_LABELS[language][impact.resource]} {impactDelta(impact.resource, impact.magnitude)}</em>)}
      </div>
    </header>
    <div className="strategy-branch-schedule" data-testid="strategy-branch-schedule">
      <span>BRANCH WINDOWS</span>
      {briefing.branchSchedule.map(({ round, event, impacts }) => <article key={round}>
        <small>R{String(round).padStart(2, '0')} · {event.code}</small>
        <b>{event.icon} {language === 'zh' ? event.titleZh : event.titleEn}</b>
        <em>{impacts.map((impact) => IMPACT_LABELS[language][impact]).join(' · ')}</em>
      </article>)}
    </div>
    <div className="strategy-response-grid" data-testid="strategy-skill-readiness">
      <span className={gapSet.has('NO_REACTIVE') ? 'gap' : 'ready'} data-testid="strategy-reactive"><small>REACTIVE</small><b>{briefing.reactiveOptions.length}</b><em>{gapSet.has('NO_REACTIVE') ? 'GAP' : 'READY'}</em></span>
      <span className={gapSet.has('NO_TEAM_RECOVERY') ? 'gap' : 'ready'} data-testid="strategy-team-recovery"><small>{language === 'zh' ? '全隊恢復' : 'TEAM RECOVERY'}</small><b>{briefing.teamRecoveryOptions.length}</b><em>{gapSet.has('NO_TEAM_RECOVERY') ? 'GAP' : 'READY'}</em></span>
      <span className={gapSet.has('NO_LOW_ENERGY_ACTION') ? 'gap' : 'ready'} data-testid="strategy-low-energy"><small>≤4 ENERGY</small><b>{briefing.lowEnergyActions.length}</b><em>{gapSet.has('NO_LOW_ENERGY_ACTION') ? 'GAP' : 'READY'}</em></span>
      <span className={gapSet.has('STAGE_GAP') ? 'gap' : 'ready'}><small>STAGE</small><b>{briefing.coveredStageCount}/6</b><em>{gapSet.has('STAGE_GAP') ? 'GAP' : 'READY'}</em></span>
      <span className="neutral"><small>COUNTER</small><b>{briefing.counterCount}/3</b><em>×1.25</em></span>
    </div>
    <div className={`strategy-gap-summary${briefing.gaps.length === 0 ? ' clear' : ''}`} data-testid="strategy-gap-signals">
      <span>{briefing.gaps.length === 0 ? 'STRUCTURE READY' : `${briefing.gaps.length} STRUCTURAL GAP${briefing.gaps.length > 1 ? 'S' : ''}`}</span>
      <b>{briefing.gaps.length === 0 ? (language === 'zh' ? '未偵測到結構缺口' : 'No structural gap detected') : briefing.gaps.map((gap) => strategyGapLabel(gap, language)).join(' · ')}</b>
      {onFindCapability && <div className="strategy-gap-actions">
        {gapSet.has('NO_REACTIVE') && <button type="button" data-testid="strategy-find-reactive" onClick={() => onFindCapability('REACTIVE')}>{language === 'zh' ? '找 Reactive' : 'FIND REACTIVE'}</button>}
        {gapSet.has('NO_TEAM_RECOVERY') && <button type="button" data-testid="strategy-find-team-recovery" onClick={() => onFindCapability('TEAM_RECOVERY')}>{language === 'zh' ? '找全隊恢復' : 'FIND RECOVERY'}</button>}
        {gapSet.has('NO_LOW_ENERGY_ACTION') && <button type="button" data-testid="strategy-find-low-energy" onClick={() => onFindCapability('LOW_ENERGY')}>{language === 'zh' ? '找低 Energy' : 'FIND LOW ENERGY'}</button>}
      </div>}
    </div>
    <p>{language === 'zh' ? '依正式 Boss class／branch／技能規則派生；只供 gameplay 準備，不是現場安全建議或成功率預測。' : 'Derived from official Boss class, branch, and skill rules; gameplay preparation only, not field safety advice or a success forecast.'}</p>
  </section>;
}

function strategyGapLabel(gap: ChallengeStrategyGap, language: Language): string {
  const labels: Record<ChallengeStrategyGap, [string, string]> = {
    NO_REACTIVE: ['無 Reactive 事件回應', 'No Reactive event response'],
    NO_TEAM_RECOVERY: ['無全隊疲勞恢復', 'No team fatigue recovery'],
    NO_LOW_ENERGY_ACTION: ['無低 Energy 一般技能', 'No low-Energy standard action'],
    STAGE_GAP: ['六階段涵蓋缺口', 'Six-stage coverage gap'],
  };
  return labels[gap][language === 'zh' ? 0 : 1];
}

function ChallengeGapCandidatePanel({
  preview,
  language,
  canRestore,
  onApply,
  onRestore,
}: {
  preview: BossChallengeGapCandidatePreview;
  language: Language;
  canRestore: boolean;
  onApply: (teamIds: [string, string, string]) => void;
  onRestore: () => void;
}) {
  const metrics: Array<{ key: keyof Omit<ChallengeStrategyStructureMetrics, 'gaps'>; label: string }> = [
    { key: 'reactive', label: 'REACTIVE' },
    { key: 'teamRecovery', label: language === 'zh' ? '全隊恢復' : 'RECOVERY' },
    { key: 'lowEnergy', label: '≤4E' },
    { key: 'counter', label: 'COUNTER' },
    { key: 'stage', label: 'STAGE' },
  ];
  return <section className="challenge-gap-candidates" data-testid="challenge-gap-candidates">
    <header>
      <div><span>STRATEGY GAP CANDIDATES</span><b>{crewCapabilityLabel(preview.capability, language)} · {preview.eligibleCandidateCount} CREW / {preview.evaluatedSwapCount} SWAPS</b></div>
      <strong>STRUCTURAL PREVIEW · NOT AUDIT VERIFIED</strong>
      {canRestore && <button type="button" data-testid="restore-gap-candidate" onClick={onRestore}>{language === 'zh' ? '復原上一隊' : 'RESTORE PREVIOUS'}</button>}
    </header>
    <div className="challenge-gap-candidate-list">
      {preview.candidates.map((candidate, index) => <article key={`${candidate.character.id}-${candidate.slotIndex}`} data-testid={`gap-candidate-${index}`}>
        <div className="gap-candidate-identity">
          <span>0{index + 1} · {candidate.character.factionCode} · SLOT {candidate.slotIndex + 1}</span>
          <b>{characterName(candidate.character, language)}</b>
          <small>{language === 'zh' ? '取代' : 'REPLACES'} {characterName(candidate.replaces, language)} · {candidate.character.id}</small>
        </div>
        <div className="gap-candidate-metrics">
          {metrics.map(({ key, label }) => {
            const before = candidate.before[key];
            const after = candidate.after[key];
            return <span key={key} className={after > before ? 'gain' : after < before ? 'loss' : ''} data-testid={`gap-candidate-${index}-${key}`}><small>{label}</small><b>{before}→{after}{key === 'counter' ? '/3' : key === 'stage' ? '/6' : ''}</b></span>;
          })}
        </div>
        <button type="button" data-testid={`apply-gap-candidate-${index}`} onClick={() => onApply(candidate.teamIds)}>{language === 'zh' ? '套用單席替換' : 'APPLY ONE-SLOT SWAP'}</button>
      </article>)}
      {preview.candidates.length === 0 && <p>{language === 'zh' ? '目前篩選下沒有可預覽的替代角色。' : 'No replacement candidate is available under the current filters.'}</p>}
    </div>
    <p>{language === 'zh' ? '只比較單一席替換後的技能、Counter 與 Stage 結構；不實跑 runtime、不预測成功率，也不取代 audit 隊伍。' : 'Compares skill, Counter, and Stage structure for one-slot swaps only; no runtime simulation, success forecast, or audit-team replacement.'}</p>
  </section>;
}

function crewCapabilityLabel(capability: Exclude<CrewSkillCapability, 'ALL'>, language: Language): string {
  if (capability === 'REACTIVE') return 'REACTIVE';
  if (capability === 'TEAM_RECOVERY') return language === 'zh' ? '全隊恢復' : 'TEAM RECOVERY';
  return '≤4 ENERGY';
}

function BossChallengeRoutePanel({
  challenge,
  bosses,
  filters,
  items,
  selectedItem,
  draftSummary,
  portfolio,
  repairQueue,
  repairQueueSessionCount,
  repairPreview,
  verification,
  verificationBaseline,
  verificationComparison,
  repairEvidence,
  repairEscalation,
  settlementPreview,
  settlement,
  currentTeamIds,
  language,
  canUndoRepair,
  onFiltersChange,
  onSelectBoss,
  onResumeDraft,
  onApplyRepair,
  onUndoRepair,
  onNextRepair,
  onVerifyDraft,
  onEvaluateEscalation,
  onApplyEscalation,
  onConfirmSettlement,
  onCancelSettlement,
  onSeedDraft,
}: {
  challenge: BossChallengeProgress;
  bosses: BossData[];
  filters: BossChallengeRouteFilters;
  items: BossChallengeRouteItem[];
  selectedItem?: BossChallengeRouteItem;
  draftSummary?: BossChallengeRouteDraftSummary;
  portfolio: BossChallengeDraftPortfolio;
  repairQueue: BossChallengeRepairQueue;
  repairQueueSessionCount: number;
  repairPreview?: BossChallengeRouteRepairPreview;
  verification?: BossChallengeDraftVerification;
  verificationBaseline?: BossChallengeDraftVerification;
  verificationComparison?: BossChallengeDraftVerificationComparison;
  repairEvidence?: BossChallengeDraftRepairEvidence;
  repairEscalation?: BossChallengeRuntimeRepairEscalation;
  settlementPreview?: BossChallengeDraftSettlementPreview;
  settlement?: BossChallengeSettlement;
  currentTeamIds: [string, string, string];
  language: Language;
  canUndoRepair: boolean;
  onFiltersChange: (filters: BossChallengeRouteFilters) => void;
  onSelectBoss: (bossId: string) => void;
  onResumeDraft: (teamIds: [string, string, string]) => void;
  onApplyRepair: (teamIds: [string, string, string]) => void;
  onUndoRepair: () => void;
  onNextRepair: () => void;
  onVerifyDraft: () => void;
  onEvaluateEscalation: () => void;
  onApplyEscalation: (candidate: BossChallengeRuntimeRepairCandidate) => void;
  onConfirmSettlement: () => void;
  onCancelSettlement: () => void;
  onSeedDraft: () => void;
}) {
  const classes = useMemo(() => bossChallengeRouteClasses(bosses), [bosses]);
  const resetFilters = () => onFiltersChange(createInitialBossChallengeRouteFilters());
  const pressureLabel = selectedItem ? challengePressureLabel(selectedItem.audit.pressure, language) : '';
  return <>
    <BossChallengeBriefing
      challenge={challenge}
      bosses={bosses}
      selectedBoss={selectedItem?.boss}
      portfolio={portfolio}
      repairQueue={repairQueue}
      repairQueueSessionCount={repairQueueSessionCount}
      language={language}
      onNextRepair={onNextRepair}
    />
    <section className="boss-challenge-route-tools" data-testid="challenge-route-tools">
      <label><span>SEVERITY</span><select data-testid="challenge-filter-severity" value={filters.severity} onChange={(event) => onFiltersChange({ ...filters, severity: event.target.value as BossChallengeRouteSeverity })}>
        <option value="ALL">ALL</option>{(['S1', 'S2', 'S3', 'S4', 'S5'] as const).map((severity) => <option key={severity} value={severity}>{severity}</option>)}
      </select></label>
      <label><span>CLASS</span><select data-testid="challenge-filter-class" value={filters.classCode} onChange={(event) => onFiltersChange({ ...filters, classCode: event.target.value })}>
        <option value="ALL">ALL</option>{classes.map((classCode) => <option key={classCode} value={classCode}>{classCode}</option>)}
      </select></label>
      <label><span>{language === 'zh' ? '紀錄狀態' : 'STATUS'}</span><select data-testid="challenge-filter-status" value={filters.status} onChange={(event) => onFiltersChange({ ...filters, status: event.target.value as BossChallengeRouteStatus })}>
        <option value="ALL">ALL</option>
        <option value="UNATTEMPTED">{language === 'zh' ? '未挑戰' : 'UNATTEMPTED'}</option>
        <option value="CLEARED">{language === 'zh' ? '已通關' : 'CLEARED'}</option>
        <option value="FAILED">{language === 'zh' ? '未通關' : 'FAILED'}</option>
      </select></label>
      <label><span>{language === 'zh' ? '紀錄來源' : 'SOURCE'}</span><select data-testid="challenge-filter-source" value={filters.source} onChange={(event) => onFiltersChange({ ...filters, source: event.target.value as BossChallengeRouteSource })}>
        <option value="ALL">ALL</option>
        <option value="OPERATION">OPERATION</option>
        <option value="DRAFT_CONFIRMATION">DRAFT CONFIRM</option>
      </select></label>
      <label><span>{language === 'zh' ? '規劃狀態' : 'DRAFT'}</span><select data-testid="challenge-filter-draft" value={filters.draftStatus} onChange={(event) => onFiltersChange({ ...filters, draftStatus: event.target.value as BossChallengeRouteDraftStatus })}>
        <option value="ALL">ALL</option>
        <option value="DRAFTED">DRAFTED</option>
        <option value="UNDRAFTED">UNDRAFTED</option>
      </select></label>
      <label><span>{language === 'zh' ? '結構準備度' : 'READINESS'}</span><select data-testid="challenge-filter-readiness" value={filters.readiness} onChange={(event) => onFiltersChange({ ...filters, readiness: event.target.value as BossChallengeRouteReadinessFilter })}>
        <option value="ALL">ALL</option>
        <option value="GAP_FREE">GAP-FREE</option>
        <option value="HAS_GAPS">HAS GAPS</option>
        <option value="NO_REACTIVE">NO REACTIVE</option>
        <option value="NO_TEAM_RECOVERY">NO TEAM RECOVERY</option>
        <option value="NO_LOW_ENERGY_ACTION">NO LOW ENERGY</option>
        <option value="STAGE_GAP">STAGE GAP</option>
      </select></label>
      <label><span>{language === 'zh' ? '排序' : 'SORT'}</span><select data-testid="challenge-route-sort" value={filters.sort} onChange={(event) => onFiltersChange({ ...filters, sort: event.target.value as BossChallengeRouteSort })}>
        <option value="ID_ASC">ID ↑</option>
        <option value="SEVERITY_DESC">SEVERITY ↓</option>
        <option value="BEST_DESC">BEST SCORE ↓</option>
        <option value="BEST_ASC">BEST SCORE ↑</option>
        <option value="AUDIT_HARDEST">AUDIT HARDEST</option>
        <option value="DRAFTED_FIRST">DRAFTED FIRST</option>
        <option value="READINESS">READINESS</option>
      </select></label>
      <strong data-testid="challenge-route-count">{items.length}/{bosses.length}</strong>
      <button type="button" data-testid="challenge-route-reset" onClick={resetFilters}>{language === 'zh' ? '重設' : 'RESET'}</button>
    </section>
    {selectedItem ? <>
      <label className="boss-challenge-selector">{language === 'zh' ? '風險事件' : 'Risk event'}
        <select data-testid="challenge-boss" value={selectedItem.boss.id} onChange={(event) => onSelectBoss(event.target.value)}>
          {items.map((item) => <option key={item.boss.id} value={item.boss.id}>{item.boss.id} · {item.boss.severity} · {item.boss.class} · {bossName(item.boss, language)} · {challengeRouteStatusLabel(item, language)} · {challengeRouteReadinessLabel(item)}</option>)}
        </select>
      </label>
      <div className={`boss-challenge-audit ${selectedItem.audit.pressure}${selectedItem.hardOutlier ? ' hard-outlier' : ''}`} data-testid="challenge-audit-selected">
        <span>DETERMINISTIC AUDIT</span>
        <b>{pressureLabel} · {selectedItem.audit.score}</b>
        <small>{selectedItem.audit.successfulCandidateTeams}/{selectedItem.audit.candidateTeamsEvaluated} TEAMS · {selectedItem.audit.candidateCompletionRate}% · R{selectedItem.audit.round}</small>
        <em>{selectedItem.hardOutlier ? (language === 'zh' ? 'HARD OUTLIER · 低分但可通關' : 'HARD OUTLIER · CLEARABLE') : '100/100 GATE PASS'}</em>
      </div>
      <section className={`boss-challenge-route-draft ${draftSummary ? 'drafted' : 'undrafted'}`} data-testid="challenge-route-draft-summary">
        <div>
          <span data-testid="challenge-draft-verification-before-ids">{verificationBaseline
            ? `BEFORE · ${verificationBaseline.teamIds.join(' / ')}`
            : `${verification ? 'VERIFICATION INPUT · ' : ''}SQUAD DRAFT · ${draftSummary ? 'DRAFTED' : 'UNDRAFTED'}`}</span>
          <b data-testid="challenge-route-draft-ids">{draftSummary ? draftSummary.teamIds.join(' / ') : (language === 'zh' ? '尚未建立規劃隊伍' : 'No planned squad')}</b>
        </div>
        {draftSummary ? <>
          <small data-testid="challenge-route-draft-counter">COUNTER <b>{draftSummary.counterCount}/3</b></small>
          <small data-testid="challenge-route-draft-stage">STAGE <b>{draftSummary.coveredStageCount}/6</b></small>
          <em data-testid="challenge-route-draft-gaps">{repairEvidence && !verificationComparison
            ? `PRIORITY ${strategyGapLabel(repairEvidence.priorityGap, language)} · TOP ${repairEvidence.replacementCharacterId} → ${repairEvidence.replacedCharacterId}`
            : draftSummary.gaps.length === 0 ? 'NO STRUCTURAL GAP' : draftSummary.gaps.map((gap) => strategyGapLabel(gap, language)).join(' · ')}</em>
          <div className={`boss-challenge-draft-verification ${verificationComparison ? verificationComparison.after.success ? 'clear' : 'failed' : verification?.success ? 'clear' : verification ? 'failed' : 'idle'}`} data-testid="challenge-draft-verification">
            <span>DRAFT VERIFY · RUNTIME ONLY</span>
            <b data-testid="challenge-draft-verification-status">{verificationComparison
              ? verificationComparison.outcome === 'CLEARED_AFTER_REPAIR' ? 'REPAIR CLEAR' : verificationComparison.outcome === 'STILL_FAILED' ? 'STILL FAILED' : verificationComparison.outcome.replaceAll('_', ' ')
              : verificationBaseline ? 'RE-VERIFY REQUIRED'
              : verification ? `VERIFIED ${verification.status}` : 'UNVERIFIED'}</b>
            <small data-testid="challenge-draft-verification-result">{verificationComparison
              ? `${verificationComparison.before.score}→${verificationComparison.after.score} · Δ${signedNumber(verificationComparison.scoreDelta)} · R${verificationComparison.before.round}→${verificationComparison.after.round}`
              : verificationBaseline ? `${verificationBaseline.status} ${verificationBaseline.score} · R${verificationBaseline.round} → CURRENT`
              : verification ? `${verification.grade} · ${verification.score} · R${verification.round}/${verification.roundLimit}` : 'NO LOCAL RESULT'}</small>
          </div>
          <button type="button" data-testid="challenge-run-draft-verification" onClick={onVerifyDraft}>{verificationBaseline && !verification ? 'RE-VERIFY' : verification ? 'RUN AGAIN' : 'RUN VERIFY'}</button>
          <button type="button" data-testid="challenge-resume-draft" onClick={() => onResumeDraft(draftSummary.teamIds)}>{draftSummary.teamIds.every((id, index) => id === currentTeamIds[index]) ? (language === 'zh' ? '重新載入 DRAFT' : 'RELOAD DRAFT') : (language === 'zh' ? '繼續規劃' : 'RESUME DRAFT')}</button>
        </> : <>
          <em data-testid="challenge-audit-seed-ids">AUDIT VERIFIED · {selectedItem.audit.recommendedTeamIds.join(' / ')}</em>
          <button type="button" data-testid="challenge-seed-audit-draft" onClick={onSeedDraft}>{language === 'zh' ? '採用 AUDIT 隊伍' : 'USE AUDIT SQUAD'}</button>
        </>}
      </section>
      {(repairPreview || canUndoRepair || verificationComparison?.outcome === 'STILL_FAILED') && <BossChallengeRouteRepair
        preview={repairPreview}
        verification={verification}
        language={language}
        canUndo={canUndoRepair}
        onApply={onApplyRepair}
        onUndo={onUndoRepair}
        verificationComparison={verificationComparison}
        escalation={repairEscalation}
        settlementPreview={settlementPreview}
        settlement={settlement}
        onEvaluateEscalation={onEvaluateEscalation}
        onApplyEscalation={onApplyEscalation}
        onConfirmSettlement={onConfirmSettlement}
        onCancelSettlement={onCancelSettlement}
      />}
    </> : <div className="boss-challenge-route-empty" data-testid="challenge-route-empty">
      <b>{language === 'zh' ? '沒有符合條件的 Boss' : 'No matching Boss'}</b>
      <button type="button" onClick={resetFilters}>{language === 'zh' ? '清除篩選' : 'CLEAR FILTERS'}</button>
    </div>}
  </>;
}

function BossChallengeRouteRepair({
  preview,
  verification,
  language,
  canUndo,
  onApply,
  onUndo,
  verificationComparison,
  escalation,
  settlementPreview,
  settlement,
  onEvaluateEscalation,
  onApplyEscalation,
  onConfirmSettlement,
  onCancelSettlement,
}: {
  preview?: BossChallengeRouteRepairPreview;
  verification?: BossChallengeDraftVerification;
  language: Language;
  canUndo: boolean;
  onApply: (teamIds: [string, string, string]) => void;
  onUndo: () => void;
  verificationComparison?: BossChallengeDraftVerificationComparison;
  escalation?: BossChallengeRuntimeRepairEscalation;
  settlementPreview?: BossChallengeDraftSettlementPreview;
  settlement?: BossChallengeSettlement;
  onEvaluateEscalation: () => void;
  onApplyEscalation: (candidate: BossChallengeRuntimeRepairCandidate) => void;
  onConfirmSettlement: () => void;
  onCancelSettlement: () => void;
}) {
  const [selectedEscalationRank, setSelectedEscalationRank] = useState(1);
  const candidate = preview?.candidate;
  const showEscalation = !candidate && verificationComparison?.outcome === 'STILL_FAILED';
  const showSettlement = Boolean(settlementPreview && verificationComparison?.after.success);
  const bestEscalationCandidate = escalation?.candidates[0];
  const defaultEscalationCandidate = verification && escalation
    ? selectDefaultBossChallengeRuntimeRepairCandidate(verification, escalation.candidates)
    : bestEscalationCandidate;
  const selectedEscalationCandidate = escalation?.candidates.find((item) => item.rank === selectedEscalationRank) ?? defaultEscalationCandidate;
  const selectedEscalationPreview = verification && selectedEscalationCandidate
    ? createBossChallengeRuntimeRepairSelectionPreview(verification, selectedEscalationCandidate)
    : undefined;
  const escalationSelectionKey = escalation
    ? `${escalation.bossId}|${escalation.sourceTeamIds.join('|')}|${escalation.excludedTeamIds?.join('|') ?? ''}`
    : '';
  useEffect(() => {
    setSelectedEscalationRank(defaultEscalationCandidate?.rank ?? 1);
  }, [escalationSelectionKey, defaultEscalationCandidate?.rank]);
  return <section className={`boss-challenge-route-repair ${candidate ? 'candidate' : 'applied'}${showEscalation ? ' escalation' : ''}${showSettlement ? settlement ? ' settlement-confirmed' : ' settlement-pending' : ''}`} data-testid="challenge-route-repair">
    <div>
      <span>{showSettlement
        ? settlement ? 'CLEAR REPAIR · LOCAL BEST CONFIRMED' : 'CLEAR REPAIR SETTLEMENT · CONFIRM REQUIRED'
        : showEscalation ? 'RUNTIME REPAIR ESCALATION · ON DEMAND' : 'TOP STRUCTURAL REPAIR · NOT AUDIT VERIFIED'}</span>
      <b data-testid="challenge-route-repair-target">{showSettlement && settlementPreview
        ? settlement
          ? `LOCAL BEST ${settlement.best.grade} · ${settlement.best.bestScore} · R${settlement.best.roundsUsed} · ${challengeRecordSourceLabel(settlement.best.source, language)}`
          : `${settlementPreview.grade} · ${settlementPreview.score} · R${settlementPreview.round} · BEST ${settlementPreview.previousBestScore ?? 'NONE'}→${settlementPreview.projectedBestScore}`
        : showEscalation
        ? escalation
          ? selectedEscalationPreview
            ? `${escalation.clearCandidates} CLEAR / ${escalation.evaluatedCandidates} EVALUATED · #${selectedEscalationCandidate?.rank} ${runtimeRepairVerdictLabel(selectedEscalationPreview)} · SCORE ${selectedEscalationPreview.currentVerification.score}→${selectedEscalationPreview.candidateVerification.score} (${signedNumber(selectedEscalationPreview.scoreDelta)}) · R${selectedEscalationPreview.currentVerification.round}→${selectedEscalationPreview.candidateVerification.round} (${signedNumber(selectedEscalationPreview.roundDelta)})`
            : `${escalation.clearCandidates} CLEAR / ${escalation.evaluatedCandidates} EVALUATED · NO CANDIDATE`
          : (language === 'zh' ? '結構修補後仍失敗；按需評估其餘單席候選' : 'Structural repair still failed; evaluate remaining one-slot candidates on demand')
        : preview
        ? `${strategyGapLabel(preview.gap, language)} → ${repairTargetLabel(preview.target, language)}`
        : (language === 'zh' ? '已套用修補；目前 draft 無可路由缺口' : 'Repair applied; current draft has no routable gap')}</b>
    </div>
    {showSettlement && settlementPreview && <small data-testid="challenge-draft-settlement-team">TEAM · {settlementPreview.teamIds.join(' / ')}<em>{settlement ? (settlement.isNewBest ? 'NEW LOCAL BEST SAVED' : 'ATTEMPT CHECKED · BEST HELD') : 'NO SAVE UNTIL CONFIRMED'}</em></small>}
    {candidate && <>
      <small data-testid="challenge-route-repair-member">{characterName(candidate.character, language)} · {candidate.character.id}<em>{language === 'zh' ? '取代' : 'REPLACES'} {characterName(candidate.replaces, language)}</em></small>
      <i data-testid="challenge-route-repair-gaps"><small>GAPS</small><b>{candidate.before.gaps.length}→{candidate.after.gaps.length}</b></i>
      <i data-testid="challenge-route-repair-counter"><small>COUNTER</small><b>{candidate.before.counter}→{candidate.after.counter}/3</b></i>
      <i data-testid="challenge-route-repair-stage"><small>STAGE</small><b>{candidate.before.stage}→{candidate.after.stage}/6</b></i>
      <button type="button" data-testid="challenge-route-apply-repair" onClick={() => onApply(candidate.teamIds)}>{language === 'zh' ? '套用最佳單席修補' : 'APPLY TOP REPAIR'}</button>
    </>}
    {showEscalation && !escalation && <button type="button" data-testid="challenge-evaluate-runtime-repairs" onClick={onEvaluateEscalation}>EVALUATE RUNTIME</button>}
    {showEscalation && selectedEscalationPreview && <small data-testid="challenge-runtime-repair-detail">SLOT {selectedEscalationPreview.slotIndex + 1} · {selectedEscalationPreview.replacedCharacterId}<em>→ {selectedEscalationPreview.replacementCharacterId}</em></small>}
    {showEscalation && escalation && <select data-testid="challenge-runtime-repair-candidates" value={selectedEscalationCandidate?.rank ?? 1} onChange={(event) => setSelectedEscalationRank(Number(event.target.value))}>
      {escalation.candidates.map((item) => {
        const itemPreview = verification ? createBossChallengeRuntimeRepairSelectionPreview(verification, item) : undefined;
        return <option key={item.teamIds.join('|')} value={item.rank}>#{item.rank} · {item.replacementCharacterId} · {itemPreview ? runtimeRepairVerdictLabel(itemPreview) : item.verification.status} · {item.verification.score} ({itemPreview ? signedNumber(itemPreview.scoreDelta) : '—'}) R{item.verification.round}</option>;
      })}
    </select>}
    {showEscalation && selectedEscalationCandidate && <button type="button" data-testid="challenge-apply-runtime-repair" onClick={() => onApplyEscalation(selectedEscalationCandidate)}>APPLY #{selectedEscalationCandidate.rank} · {selectedEscalationPreview ? runtimeRepairVerdictLabel(selectedEscalationPreview) : selectedEscalationCandidate.verification.status}</button>}
    {showSettlement && settlementPreview && !settlement && <button type="button" data-testid="challenge-confirm-draft-settlement" onClick={onConfirmSettlement}>{settlementPreview.projectedIsNewBest ? 'CONFIRM LOCAL BEST' : 'CONFIRM ATTEMPT'}</button>}
    {showSettlement && settlementPreview && !settlement && <button type="button" data-testid="challenge-cancel-draft-settlement" onClick={onCancelSettlement}>{language === 'zh' ? '取消並復原' : 'CANCEL & RESTORE'}</button>}
    {canUndo && !showSettlement && <button type="button" data-testid="challenge-route-undo-repair" onClick={onUndo}>{language === 'zh' ? '復原上一隊' : 'UNDO REPAIR'}</button>}
    {showSettlement && settlementPreview && <strong data-testid="challenge-draft-settlement-provenance">{settlementPreview.provenance} · {settlement ? `SAVED TO ${BOSS_CHALLENGE_STORAGE_KEY} · ${challengeRecordSourceLabel(settlement.best.source, language)}` : 'CAMPAIGN ISOLATED'}</strong>}
    {showEscalation && escalation && <strong data-testid="challenge-runtime-repair-provenance">{escalation.provenance} · COUNTER {selectedEscalationPreview?.counterCount ?? 0}/3 · STAGE {selectedEscalationPreview?.coveredStageCount ?? 0}/6 · GAPS {selectedEscalationPreview?.remainingStructuralGaps ?? '—'} · TOP {escalation.shortlistedCandidates}</strong>}
    {preview && <strong>{preview.eligibleCandidateCount} CREW / {preview.evaluatedSwapCount} SWAPS</strong>}
  </section>;
}

function runtimeRepairVerdictLabel(preview: BossChallengeRuntimeRepairSelectionPreview): string {
  if (preview.verdict === 'IMPROVED_FAILED') return 'IMPROVED FAILED';
  if (preview.verdict === 'NO_IMPROVEMENT') return 'NO IMPROVEMENT';
  return 'CLEAR';
}

function repairTargetLabel(target: BossChallengeRepairTarget, language: Language): string {
  if (target === 'STAGE_COVERAGE') return language === 'zh' ? '六階段涵蓋' : 'STAGE COVERAGE';
  return crewCapabilityLabel(target, language);
}

function challengeRouteStatusLabel(item: BossChallengeRouteItem, language: Language): string {
  if (item.status === 'UNATTEMPTED') return language === 'zh' ? '未挑戰' : 'NEW';
  if (item.status === 'FAILED') return language === 'zh' ? `未通關 ${item.record?.bestScore ?? 0}` : `FAILED ${item.record?.bestScore ?? 0}`;
  return `${item.record?.grade ?? '-'} · ${item.record?.bestScore ?? 0} BEST`;
}

function challengeRouteReadinessLabel(item: BossChallengeRouteItem): string {
  if (item.readiness === 'GAP_FREE') return 'GAP-FREE';
  if (item.readiness === 'HAS_GAPS') return `HAS GAPS ${item.draftSummary?.gaps.length ?? 0}`;
  return 'UNDRAFTED';
}

function challengePressureLabel(pressure: BossChallengeRouteItem['audit']['pressure'], language: Language): string {
  if (language === 'en') return pressure.toUpperCase();
  return { comfortable: '寬裕', tight: '緊繃', critical: '臨界', failed: '失敗' }[pressure];
}

function signedNumber(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function BossChallengeBriefing({
  challenge,
  bosses,
  selectedBoss,
  portfolio,
  repairQueue,
  repairQueueSessionCount,
  language,
  onNextRepair,
}: {
  challenge: BossChallengeProgress;
  bosses: BossData[];
  selectedBoss?: BossData;
  portfolio: BossChallengeDraftPortfolio;
  repairQueue: BossChallengeRepairQueue;
  repairQueueSessionCount: number;
  language: Language;
  onNextRepair: () => void;
}) {
  const summary = bossChallengeSummary(challenge, bosses);
  const sourceSummary = bossChallengeSourceSummary(challenge, bosses);
  const selectedBest = selectedBoss ? challenge.bestByBossId[selectedBoss.id] : undefined;
  const selectedDraft = selectedBoss ? challenge.draftByBossId[selectedBoss.id] : undefined;
  return (
    <section className="boss-challenge-briefing" data-testid="boss-challenge-briefing">
      <header>
        <div><span>BOSS CHALLENGE</span><b>{language === 'zh' ? '公平條件 · 各 Boss 獨立最佳分' : 'Fair conditions · Per-boss local best'}</b></div>
        <strong>{summary.completedBosses}/{summary.totalBosses}</strong>
      </header>
      <div className="boss-challenge-summary" data-testid="challenge-summary">
        <span><small>{language === 'zh' ? '已挑戰' : 'ATTEMPTED'}</small><b>{summary.attemptedBosses}</b></span>
        <span><small>{language === 'zh' ? '已完成' : 'CLEARED'}</small><b>{summary.completedBosses}</b></span>
        <span><small>{language === 'zh' ? '平均最佳' : 'AVG BEST'}</small><b>{summary.averageBestScore}</b></span>
        <span><small>S GRADE</small><b>{summary.sGradeBosses}</b></span>
        <span><small>OPERATION</small><b data-testid="challenge-source-operation">{sourceSummary.operationRecords}/{sourceSummary.operationCompleted}</b></span>
        <span><small>DRAFT CONFIRM</small><b data-testid="challenge-source-draft-confirmation">{sourceSummary.draftConfirmationRecords}/{sourceSummary.draftConfirmationCompleted}</b></span>
      </div>
      <div className="boss-challenge-rules">
        <span><b>MASTERY L3</b><small>{BOSS_CHALLENGE_MASTERY_XP} XP</small></span>
        <span><b>{BOSS_CHALLENGE_ROUND_LIMIT} ROUNDS</b><small>{language === 'zh' ? '固定上限' : 'Fixed limit'}</small></span>
        <span><b>FIXED L1</b><small>{BOSS_CHALLENGE_EQUIPMENT_ID} · {BOSS_CHALLENGE_SPARE_ID} · {BOSS_CHALLENGE_VESSEL_ID} · GRD RESERVE</small></span>
        <span><b>ISOLATED SAVE</b><small>{BOSS_CHALLENGE_STORAGE_KEY}</small></span>
      </div>
      <div className="boss-challenge-portfolio" data-testid="challenge-draft-portfolio">
        <span><small>DRAFTED</small><b data-testid="challenge-portfolio-drafted">{portfolio.draftedBosses}/{portfolio.totalBosses}</b></span>
        <span><small>GAP-FREE</small><b data-testid="challenge-portfolio-gap-free">{portfolio.gapFreeDrafts}</b></span>
        <span><small>HAS GAPS</small><b data-testid="challenge-portfolio-has-gaps">{portfolio.draftsWithGaps}</b></span>
        <div className="boss-challenge-repair-queue" data-testid="challenge-repair-queue">
          <span><small>REPAIR QUEUE</small><b data-testid="challenge-repair-queue-position">{repairQueue.currentPosition > 0 ? repairQueue.currentPosition : '—'}/{repairQueue.remainingDrafts}</b></span>
          <span><small>R / F / E / S</small><b data-testid="challenge-repair-queue-gaps">{repairQueue.gapCounts.NO_REACTIVE}/{repairQueue.gapCounts.NO_TEAM_RECOVERY}/{repairQueue.gapCounts.NO_LOW_ENERGY_ACTION}/{repairQueue.gapCounts.STAGE_GAP}</b></span>
          <span><small>SESSION</small><b data-testid="challenge-repair-queue-session">{repairQueueSessionCount}</b></span>
          <em>{language === 'zh' ? '手動確認 · 不自動套用' : 'MANUAL CONFIRM · NO AUTO APPLY'}</em>
          <button type="button" data-testid="challenge-repair-queue-next" disabled={!repairQueue.nextBossId} onClick={onNextRepair}>{repairQueue.nextBossId ? `NEXT · ${repairQueue.nextBossId}` : repairQueue.remainingDrafts === 0 ? 'QUEUE CLEAR' : 'CURRENT ONLY'}</button>
        </div>
      </div>
      {selectedBoss && <div className="boss-challenge-selected" data-testid="challenge-selected-best">
        <span>{selectedBoss.id} · {bossName(selectedBoss, language)}</span>
        {selectedBest
          ? <b>{selectedBest.grade} · {selectedBest.bestScore} BEST · R{selectedBest.roundsUsed}<i data-testid="challenge-selected-best-source"> · {challengeRecordSourceLabel(selectedBest.source, language)}</i></b>
          : <b>{language === 'zh' ? '尚無紀錄' : 'NO RECORD'}</b>}
        <em data-testid="challenge-draft-status">{selectedDraft ? `DRAFT SAVED · ${selectedDraft.teamIds.join(' / ')}` : `DRAFT DEFAULT · ${INITIAL_TEAM.join(' / ')}`}</em>
      </div>}
    </section>
  );
}

function CrewRotationAdvisor({
  recommendation,
  language,
  onApply,
  compact = false,
}: {
  recommendation: CrewRotationRecommendation;
  language: Language;
  onApply: () => void;
  compact?: boolean;
}) {
  const score = recommendation.score;
  const current = recommendation.currentScore;
  const bandLabel = (band: keyof typeof FATIGUE_ZH) => language === 'zh' ? FATIGUE_ZH[band] : band;
  return <section className={`crew-rotation-advisor${compact ? ' compact' : ''}`} data-testid={compact ? 'forecast-rotation-advisor' : 'crew-rotation-advisor'}>
    <header>
      <div><span>CREW ROTATION ADVISOR</span><b>{recommendation.changesRecommended ? (language === 'zh' ? `建議輪調 ${recommendation.changedSlots} 個席位` : `Rotate ${recommendation.changedSlots} slots`) : (language === 'zh' ? '目前隊伍已是最佳建議' : 'Current crew is recommended')}</b></div>
      <button data-testid={compact ? 'apply-forecast-rotation' : 'apply-crew-rotation'} disabled={!recommendation.changesRecommended} onClick={onApply}>{recommendation.changesRecommended ? (language === 'zh' ? '套用建議' : 'Apply') : '✓ OPTIMAL'}</button>
    </header>
    <div className="crew-rotation-score">
      <span><small>MASTERY</small><b className={score.masteryReady ? 'pass' : 'fail'}>{score.qualifiedMembers}/{score.requiredQualifiedMembers}</b></span>
      <span><small>{language === 'zh' ? '階段涵蓋' : 'COVERAGE'}</small><b>{score.stageCoverage}/6</b></span>
      <span><small>COUNTER</small><b>{score.counterCoverage}/3</b></span>
      <span><small>{language === 'zh' ? '臨界+' : 'CRITICAL+'}</small><b>{current.projectedCriticalOrWorseCount}→{score.projectedCriticalOrWorseCount}</b></span>
      <span><small>{language === 'zh' ? '耗竭' : 'EXHAUSTED'}</small><b>{current.projectedExhaustedCount}→{score.projectedExhaustedCount}</b></span>
    </div>
    <div className="crew-rotation-members">
      {recommendation.candidates.map((candidate, index) => <article key={candidate.character.id} className={`band-${candidate.forecast.roundLimitBand.toLowerCase()}`} data-testid={`rotation-candidate-${index}`}>
        <span><small>0{index + 1} · {candidate.character.factionCode} · M{candidate.masteryLevel}</small><b>{characterName(candidate.character, language)}</b></span>
        <i><small>{language === 'zh' ? '目前' : 'NOW'}</small><b>{candidate.forecast.before}</b></i>
        <i><small>LIMIT</small><b>{candidate.forecast.afterRoundLimit}</b><em>{bandLabel(candidate.forecast.roundLimitBand)}</em></i>
      </article>)}
    </div>
    {!compact && <p>{language === 'zh'
      ? `優先順序：Mastery gate → 回合上限 readiness → 六階段涵蓋 → Boss counter → 熟練度／保留成員。完整搜尋 ${recommendation.candidateCount} 名已解鎖且可出勤角色；數值為 gameplay abstraction。`
      : `Priority: Mastery gate → round-limit readiness → stage coverage → Boss counter → mastery/retention. Searches all ${recommendation.candidateCount} unlocked, deployable crew; values are gameplay abstractions.`}</p>}
  </section>;
}

function DispatchForecastPanel({
  forecast,
  rotationRecommendation,
  database,
  team,
  mission,
  vessel,
  language,
  onApplyRotation,
}: {
  forecast: DispatchForecast;
  rotationRecommendation: CrewRotationRecommendation;
  database: GameDatabase;
  team: CharacterData[];
  mission: MissionData;
  vessel: VesselData;
  language: Language;
  onApplyRotation: () => void;
}) {
  const characterById = new Map(team.map((character) => [character.id, character]));
  const bandLabel = (band: keyof typeof FATIGUE_ZH) => language === 'zh' ? FATIGUE_ZH[band] : band;
  const maintenance = forecast.maintenance;
  return (
    <section className="dispatch-forecast" data-testid="dispatch-forecast">
      <header className="dispatch-forecast-heading">
        <div><span>CAMPAIGN DISPATCH FORECAST</span><b>{language === 'zh' ? mission.titleZh : mission.titleEn}</b><small>{mission.operationProfile.siteCode} · {vessel.class}</small></div>
        <div className="dispatch-forecast-metrics">
          <span><small>{language === 'zh' ? '回合上限' : 'ROUND LIMIT'}</small><b>{forecast.roundLimit}</b></span>
          <span><small>BRANCH EVENTS</small><b>{forecast.branchEventCount}</b></span>
          <span><small>{language === 'zh' ? '返航恢復' : 'TRANSIT RECOVERY'}</small><b>-{forecast.crew[0]?.transitRecovery ?? 0} F</b></span>
        </div>
      </header>
      {forecast.fleetCondition && <div className={`forecast-fleet-condition ${forecast.fleetCondition.modifier.pressure.toLowerCase()}`} data-testid="forecast-fleet-condition">
        <span><small>FLEET CONDITION</small><b>{forecast.fleetCondition.modifier.turbineId.replace('WTG-OWM-', 'WTG-')} · {forecast.fleetCondition.modifier.pressure}</b></span>
        <span><small>SOURCE</small><b>{forecast.fleetCondition.modifier.availability} · R{forecast.fleetCondition.modifier.sourceReliability} · B{forecast.fleetCondition.modifier.openFaults}</b></span>
        <span><small>COST</small><b>+{forecast.fleetCondition.mobilizationCostBefore}→+{forecast.fleetCondition.mobilizationCostAfter}</b></span>
        <span><small>SAFETY</small><b>{forecast.fleetCondition.safetyBefore}→{forecast.fleetCondition.safetyAfter}</b></span>
        <span><small>RELIABILITY</small><b>{forecast.fleetCondition.reliabilityBefore}→{forecast.fleetCondition.reliabilityAfter}</b></span>
        <em>Gameplay abstraction</em>
      </div>}
      <div className="dispatch-forecast-grid">
        <article className="forecast-card forecast-equipment" data-testid="forecast-equipment">
          <div className="forecast-card-heading"><span>EQUIPMENT CONDITION</span><b>{language === 'zh' ? '成功／失敗' : 'Success / failure'}</b></div>
          {forecast.equipment.map((entry) => {
            const item = database.equipmentById.get(entry.equipmentId)!;
            return <div className="forecast-equipment-row" key={entry.slot}>
              <span><small>{entry.slot.toUpperCase()} · {item.tier}</small><b>{equipmentName(item, language)}</b></span>
              <i><small>{language === 'zh' ? '目前' : 'NOW'}</small><b>{entry.before}%</b></i>
              <i className="success"><small>{language === 'zh' ? '成功' : 'WIN'}</small><b>{entry.afterSuccess}%</b><em>-{entry.successWear}</em></i>
              <i className="failure"><small>{language === 'zh' ? '失敗' : 'FAIL'}</small><b>{entry.afterFailure}%</b><em>-{entry.failureWear}</em></i>
            </div>;
          })}
        </article>

        <article className="forecast-card forecast-maintenance" data-testid="forecast-maintenance">
          <div className="forecast-card-heading"><span>MAINTENANCE CREDITS</span><b>{maintenance.current} MNT</b></div>
          <div className="forecast-outcomes">
            <div className="success"><span>{language === 'zh' ? '任務成功' : 'SUCCESS'}</span><b>+{maintenance.successRewardMin}–{maintenance.successRewardMax}</b><small>{language === 'zh' ? `任務後修滿 -${maintenance.successRepairCost}` : `Full repair -${maintenance.successRepairCost}`}</small><strong>{maintenance.afterSuccessFullRepairMin}–{maintenance.afterSuccessFullRepairMax} MNT</strong></div>
            <div className="failure"><span>{language === 'zh' ? '任務失敗' : 'FAILURE'}</span><b>+{maintenance.failureReward}</b><small>{language === 'zh' ? `任務後修滿 -${maintenance.failureRepairCost}` : `Full repair -${maintenance.failureRepairCost}`}</small><strong>{maintenance.afterFailureFullRepair} MNT</strong></div>
          </div>
        </article>

        <article className="forecast-card forecast-crew" data-testid="forecast-crew">
          <div className="forecast-card-heading"><span>CREW FATIGUE ENVELOPE</span><b>{language === 'zh' ? '1 回合 baseline → 回合上限' : '1-round baseline → round limit'}</b></div>
          <div className="forecast-crew-grid">
            {forecast.crew.map((entry, index) => {
              const character = characterById.get(entry.characterId)!;
              return <div key={`${index}-${entry.characterId}`} className={`band-${entry.roundLimitBand.toLowerCase()}`} data-testid={`forecast-crew-${index}`}>
                <span><small>0{index + 1} · {character.factionCode}</small><b>{characterName(character, language)}</b></span>
                <i><small>{language === 'zh' ? '目前' : 'NOW'}</small><b>{entry.before}/{entry.fatigueMax}</b></i>
                <i><small>{language === 'zh' ? '每回合' : 'PER ROUND'}</small><b>+{entry.perRoundDamage}</b></i>
                <i className="one-round"><small>1R + {language === 'zh' ? '返航' : 'TRANSIT'}</small><b>{entry.afterOneRound}</b><em>{bandLabel(entry.oneRoundBand)}</em></i>
                <i className="round-limit"><small>{forecast.roundLimit}R + {language === 'zh' ? '返航' : 'TRANSIT'}</small><b>{entry.afterRoundLimit}</b><em>{bandLabel(entry.roundLimitBand)}</em></i>
              </div>;
            })}
          </div>
        </article>

        <article className="forecast-card forecast-rst" data-testid="forecast-rst">
          <div className="forecast-card-heading"><span>REST TOKEN</span><b>{forecast.recoveryTokens.current} → {forecast.recoveryTokens.after} RST</b></div>
          <div className="forecast-rst-flow"><span>{forecast.recoveryTokens.current}<small>{language === 'zh' ? '目前' : 'Current'}</small></span><i>+</i><span className="earned">{forecast.recoveryTokens.earned}<small>{vessel.class} {language === 'zh' ? '任務取得' : 'reward'}</small></span><i>=</i><span>{forecast.recoveryTokens.after}<small>{language === 'zh' ? '任務後' : 'After mission'}</small></span></div>
        </article>
      </div>
      <CrewRotationAdvisor recommendation={rotationRecommendation} language={language} onApply={onApplyRotation} compact />
      <p className="dispatch-forecast-disclaimer">{language === 'zh'
        ? 'Gameplay forecast — Condition／MNT／RST 使用正式結算公式；Crew 顯示不含主動技能疲勞、Support、RiskShield、branch 選擇與中途換班的 baseline envelope，不是現場人因或維護數據。'
        : 'Gameplay forecast — Condition, MNT, and RST reuse settlement formulas. Crew is a baseline envelope excluding skill fatigue, Support, RiskShield, branch choices, and crew swaps; it is not field human-factors or maintenance data.'}</p>
    </section>
  );
}

function SceneRouteSummary({
  route,
  language,
  testId,
}: {
  route: SceneRoute;
  language: Language;
  testId: string;
}) {
  return (
    <section className={`scene-route-summary ${route.availability.toLowerCase()}`} data-testid={testId}>
      <div><span>MISSION SCENE ROUTING</span><b>{route.requestedScene.id} · {sceneRouteName(route, language)}</b></div>
      <strong>{route.availability}</strong>
      <small>{language === 'zh' ? route.requestedScene.locationType : route.requestedScene.camera} · {route.requestedScene.variant} · {route.requestedScene.mood}</small>
      <em>{sceneRouteProvenance(route, language)} · {route.qaStatus}</em>
    </section>
  );
}

function FleetTurbineIcon({
  turbineId,
  availability,
}: {
  turbineId: string;
  availability: TurbineAvailability;
}) {
  const geometry = fleetTurbineIconGeometry();
  const hub = geometry.hub;
  const bladeLength = geometry.bladeLength;
  const hubRadius = geometry.hubRadius;
  const bladePolygons = THREE_BLADE_ANGLES.map((angle) => turbineBladePolygon(angle, bladeLength, hubRadius)
    .map((point) => `${(hub.x + point.x).toFixed(1)},${(hub.y + point.y).toFixed(1)}`)
    .join(' '));
  const nacelleStartX = hub.x + hubRadius * 0.65;
  const nacelleEndX = nacelleStartX + geometry.nacelleLength;
  return (
    <svg
      className={`fleet-turbine-icon ${availability.toLowerCase()}`}
      data-testid={`fleet-turbine-icon-${turbineId}`}
      data-blade-count={THREE_BLADE_ANGLES.length}
      data-shaft-locked="true"
      data-rotor-axis-consistent="true"
      data-hub-cx={hub.x}
      data-hub-cy={hub.y}
      data-shaft-start-x={hub.x}
      data-shaft-start-y={hub.y}
      data-shaft-end-x={geometry.shaftEnd.x}
      data-shaft-end-y={geometry.shaftEnd.y}
      data-tower-center-x={hub.x}
      data-nacelle-axis-y={hub.y}
      data-nacelle="true"
      data-tower="true"
      data-rotor-transform-origin={`${hub.x} ${hub.y}`}
      data-icon-revision="offshore-svg-v002"
      data-foundation="monopile-transition-platform"
      data-access-platform="true"
      data-hub-shaft-tower-axis-lock="true"
      viewBox={`0 0 ${geometry.viewBoxWidth} ${geometry.viewBoxHeight}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle className="fleet-turbine-axis-ring" cx={hub.x} cy={hub.y} r={bladeLength + 1.2} />
      <path className="fleet-turbine-sea-line" d={`M ${hub.x - 31} ${geometry.platformY + 5.8} C ${hub.x - 18} ${geometry.platformY + 3.4}, ${hub.x - 6} ${geometry.platformY + 7.6}, ${hub.x + 7} ${geometry.platformY + 5.2} S ${hub.x + 31} ${geometry.platformY + 5.6}, ${hub.x + 41} ${geometry.platformY + 4.1}`} />
      <path className="fleet-turbine-foundation" d={`M ${hub.x - 6.4} ${geometry.towerBaseY} L ${hub.x - 9.4} ${geometry.platformY + 7.2} M ${hub.x + 6.4} ${geometry.towerBaseY} L ${hub.x + 9.4} ${geometry.platformY + 7.2} M ${hub.x - 14} ${geometry.platformY + 1.8} H ${hub.x + 14}`} />
      <path className="fleet-turbine-tower" d={`M ${hub.x - geometry.towerTopWidth / 2} ${geometry.towerTopY} L ${hub.x - geometry.towerBaseWidth / 2} ${geometry.towerBaseY} L ${hub.x + geometry.towerBaseWidth / 2} ${geometry.towerBaseY} L ${hub.x + geometry.towerTopWidth / 2} ${geometry.towerTopY} Z`} />
      <line className="fleet-turbine-tower-highlight" x1={hub.x} y1={geometry.towerTopY + 1.6} x2={hub.x} y2={geometry.towerBaseY - 2.4} />
      <path className="fleet-turbine-platform" d={`M ${hub.x - 15} ${geometry.platformY} H ${hub.x + 15} M ${hub.x - 10.5} ${geometry.platformY + 3.8} H ${hub.x + 10.5}`} />
      <path className="fleet-turbine-access-rail" d={`M ${hub.x - 17} ${geometry.platformY - 3.4} H ${hub.x + 17} M ${hub.x - 13} ${geometry.platformY - 3.4} V ${geometry.platformY} M ${hub.x + 13} ${geometry.platformY - 3.4} V ${geometry.platformY}`} />
      <path className="fleet-turbine-nacelle" d={`M ${nacelleStartX} ${hub.y - geometry.nacelleHeight / 2} H ${nacelleEndX} Q ${nacelleEndX + 4.8} ${hub.y} ${nacelleEndX} ${hub.y + geometry.nacelleHeight / 2} H ${nacelleStartX} Z`} />
      <path className="fleet-turbine-nacelle-highlight" d={`M ${nacelleStartX + 3.8} ${hub.y - geometry.nacelleHeight / 2 + 2.2} H ${nacelleEndX - 2.4}`} />
      <line className="fleet-turbine-shaft" x1={hub.x} y1={hub.y} x2={geometry.shaftEnd.x} y2={geometry.shaftEnd.y} />
      <g
        className="fleet-turbine-rotor"
        data-rotor-origin={`${hub.x} ${hub.y}`}
        data-rotor-axis-lock="hub-shaft-tower"
        style={{
          '--rotor-origin-x': `${hub.x}px`,
          '--rotor-origin-y': `${hub.y}px`,
        } as React.CSSProperties}
      >
        {bladePolygons.map((points, index) => <polygon key={`${turbineId}-blade-${index}`} points={points} />)}
      </g>
      <circle className="fleet-turbine-hub" cx={hub.x} cy={hub.y} r={hubRadius} />
      <circle className="fleet-turbine-hub-core" cx={hub.x} cy={hub.y} r={hubRadius * 0.38} />
    </svg>
  );
}

function OperationReturnNoticePanel({
  mission,
  reason,
  selected,
  language,
  onSelect,
  onDismiss,
}: {
  mission: MissionData;
  reason: OperationReturnNotice['reason'];
  selected: boolean;
  language: Language;
  onSelect: () => void;
  onDismiss: () => void;
}) {
  return (
    <section
      className="operation-return-notice"
      data-testid="operation-return-notice"
      data-return-mission-id={mission.id}
      data-return-reason={reason}
      data-return-selected={selected}
      data-return-can-redeploy="false"
    >
      <div className="operation-return-copy">
        <span>{language === 'zh' ? '作業已返回 Route' : 'Operation returned to Route'}</span>
        <b>{mission.id} · {missionTitle(mission, language)}</b>
        <div className="operation-return-flags" data-testid="operation-return-flags">
          <i>{language === 'zh' ? '未結算' : 'NO SETTLEMENT'}</i>
          <i>{language === 'zh' ? '未寫存檔' : 'NO SAVE WRITE'}</i>
          <i>{language === 'zh' ? '僅回 Route' : 'ROUTE ONLY'}</i>
        </div>
        <small data-testid="operation-return-notice-status">
          {language === 'zh'
          ? '本次 sortie 未結算，未寫入任務結果、獎勵、最佳分數或 mission outcome history。'
          : 'This sortie was not settled; no mission result, reward, best score, or mission outcome history was written.'}
        </small>
      </div>
      <div className="operation-return-actions">
        <button
          type="button"
          data-testid="operation-return-route"
          data-return-action="select-route"
          data-target-mission-id={mission.id}
          data-target-selected={selected}
          onClick={onSelect}
        >
          {selected
            ? (language === 'zh' ? '同一任務已選取' : 'Same mission selected')
            : (language === 'zh' ? '選回中止任務' : 'Select aborted mission')}
        </button>
        <button
          type="button"
          data-testid="operation-return-dismiss"
          data-return-action="dismiss"
          data-target-mission-id={mission.id}
          onClick={onDismiss}
        >
          {language === 'zh' ? '清除提示' : 'Dismiss notice'}
        </button>
      </div>
    </section>
  );
}

function RouteReadinessCarryover({
  items,
  canDeploy,
  language,
  onOpenTab,
  onConfirmPlanning,
  onDeploy,
}: {
  items: Array<{
    key: string;
    label: string;
    detail: string;
    ready: boolean;
    tab: 'readiness' | 'crew' | 'loadout';
    action?: keyof OperationPlanningConfirmations;
  }>;
  canDeploy: boolean;
  language: Language;
  onOpenTab: (tab: 'readiness' | 'crew' | 'loadout') => void;
  onConfirmPlanning: (field: keyof OperationPlanningConfirmations) => void;
  onDeploy: () => void;
}) {
  const missingItems = items.filter((item) => !item.ready);
  const readyCount = items.length - missingItems.length;
  const nextItem = missingItems[0];
  const nextGapKey = nextItem?.key ?? 'READY';
  const nextGapAction = missingItems.length === 0
    ? 'deploy'
    : nextItem?.action
      ? `confirm-${nextItem.action}`
      : `open-${nextItem?.tab ?? 'readiness'}`;
  const nextGapTab = nextItem?.tab ?? 'operation';
  const nextGapReason = missingItems.length === 0
    ? 'Ready: deploy with existing campaign dispatch flow'
    : nextItem?.action
      ? `Resolve ${nextItem.label}: apply the required planning confirmation`
      : `Resolve ${nextItem?.label ?? 'readiness'}: open the ${nextGapTab} tab for manual review`;
  const handlePrimary = () => {
    if (missingItems.length === 0) {
      if (canDeploy) onDeploy();
      return;
    }
    if (nextItem?.action) {
      onConfirmPlanning(nextItem.action);
      return;
    }
    onOpenTab(nextItem?.tab ?? 'readiness');
  };
  const actionLabel = (item: { action?: keyof OperationPlanningConfirmations; tab: 'readiness' | 'crew' | 'loadout' }) => {
    if (item.action) return language === 'zh' ? '確認' : 'Confirm';
    if (item.tab === 'crew') return language === 'zh' ? '調整' : 'Fix';
    if (item.tab === 'loadout') return language === 'zh' ? '整備' : 'Fix';
    return language === 'zh' ? '查看' : 'Open';
  };

  return (
    <section className={`route-readiness-carryover ${missingItems.length === 0 ? 'ready' : 'blocked'}`} data-testid="route-readiness-carryover">
      <div className="route-readiness-summary">
        <span>{language === 'zh' ? '下一關整備提醒' : 'NEXT MISSION READINESS'}</span>
        <b>{readyCount}/{items.length} · {missingItems.length === 0 ? 'READY' : 'PENDING'}</b>
        <small>{missingItems.length === 0
          ? (language === 'zh' ? '可直接出勤；資料未寫入新存檔欄位。' : 'Ready to deploy; no new save fields.')
          : `${language === 'zh' ? '尚缺' : 'Pending'}：${missingItems.map((item) => item.label).join(' / ')}`}</small>
      </div>
      <div className="route-readiness-chips">
        {items.map((item) => (
          <div key={item.key} className={`route-readiness-chip ${item.ready ? 'ready' : 'blocked'}`} data-testid={`route-readiness-${item.key}`}>
            <button type="button" className="route-readiness-open" onClick={() => onOpenTab(item.tab)}>
              <span>{item.ready ? '✓' : '○'} {item.label}</span>
              <small>{item.detail}</small>
            </button>
            {!item.ready && <button
              type="button"
              className="route-readiness-shortcut"
              data-testid={`route-readiness-shortcut-${item.key}`}
              onClick={() => item.action ? onConfirmPlanning(item.action) : onOpenTab(item.tab)}
            >{actionLabel(item)}</button>}
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`route-readiness-primary ${missingItems.length === 0 ? 'deploy' : ''}`}
        data-testid="route-readiness-next-step"
        data-next-readiness-gap={nextGapKey}
        data-next-readiness-action={nextGapAction}
        data-next-readiness-tab={nextGapTab}
        data-next-readiness-reason={nextGapReason}
        disabled={missingItems.length === 0 && !canDeploy}
        onClick={handlePrimary}
      >
        <span>{missingItems.length === 0
          ? (language === 'zh' ? '\u90e8\u7f72\u4efb\u52d9' : 'Deploy now')
          : (language === 'zh' ? '\u8655\u7406\u4e0b\u4e00\u500b\u7f3a\u53e3' : 'Resolve next gap')}</span>
        <small data-testid="route-readiness-next-reason">{nextGapReason}</small>
      </button>
    </section>
  );
}

function CampaignMissionMap({
  database,
  campaign,
  selectedMissionId,
  language,
  focus = 'all',
  onSelect,
  onMaintainTurbine,
  onMaintainTurbinePlan,
}: {
  database: GameDatabase;
  campaign: CampaignProgress;
  selectedMissionId: string;
  language: Language;
  focus?: 'all' | 'fleet' | 'missions';
  onSelect: (missionId: string) => void;
  onMaintainTurbine: (turbineId: string) => TurbineMaintenanceSettlement | null;
  onMaintainTurbinePlan: (turbineIds: string[]) => FleetMaintenancePlanSettlement | null;
}) {
  const missions = [...database.missions].sort((a, b) => a.order - b.order);
  const chapters = [...new Set(missions.map((mission) => mission.chapter))];
  const completionSummary = campaignCompletionSummary(campaign, missions);

  return (
    <section className="campaign-map panel" data-testid="campaign-mission-map">
      <div className="campaign-map-heading" data-testid="campaign-progress">
        <div><span className="section-kicker">CAMPAIGN ROUTE</span><b>{language === 'zh' ? '離岸運維進階航線' : 'Offshore operations progression route'}</b></div>
        <div className="campaign-map-total"><strong>{campaign.completedMissionIds.length}/{missions.length}</strong><span>COMPLETE</span></div>
        <div className="campaign-map-xp"><strong>{campaign.totalXp}</strong><span>XP</span></div>
        <div className="campaign-map-legend" aria-label={language === 'zh' ? '任務狀態圖例' : 'Mission status legend'}>
          <span><i className="completed" />{language === 'zh' ? '完成' : 'Complete'}</span>
          <span><i className="available" />{language === 'zh' ? '可出勤' : 'Ready'}</span>
          <span><i className="locked" />{language === 'zh' ? '鎖定' : 'Locked'}</span>
        </div>
      </div>
      {focus !== 'missions' && <WindFarmOperationsBoard database={database} campaign={campaign} selectedMissionId={selectedMissionId} language={language} onMaintainTurbine={onMaintainTurbine} onMaintainTurbinePlan={onMaintainTurbinePlan} />}
      {focus !== 'fleet' && completionSummary.complete && <CampaignCompletionPanel summary={completionSummary} language={language} />}
      {focus !== 'fleet' && <div className="campaign-chapters">
        {chapters.map((chapter) => {
          const chapterMissions = missions.filter((mission) => mission.chapter === chapter);
          const completed = chapterMissions.filter((mission) => campaign.completedMissionIds.includes(mission.id)).length;
          return (
            <article key={chapter} className="campaign-chapter" data-testid={`mission-map-chapter-${chapter}`}>
              <header><div><span>CHAPTER {String(chapter).padStart(2, '0')}</span><b>{campaignChapterTitle(chapter, language)}</b></div><small>{completed}/{chapterMissions.length}</small></header>
              <div className="mission-path">
                {chapterMissions.map((mission) => {
                  const status = campaignMissionStatus(mission, campaign);
                  const selected = selectedMissionId === mission.id;
                  const boss = database.bossById.get(mission.bossId)!;
                  const sceneRoute = resolveSceneRoute(mission.sceneId, database.sceneById, database.sceneAssets);
                  const grade = campaignMissionGrade(mission.id, campaign);
                  const score = campaign.bestScores[mission.id];
                  const prerequisite = mission.unlockRequires ? database.missionById.get(mission.unlockRequires) : undefined;
                  return (
                    <button
                      key={mission.id}
                      type="button"
                      className={`mission-node ${status}${selected ? ' selected' : ''}`}
                      data-testid={`mission-node-${mission.id}`}
                      data-status={status}
                      aria-current={selected ? 'step' : undefined}
                      disabled={status === 'locked'}
                      onClick={() => onSelect(mission.id)}
                    >
                      <span className="mission-node-index">{String(mission.order).padStart(2, '0')}</span>
                      <span className="mission-node-copy"><b>{missionTitle(mission, language)}</b><small>{boss.severity} · {boss.class} · {mission.rewardXp} XP</small><small className={`mission-node-scene ${sceneRoute.availability.toLowerCase()}`} data-testid={`mission-scene-${mission.id}`}>{mission.turbineId.replace('WTG-OWM-', 'WTG-')} · {sceneRoute.requestedScene.id} · {sceneRoute.availability}</small></span>
                      <span className="mission-node-state">
                        {status === 'completed' && <><strong>{grade ?? '✓'}</strong><small>{grade && typeof score === 'number' ? `${score} BEST` : 'COMPLETE'}</small></>}
                        {status === 'available' && <><strong>{selected ? '▶' : '●'}</strong><small>{selected ? 'SELECTED' : 'READY'}</small></>}
                        {status === 'locked' && <><strong>◇</strong><small>{prerequisite ? `REQ ${String(prerequisite.order).padStart(2, '0')}` : 'LOCKED'}</small></>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>}
    </section>
  );
}

function WindFarmOperationsBoard({
  database,
  campaign,
  selectedMissionId,
  language,
  onMaintainTurbine,
  onMaintainTurbinePlan,
}: {
  database: GameDatabase;
  campaign: CampaignProgress;
  selectedMissionId: string;
  language: Language;
  onMaintainTurbine: (turbineId: string) => TurbineMaintenanceSettlement | null;
  onMaintainTurbinePlan: (turbineIds: string[]) => FleetMaintenancePlanSettlement | null;
}) {
  const selectedMission = database.missionById.get(selectedMissionId);
  const summary = summarizeWindFarm(campaign.windFarm);
  const dispatchPriority = createFleetDispatchPriority(campaign.windFarm, campaign.maintenanceCredits);
  const missionTurbineId = selectedMission?.turbineId ?? database.turbines[0]?.id ?? '';
  const [selectedTurbineId, setSelectedTurbineId] = useState(missionTurbineId);
  const [confirmationTurbineId, setConfirmationTurbineId] = useState<string>();
  const [maintenanceSettlement, setMaintenanceSettlement] = useState<TurbineMaintenanceSettlement>();
  const [maintenanceMode, setMaintenanceMode] = useState<'single' | 'plan'>('single');
  const [planTurbineIds, setPlanTurbineIds] = useState<string[]>([]);
  const [planConfirmation, setPlanConfirmation] = useState(false);
  const [planSettlement, setPlanSettlement] = useState<FleetMaintenancePlanSettlement>();
  const [boardTab, setBoardTab] = useState<'dispatch' | 'history'>('dispatch');
  useEffect(() => {
    setSelectedTurbineId(missionTurbineId);
    setConfirmationTurbineId(undefined);
    setMaintenanceSettlement(undefined);
    setMaintenanceMode('single');
    setPlanTurbineIds([]);
    setPlanConfirmation(false);
    setPlanSettlement(undefined);
  }, [missionTurbineId]);
  const selectedTurbine = database.turbineById.get(selectedTurbineId);
  const selectedDispatch = dispatchPriority.items.find((item) => item.turbineId === selectedTurbineId);
  const quote = turbineMaintenanceQuote(campaign.windFarm, selectedTurbineId, campaign.maintenanceCredits);
  const planQuote = createFleetMaintenancePlan(campaign.windFarm, planTurbineIds, campaign.maintenanceCredits);
  const selectedInPlan = planTurbineIds.includes(selectedTurbineId);
  const candidatePlan = createFleetMaintenancePlan(campaign.windFarm, [...planTurbineIds, selectedTurbineId], campaign.maintenanceCredits);
  const displayedPlan = planSettlement?.quote ?? planQuote;
  const chooseTurbine = (turbineId: string) => {
    setSelectedTurbineId(turbineId);
    setConfirmationTurbineId(undefined);
    setMaintenanceSettlement(undefined);
  };
  const confirmMaintenance = () => {
    const settlement = onMaintainTurbine(selectedTurbineId);
    if (!settlement) return;
    setConfirmationTurbineId(undefined);
    setMaintenanceSettlement(settlement);
  };
  const changeMaintenanceMode = (mode: 'single' | 'plan') => {
    setMaintenanceMode(mode);
    setConfirmationTurbineId(undefined);
    setPlanConfirmation(false);
  };
  const addSelectedToPlan = () => {
    if (selectedInPlan || !candidatePlan.canConfirm) return;
    setPlanTurbineIds(candidatePlan.turbineIds);
    setPlanConfirmation(false);
    setPlanSettlement(undefined);
  };
  const removeFromPlan = (turbineId: string) => {
    setPlanTurbineIds((current) => current.filter((id) => id !== turbineId));
    setPlanConfirmation(false);
    setPlanSettlement(undefined);
  };
  const clearPlan = () => {
    setPlanTurbineIds([]);
    setPlanConfirmation(false);
    setPlanSettlement(undefined);
  };
  const confirmPlan = () => {
    const settlement = onMaintainTurbinePlan(planTurbineIds);
    if (!settlement) return;
    setPlanConfirmation(false);
    setPlanTurbineIds([]);
    setPlanSettlement(settlement);
  };
  return (
    <section className="wind-farm-board" data-testid="wind-farm-board">
      <header>
        <div><span>FLEET DISPATCH PRIORITY</span><b>{language === 'zh' ? '六機組風險、可靠度與單次維修效益排序' : 'Six-turbine risk, reliability, and one-action impact'}</b></div>
        <nav className="fleet-board-tabs" aria-label={language === 'zh' ? '風場資訊頁籤' : 'Fleet operation tabs'}>
          <button type="button" className={boardTab === 'dispatch' ? 'active' : ''} aria-selected={boardTab === 'dispatch'} data-testid="fleet-board-tab-dispatch" onClick={() => setBoardTab('dispatch')}>DISPATCH</button>
          <button type="button" className={boardTab === 'history' ? 'active' : ''} aria-selected={boardTab === 'history'} data-testid="fleet-board-tab-history" onClick={() => setBoardTab('history')}>HISTORY <small>{campaign.fleetOperationsHistory.length}</small></button>
        </nav>
        <p data-testid="fleet-dispatch-counts"><strong>{dispatchPriority.actionableCount} ACTION</strong><strong>{dispatchPriority.affordableCount} READY</strong><span><i className="available" />{summary.available} AVL</span><span><i className="degraded" />{summary.degraded} DGD</span><span><i className="offline" />{summary.offline} OFF</span><strong>{summary.averageReliability}% R</strong><strong>{summary.totalBacklog} B</strong></p>
      </header>
      {boardTab === 'history' ? <FleetOperationsHistoryPanel history={campaign.fleetOperationsHistory} database={database} language={language} /> : <>
      <div className="wind-farm-turbines" data-testid="fleet-dispatch-priority">
        {dispatchPriority.items.map((dispatch) => {
          const turbine = database.turbineById.get(dispatch.turbineId);
          const state = campaign.windFarm[dispatch.turbineId];
          if (!turbine || !state) return null;
          const selected = selectedMission?.turbineId === turbine.id;
          const availabilityDelta = dispatch.projectedSummary.available - dispatchPriority.currentSummary.available;
          return <button type="button" key={turbine.id} className={`${state.availability.toLowerCase()}${selected ? ' mission-target' : ''}${selectedTurbineId === turbine.id ? ' selected' : ''}${planTurbineIds.includes(turbine.id) ? ' plan-selected' : ''}`} data-testid={`wind-turbine-${turbine.id}`} data-rank={dispatch.rank} data-budget-status={dispatch.budgetStatus} data-plan-selected={planTurbineIds.includes(turbine.id)} data-availability={state.availability} aria-pressed={selectedTurbineId === turbine.id} onClick={() => chooseTurbine(turbine.id)}>
            <span className="wind-turbine-header"><i>#{String(dispatch.rank).padStart(2, '0')} {availabilitySymbol(state.availability)}</i><small>{turbine.id.replace('WTG-OWM-', 'WTG-')} · {turbine.zone}</small><FleetTurbineIcon turbineId={turbine.id} availability={state.availability} /></span>
            <b>{language === 'zh' ? turbine.nameZh : turbine.nameEn}</b>
            <span className="wind-turbine-metrics"><strong>R {dispatch.quote.beforeReliability}→{dispatch.quote.afterReliability}</strong><em>B {dispatch.quote.beforeBacklog}→{dispatch.quote.afterBacklog}</em></span>
            <small className={`fleet-dispatch-budget ${dispatch.budgetStatus.toLowerCase()}`} data-testid={`fleet-dispatch-item-${turbine.id}`}>{dispatch.quote.canMaintain ? `${dispatch.quote.cost} MNT · ${dispatch.budgetStatus === 'READY' ? 'READY' : 'SHORT'}` : 'CLEAR'} · AVL {availabilityDelta >= 0 ? '+' : ''}{availabilityDelta}</small>
          </button>;
        })}
      </div>
      {selectedTurbine && quote && (maintenanceMode === 'single'
        ? <div className={`fleet-maintenance-action ${quote.priority.toLowerCase()}`} data-testid="fleet-maintenance-action">
            <div className="fleet-maintenance-copy">
              <div className="fleet-maintenance-mode-tabs"><button type="button" className="active" data-testid="fleet-maintenance-mode-single" aria-selected="true" onClick={() => changeMaintenanceMode('single')}>SINGLE</button><button type="button" data-testid="fleet-maintenance-mode-plan" aria-selected="false" onClick={() => changeMaintenanceMode('plan')}>PLAN</button></div>
              <span>FLEET MAINTENANCE QUOTE</span><b>{selectedTurbine.id.replace('WTG-OWM-', 'WTG-')} · {language === 'zh' ? selectedTurbine.nameZh : selectedTurbine.nameEn}</b>{selectedDispatch && <small data-testid="fleet-dispatch-projection">FLEET {dispatchPriority.currentSummary.available}→{selectedDispatch.projectedSummary.available} AVL · {dispatchPriority.currentSummary.averageReliability}→{selectedDispatch.projectedSummary.averageReliability}% R · {dispatchPriority.currentSummary.totalBacklog}→{selectedDispatch.projectedSummary.totalBacklog} B</small>}
            </div>
            <div className="fleet-maintenance-metrics">
              <span><small>PRIORITY</small><b>{quote.priority}</b></span>
              <span><small>RELIABILITY</small><b>{quote.beforeReliability}→{quote.afterReliability}%</b></span>
              <span><small>BACKLOG</small><b>{quote.beforeBacklog}→{quote.afterBacklog}</b></span>
              <span><small>AVAILABILITY</small><b>{quote.beforeAvailability}→{quote.afterAvailability}</b></span>
              <span><small>MNT</small><b>{quote.availableCredits}→{Math.max(0, quote.availableCredits - quote.cost)} (-{quote.cost})</b></span>
            </div>
            <div className="fleet-maintenance-actions">
              {maintenanceSettlement?.turbineId === selectedTurbineId
                ? <><strong data-testid="fleet-maintenance-settlement">COMPLETE · ACTION {maintenanceSettlement.after.maintenanceActions}</strong>{maintenanceSettlement.after.openFaults > 0 ? <button type="button" data-testid="fleet-maintenance-next" onClick={() => setMaintenanceSettlement(undefined)}>{language === 'zh' ? '處理下一筆' : 'NEXT FAULT'}</button> : <em>{language === 'zh' ? 'BACKLOG 已清除' : 'BACKLOG CLEARED'}</em>}</>
                : !quote.canMaintain
                  ? <em data-testid="fleet-maintenance-unavailable">{language === 'zh' ? '無可處置 fault backlog' : 'NO ACTIONABLE FAULT BACKLOG'}</em>
                  : confirmationTurbineId !== selectedTurbineId
                    ? <button type="button" data-testid="fleet-maintenance-prepare" disabled={!quote.canAfford} onClick={() => setConfirmationTurbineId(selectedTurbineId)}>{quote.canAfford ? (language === 'zh' ? `準備維護 · ${quote.cost} MNT` : `PREPARE · ${quote.cost} MNT`) : (language === 'zh' ? `MNT 不足 · 需要 ${quote.cost}` : `INSUFFICIENT MNT · ${quote.cost}`)}</button>
                    : <><span data-testid="fleet-maintenance-confirmation">NO SAVE UNTIL CONFIRMED</span><button type="button" data-testid="fleet-maintenance-cancel" onClick={() => setConfirmationTurbineId(undefined)}>{language === 'zh' ? '取消' : 'CANCEL'}</button><button type="button" data-testid="fleet-maintenance-confirm" onClick={confirmMaintenance}>{language === 'zh' ? '確認執行' : 'CONFIRM'}</button></>}
            </div>
          </div>
        : <div className="fleet-maintenance-action plan" data-testid="fleet-maintenance-plan">
            <div className="fleet-maintenance-copy">
              <div className="fleet-maintenance-mode-tabs"><button type="button" data-testid="fleet-maintenance-mode-single" aria-selected="false" onClick={() => changeMaintenanceMode('single')}>SINGLE</button><button type="button" className="active" data-testid="fleet-maintenance-mode-plan" aria-selected="true" onClick={() => changeMaintenanceMode('plan')}>PLAN</button></div>
              <span>FLEET MAINTENANCE PLAN</span>
              <b data-testid="fleet-plan-summary">{displayedPlan.steps.length} ACTIONS · {displayedPlan.turbineIds.length > 0 ? displayedPlan.turbineIds.map((id) => id.replace('WTG-OWM-', 'WTG-')).join(' → ') : 'SELECT TURBINE'}</b>
              <small>MNT {displayedPlan.initialCredits}→{displayedPlan.afterCredits} (-{displayedPlan.totalCost}) · FLEET {displayedPlan.beforeSummary.available}→{displayedPlan.afterSummary.available} AVL · {displayedPlan.beforeSummary.averageReliability}→{displayedPlan.afterSummary.averageReliability}% R · {displayedPlan.beforeSummary.totalBacklog}→{displayedPlan.afterSummary.totalBacklog} B</small>
            </div>
            <div className="fleet-plan-steps" data-testid="fleet-plan-steps">
              {displayedPlan.steps.length > 0
                ? displayedPlan.steps.map((step) => <button type="button" key={step.turbineId} data-testid={`fleet-plan-step-${step.turbineId}`} disabled={Boolean(planSettlement)} onClick={() => removeFromPlan(step.turbineId)}><b>#{String(step.order).padStart(2, '0')} {step.turbineId.replace('WTG-OWM-', 'WTG-')}</b><small>R {step.before.reliability}→{step.after.reliability} · B {step.before.openFaults}→{step.after.openFaults} · AVL {step.beforeSummary.available}→{step.afterSummary.available} · {step.beforeCredits}→{step.afterCredits} MNT</small></button>)
                : <em>{language === 'zh' ? '選擇風機卡，再加入維修計畫' : 'Select a turbine card, then add it to the plan'}</em>}
            </div>
            <div className="fleet-maintenance-actions">
              {planSettlement
                ? <><strong data-testid="fleet-plan-settlement">COMPLETE · {planSettlement.steps.length} ACTIONS · {planSettlement.beforeCredits}→{planSettlement.afterCredits} MNT</strong><button type="button" data-testid="fleet-plan-new" onClick={clearPlan}>{language === 'zh' ? '新計畫' : 'NEW PLAN'}</button></>
                : planConfirmation
                  ? <><span data-testid="fleet-plan-confirmation">NO SAVE UNTIL CONFIRMED</span><button type="button" data-testid="fleet-plan-cancel-confirmation" onClick={() => setPlanConfirmation(false)}>{language === 'zh' ? '取消' : 'CANCEL'}</button><button type="button" data-testid="fleet-plan-confirm" onClick={confirmPlan}>{language === 'zh' ? '確認整批執行' : 'CONFIRM PLAN'}</button></>
                  : <><button type="button" data-testid="fleet-plan-add" disabled={selectedInPlan || !candidatePlan.canConfirm} onClick={addSelectedToPlan}>{selectedInPlan ? 'IN PLAN' : candidatePlan.canConfirm ? `ADD ${selectedTurbine.id.replace('WTG-OWM-', 'WTG-')}` : quote.canMaintain ? 'PLAN SHORT' : 'NO BACKLOG'}</button><button type="button" data-testid="fleet-plan-clear" disabled={planTurbineIds.length === 0} onClick={clearPlan}>{language === 'zh' ? '清除' : 'CLEAR'}</button><button type="button" data-testid="fleet-plan-prepare" disabled={!planQuote.canConfirm} onClick={() => setPlanConfirmation(true)}>{planQuote.canConfirm ? (language === 'zh' ? `準備計畫 · ${planQuote.totalCost} MNT` : `PREPARE PLAN · ${planQuote.totalCost} MNT`) : (language === 'zh' ? '計畫尚未可執行' : 'PLAN NOT READY')}</button></>}
            </div>
          </div>)}
      </>}
      <small>{language === 'zh' ? 'R = Reliability · B = Open fault backlog · 數值為 gameplay abstraction' : 'R = Reliability · B = Open fault backlog · values are gameplay abstractions'}</small>
    </section>
  );
}

function FleetOperationsHistoryPanel({
  history,
  database,
  language,
}: {
  history: FleetOperationHistoryRecord[];
  database: GameDatabase;
  language: Language;
}) {
  const [page, setPage] = useState(0);
  const pageSize = 6;
  const ordered = [...history].sort((left, right) => right.sequence - left.sequence);
  const pageCount = Math.max(1, Math.ceil(ordered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = ordered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  return (
    <section className="fleet-history-panel" data-testid="fleet-history-panel">
      <div className="fleet-history-heading">
        <div><span>FLEET OPERATIONS HISTORY</span><b>{language === 'zh' ? '最近任務、維護與出勤修正' : 'Recent mission, maintenance, and dispatch events'}</b></div>
        <strong data-testid="fleet-history-count">{history.length}/{30}</strong>
        <div className="workspace-pagination fleet-history-pagination">
          <button type="button" data-testid="fleet-history-prev" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>←</button>
          <span data-testid="fleet-history-page">{currentPage + 1}/{pageCount}</span>
          <button type="button" data-testid="fleet-history-next" disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>→</button>
        </div>
      </div>
      <div className="fleet-history-list">
        {visible.length > 0
          ? visible.map((record) => <article key={record.id} className={`fleet-history-event ${record.kind.toLowerCase()}`} data-testid={`fleet-history-event-${record.kind}-${record.sequence}`}>
              <span>#{String(record.sequence).padStart(2, '0')} · {record.kind.replace('_', ' ')}</span>
              <b>{fleetHistoryTitle(record, database, language)}</b>
              <small>{fleetHistoryPrimaryMetric(record)}</small>
              <em>{fleetHistorySecondaryMetric(record)}</em>
            </article>)
          : <div className="fleet-history-empty" data-testid="fleet-history-empty">{language === 'zh' ? '尚無紀錄；部署任務或確認維護後會在此顯示。' : 'No records yet; deploy a mission or confirm maintenance to populate this tab.'}</div>}
      </div>
    </section>
  );
}

function fleetHistoryTitle(record: FleetOperationHistoryRecord, database: GameDatabase, language: Language): string {
  if (record.kind === 'DISPATCH') {
    const turbine = record.turbineId ? database.turbineById.get(record.turbineId) : undefined;
    return `${record.pressure ?? 'NOMINAL'} · ${turbine ? turbine.id.replace('WTG-OWM-', 'WTG-') : record.turbineId ?? 'WTG'}`;
  }
  if (record.kind === 'MISSION') {
    const mission = record.missionId ? database.missionById.get(record.missionId) : undefined;
    return `${record.outcome ?? 'CLEAR'} · ${record.grade ?? '—'}${typeof record.score === 'number' ? ` · ${record.score}` : ''} · ${mission ? missionTitle(mission, language) : record.missionId ?? 'MISSION'}`;
  }
  if (record.kind === 'MAINTENANCE_PLAN') {
    return `${record.actionCount ?? record.turbineIds?.length ?? 0} ACTIONS · ${(record.turbineIds ?? []).map((id) => id.replace('WTG-OWM-', 'WTG-')).join(' → ')}`;
  }
  const turbine = record.turbineId ? database.turbineById.get(record.turbineId) : undefined;
  return `${turbine ? turbine.id.replace('WTG-OWM-', 'WTG-') : record.turbineId ?? 'WTG'} · ACTION ${record.actionCount ?? 1}`;
}

function fleetHistoryPrimaryMetric(record: FleetOperationHistoryRecord): string {
  if (record.kind === 'DISPATCH') return `COST +${record.costBefore ?? 0}→+${record.costAfter ?? 0} · SAFETY ${record.safetyBefore ?? 0}→${record.safetyAfter ?? 0}`;
  if (record.kind === 'MAINTENANCE_PLAN') return `MNT ${record.creditsBefore ?? 0}→${record.creditsAfter ?? 0} · FLEET R ${record.reliabilityBefore ?? 0}→${record.reliabilityAfter ?? 0}`;
  if (record.kind === 'MAINTENANCE') return `MNT ${record.creditsBefore ?? 0}→${record.creditsAfter ?? 0} · R ${record.reliabilityBefore ?? 0}→${record.reliabilityAfter ?? 0}`;
  return `MNT +${record.creditsDelta ?? 0} · R ${record.reliabilityBefore ?? 0}→${record.reliabilityAfter ?? 0}`;
}

function fleetHistorySecondaryMetric(record: FleetOperationHistoryRecord): string {
  if (record.kind === 'DISPATCH') return `R ${record.reliabilityBefore ?? 0}→${record.reliabilityAfter ?? 0} · B ${record.backlogBefore ?? 0}`;
  if (record.kind === 'MAINTENANCE_PLAN') return `AVL ${record.fleetBefore?.available ?? 0}→${record.fleetAfter?.available ?? 0} · B ${record.backlogBefore ?? 0}→${record.backlogAfter ?? 0}`;
  return `${record.availabilityBefore ?? 'AVL'}→${record.availabilityAfter ?? 'AVL'} · B ${record.backlogBefore ?? 0}→${record.backlogAfter ?? 0}`;
}

function availabilitySymbol(availability: TurbineAvailability): string {
  if (availability === 'AVAILABLE') return '●';
  if (availability === 'DEGRADED') return '△';
  return '×';
}

function MissionEventDeck({
  mission,
  currentRound,
  activeRound,
  language,
  compact = false,
  highlight = false,
}: {
  mission: MissionData;
  currentRound?: number;
  activeRound?: number;
  language: Language;
  compact?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`mission-event-deck${compact ? ' compact' : ''}${highlight ? ' onboarding-focus' : ''}`} data-testid="mission-event-deck">
      <div className="mission-event-deck-title"><span>MISSION EVENT DECK</span><small>{language === 'zh' ? '固定回合 · 可重現' : 'Fixed rounds · Replayable'}</small></div>
      <div className="mission-event-triggers">
        {mission.branchEventDeck.map((trigger) => {
          const event = missionBranchEventDefinition(trigger.eventCode);
          const state = activeRound === trigger.round
            ? 'active'
            : currentRound !== undefined && trigger.round < currentRound
              ? 'resolved'
              : 'upcoming';
          return (
            <div key={`${trigger.round}-${trigger.eventCode}`} className={`mission-event-trigger ${state}`} data-testid={`mission-event-trigger-${trigger.round}`} style={{ '--event': event.accent } as React.CSSProperties}>
              <span><i>{event.icon}</i>R{String(trigger.round).padStart(2, '0')}</span>
              <b>{language === 'zh' ? event.titleZh : event.titleEn}</b>
              <small>×{trigger.intensity.toFixed(2)}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function campaignChapterTitle(chapter: number, language: Language): string {
  const titles: Record<number, [string, string]> = {
    1: ['基礎訓練', 'Foundation'],
    2: ['進階診斷', 'Advanced diagnosis'],
    3: ['精英處置', 'Elite response'],
    4: ['危急事件', 'Critical incidents'],
    5: ['終局演練', 'Final readiness'],
  };
  const title = titles[chapter] ?? [`第 ${chapter} 章`, `Chapter ${chapter}`];
  return title[language === 'zh' ? 0 : 1];
}

function CampaignCompletionPanel({
  summary,
  language,
  compact = false,
}: {
  summary: CampaignCompletionSummary;
  language: Language;
  compact?: boolean;
}) {
  return (
    <section
      className={`campaign-completion${compact ? ' compact' : ''}`}
      data-testid="campaign-completion-summary"
      data-campaign-complete={summary.complete}
      data-completed-missions={summary.completedMissions}
      data-total-missions={summary.totalMissions}
      data-completed-chapters={summary.completedChapters}
      data-total-chapters={summary.totalChapters}
      data-average-best-score={summary.averageBestScore}
      data-scored-missions={summary.scoredMissions}
      data-campaign-grade={summary.campaignGrade ?? ''}
      data-s-grade-count={summary.sGradeCount}
      data-mastered-character-count={summary.masteredCharacterCount}
    >
      <div className="campaign-completion-copy">
        <span>CAMPAIGN COMPLETE</span>
        <b>{language === 'zh' ? '離岸運維大師航線完成' : 'Offshore Master route complete'}</b>
        <p>{language === 'zh' ? '五章終局演練已完成；所有任務與最佳分數保留，可自由重玩。' : 'All five chapters are complete; every mission and best score remains available for replay.'}</p>
      </div>
      <div className="campaign-completion-grade"><strong>{summary.campaignGrade ?? '—'}</strong><span>CAMPAIGN GRADE</span></div>
      <div className="campaign-completion-metrics">
        <span><b>{summary.completedMissions}/{summary.totalMissions}</b>{language === 'zh' ? '任務' : 'Missions'}</span>
        <span><b>{summary.completedChapters}/{summary.totalChapters}</b>{language === 'zh' ? '章節' : 'Chapters'}</span>
        <span><b>{summary.averageBestScore}</b>{language === 'zh' ? '平均最佳分' : 'Average best'}</span>
        <span><b>{summary.sGradeCount}</b>{language === 'zh' ? 'S 評級' : 'S grades'}</span>
        <span><b>{summary.masteredCharacterCount}</b>{language === 'zh' ? 'L5 技師' : 'L5 crew'}</span>
      </div>
    </section>
  );
}

function createSession(
  database: GameDatabase,
  missionDefinition: MissionData,
  boss: BossData,
  deployment: DeploymentState,
  campaign: CampaignProgress,
  operationReadiness: OperationReadinessEvaluation,
  language: Language = 'zh',
): SessionState {
  const perks = teamMasteryPerks(deployment.teamIds, campaign);
  const team = deployment.teamIds.map((id) => createCharacterRuntime(
    requiredCharacter(database, id),
    perks.byCharacterId[id],
    campaignCrewFatigue(campaign, id),
  ));
  const loadout = evaluateLoadout(
    missionDefinition,
    requiredEquipment(database, deployment.equipmentId),
    requiredEquipment(database, deployment.spareId),
    requiredVessel(database, deployment.vesselId),
  );
  const preparedMission = applyMasteryPerks(applyLoadout(createMission(boss), loadout), perks);
  const fleetModifier = createFleetConditionDispatchModifier(campaign.windFarm, missionDefinition.turbineId);
  const fleetCondition = fleetModifier
    ? projectFleetConditionDispatch(preparedMission, operationReadiness.mobilizationCost, fleetModifier)
    : undefined;
  const readyMission = applyOperationReadiness(preparedMission, operationReadiness);
  const mission = fleetModifier ? applyFleetConditionDispatch(readyMission, fleetModifier) : readyMission;
  const fleetLog = fleetCondition
    ? language === 'zh'
      ? `｜風場 ${fleetCondition.modifier.pressure}｜成本 +${fleetCondition.mobilizationCostBefore}→+${fleetCondition.mobilizationCostAfter}｜Safety ${fleetCondition.safetyBefore}→${fleetCondition.safetyAfter}｜Reliability ${fleetCondition.reliabilityBefore}→${fleetCondition.reliabilityAfter}`
      : ` | Fleet ${fleetCondition.modifier.pressure} | Cost +${fleetCondition.mobilizationCostBefore}→+${fleetCondition.mobilizationCostAfter} | Safety ${fleetCondition.safetyBefore}→${fleetCondition.safetyAfter} | Reliability ${fleetCondition.reliabilityBefore}→${fleetCondition.reliabilityAfter}`
    : '';
  return {
    mode: 'campaign',
    missionId: missionDefinition.id,
    sceneId: missionDefinition.sceneId,
    boss,
    equipmentId: deployment.equipmentId,
    spareId: deployment.spareId,
    vesselId: deployment.vesselId,
    loadout,
    mission,
    fleetCondition,
    team,
    selectedIndex: 0,
    eventPulse: 0,
    settled: false,
    departedCrewFatigue: {},
    log: [language === 'zh' ? `任務 ${missionDefinition.id} 已部署｜場景 ${missionDefinition.sceneId}｜整備 ${operationReadiness.matchedChecks}/5｜天候 ${operationReadiness.initialWeatherWindow}｜動員 +${operationReadiness.mobilizationCost}${fleetLog}｜配置 ${loadout.matchedChoices}/3｜Perk ${perks.unlockedPerkCount}/6｜Detect 開始` : `Mission ${missionDefinition.id} deployed | Scene ${missionDefinition.sceneId} | Readiness ${operationReadiness.matchedChecks}/5 | Weather ${operationReadiness.initialWeatherWindow} | Mobilization +${operationReadiness.mobilizationCost}${fleetLog} | Loadout ${loadout.matchedChoices}/3 | Perks ${perks.unlockedPerkCount}/6 | Detect started`],
  };
}

function createSandboxSession(
  database: GameDatabase,
  boss: BossData,
  deployment: DeploymentState,
  campaign: CampaignProgress,
  language: Language = 'zh',
): SessionState {
  const scenario = normalizeSandboxScenario(deployment.sandboxScenario);
  const perks = teamMasteryPerks(deployment.teamIds, campaign, true);
  const team = deployment.teamIds.map((id) => createCharacterRuntime(requiredCharacter(database, id), perks.byCharacterId[id]));
  const loadout = evaluateSandboxLoadout(
    requiredEquipment(database, deployment.equipmentId),
    requiredEquipment(database, deployment.spareId),
    requiredVessel(database, deployment.vesselId),
  );
  return {
    mode: 'sandbox',
    sceneId: deployment.sandboxSceneId,
    boss,
    equipmentId: deployment.equipmentId,
    spareId: deployment.spareId,
    vesselId: deployment.vesselId,
    loadout,
    mission: applySandboxScenario(applyMasteryPerks(applyLoadout(createMission(boss), loadout), perks), scenario),
    team,
    selectedIndex: 0,
    eventPulse: 0,
    settled: true,
    departedCrewFatigue: {},
    sandboxScenario: scenario,
    log: [language === 'zh'
      ? `Sandbox ${boss.id} 已部署｜場景 ${deployment.sandboxSceneId}｜Sea State ${scenario.seaState}｜天候 ${scenario.weatherWindow}｜安全 ${scenario.safety}｜證據 ${scenario.evidence}｜${scenario.roundLimit} 回合｜不計 XP`
      : `Sandbox ${boss.id} deployed | Scene ${deployment.sandboxSceneId} | Sea State ${scenario.seaState} | Weather ${scenario.weatherWindow} | Safety ${scenario.safety} | Evidence ${scenario.evidence} | ${scenario.roundLimit} rounds | No XP`],
  };
}

function createBossChallengeSession(
  database: GameDatabase,
  boss: BossData,
  deployment: DeploymentState,
  campaign: CampaignProgress,
  language: Language = 'zh',
): SessionState {
  const projection = createBossChallengeCampaignProjection(campaign, database.characters);
  const perks = teamMasteryPerks(deployment.teamIds, projection);
  const team = deployment.teamIds.map((id) => createCharacterRuntime(requiredCharacter(database, id), perks.byCharacterId[id]));
  const loadout = evaluateSandboxLoadout(
    requiredEquipment(database, BOSS_CHALLENGE_EQUIPMENT_ID),
    requiredEquipment(database, BOSS_CHALLENGE_SPARE_ID),
    requiredVessel(database, BOSS_CHALLENGE_VESSEL_ID),
  );
  const mission = applyMasteryPerks(applyLoadout(createMission(boss), loadout), perks);
  return {
    mode: 'challenge',
    sceneId: database.sceneAssets.fallback.sourceSceneId,
    boss,
    equipmentId: BOSS_CHALLENGE_EQUIPMENT_ID,
    spareId: BOSS_CHALLENGE_SPARE_ID,
    vesselId: BOSS_CHALLENGE_VESSEL_ID,
    loadout,
    mission: { ...mission, roundLimit: BOSS_CHALLENGE_ROUND_LIMIT },
    team,
    selectedIndex: 0,
    eventPulse: 0,
    settled: false,
    departedCrewFatigue: {},
    log: [language === 'zh'
      ? `Boss Challenge ${boss.id} 已部署｜固定 Mastery L3／${BOSS_CHALLENGE_ROUND_LIMIT} 回合／標準 L1 配置｜Campaign 不變`
      : `Boss Challenge ${boss.id} deployed | Fixed Mastery L3 / ${BOSS_CHALLENGE_ROUND_LIMIT} rounds / standard L1 loadout | Campaign unchanged`],
  };
}

function Topbar({
  database,
  campaign,
  view,
  language,
  onboarding,
  reducedMotion,
  onNavigate,
  onReplayOnboarding,
  onToggleLanguage,
  onToggleMotion,
}: {
  database: GameDatabase;
  campaign: CampaignProgress;
  view: GameView;
  language: Language;
  onboarding: OnboardingProgress;
  reducedMotion: boolean;
  onNavigate: (view: GameView) => void;
  onReplayOnboarding: () => void;
  onToggleLanguage: () => void;
  onToggleMotion: () => void;
}) {
  const ui = UI[language];
  return (
    <header className="topbar">
      <div className="brand-block">
        <span className="eyebrow">DOF LAB · STRATEGY SIMULATION</span>
        <div className="brand-line"><span className="brand-mark">OWM</span><h1>Offshore Wind Masters</h1></div>
      </div>
      <nav className="mode-nav" aria-label="Game mode">
        {(['campaign', 'challenge', 'sandbox', 'collection', 'codex'] as const).map((item) => <button key={item} data-testid={`nav-${item}`} className={view === item ? 'active' : ''} onClick={() => onNavigate(item)}>{ui[item]}</button>)}
        <button className="onboarding-replay" data-testid="onboarding-replay" onClick={onReplayOnboarding}>
          {onboarding.status === 'active'
            ? (language === 'zh' ? `導覽 ${onboarding.stepIndex + 1}/5` : `Guide ${onboarding.stepIndex + 1}/5`)
            : (language === 'zh' ? '重播教學' : 'Replay guide')}
        </button>
      </nav>
      <div className="dataset-strip" aria-label="資料庫統計">
        <DataChip value={database.manifest.counts.characters} label={ui.characters} />
        <DataChip value={database.manifest.counts.skills} label={ui.skills} />
        <DataChip value={database.manifest.counts.bosses} label={ui.bosses} />
        <DataChip value={campaign.totalXp} label="XP" />
        <DataChip value={campaign.maintenanceCredits} label="MNT" />
        <DataChip value={campaign.recoveryTokens} label="RST" />
      </div>
      <button className="motion-button" data-testid="motion-toggle" aria-pressed={reducedMotion} onClick={onToggleMotion}>{reducedMotion ? (language === 'zh' ? '低動態' : 'Low motion') : (language === 'zh' ? '標準動態' : 'Full motion')}</button>
      <button className="language-button" data-testid="language-toggle" onClick={onToggleLanguage}>{language === 'zh' ? 'EN' : '繁中'}</button>
    </header>
  );
}

function CollectionScreen({
  database,
  campaign,
  language,
  onImportProgress,
}: {
  database: GameDatabase;
  campaign: CampaignProgress;
  language: Language;
  onImportProgress: (progress: CampaignProgress) => void;
}) {
  const [activeTab, setActiveTab] = useState<'crew' | 'resources'>('crew');
  const [factionFilter, setFactionFilter] = useState('ALL');
  const [crewSearch, setCrewSearch] = useState('');
  const [page, setPage] = useState(0);
  const [saveText, setSaveText] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const unlockedCharacters = unlockedCareerCharacters(campaign, database.characters);
  const unlockedCharacterIds = new Set(unlockedCharacters.map((character) => character.id));
  const factionCharacters = factionFilter === 'ALL'
    ? database.characters
    : database.characters.filter((character) => character.factionCode === factionFilter);
  const normalizedSearch = crewSearch.trim().toLocaleLowerCase();
  const characters = normalizedSearch
    ? factionCharacters.filter((character) => [
        character.id,
        characterName(character, 'zh'),
        characterName(character, 'en'),
        professionName(character, 'zh'),
        professionName(character, 'en'),
      ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch)))
    : factionCharacters;
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(characters.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleCharacters = characters.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  const ownedEquipmentIds = new Set(campaign.ownedEquipmentIds);
  const equipmentTierInventory = (['L1', 'L2', 'L3', 'L4', 'L5'] as const).map((tier) => ({
    tier,
    owned: database.equipment.filter((item) => item.tier === tier && ownedEquipmentIds.has(item.id)).length,
    total: database.equipment.filter((item) => item.tier === tier).length,
  }));
  const equipmentCategoryInventory = [...new Set(database.equipment.map((item) => item.category))].map((category) => ({
    category,
    owned: database.equipment.filter((item) => item.category === category && ownedEquipmentIds.has(item.id)).length,
    total: database.equipment.filter((item) => item.category === category).length,
  }));
  const serviceableEquipmentCount = database.equipment.filter((item) => isEquipmentServiceable(campaign, item.id)).length;
  const wornEquipmentCount = campaign.ownedEquipmentIds.filter((id) => campaignEquipmentCondition(campaign, id) < 100).length;
  const crewReadinessCounts = database.characters.reduce((counts, character) => {
    counts[crewReadinessBand(campaign, character)] += 1;
    return counts;
  }, { Stable: 0, Tired: 0, Critical: 0, Exhausted: 0 });
  const generateSave = () => {
    setSaveText(serializeCampaignSave(campaign));
    setSaveStatus(language === 'zh' ? '已產生目前進度的 JSON。' : 'Current progress JSON generated.');
  };
  const importSave = () => {
    const result = parseCampaignSave(saveText, database.missions, database.equipment, database.characters, database.turbines);
    if (!result.ok) {
      const message = {
        INVALID_JSON: language === 'zh' ? 'JSON 語法無效。' : 'Invalid JSON syntax.',
        INVALID_FORMAT: language === 'zh' ? '不是可辨識的 OWM 存檔。' : 'Unrecognized OWM save.',
        UNSUPPORTED_VERSION: language === 'zh' ? '存檔版本尚未支援。' : 'Save version is not supported.',
      }[result.error];
      setSaveStatus(message);
      return;
    }
    onImportProgress(result.progress);
    setSaveStatus(result.migratedLegacy
      ? (language === 'zh' ? '舊版存檔已 migration 並匯入。' : 'Legacy save migrated and imported.')
      : (language === 'zh' ? '存檔已匯入。' : 'Save imported.'));
  };
  const handleCollectionTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const tabs = ['crew', 'resources'] as const;
    const currentIndex = tabs.indexOf(activeTab);
    const nextTab = event.key === 'ArrowRight'
      ? tabs[(currentIndex + 1) % tabs.length]
      : event.key === 'ArrowLeft'
        ? tabs[(currentIndex - 1 + tabs.length) % tabs.length]
        : event.key === 'Home'
          ? tabs[0]
          : event.key === 'End'
            ? tabs[tabs.length - 1]
            : undefined;
    if (!nextTab) return;
    event.preventDefault();
    setActiveTab(nextTab);
    window.requestAnimationFrame(() => document.getElementById(`collection-tab-${nextTab}-button`)?.focus());
  };
  return (
    <section className="collection-shell" data-testid="collection-screen">
      <div className="collection-heading">
        <div><span className="section-kicker">CREW ARCHIVE</span><h2>{language === 'zh' ? '角色收藏與熟練度' : 'Crew collection and mastery'}</h2><p>{campaign.totalXp} XP · <span data-testid="collection-career-unlocked-count">{unlockedCharacters.length}/300 Career</span> · {Object.keys(database.sourceArtIndex.items).length}/300 Source Art</p></div>
        <div className="collection-summary"><b>{campaign.completedMissionIds.length}/{database.missions.length}</b><span>{language === 'zh' ? '任務完成' : 'missions complete'}</span></div>
      </div>
      <nav className="workspace-tabs collection-tabs" role="tablist" aria-label={language === 'zh' ? '收藏頁籤' : 'Collection tabs'} data-testid="collection-tabs">
        <button id="collection-tab-crew-button" role="tab" type="button" className={activeTab === 'crew' ? 'active' : ''} aria-selected={activeTab === 'crew'} aria-controls="collection-panel-crew" tabIndex={activeTab === 'crew' ? 0 : -1} data-testid="collection-tab-crew" onClick={() => setActiveTab('crew')} onKeyDown={handleCollectionTabKey}>{language === 'zh' ? 'Crew 卡牌' : 'Crew cards'}</button>
        <button id="collection-tab-resources-button" role="tab" type="button" className={activeTab === 'resources' ? 'active' : ''} aria-selected={activeTab === 'resources'} aria-controls="collection-panel-resources" tabIndex={activeTab === 'resources' ? 0 : -1} data-testid="collection-tab-resources" onClick={() => setActiveTab('resources')} onKeyDown={handleCollectionTabKey}>{language === 'zh' ? '資源與存檔' : 'Resources & save'}</button>
      </nav>
      {activeTab === 'resources' && <div id="collection-panel-resources" role="tabpanel" aria-labelledby="collection-tab-resources-button" className="collection-resource-pane" data-testid="collection-resource-pane"><div className="save-manager" data-testid="save-manager">
        <div className="save-manager-copy"><span className="section-kicker">CAMPAIGN SAVE V5</span><b>{language === 'zh' ? '存檔備份與轉移' : 'Backup and transfer'}</b><small>{language === 'zh' ? 'JSON 包含戰役、Equipment maintenance、Crew readiness、Fleet state 與 Operations History。' : 'JSON contains campaign, equipment maintenance, crew readiness, fleet state, and operations history.'}</small></div>
        <textarea data-testid="save-export-text" value={saveText} onChange={(event) => setSaveText(event.target.value)} placeholder={language === 'zh' ? '按「產生 JSON」或貼上既有存檔' : 'Generate JSON or paste an existing save'} aria-label={language === 'zh' ? '戰役存檔 JSON' : 'Campaign save JSON'} />
        <div className="save-manager-actions">
          <button data-testid="save-generate" onClick={generateSave}>{language === 'zh' ? '產生 JSON' : 'Generate JSON'}</button>
          <button data-testid="save-import" onClick={importSave}>{language === 'zh' ? '匯入並覆寫' : 'Import and replace'}</button>
          {saveText && <a data-testid="save-download" download="OWM_campaign_save.json" href={`data:application/json;charset=utf-8,${encodeURIComponent(saveText)}`}>{language === 'zh' ? '下載 JSON' : 'Download JSON'}</a>}
          <small role="status">{saveStatus}</small>
        </div>
      </div>
      <section className="collection-equipment-inventory" data-testid="collection-equipment-inventory">
        <div className="collection-equipment-heading"><div><span className="section-kicker">EQUIPMENT INVENTORY</span><b>{language === 'zh' ? '任務裝備持有與維護狀態' : 'Mission equipment ownership and maintenance'}</b></div><strong>{campaign.ownedEquipmentIds.length}/{database.equipment.length}</strong></div>
        <div className="collection-maintenance-summary" data-testid="collection-maintenance-summary"><span><small>MAINTENANCE</small><b>{campaign.maintenanceCredits} MNT</b></span><span><small>{language === 'zh' ? '可出勤' : 'SERVICEABLE'}</small><b>{serviceableEquipmentCount}/{campaign.ownedEquipmentIds.length}</b></span><span><small>{language === 'zh' ? '已有損耗' : 'WORN'}</small><b>{wornEquipmentCount}</b></span></div>
        <div className="collection-equipment-tiers">{equipmentTierInventory.map((entry) => <span key={entry.tier} className={entry.owned === entry.total ? 'unlocked' : 'locked'}><b>{entry.tier}</b><small>{entry.owned}/{entry.total}</small></span>)}</div>
        <div className="collection-equipment-categories">{equipmentCategoryInventory.map((entry) => <span key={entry.category}><b>{entry.category}</b><small>{entry.owned}/{entry.total}</small></span>)}</div>
        <p>{language === 'zh' ? 'Chapter 01 起始持有 L1；章末解鎖 L2–L5。任務會損耗實際攜帶裝備，Condition 低於 25% 前需在 Deployment 維修。' : 'Start Chapter 01 with L1 and unlock L2–L5 at chapter milestones. Deployed items wear down and must be repaired before condition falls below 25%.'}</p>
      </section>
      <section className="collection-crew-readiness" data-testid="collection-crew-readiness">
        <div><span className="section-kicker">CREW READINESS</span><b>{language === 'zh' ? '全體技師任務間疲勞' : 'Roster inter-mission fatigue'}</b><strong>{campaign.recoveryTokens} RST</strong></div>
        <span className="stable"><b>{crewReadinessCounts.Stable}</b><small>{language === 'zh' ? '穩定' : 'Stable'}</small></span>
        <span className="tired"><b>{crewReadinessCounts.Tired}</b><small>{language === 'zh' ? '疲憊' : 'Tired'}</small></span>
        <span className="critical"><b>{crewReadinessCounts.Critical}</b><small>{language === 'zh' ? '臨界' : 'Critical'}</small></span>
        <span className="exhausted"><b>{crewReadinessCounts.Exhausted}</b><small>{language === 'zh' ? '耗竭' : 'Exhausted'}</small></span>
        <p>{language === 'zh' ? '在 Deployment 選取技師即可使用 RST 休息；Reserve 會於每次任務後自動恢復。' : 'Select crew in Deployment to spend RST on rest; reserves recover automatically after every mission.'}</p>
      </section></div>}
      {activeTab === 'crew' && <div id="collection-panel-crew" role="tabpanel" aria-labelledby="collection-tab-crew-button" className="collection-crew-pane" data-testid="collection-crew-pane">
      <div className="collection-filters">
        {['ALL', ...database.factions.map((faction) => faction.code)].map((code) => <button key={code} className={factionFilter === code ? 'active' : ''} data-testid={`collection-filter-${code}`} onClick={() => { setFactionFilter(code); setPage(0); }}>{code}</button>)}
        <input
          className="collection-search"
          data-testid="collection-search"
          value={crewSearch}
          onChange={(event) => { setCrewSearch(event.target.value); setPage(0); }}
          placeholder={language === 'zh' ? '搜尋 ID／姓名／職種' : 'Search ID / name / role'}
          aria-label={language === 'zh' ? '搜尋 Crew 卡牌' : 'Search crew cards'}
        />
      </div>
      <div className="workspace-pagination" data-testid="collection-pagination">
        <button data-testid="collection-page-previous" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>←</button>
        <span data-testid="collection-page-status">{currentPage + 1}/{pageCount} · {characters.length} CREW</span>
        <button data-testid="collection-page-next" disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>→</button>
      </div>
      <div className="collection-grid">
        {visibleCharacters.map((character) => {
          const mastery = characterMastery(campaign.characterXp[character.id] ?? 0);
          const trackProgress = careerTrackProgress(campaign, database.characters, character.trackId);
          const careerUnlocked = unlockedCharacterIds.has(character.id);
          const persistentFatigue = campaignCrewFatigue(campaign, character.id);
          const readinessBand = crewReadinessBand(campaign, character);
          const art = database.sourceArtIndex.items[character.id];
          return <article
            key={character.id}
            className={`collection-card${careerUnlocked ? '' : ' career-locked'}`}
            data-testid={`collection-character-${character.id}`}
            data-career-unlocked={careerUnlocked}
            data-source-art-character-id={character.id}
            data-source-art-version={art?.version ?? ''}
            data-source-art-file={art?.file ?? ''}
            data-source-art-qa-status={art?.qaStatus ?? ''}
            data-source-art-engineering-qa-status={art?.engineeringQaStatus ?? ''}
            style={{ '--faction': database.factionById.get(character.factionCode)?.color ?? '#42dbc8' } as React.CSSProperties}
          >
            <div className="collection-art">
              {art ? <img loading="lazy" src={`/assets/source-art/p01/${art.file}`} alt="" /> : <span>◈</span>}
              <small>{art ? `P01 ${art.version.toUpperCase()}` : 'PROMPT READY'}</small>
              {!careerUnlocked && <em className="career-lock-badge">🔒 {character.levelCode}</em>}
            </div>
            <div className="collection-copy"><span>{character.factionCode} · {character.levelCode}</span><b>{characterName(character, language)}</b><small>{professionName(character, language)}</small></div>
            <div className="collection-career" data-testid={`collection-career-status-${character.id}`}>
              <div><span>{character.trackId} · TRACK L{trackProgress.level}</span><b>{careerUnlocked ? (language === 'zh' ? '已解鎖' : 'UNLOCKED') : `${character.levelCode} LOCKED`}</b></div>
              <i><span style={{ width: `${trackProgress.progress * 100}%` }} /></i>
              <small>{trackProgress.nextThreshold === null ? `${trackProgress.xp} XP · MAX` : `${trackProgress.xp} / ${trackProgress.nextThreshold} XP`}</small>
            </div>
            <div className="collection-mastery">
              <div><span>MASTERY L{mastery.level}</span><b>{mastery.xp}{mastery.nextThreshold ? ` / ${mastery.nextThreshold}` : ' MAX'} XP</b></div>
              <i><span style={{ width: `${mastery.progress * 100}%` }} /></i>
            </div>
            <div className={`collection-readiness band-${readinessBand.toLowerCase()}`} data-testid={`collection-readiness-${character.id}`}><div><span>{language === 'zh' ? FATIGUE_ZH[readinessBand] : readinessBand}</span><b>{persistentFatigue}/{character.fatigueMax}</b></div><i><span style={{ width: `${(persistentFatigue / Math.max(1, character.fatigueMax)) * 100}%` }} /></i></div>
            <div className="collection-skills" aria-label="Skill unlocks">
              {characterSkillIds(character).map((skillId, index) => <span key={skillId} className={isSkillSlotUnlocked(index, mastery) ? 'unlocked' : 'locked'} title={skillName(database.skillById.get(skillId)!, language)}>{isSkillSlotUnlocked(index, mastery) ? '◆' : '◇'}</span>)}
            </div>
            <MasteryPerkBadges xp={mastery.xp} language={language} compact testId={`collection-perks-${character.id}`} />
          </article>;
        })}
      </div></div>}
    </section>
  );
}

function MasteryPerkBadges({ xp, language, compact = false, testId }: { xp: number; language: Language; compact?: boolean; testId: string }) {
  const unlocked = new Set(unlockedMasteryPerks(xp).map((perk) => perk.id));
  return (
    <div className={`mastery-perks${compact ? ' compact' : ''}`} data-testid={testId}>
      {MASTERY_PERKS.map((perk) => {
        const available = unlocked.has(perk.id);
        return <div key={perk.id} className={available ? 'unlocked' : 'locked'} title={language === 'zh' ? perk.descriptionZh : perk.descriptionEn}>
          <span>L{perk.requiredLevel}</span><b>{language === 'zh' ? perk.titleZh : perk.titleEn}</b><small>{available ? (language === 'zh' ? '已啟用' : 'Active') : `${perk.requiredLevel === 4 ? 500 : 900} XP`}</small>
        </div>;
      })}
    </div>
  );
}

function CodexScreen({ database, campaign, language }: { database: GameDatabase; campaign: CampaignProgress; language: Language }) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const categories = [...new Set(database.codex.map((entry) => entry.category))];
  const entries = categoryFilter === 'ALL'
    ? database.codex
    : database.codex.filter((entry) => entry.category === categoryFilter);
  const pageSize = 3;
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleEntries = entries.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  const unlockedCount = database.codex.filter((entry) => isCodexEntryUnlocked(entry, campaign)).length;

  return (
    <section className="codex-shell" data-testid="codex-screen">
      <div className="codex-heading">
        <div>
          <span className="section-kicker">KNOWLEDGE CODEX</span>
          <h2>{language === 'zh' ? '離岸風電知識庫' : 'Offshore wind knowledge codex'}</h2>
          <p>{language === 'zh' ? '完成任務後解鎖該任務的工程知識與安全摘要。' : 'Complete missions to unlock their engineering and safety summaries.'}</p>
        </div>
        <div className="codex-summary" data-testid="codex-unlock-count"><b>{unlockedCount}/{database.codex.length}</b><span>{language === 'zh' ? '知識條目已解鎖' : 'entries unlocked'}</span></div>
      </div>
      <div className="codex-filters" aria-label={language === 'zh' ? '知識分類' : 'Knowledge categories'}>
        {['ALL', ...categories].map((category) => (
          <button key={category} className={categoryFilter === category ? 'active' : ''} data-testid={`codex-filter-${category}`} onClick={() => { setCategoryFilter(category); setPage(0); }}>
            {category === 'ALL' ? (language === 'zh' ? '全部' : 'All') : codexCategoryLabel(category, language)}
          </button>
        ))}
      </div>
      <div className="workspace-pagination codex-pagination" data-testid="codex-pagination">
        <button data-testid="codex-page-previous" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>←</button>
        <span>{currentPage + 1}/{pageCount} · {entries.length} ENTRIES</span>
        <button data-testid="codex-page-next" disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>→</button>
      </div>
      <div className="codex-grid">
        {visibleEntries.map((entry) => {
          const unlocked = isCodexEntryUnlocked(entry, campaign);
          const mission = database.missionById.get(entry.unlockMissionId)!;
          return (
            <article key={entry.id} className={`codex-card ${unlocked ? 'unlocked' : 'locked'}`} data-testid={`codex-entry-${entry.id}`} data-unlocked={unlocked}>
              <div className="codex-card-heading"><span>{entry.id} · {codexCategoryLabel(entry.category, language)}</span><b>{unlocked ? '◆' : '◇'}</b></div>
              <h3>{unlocked ? (language === 'zh' ? entry.titleZh : entry.titleEn) : (language === 'zh' ? '知識條目尚未解鎖' : 'Knowledge entry locked')}</h3>
              {unlocked ? (
                <>
                  <p>{language === 'zh' ? entry.summaryZh : entry.summaryEn}</p>
                  <ul>{(language === 'zh' ? entry.keyPointsZh : entry.keyPointsEn).map((point) => <li key={point}>{point}</li>)}</ul>
                  <div className="codex-safety"><b>{language === 'zh' ? '安全邊界' : 'Safety boundary'}</b><span>{language === 'zh' ? entry.safetyNoteZh : entry.safetyNoteEn}</span></div>
                  <small>{language === 'zh' ? entry.sourceNoteZh : entry.sourceNoteEn}</small>
                </>
              ) : (
                <div className="codex-lock-copy"><span>LOCKED</span><p>{language === 'zh' ? '完成任務後解鎖：' : 'Complete mission to unlock: '}<b>{missionTitle(mission, language)}</b></p></div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function codexCategoryLabel(category: string, language: Language): string {
  const labels: Record<string, [string, string]> = {
    CONDITION_MONITORING: ['狀態監測', 'Condition monitoring'],
    HYDRAULICS: ['液壓系統', 'Hydraulics'],
    ELECTRICAL_SAFETY: ['電氣安全', 'Electrical safety'],
    ELECTRICAL_DIAGNOSTICS: ['電氣診斷', 'Electrical diagnostics'],
    DRIVETRAIN: ['傳動鏈', 'Drivetrain'],
    CONTROL_SYSTEMS: ['控制系統', 'Control systems'],
    OPERATIONS: ['運維決策', 'Operations'],
  };
  const label = labels[category];
  return label ? label[language === 'zh' ? 0 : 1] : category;
}

function BranchEventPanel({
  event,
  options,
  language,
  highlight = false,
  onReact,
  onAccept,
}: {
  event: MissionBranchEvent;
  options: Array<{ actorIndex: number; character: CharacterData; skill: SkillData; available: boolean; reason?: string }>;
  language: Language;
  highlight?: boolean;
  onReact: (actorIndex: number, skillId: string) => void;
  onAccept: () => void;
}) {
  const penaltyItems = branchPenaltyItems(event.penalty, language);
  const recommendedReactive = [...options]
    .filter((option) => option.available)
    .sort((left, right) => right.skill.power - left.skill.power || left.skill.energyCost - right.skill.energyCost)[0];
  const recommendedReactiveReason = recommendedReactive
    ? `Recommended: highest available Reactive power ${recommendedReactive.skill.power}; mitigates branch consequence before accepting penalty`
    : '';
  return (
    <section className={`branch-event-panel${highlight ? ' onboarding-focus' : ''}`} data-testid="branch-event-panel" style={{ '--branch': event.accent } as React.CSSProperties}>
      <div className="branch-event-heading">
        <span>{event.icon}</span>
        <div><small>BRANCH EVENT · REACTIVE WINDOW · <em data-testid="branch-intensity">×{event.intensity.toFixed(2)}</em></small><b>{language === 'zh' ? event.titleZh : event.titleEn}</b></div>
      </div>
      <p>{language === 'zh' ? event.descriptionZh : event.descriptionEn}</p>
      <div className="branch-penalties" aria-label={language === 'zh' ? '完整事件後果' : 'Full event consequence'}>
        {penaltyItems.map((item) => <span key={item}>{item}</span>)}
      </div>
      {recommendedReactive && (
        <button
          type="button"
          className="branch-reactive-cta"
          data-testid="branch-reactive-cta"
          data-recommended-character-id={recommendedReactive.character.id}
          data-recommended-skill-id={recommendedReactive.skill.id}
          data-recommended-reactive-reason={recommendedReactiveReason}
          data-recommended-reactive-power={recommendedReactive.skill.power}
          data-recommended-reactive-energy-cost={recommendedReactive.skill.energyCost}
          title={recommendedReactiveReason}
          onClick={() => onReact(recommendedReactive.actorIndex, recommendedReactive.skill.id)}
        >
          <span>REC</span>
          <b>{characterName(recommendedReactive.character, language)} → {skillName(recommendedReactive.skill, language)}</b>
          <small>Reactive / E -{recommendedReactive.skill.energyCost} / Power {recommendedReactive.skill.power}</small>
          <small className="branch-reactive-reason" data-testid="branch-reactive-reason">{recommendedReactiveReason}</small>
        </button>
      )}
      <div className="reactive-options">
        {options.map((option) => (
          <button
            key={`${option.actorIndex}-${option.skill.id}`}
            data-testid={`branch-reactive-${option.actorIndex}-${option.skill.id}`}
            disabled={!option.available}
            title={option.reason}
            onClick={() => onReact(option.actorIndex, option.skill.id)}
          >
            <span>{characterName(option.character, language)}</span>
            <b>{skillName(option.skill, language)}</b>
            <small>{option.skill.energyCost}E · Power {option.skill.power}</small>
          </button>
        ))}
        {options.length === 0 && <p className="no-reactive">{language === 'zh' ? '本隊沒有可用 Reactive skill。' : 'No Reactive skill is available in this team.'}</p>}
      </div>
      <button className="branch-accept" data-testid="branch-accept" onClick={onAccept}>{language === 'zh' ? '不使用技能／承受完整後果' : 'Accept full consequence'}</button>
    </section>
  );
}

function DiagnosisPanel({ mission, language, highlight = false, onChoose }: { mission: MissionData; language: Language; highlight?: boolean; onChoose: (optionId: string) => void }) {
  const recommendedDiagnosis = mission.diagnosisOptions.find((option) => option.correct);
  const recommendedDiagnosisReason = recommendedDiagnosis
    ? `Recommended: evidence-backed answer from ${mission.diagnosisOptions.length} diagnosis options`
    : '';
  return (
    <div className={`diagnosis-panel${highlight ? ' onboarding-focus' : ''}`} data-testid="diagnosis-panel">
      <span className="section-kicker">DIAGNOSIS GATE</span>
      <b>{language === 'zh' ? '根據目前證據，下一步應採取什麼判斷？' : 'What decision should follow the available evidence?'}</b>
      {recommendedDiagnosis && (
        <button
          type="button"
          className="diagnosis-rec-cta"
          data-testid="diagnosis-rec-cta"
          data-recommended-diagnosis-id={recommendedDiagnosis.id}
          data-recommended-diagnosis-reason={recommendedDiagnosisReason}
          onClick={() => onChoose(recommendedDiagnosis.id)}
        >
          <span>REC</span>
          <b>{language === 'zh' ? recommendedDiagnosis.labelZh : recommendedDiagnosis.labelEn}</b>
          <small data-testid="diagnosis-rec-reason">{recommendedDiagnosisReason}</small>
        </button>
      )}
      <div>
        {mission.diagnosisOptions.map((option) => (
          <button
            key={option.id}
            className="diagnosis-choice"
            data-testid={option.correct ? 'diagnosis-choice-correct' : `diagnosis-choice-${option.id}`}
            onClick={() => onChoose(option.id)}
          >{language === 'zh' ? option.labelZh : option.labelEn}</button>
        ))}
      </div>
    </div>
  );
}

function DebriefPanel({
  debrief,
  failureReason,
  reward,
  missions,
  characters,
  codexEntry,
  completionSummary,
  continueTargets,
  logEntries,
  language,
  highlight = false,
  onSelectMission,
  onReturnRoute,
}: {
  debrief: ReturnType<typeof missionDebrief>;
  failureReason?: MissionFailureReason;
  reward?: CampaignReward;
  missions: MissionData[];
  characters: CharacterData[];
  codexEntry?: CodexEntryData;
  completionSummary?: CampaignCompletionSummary;
  continueTargets?: CampaignContinueTargets;
  logEntries: string[];
  language: Language;
  highlight?: boolean;
  onSelectMission?: (missionId: string) => void;
  onReturnRoute?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'review' | 'score' | 'log'>('review');
  const unlockedMission = reward?.newlyUnlockedMissionId
    ? missions.find((mission) => mission.id === reward.newlyUnlockedMissionId)
    : undefined;
  const debriefCharacterById = new Map(characters.map((character) => [character.id, character]));
  const newlyUnlockedCareerNames = reward?.newlyUnlockedCharacterIds
    .map((id) => debriefCharacterById.get(id))
    .filter((character): character is CharacterData => Boolean(character))
    .map((character) => `${character.levelCode} ${characterName(character, language)}`) ?? [];
  const handleDebriefTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const tabs = ['review', 'score', 'log'] as const;
    const currentIndex = tabs.indexOf(activeTab);
    const nextTab = event.key === 'ArrowRight'
      ? tabs[(currentIndex + 1) % tabs.length]
      : event.key === 'ArrowLeft'
        ? tabs[(currentIndex - 1 + tabs.length) % tabs.length]
        : event.key === 'Home'
          ? tabs[0]
          : event.key === 'End'
            ? tabs[tabs.length - 1]
            : undefined;
    if (!nextTab) return;
    event.preventDefault();
    setActiveTab(nextTab);
    window.requestAnimationFrame(() => document.getElementById(`debrief-tab-${nextTab}-button`)?.focus());
  };
  return (
    <div className={`debrief-panel${highlight ? ' onboarding-focus' : ''}`} data-testid="mission-debrief">
      <div className="debrief-summary">
        <div className="debrief-grade"><strong>{debrief.grade}</strong><span>{debrief.totalScore}</span></div>
        <div>
          <span>MISSION RESULT REVIEW</span>
          <b>{reward ? (language === 'zh' ? '戰役結算摘要' : 'Campaign settlement summary') : (language === 'zh' ? '任務分數摘要' : 'Mission score summary')}</b>
          <small>{language === 'zh' ? '所有數值皆為 gameplay abstraction。' : 'All values are gameplay abstractions.'}</small>
        </div>
      </div>
      <nav className="debrief-tabs" role="tablist" aria-label={language === 'zh' ? '任務結算頁籤' : 'Mission result tabs'} data-testid="debrief-tabs">
        {([
          ['review', language === 'zh' ? '結算摘要' : 'Review'],
          ['score', language === 'zh' ? '分數' : 'Score'],
          ['log', 'Log'],
        ] as const).map(([tab, label]) => <button key={tab} id={`debrief-tab-${tab}-button`} role="tab" type="button" className={activeTab === tab ? 'active' : ''} aria-selected={activeTab === tab} aria-controls={`debrief-panel-${tab}`} tabIndex={activeTab === tab ? 0 : -1} data-testid={`debrief-tab-${tab}`} onClick={() => setActiveTab(tab)} onKeyDown={handleDebriefTabKey}>{label}</button>)}
      </nav>
      {activeTab === 'score' && <div id="debrief-panel-score" role="tabpanel" aria-labelledby="debrief-tab-score-button" className="debrief-metrics" data-testid="debrief-score-panel">
        <Metric label={language === 'zh' ? '完成度' : 'Completion'} value={debrief.completionScore} />
        <Metric label={language === 'zh' ? '安全' : 'Safety'} value={debrief.safetyScore} />
        <Metric label={language === 'zh' ? '證據' : 'Evidence'} value={debrief.evidenceScore} />
        <Metric label={language === 'zh' ? '時間' : 'Time'} value={debrief.timeScore} />
        <Metric label={language === 'zh' ? '疲勞' : 'Fatigue'} value={debrief.fatigueScore} />
        <Metric label={language === 'zh' ? '成本' : 'Cost'} value={debrief.costScore} />
      </div>}
      {activeTab === 'review' && <div id="debrief-panel-review" role="tabpanel" aria-labelledby="debrief-tab-review-button" className="mission-result-review" data-testid="mission-result-review">
        {reward && <div className={`score-compare-reward ${reward.scoreRecordStatus.toLowerCase().replace('_', '-')}`} data-testid="score-compare-reward">
          <span><small>{language === 'zh' ? '本次' : 'THIS RUN'}</small><b>{reward.currentGrade} · {reward.currentScore}</b></span>
          <span><small>{language === 'zh' ? '任務前 BEST' : 'BEST BEFORE'}</small><b>{reward.previousBestScore === undefined ? 'NONE' : reward.previousBestScore}</b></span>
          <span><small>{language === 'zh' ? '任務後 BEST' : 'BEST AFTER'}</small><b>{reward.bestGradeAfter} · {reward.bestScoreAfter}</b></span>
          <strong>{reward.scoreRecordStatus === 'FIRST_BEST'
            ? (language === 'zh' ? '首次 BEST' : 'FIRST BEST')
            : reward.scoreRecordStatus === 'NEW_BEST'
              ? (language === 'zh' ? '刷新 BEST' : 'NEW BEST')
              : (language === 'zh' ? 'BEST 維持' : 'BEST HELD')}</strong>
        </div>}
        {reward && <div className="campaign-reward" data-testid="campaign-reward"><b>+{reward.earnedXp} XP</b><span>{unlockedMission ? `${language === 'zh' ? '解鎖' : 'Unlocked'}：${missionTitle(unlockedMission, language)}` : reward.campaignCompleted ? (language === 'zh' ? '五章戰役全數完成' : 'All five chapters complete') : language === 'zh' ? '最佳分數已保存' : 'Best score saved'}</span>{reward.newlyUnlockedEquipmentTier && <span data-testid="equipment-tier-reward">{language === 'zh' ? `Equipment ${reward.newlyUnlockedEquipmentTier} 解鎖 · ${reward.newlyUnlockedEquipmentIds.length} 項` : `Equipment ${reward.newlyUnlockedEquipmentTier} unlocked · ${reward.newlyUnlockedEquipmentIds.length} items`}</span>}<span data-testid="track-xp-reward">{reward.trackProgressUpdates.map((update) => `${update.trackId} ${update.beforeXp}→${update.afterXp} XP`).join(' · ')}</span>{newlyUnlockedCareerNames.length > 0 && <span data-testid="career-unlock-reward">{language === 'zh' ? `Career 解鎖：${newlyUnlockedCareerNames.join('、')}` : `Career unlocked: ${newlyUnlockedCareerNames.join(', ')}`}</span>}</div>}
        {reward && <div className="maintenance-reward" data-testid="maintenance-reward"><b>+{reward.maintenanceCreditsEarned} MNT</b><span>{reward.equipmentWear.map((item) => `${item.slot === 'equipment' ? 'EQ' : 'SP'} ${item.before}→${item.after} (-${item.wear})`).join(' · ')}</span><small>{language === 'zh' ? '任務損耗與 Maintenance Credits 為 gameplay abstraction。' : 'Mission wear and Maintenance Credits are gameplay abstractions.'}</small></div>}
        {reward && <div className="crew-recovery-reward" data-testid="crew-recovery-reward"><b>+{reward.recoveryTokensEarned} RST</b><span>{reward.crewFatigueUpdates.filter((item) => item.source === 'deployed').map((item) => `${debriefCharacterById.get(item.characterId) ? characterName(debriefCharacterById.get(item.characterId)!, language) : item.characterId} ${item.missionEnd}→${item.after}`).join(' · ')}</span><small>{language === 'zh' ? `返航恢復已套用；Reserve 自動恢復 ${reward.crewFatigueUpdates.filter((item) => item.source === 'reserve').length} 人。數值為 gameplay abstraction。` : `Transit recovery applied; ${reward.crewFatigueUpdates.filter((item) => item.source === 'reserve').length} reserves recovered automatically. Values are gameplay abstractions.`}</small></div>}
        {reward?.windFarmUpdate && <div className={`wind-farm-reward ${reward.windFarmUpdate.after.availability.toLowerCase()}`} data-testid="wind-farm-reward"><b>{reward.windFarmUpdate.turbineId.replace('WTG-OWM-', 'WTG-')} · {reward.windFarmUpdate.after.availability}</b><span>Reliability {reward.windFarmUpdate.before.reliability}→{reward.windFarmUpdate.after.reliability}% ({reward.windFarmUpdate.reliabilityDelta >= 0 ? '+' : ''}{reward.windFarmUpdate.reliabilityDelta}) · Backlog {reward.windFarmUpdate.before.openFaults}→{reward.windFarmUpdate.after.openFaults}</span><small>{language === 'zh' ? 'Wind Farm Operations Board 已保存本次任務結果；數值為 gameplay abstraction。' : 'Mission outcome saved to the Wind Farm Operations Board; values are gameplay abstractions.'}</small></div>}
        {reward && codexEntry && <div className="codex-reward" data-testid="codex-reward"><b>KNOWLEDGE CODEX ◆</b><span>{language === 'zh' ? codexEntry.titleZh : codexEntry.titleEn}</span></div>}
        {reward && continueTargets && onSelectMission && onReturnRoute && <CampaignContinueActions targets={continueTargets} language={language} onSelectMission={onSelectMission} onReturnRoute={onReturnRoute} />}
      </div>}
      {activeTab === 'log' && <div id="debrief-panel-log" role="tabpanel" aria-labelledby="debrief-tab-log-button" className="log-list debrief-log-list" data-testid="debrief-log-panel">
        {logEntries.map((entry, index) => <p key={`${entry}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{entry}</p>)}
      </div>}
      {completionSummary?.complete && <CampaignCompletionPanel summary={completionSummary} language={language} compact />}
      {failureReason && <small>{failureReasonLabel(failureReason, language)}</small>}
    </div>
  );
}

function CampaignContinueActions({
  targets,
  language,
  onSelectMission,
  onReturnRoute,
}: {
  targets: CampaignContinueTargets;
  language: Language;
  onSelectMission: (missionId: string) => void;
  onReturnRoute: () => void;
}) {
  const currentMission = targets.currentMission;
  const nextMission = targets.nextAvailableMission;
  const nextLabel = nextMission
    ? `${String(nextMission.order).padStart(2, '0')} · ${nextMission.id} · ${missionTitle(nextMission, language)}`
    : (language === 'zh' ? '戰役已完成' : 'Campaign complete');
  const replayLabel = currentMission
    ? `${String(currentMission.order).padStart(2, '0')} · ${currentMission.id} · ${missionTitle(currentMission, language)}`
    : (language === 'zh' ? '目前任務' : 'Current mission');

  const recommendedContinueAction = nextMission ? 'next-mission' : 'return-route';
  const nextReason = nextMission
    ? `Recommended: continue to unlocked mission ${nextMission.id}`
    : 'Recommended: campaign complete; return to Route to review fleet state';
  const routeReason = 'Review fleet, crew readiness, loadout, and wind farm condition before redeploying';
  const replayReason = currentMission
    ? `Replay ${currentMission.id} to chase a better best score`
    : 'Replay unavailable because no current mission is selected';

  return (
    <div className="campaign-continue-actions" data-testid="campaign-continue-actions" data-recommended-continue-action={recommendedContinueAction} data-current-mission-id={currentMission?.id ?? ''} data-next-mission-id={nextMission?.id ?? ''} data-available-mission-count={targets.availableMissionCount}>
      <div data-testid="campaign-continue-summary" data-recommended-continue-action={recommendedContinueAction} data-next-mission-id={nextMission?.id ?? ''}>
        <span>{language === 'zh' ? '下一步' : 'NEXT ACTION'}</span>
        <b>{nextMission ? nextLabel : (language === 'zh' ? '所有任務已結算' : 'All missions settled')}</b>
        <small>{nextReason} ? {targets.availableMissionCount} ready; no new save fields.</small>
      </div>
      <button type="button" className={nextMission ? 'recommended' : ''} data-testid="continue-next-mission" data-continue-action="next-mission" data-continue-reason={nextReason} data-recommended-mission-id={nextMission?.id ?? ''} data-current-mission-id={currentMission?.id ?? ''} disabled={!nextMission} onClick={() => nextMission && onSelectMission(nextMission.id)}>
        <span>{language === 'zh' ? '下一個任務' : 'Next mission'}</span>
        <small>{nextLabel}</small>
      </button>
      <button type="button" data-testid="continue-return-route" data-continue-action="return-route" data-continue-reason={routeReason} data-current-mission-id={currentMission?.id ?? ''} onClick={onReturnRoute}>
        <span>{language === 'zh' ? '返回 Route' : 'Return route'}</span>
        <small>{language === 'zh' ? '檢查風場／隊伍／裝備' : 'Review fleet / crew / loadout'}</small>
      </button>
      <button type="button" data-testid="continue-replay-mission" data-continue-action="replay-mission" data-continue-reason={replayReason} data-replay-mission-id={currentMission?.id ?? ''} data-current-mission-id={currentMission?.id ?? ''} disabled={!currentMission} onClick={() => currentMission && onSelectMission(currentMission.id)}>
        <span>{language === 'zh' ? '重玩本任務' : 'Replay mission'}</span>
        <small>{replayLabel}</small>
      </button>
    </div>
  );
}

function BossChallengeResultPanel({ settlement, language }: { settlement: BossChallengeSettlement; language: Language }) {
  return (
    <section className={`boss-challenge-result${settlement.isNewBest ? ' new-best' : ''}`} data-testid="challenge-result">
      <div>
        <span>{settlement.isNewBest ? 'NEW LOCAL BEST' : 'ATTEMPT COMPLETE'}</span>
        <b>{settlement.attempt.grade} · {settlement.attempt.bestScore}</b>
        <small>R{settlement.attempt.roundsUsed} · {settlement.attempt.completed ? (language === 'zh' ? '完成' : 'CLEARED') : (language === 'zh' ? '未完成' : 'FAILED')} · <i data-testid="challenge-result-attempt-source">{challengeRecordSourceLabel(settlement.attempt.source, language)}</i></small>
      </div>
      <div>
        <span>{language === 'zh' ? '本 Boss 最佳' : 'BOSS BEST'}</span>
        <b>{settlement.best.grade} · {settlement.best.bestScore} · <i data-testid="challenge-result-best-source">{challengeRecordSourceLabel(settlement.best.source, language)}</i></b>
        <small>{settlement.previousBestScore === null ? (language === 'zh' ? '首次紀錄' : 'FIRST RECORD') : `${language === 'zh' ? '先前' : 'PREVIOUS'} ${settlement.previousBestScore}`}</small>
      </div>
      <p>{language === 'zh' ? `本次最佳紀錄與規劃 draft 分別保存至 ${BOSS_CHALLENGE_STORAGE_KEY}；Campaign XP／MNT／RST／疲勞／裝備 Condition 均未變更。` : `Best record and squad draft are stored separately in ${BOSS_CHALLENGE_STORAGE_KEY}; Campaign XP, MNT, RST, fatigue, and equipment condition remain unchanged.`}</p>
    </section>
  );
}

function challengeRecordSourceLabel(source: BossChallengeRecordSource, language: Language): string {
  if (source === 'DRAFT_CONFIRMATION') return language === 'zh' ? 'DRAFT 確認' : 'DRAFT CONFIRM';
  return 'OPERATION';
}

function ResourceMeter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className={`resource-meter ${tone}`}><div><span>{label}</span><b>{value}%</b></div><i><span style={{ width: `${value}%` }} /></i></div>;
}

function branchPenaltyItems(penalty: BranchPenalty, language: Language): string[] {
  const labels = language === 'zh'
    ? { weatherLoss: '天候', safetyLoss: '安全', evidenceLoss: '證據', reliabilityLoss: '可靠度', progressLoss: '進度', costIncrease: '成本', energyDrain: '全隊 Energy' }
    : { weatherLoss: 'Weather', safetyLoss: 'Safety', evidenceLoss: 'Evidence', reliabilityLoss: 'Reliability', progressLoss: 'Progress', costIncrease: 'Cost', energyDrain: 'Team Energy' };
  return (Object.entries(penalty) as Array<[keyof BranchPenalty, number]>)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${labels[key]} ${key === 'costIncrease' ? '+' : '-'}${value}`);
}

function branchPenaltySummary(penalty: BranchPenalty, language: Language): string {
  return branchPenaltyItems(penalty, language).join(' · ') || (language === 'zh' ? '無額外損失' : 'No additional loss');
}

function failureReasonLabel(reason: MissionFailureReason, language: Language): string {
  const labels = {
    TeamExhausted: ['全隊耗竭，必須撤離', 'All crew exhausted; evacuation required'],
    RoundLimit: ['超過作業時間限制', 'Operation exceeded the round limit'],
    WeatherWindow: ['天候窗口關閉', 'Weather window closed'],
    Safety: ['安全餘裕耗盡', 'Safety margin depleted'],
  } as const;
  return labels[reason][language === 'zh' ? 0 : 1];
}

function requiredCharacter(database: GameDatabase, id: string): CharacterData {
  const character = database.characterById.get(id);
  if (!character) throw new Error(`找不到角色：${id}`);
  return character;
}

function sessionMasteryXp(mode: SessionState['mode'], campaign: CampaignProgress, characterId: string): number {
  if (mode === 'sandbox') return 900;
  if (mode === 'challenge') return BOSS_CHALLENGE_MASTERY_XP;
  return campaign.characterXp[characterId] ?? 0;
}

function requiredEquipment(database: GameDatabase, id: string): EquipmentData {
  const equipment = database.equipmentById.get(id);
  if (!equipment) throw new Error(`找不到裝備：${id}`);
  return equipment;
}

function requiredMission(database: GameDatabase, id: string): MissionData {
  const mission = database.missionById.get(id);
  if (!mission) throw new Error(`找不到任務：${id}`);
  return mission;
}

function requiredVessel(database: GameDatabase, id: string): VesselData {
  const vessel = database.vesselById.get(id);
  if (!vessel) throw new Error(`找不到船舶：${id}`);
  return vessel;
}

function equipmentName(equipment: EquipmentData, language: Language): string {
  return language === 'zh' ? equipment.nameZh : equipment.nameEn;
}

function vesselName(vessel: VesselData, language: Language): string {
  return language === 'zh' ? vessel.nameZh : vessel.nameEn;
}

function missionTitle(mission: MissionData, language: Language): string {
  return language === 'zh' ? mission.titleZh : mission.titleEn;
}

function pushLog(log: string[], entry: string): string[] {
  return [entry, ...log].slice(0, 6);
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function DataChip({ value, label }: { value: number; label: string }) {
  return <div className="data-chip"><strong>{value.toLocaleString()}</strong><span>{label}</span></div>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
