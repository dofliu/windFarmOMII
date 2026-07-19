import {
  MAX_EQUIPMENT_CONDITION,
  applyLoadout,
  applyMasteryPerks,
  campaignCrewFatigue,
  campaignEquipmentCondition,
  crewReadinessBandForFatigue,
  equipmentWearForMission,
  evaluateLoadout,
  maintenanceCreditsForMission,
  masteryPerkModifiers,
  teamMasteryPerks,
  type CampaignProgress,
  type CrewReadinessBand,
} from './campaign';
import { bossClassRule, createMission } from './runtime';
import { createFleetConditionDispatchModifier, projectFleetConditionDispatch, type FleetConditionDispatchProjection } from './windFarm';
import type { BossData, CharacterData, EquipmentData, MissionData, VesselData } from './types';

export interface DispatchEquipmentForecast {
  equipmentId: string;
  slot: 'equipment' | 'spare';
  before: number;
  successWear: number;
  failureWear: number;
  afterSuccess: number;
  afterFailure: number;
  successRepairCost: number;
  failureRepairCost: number;
}

export interface DispatchCrewForecast {
  characterId: string;
  before: number;
  fatigueMax: number;
  perRoundDamage: number;
  transitRecovery: number;
  afterOneRound: number;
  afterRoundLimit: number;
  oneRoundBand: CrewReadinessBand;
  roundLimitBand: CrewReadinessBand;
}

export interface DispatchCrewForecastContext {
  roundLimit: number;
  baseFatigueDamage: number;
  transitRecovery: number;
}

export interface DispatchMaintenanceForecast {
  current: number;
  successRewardMin: number;
  successRewardMax: number;
  failureReward: number;
  successRepairCost: number;
  failureRepairCost: number;
  afterSuccessFullRepairMin: number;
  afterSuccessFullRepairMax: number;
  afterFailureFullRepair: number;
}

export interface DispatchForecast {
  missionId: string;
  roundLimit: number;
  branchEventCount: number;
  equipment: DispatchEquipmentForecast[];
  maintenance: DispatchMaintenanceForecast;
  crew: DispatchCrewForecast[];
  recoveryTokens: {
    current: number;
    earned: number;
    after: number;
  };
  fleetCondition?: FleetConditionDispatchProjection;
}

export function createDispatchForecast(
  campaign: CampaignProgress,
  mission: MissionData,
  boss: BossData,
  equipment: EquipmentData,
  spare: EquipmentData,
  vessel: VesselData,
  crew: CharacterData[],
): DispatchForecast {
  const roundLimit = createMission(boss).roundLimit;
  const equipmentForecast = [
    equipmentForecastFor(campaign, mission, equipment, 'equipment'),
    equipmentForecastFor(campaign, mission, spare, 'spare'),
  ];
  const successRepairCost = equipmentForecast.reduce((sum, item) => sum + item.successRepairCost, 0);
  const failureRepairCost = equipmentForecast.reduce((sum, item) => sum + item.failureRepairCost, 0);
  const successRewardMin = maintenanceCreditsForMission(mission, { totalScore: 0 }, true);
  const successRewardMax = maintenanceCreditsForMission(mission, { totalScore: 100 }, true);
  const failureReward = maintenanceCreditsForMission(mission, { totalScore: 0 }, false);
  const crewContext = createDispatchCrewForecastContext(boss, equipment, vessel);
  const crewForecast = crew.map((character) => createDispatchCrewForecast(campaign, character, crewContext));
  const recoveryTokensEarned = vessel.class === 'SOV' ? 2 : 1;
  const fleetModifier = createFleetConditionDispatchModifier(campaign.windFarm, mission.turbineId);
  const fleetCondition = fleetModifier
    ? projectFleetConditionDispatch(
        applyMasteryPerks(
          applyLoadout(createMission(boss), evaluateLoadout(mission, equipment, spare, vessel)),
          teamMasteryPerks(crew.map((character) => character.id), campaign),
        ),
        mission.operationProfile.mobilizationCost,
        fleetModifier,
      )
    : undefined;

  return {
    missionId: mission.id,
    roundLimit,
    branchEventCount: mission.branchEventDeck.length,
    equipment: equipmentForecast,
    maintenance: {
      current: campaign.maintenanceCredits,
      successRewardMin,
      successRewardMax,
      failureReward,
      successRepairCost,
      failureRepairCost,
      afterSuccessFullRepairMin: campaign.maintenanceCredits + successRewardMin - successRepairCost,
      afterSuccessFullRepairMax: campaign.maintenanceCredits + successRewardMax - successRepairCost,
      afterFailureFullRepair: campaign.maintenanceCredits + failureReward - failureRepairCost,
    },
    crew: crewForecast,
    recoveryTokens: {
      current: campaign.recoveryTokens,
      earned: recoveryTokensEarned,
      after: campaign.recoveryTokens + recoveryTokensEarned,
    },
    ...(fleetCondition ? { fleetCondition } : {}),
  };
}

export function createDispatchCrewForecast(
  campaign: CampaignProgress,
  character: CharacterData,
  context: DispatchCrewForecastContext,
): DispatchCrewForecast {
  const { roundLimit, baseFatigueDamage, transitRecovery } = context;
  const before = campaignCrewFatigue(campaign, character.id);
  const perRoundDamage = Math.max(
    1,
    baseFatigueDamage - masteryPerkModifiers(campaign.characterXp[character.id] ?? 0).fatigueProtection,
  );
  const afterOneRound = afterTransitRecovery(before, perRoundDamage, 1, character.fatigueMax, transitRecovery);
  const afterRoundLimit = afterTransitRecovery(before, perRoundDamage, roundLimit, character.fatigueMax, transitRecovery);
  return {
    characterId: character.id,
    before,
    fatigueMax: character.fatigueMax,
    perRoundDamage,
    transitRecovery,
    afterOneRound,
    afterRoundLimit,
    oneRoundBand: crewReadinessBandForFatigue(afterOneRound, character.fatigueMax),
    roundLimitBand: crewReadinessBandForFatigue(afterRoundLimit, character.fatigueMax),
  };
}

export function createDispatchCrewForecastContext(
  boss: BossData,
  equipment: EquipmentData,
  vessel: VesselData,
): DispatchCrewForecastContext {
  const classRule = bossClassRule(boss.class);
  const operationalRelief = Math.floor(equipment.fatigueRelief / 2) + vessel.fatigueRelief;
  return {
    roundLimit: createMission(boss).roundLimit,
    baseFatigueDamage: Math.max(1, boss.fatigueDamage + classRule.fatigueBonus - operationalRelief),
    transitRecovery: Math.max(0, vessel.fatigueRelief * 2),
  };
}

function equipmentForecastFor(
  campaign: CampaignProgress,
  mission: MissionData,
  equipment: EquipmentData,
  slot: 'equipment' | 'spare',
): DispatchEquipmentForecast {
  const before = campaignEquipmentCondition(campaign, equipment.id);
  const successWear = equipmentWearForMission(mission, true, slot);
  const failureWear = equipmentWearForMission(mission, false, slot);
  const afterSuccess = Math.max(0, before - successWear);
  const afterFailure = Math.max(0, before - failureWear);
  return {
    equipmentId: equipment.id,
    slot,
    before,
    successWear,
    failureWear,
    afterSuccess,
    afterFailure,
    successRepairCost: fullRepairCost(equipment, afterSuccess),
    failureRepairCost: fullRepairCost(equipment, afterFailure),
  };
}

function fullRepairCost(equipment: EquipmentData, condition: number): number {
  const tierRank = Number(equipment.tier.slice(1));
  return Math.ceil((MAX_EQUIPMENT_CONDITION - condition) * tierRank / 2);
}

function afterTransitRecovery(
  before: number,
  perRoundDamage: number,
  rounds: number,
  fatigueMax: number,
  transitRecovery: number,
): number {
  const missionEnd = Math.min(fatigueMax, Math.max(0, before + perRoundDamage * rounds));
  return Math.max(0, missionEnd - transitRecovery);
}
