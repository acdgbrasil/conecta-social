import { err, ok, type Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import {
  HousingCondition,
  SocialBenefit,
  SocialBenefitsCollection,
  SocioEconomicSituation,
  FamilyMemberId,
} from "@conecta/social-care";
import {
  ACCESSIBILITY_LEVEL as ACCESSIBILITY_LEVEL_DOMAIN,
  ELECTRICITY_ACCESS as ELECTRICITY_ACCESS_DOMAIN,
  HOUSING_CONDITION_TYPE as HOUSING_CONDITION_TYPE_DOMAIN,
  SEWAGE_DISPOSAL_METHOD as SEWAGE_DISPOSAL_METHOD_DOMAIN,
  WALL_MATERIAL as WALL_MATERIAL_DOMAIN,
  WASTE_COLLECTION_TYPE as WASTE_COLLECTION_TYPE_DOMAIN,
  WATER_SUPPLY_TYPE as WATER_SUPPLY_TYPE_DOMAIN,
} from "@conecta/social-care/domain/value-objects/props/housingCondition.props";
import {
  ACCESSIBILITY_LEVEL as ACCESSIBILITY_LEVEL_DTO,
  ELECTRICITY_ACCESS as ELECTRICITY_ACCESS_DTO,
  HOUSING_CONDITION_TYPE as HOUSING_CONDITION_TYPE_DTO,
  SEWAGE_DISPOSAL_METHOD as SEWAGE_DISPOSAL_METHOD_DTO,
  WALL_MATERIAL as WALL_MATERIAL_DTO,
  WASTE_COLLECTION_TYPE as WASTE_COLLECTION_TYPE_DTO,
  WATER_SUPPLY_TYPE as WATER_SUPPLY_TYPE_DTO,
} from "../../dto/enums/housing-condition.enums";
import type {
  HousingConditionDTO,
  SocialBenefitDTO,
  SocioEconomicSituationDTO,
} from "../../dto/social-assessment.dto";

type EnumMap<
  TDto extends Record<string, string>,
  TDomain extends Record<string, string>,
> = Record<keyof TDto, keyof TDomain>;

const HOUSING_CONDITION_TYPE_MAP: EnumMap<
  typeof HOUSING_CONDITION_TYPE_DTO,
  typeof HOUSING_CONDITION_TYPE_DOMAIN
> = {
  OWNED: "OWNED",
  RENTED: "RENTED",
  CEDED: "CEDED",
  SQUATTED: "SQUATTED",
};

const WALL_MATERIAL_MAP: EnumMap<
  typeof WALL_MATERIAL_DTO,
  typeof WALL_MATERIAL_DOMAIN
> = {
  MASONRY: "MASONRY",
  FINISHED_WOOD: "FINISHED_WOOD",
  MAKESHIFT_MATERIALS: "MAKESHIFT_MATERIALS",
};

const WATER_SUPPLY_TYPE_MAP: EnumMap<
  typeof WATER_SUPPLY_TYPE_DTO,
  typeof WATER_SUPPLY_TYPE_DOMAIN
> = {
  PUBLIC_NETWORK: "PUBLIC_NETWORK",
  WELL_OR_SPRING: "WELL_OR_SPRING",
  RAINWATER_HARVEST: "RAINWATER_HARVEST",
  WATER_TRUCK: "WATER_TRUCK",
  OTHER: "OTHER",
};

const ELECTRICITY_ACCESS_MAP: EnumMap<
  typeof ELECTRICITY_ACCESS_DTO,
  typeof ELECTRICITY_ACCESS_DOMAIN
> = {
  METERED_CONNECTION: "METERED_CONNECTION",
  IRREGULAR_CONNECTION: "IRREGULAR_CONNECTION",
  NO_ACCESS: "NO_ACCESS",
};

const SEWAGE_DISPOSAL_METHOD_MAP: EnumMap<
  typeof SEWAGE_DISPOSAL_METHOD_DTO,
  typeof SEWAGE_DISPOSAL_METHOD_DOMAIN
> = {
  PUBLIC_SEWER: "PUBLIC_SEWER",
  SEPTIC_TANK: "SEPTIC_TANK",
  RUDIMENTARY_PIT: "RUDIMENTARY_PIT",
  OPEN_SEWAGE: "OPEN_SEWAGE",
  NO_BATHROOM: "NO_BATHROOM",
};

const WASTE_COLLECTION_TYPE_MAP: EnumMap<
  typeof WASTE_COLLECTION_TYPE_DTO,
  typeof WASTE_COLLECTION_TYPE_DOMAIN
> = {
  DIRECT_COLLECTION: "DIRECT_COLLECTION",
  INDIRECT_COLLECTION: "INDIRECT_COLLECTION",
  NO_COLLECTION: "NO_COLLECTION",
};

const ACCESSIBILITY_LEVEL_MAP: EnumMap<
  typeof ACCESSIBILITY_LEVEL_DTO,
  typeof ACCESSIBILITY_LEVEL_DOMAIN
> = {
  FULLY_ACCESSIBLE: "FULLY_ACCESSIBLE",
  PARTIALLY_ACCESSIBLE: "PARTIALLY_ACCESSIBLE",
  NOT_ACCESSIBLE: "NOT_ACCESSIBLE",
};

/**
 * Converte um DTO de Condição de Moradia para o Value Object de Domínio.
 * Atua como ACL garantindo que apenas dados válidos entrem no domínio.
 */
export const mapHousingConditionDtoToDomain = (
  dto: HousingConditionDTO,
): Result<HousingCondition, DomainError> => {
  return HousingCondition.create({
    housingConditionType: HOUSING_CONDITION_TYPE_MAP[dto.housingConditionType],
    wallMaterial: WALL_MATERIAL_MAP[dto.wallMaterial],
    numberOfRooms: dto.numberOfRooms,
    numberOfBathrooms: dto.numberOfBathrooms,
    waterSupplyType: WATER_SUPPLY_TYPE_MAP[dto.waterSupplyType],
    electricityAccess: ELECTRICITY_ACCESS_MAP[dto.electricityAccess],
    sewerDisposalMethod: SEWAGE_DISPOSAL_METHOD_MAP[dto.sewerDisposalMethod],
    wasteCollectionType: WASTE_COLLECTION_TYPE_MAP[dto.wasteCollectionType],
    accessibilityLevel: ACCESSIBILITY_LEVEL_MAP[dto.accessibilityLevel],
    isInGeographicRiskArea: dto.isInGeographicRiskArea,
    isInSocialConflictArea: dto.isInSocialConflictArea,
  });
};

/**
 * Converte um DTO de Benefício Social para o Value Object de Domínio.
 */
export const mapSocialBenefitDtoToDomain = (
  dto: SocialBenefitDTO,
): Result<SocialBenefit, DomainError> => {
  const beneficiaryIdResult = FamilyMemberId.create(dto.beneficiaryId);
  if (beneficiaryIdResult.isErr) return err(beneficiaryIdResult.error);

  return SocialBenefit.create({
    benefitName: dto.benefitName,
    amount: dto.amount,
    beneficiaryId: beneficiaryIdResult.value,
  });
};

/**
 * Converte um DTO de Situação Socioeconômica para o Value Object de Domínio.
 * Orquestra a conversão da lista de benefícios usando a função atômica `mapSocialBenefitDtoToDomain`.
 */
export const mapSocioEconomicSituationDtoToDomain = (
  dto: SocioEconomicSituationDTO,
): Result<SocioEconomicSituation, DomainError> => {
  const benefits: SocialBenefit[] = [];

  for (const benefitDto of dto.socialBenefits) {
    const benefitResult = mapSocialBenefitDtoToDomain(benefitDto);
    if (benefitResult.isErr) return err(benefitResult.error);
    benefits.push(benefitResult.value);
  }

  const collectionResult = SocialBenefitsCollection.create(benefits);
  if (collectionResult.isErr) return err(collectionResult.error);

  return SocioEconomicSituation.create({
    totalFamilyIncome: dto.totalFamilyIncome,
    incomePerCapita: dto.incomePerCapita,
    receivesSocialBenefit: dto.receivesSocialBenefit,
    socialBenefits: collectionResult.value,
    mainSourceOfIncome: dto.mainSourceOfIncome,
    hasUnemployed: dto.hasUnemployed,
  });
};
