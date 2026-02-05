import { err, ok, type Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import {
  HousingCondition,
  SocialBenefit,
  SocialBenefitsCollection,
  SocioEconomicSituation,
  FamilyMemberId,
} from "@conecta/social-care";
import type {
  HousingConditionDTO,
  SocialBenefitDTO,
  SocioEconomicSituationDTO,
} from "../dto/social-assessment.dto";

/**
 * Converte um DTO de Condição de Moradia para o Value Object de Domínio.
 * Atua como ACL garantindo que apenas dados válidos entrem no domínio.
 */
export const mapHousingConditionDtoToDomain = (
  dto: HousingConditionDTO,
): Result<HousingCondition, DomainError> => {
  return HousingCondition.create(dto);
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
