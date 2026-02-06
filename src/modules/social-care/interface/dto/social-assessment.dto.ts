import type {
  ACCESSIBILITY_LEVEL,
  ELECTRICITY_ACCESS,
  HOUSING_CONDITION_TYPE,
  SEWAGE_DISPOSAL_METHOD,
  WALL_MATERIAL,
  WASTE_COLLECTION_TYPE,
  WATER_SUPPLY_TYPE,
} from "./enums/housing-condition.enums";

export type HousingConditionDTO = {
  housingConditionType: keyof typeof HOUSING_CONDITION_TYPE;
  wallMaterial: keyof typeof WALL_MATERIAL;
  numberOfRooms: number;
  numberOfBathrooms: number;
  waterSupplyType: keyof typeof WATER_SUPPLY_TYPE;
  electricityAccess: keyof typeof ELECTRICITY_ACCESS;
  sewerDisposalMethod: keyof typeof SEWAGE_DISPOSAL_METHOD;
  wasteCollectionType: keyof typeof WASTE_COLLECTION_TYPE;
  accessibilityLevel: keyof typeof ACCESSIBILITY_LEVEL;
  isInGeographicRiskArea: boolean;
  isInSocialConflictArea: boolean;
};

export type SocialBenefitDTO = {
  benefitName: string;
  amount: number;
  beneficiaryId: string;
};

export type SocioEconomicSituationDTO = {
  totalFamilyIncome: number;
  incomePerCapita: number;
  receivesSocialBenefit: boolean;
  socialBenefits: SocialBenefitDTO[];
  mainSourceOfIncome: string;
  hasUnemployed: boolean;
};
