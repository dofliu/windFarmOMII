export type Language = 'zh' | 'en';

export interface ManifestCounts {
  factions: number;
  careerTracks: number;
  characters: number;
  skills: number;
  characterSkillLinks: number;
  equipment: number;
  bosses: number;
  scenes: number;
  missions: number;
  turbines: number;
  codexEntries: number;
  vessels: number;
  prompts: number;
}

export interface ManifestData {
  project: string;
  version: string;
  counts: ManifestCounts;
  invariants: string[];
  files: string[];
}

export interface FactionData {
  code: string;
  zh: string;
  en: string;
  color: string;
  accent: string;
  theme: string;
}

export interface CareerTrackData {
  id: string;
  faction: string;
  roleZh: string;
  roleEn: string;
  toolsZh: string;
  toolsEn: string;
  personality: string;
}

export interface CharacterData {
  id: string;
  trackId: string;
  artKey: string;
  nameZh: string;
  nameEn: string;
  factionCode: string;
  factionZh: string;
  factionEn: string;
  professionZh: string;
  professionEn: string;
  levelCode: string;
  levelZh: string;
  levelEn: string;
  rarity: string;
  stars: number;
  fatigueMax: number;
  fatigueRecovery: number;
  actionPoints: number;
  atk: number;
  def: number;
  intel: number;
  speed: number;
  passiveSkillId: string;
  skill1Id: string;
  skill2Id: string;
  ultimateSkillId: string;
  personality: string;
  toolsZh: string;
  toolsEn: string;
  ppe: string;
  story: string;
  palette: string;
  portraitFile: string;
  artStatus: string;
}

export interface SkillData {
  id: string;
  trackId: string;
  faction: string;
  nameZh: string;
  nameEn: string;
  type: 'Passive' | 'Active' | 'Reactive' | 'Support' | 'Ultimate';
  target: string;
  energyCost: number;
  cooldown: number;
  fatigueDelta: number;
  power: number;
  effectZh: string;
  statusEffect: string;
  vfx: string;
  sfx: string;
}

export interface BossData {
  id: string;
  class: string;
  nameZh: string;
  nameEn: string;
  severity: string;
  fatigueDamage: number;
  resilience: number;
  phases: number;
  counterFactions: string;
  mechanic: string;
  fileName: string;
}

export type BossChallengeAuditPressure = 'comfortable' | 'tight' | 'critical' | 'failed';

export interface BossChallengeAuditItemData {
  bossId: string;
  recommendedTeamIds: [string, string, string];
  severity: string;
  class: string;
  success: boolean;
  pressure: BossChallengeAuditPressure;
  round: number;
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  candidateTeamsEvaluated: number;
  successfulCandidateTeams: number;
  candidateCompletionRate: number;
}

export interface BossChallengeAuditData {
  schemaVersion: 1;
  model: 'OWM_CHALLENGE_DETERMINISTIC_AUTOPLAY';
  gatesPassed: boolean;
  summary: {
    auditedBosses: number;
    completedBosses: number;
    averageScore: number;
  };
  hardOutlierBossIds: string[];
  items: BossChallengeAuditItemData[];
}

export interface SceneData {
  id: string;
  nameZh: string;
  nameEn: string;
  locationType: string;
  variant: string;
  camera: string;
  mood: string;
  imagePrompt: string;
  fileName: string;
}

export interface SceneAssetIndexItem {
  sceneId: string;
  file: string;
  version: string;
  qaStatus: 'ENGINEERING_QA_PASSED' | 'VISUAL_REVIEW_REQUIRED';
}

export interface SceneAssetFallback {
  sourceSceneId: string;
  file: string;
  version: string;
  qaStatus: 'ENGINEERING_QA_PASSED' | 'VISUAL_REVIEW_REQUIRED';
  labelZh: string;
  labelEn: string;
}

export interface SceneAssetIndexData {
  schemaVersion: 1;
  fallback: SceneAssetFallback;
  items: Record<string, SceneAssetIndexItem>;
}

export interface VesselData {
  id: string;
  class: 'CTV' | 'SOV' | 'USV';
  nameZh: string;
  nameEn: string;
  weatherProtection: number;
  safetyProtection: number;
  fatigueRelief: number;
  deploymentCost: number;
  descriptionZh: string;
  descriptionEn: string;
}

export interface DiagnosisOptionData {
  id: string;
  labelZh: string;
  labelEn: string;
  correct: boolean;
  feedbackZh: string;
  feedbackEn: string;
}

export type MissionBranchCode = 'WEATHER_ESCALATION' | 'SPARE_DELAY' | 'SECONDARY_FAULT' | 'COMMS_OUTAGE' | 'FALSE_ALARM';

export interface MissionBranchTriggerData {
  round: number;
  eventCode: MissionBranchCode;
  intensity: number;
}

export interface MissionOperationProfile {
  siteCode: string;
  siteNameZh: string;
  siteNameEn: string;
  weatherZh: string;
  weatherEn: string;
  seaState: 1 | 2 | 3 | 4 | 5;
  workPermitCode: string;
  workPermitZh: string;
  workPermitEn: string;
  minimumMasteryLevel: 1 | 2 | 3 | 4 | 5;
  minimumQualifiedMembers: number;
  requiredPpeZh: string[];
  requiredPpeEn: string[];
  accessRequirementZh: string;
  accessRequirementEn: string;
  allowedVesselClasses: Array<'CTV' | 'SOV' | 'USV'>;
  initialWeatherWindow: number;
  mobilizationCost: number;
  gameplayAbstraction: true;
}

export type EquipmentTier = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface MissionData {
  id: string;
  chapter: number;
  order: number;
  titleZh: string;
  titleEn: string;
  briefingZh: string;
  briefingEn: string;
  bossId: string;
  sceneId: string;
  turbineId: string;
  recommendedFactionCodes: string[];
  recommendedEquipmentId: string;
  recommendedSpareId: string;
  recommendedVesselId: string;
  unlockRequires: string | null;
  rewardXp: number;
  rewardEquipmentTier: EquipmentTier | null;
  operationProfile: MissionOperationProfile;
  branchEventDeck: MissionBranchTriggerData[];
  learningObjectivesZh: string[];
  learningObjectivesEn: string[];
  diagnosisOptions: DiagnosisOptionData[];
}

export interface TurbineData {
  id: string;
  nameZh: string;
  nameEn: string;
  zone: string;
  ratedPowerMw: number;
  initialReliability: number;
  initialOpenFaults: number;
}

export interface CodexEntryData {
  id: string;
  unlockMissionId: string;
  category: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  keyPointsZh: string[];
  keyPointsEn: string[];
  safetyNoteZh: string;
  safetyNoteEn: string;
  sourceNoteZh: string;
  sourceNoteEn: string;
}

export interface EquipmentData {
  id: string;
  category: string;
  nameZh: string;
  nameEn: string;
  tier: EquipmentTier;
  rarity: string;
  fatigueRelief: number;
  reliabilityBonus: number;
  compatibleFaction: string;
  description: string;
  fileName: string;
}

export interface SourceArtIndexItem {
  characterId: string;
  version: string;
  file: string;
  qaStatus: string;
  engineeringQaStatus: string;
}

export interface SourceArtIndexData {
  schemaVersion: string;
  promptRevision: string;
  generatedAt: string;
  total: number;
  items: Record<string, SourceArtIndexItem>;
}

export interface GameDatabase {
  manifest: ManifestData;
  factions: FactionData[];
  careerTracks: CareerTrackData[];
  characters: CharacterData[];
  skills: SkillData[];
  equipment: EquipmentData[];
  bosses: BossData[];
  bossChallengeAudit: BossChallengeAuditData;
  scenes: SceneData[];
  sceneAssets: SceneAssetIndexData;
  missions: MissionData[];
  turbines: TurbineData[];
  codex: CodexEntryData[];
  vessels: VesselData[];
  sourceArtIndex: SourceArtIndexData;
  factionById: Map<string, FactionData>;
  careerTrackById: Map<string, CareerTrackData>;
  characterById: Map<string, CharacterData>;
  skillById: Map<string, SkillData>;
  equipmentById: Map<string, EquipmentData>;
  bossById: Map<string, BossData>;
  bossChallengeAuditById: Map<string, BossChallengeAuditItemData>;
  sceneById: Map<string, SceneData>;
  missionById: Map<string, MissionData>;
  turbineById: Map<string, TurbineData>;
  codexById: Map<string, CodexEntryData>;
  vesselById: Map<string, VesselData>;
}
