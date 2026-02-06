import { describe, test, expect } from "bun:test";
import {
  mapHousingConditionDtoToDomain,
  mapSocialBenefitDtoToDomain,
  mapSocioEconomicSituationDtoToDomain,
} from "../../social-assessment.mapper";
import { ImutableListFactory } from "@conecta/fn";
import type {
  HousingConditionDTO,
  SocialBenefitDTO,
  SocioEconomicSituationDTO,
} from "../../../../dto/social-assessment.dto";

const VALID_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";

describe("SocialAssessmentMapper (Functional ACL)", () => {
  describe("mapHousingConditionDtoToDomain", () => {
    test("deve mapear DTO válido para HousingCondition VO", () => {
      const dto: HousingConditionDTO = {
        housingConditionType: "OWNED",
        wallMaterial: "MASONRY",
        numberOfRooms: 4,
        numberOfBathrooms: 2,
        waterSupplyType: "PUBLIC_NETWORK",
        electricityAccess: "METERED_CONNECTION",
        sewerDisposalMethod: "PUBLIC_SEWER",
        wasteCollectionType: "DIRECT_COLLECTION",
        accessibilityLevel: "FULLY_ACCESSIBLE",
        isInGeographicRiskArea: false,
        isInSocialConflictArea: false,
      };

      const result = mapHousingConditionDtoToDomain(dto);

      expect(result.isOk).toBe(true);
      expect(result.unwrap().numberOfRooms).toBe(4);
    });

    test("deve falhar se as regras de negócio forem violadas (ex: banheiros > quartos)", () => {
      const dto: HousingConditionDTO = {
        housingConditionType: "OWNED",
        wallMaterial: "MASONRY",
        numberOfRooms: 2,
        numberOfBathrooms: 3, // Inválido
        waterSupplyType: "PUBLIC_NETWORK",
        electricityAccess: "METERED_CONNECTION",
        sewerDisposalMethod: "PUBLIC_SEWER",
        wasteCollectionType: "DIRECT_COLLECTION",
        accessibilityLevel: "FULLY_ACCESSIBLE",
        isInGeographicRiskArea: false,
        isInSocialConflictArea: false,
      };

      const result = mapHousingConditionDtoToDomain(dto);

      expect(result.isErr).toBe(true);
    });
  });

  describe("mapSocialBenefitDtoToDomain", () => {
    test("deve mapear DTO válido para SocialBenefit VO", () => {
      const dto: SocialBenefitDTO = {
        benefitName: "Bolsa Família",
        amount: 600,
        beneficiaryId: VALID_UUID,
      };

      const result = mapSocialBenefitDtoToDomain(dto);

      expect(result.isOk).toBe(true);
      const vo = result.unwrap();
      expect(vo.benefitName).toBe("Bolsa Família");
      expect(vo.amount).toBe(600);
      expect(vo.beneficiaryId).toBe(VALID_UUID); // UUIDs são normalizados para lowercase
    });

    test("deve falhar se beneficiaryId for inválido", () => {
      const dto: SocialBenefitDTO = {
        benefitName: "BPC",
        amount: 1412,
        beneficiaryId: "invalid-uuid",
      };

      const result = mapSocialBenefitDtoToDomain(dto);

      expect(result.isErr).toBe(true);
    });

    test("deve falhar se valor for negativo ou zero", () => {
      const dto: SocialBenefitDTO = {
        benefitName: "Auxílio Gás",
        amount: 0,
        beneficiaryId: VALID_UUID,
      };

      const result = mapSocialBenefitDtoToDomain(dto);

      expect(result.isErr).toBe(true);
    });

    test("deve normalizar o nome do benefício (trim e espaços)", () => {
      const dto: SocialBenefitDTO = {
        benefitName: "  Bolsa   Família  ",
        amount: 600,
        beneficiaryId: VALID_UUID,
      };

      const result = mapSocialBenefitDtoToDomain(dto);

      expect(result.isOk).toBe(true);
      expect(result.unwrap().benefitName).toBe("Bolsa Família");
    });
  });

  describe("mapSocioEconomicSituationDtoToDomain", () => {
    test("deve mapear DTO válido para SocioEconomicSituation VO", () => {
      const dto: SocioEconomicSituationDTO = {
        totalFamilyIncome: 3000,
        incomePerCapita: 1000,
        receivesSocialBenefit: true,
        socialBenefits: [
          {
            benefitName: "Bolsa Família",
            amount: 600,
            beneficiaryId: VALID_UUID,
          },
        ],
        mainSourceOfIncome: "Trabalho Formal",
        hasUnemployed: false,
      };

      const result = mapSocioEconomicSituationDtoToDomain(dto);

      expect(result.isOk).toBe(true);
      const vo = result.unwrap();
      expect(vo.totalFamilyIncome).toBe(3000);
      expect(ImutableListFactory.count(vo.socialBenefits)).toBe(1);
    });

    test("deve falhar se houver inconsistência nos benefícios (flag true, lista vazia)", () => {
      const dto: SocioEconomicSituationDTO = {
        totalFamilyIncome: 3000,
        incomePerCapita: 1000,
        receivesSocialBenefit: true,
        socialBenefits: [], // Inconsistente
        mainSourceOfIncome: "Trabalho Formal",
        hasUnemployed: false,
      };

      const result = mapSocioEconomicSituationDtoToDomain(dto);

      expect(result.isErr).toBe(true);
    });

    test("deve falhar se algum benefício for inválido (beneficiaryId inválido)", () => {
      const dto: SocioEconomicSituationDTO = {
        totalFamilyIncome: 3000,
        incomePerCapita: 1000,
        receivesSocialBenefit: true,
        socialBenefits: [
          {
            benefitName: "Bolsa Família",
            amount: 600,
            beneficiaryId: "invalid-uuid",
          },
        ],
        mainSourceOfIncome: "Trabalho Formal",
        hasUnemployed: false,
      };

      const result = mapSocioEconomicSituationDtoToDomain(dto);

      expect(result.isErr).toBe(true);
    });
  });
});
