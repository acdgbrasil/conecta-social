import { describe, expect, test } from "bun:test";
import { HousingCondition } from "../housingCondition.valueObject";

describe("HousingCondition.valueObject", () => {
  test("cria condição de moradia com valores válidos", () => {
    const props = {
      housingConditionType: "OWNED",
      wallMaterial: "MASONRY",
      numberOfRooms: 3,
      numberOfBathrooms: 2,
      isInGeographicRiskArea: false,
      isInSocialConflictArea: false,
      electricityAccess: "METERED_CONNECTION",
      sewerDisposalMethod: "PUBLIC_SEWER",
      wasteCollectionType: "DIRECT_COLLECTION",
      accessibilityLevel: "FULLY_ACCESSIBLE",
    };
    const result = HousingCondition.create(props);

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const condition = result.unwrap();
    expect(condition.numberOfRooms).toBe(3);
    expect(Object.isFrozen(condition)).toBe(true);
  });
});

