import { describe, expect, test } from "bun:test";
import { HousingCondition } from "../housingCondition.valueObject";

describe("HousingCondition.valueObject", () => {
  test("cria condição de moradia com valores padrões imutáveis", () => {
    const result = HousingCondition.create();

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const housing = result.unwrap();
    expect(housing.housingConditionType.OWNED).toBe("OWNED");
    expect(housing.wallMaterial.MASONRY).toBe("MASONRY");
    expect(housing.numberOfRooms).toBe(0);
    expect(housing.numberOfBathrooms).toBe(0);
    expect(housing.isInGeographicRiskArea).toBe(false);
    expect(Object.isFrozen(housing)).toBe(true);
  });
});
