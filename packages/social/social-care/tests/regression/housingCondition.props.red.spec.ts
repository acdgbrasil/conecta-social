import { describe, expect, test } from "bun:test";

import { ELETRICITY_ACCESS } from "@conecta/social-care/value-objects/props/housingCondition.props";

describe("HousingCondition props — catálogo de eletricidade", () => {
  const expectedElectricityCatalog = {
    METERED_CONNECTION: "METERED_CONNECTION",
    IRREGULAR_CONNECTION: "IRREGULAR_CONNECTION",
    NO_CONNECTION: "NO_CONNECTION",
  } as const;

  test("exponha apenas valores documentados para acesso à eletricidade", () => {
    expect(ELETRICITY_ACCESS).toEqual(expectedElectricityCatalog);
  });

  test("não mistura fontes de água com o catálogo elétrico", () => {
    const values = Object.values(ELETRICITY_ACCESS);
    const waterSources = [
      "WELL_SPRING",
      "RAINWATER_HARVESTING",
      "WATER_TRUCK",
    ];

    waterSources.forEach((source) => {
      expect(values).not.toContain(source);
    });
  });
});
