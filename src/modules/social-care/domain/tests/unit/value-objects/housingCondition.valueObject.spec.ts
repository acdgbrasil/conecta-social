import { describe, expect, test } from "bun:test";
import { HC, HousingCondition } from "@conecta/social-care";
import { Result } from "@conecta/result";

// Importando agora diretamente do VO, ou definindo mocks no teste
const HOUSING_CONDITION_TYPE = { OWNED: "OWNED" } as const;
const WALL_MATERIAL = { MASONRY: "MASONRY" } as const;
const ELECTRICITY_ACCESS = { METERED_CONNECTION: "METERED_CONNECTION" } as const;
const SEWAGE_DISPOSAL_METHOD = { PUBLIC_SEWER: "PUBLIC_SEWER" } as const;
const WASTE_COLLECTION_TYPE = { DIRECT_COLLECTION: "DIRECT_COLLECTION" } as const;
const ACCESSIBILITY_LEVEL = { FULLY_ACCESSIBLE: "FULLY_ACCESSIBLE" } as const;
const WATER_SUPPLY_TYPE = { PUBLIC_NETWORK: "PUBLIC_NETWORK" } as const;

describe("HousingCondition.valueObject (FP Refactor - RED)", () => {
  const validProps = {
    housingConditionType: HOUSING_CONDITION_TYPE.OWNED,
    wallMaterial: WALL_MATERIAL.MASONRY,
    numberOfRooms: 3,
    numberOfBathrooms: 1,
    isInGeographicRiskArea: false,
    isInSocialConflictArea: false,
    electricityAccess: ELECTRICITY_ACCESS.METERED_CONNECTION,
    sewerDisposalMethod: SEWAGE_DISPOSAL_METHOD.PUBLIC_SEWER,
    wasteCollectionType: WASTE_COLLECTION_TYPE.DIRECT_COLLECTION,
    accessibilityLevel: ACCESSIBILITY_LEVEL.FULLY_ACCESSIBLE,
    waterSupplyType: WATER_SUPPLY_TYPE.PUBLIC_NETWORK,
  };

  describe("Factory", () => {
    test("create valida quartos vs banheiros", () => {
      const result = HousingCondition.create({ ...validProps as any, numberOfRooms: 1, numberOfBathrooms: 2 });
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(HC.BathroomsExceedRooms().code);
    });

    test("create valida números negativos", () => {
      const result = HousingCondition.create({ ...validProps as any, numberOfRooms: -1 });
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(HC.NegativeRooms().code);
    });
  });
});