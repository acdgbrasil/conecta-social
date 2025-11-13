import { describe, expect, test } from "bun:test";
import { HC, HousingCondition } from "@conecta/social-care";
import {
  ACCESSIBILITY_LEVEL,
  ELECTRICITY_ACCESS,
  HOUSING_CONDITION_TYPE,
  SEWAGE_DISPOSAL_METHOD,
  WALL_MATERIAL,
  WASTE_COLLECTION_TYPE,
  WATER_SUPPLY_TYPE,
} from "@conecta/social-care/value-objects/props/housingCondition.props";

describe("HousingCondition.valueObject", () => {
  const createValidProps = (overrides = {}) => ({
    housingConditionType: HOUSING_CONDITION_TYPE.OWNED,
    wallMaterial: WALL_MATERIAL.MASONRY,
    numberOfRooms: 3,
    numberOfBathrooms: 2,
    isInGeographicRiskArea: false,
    isInSocialConflictArea: false,
    electricityAccess: ELECTRICITY_ACCESS.METERED_CONNECTION,
    sewerDisposalMethod: SEWAGE_DISPOSAL_METHOD.OPEN_SEWAGE,
    wasteCollectionType: WASTE_COLLECTION_TYPE.DIRECT_COLLECTION,
    accessibilityLevel: ACCESSIBILITY_LEVEL.FULLY_ACCESSIBLE,
    waterSupplyType: WATER_SUPPLY_TYPE.OTHER,
    ...overrides,
  });

  test("deve criar uma condição de moradia com valores válidos", () => {
    // Arrange
    const props = createValidProps();
    
    // Act
    const result = HousingCondition.create(props);

    // Assert
    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const condition = result.unwrap();
    expect(condition.numberOfRooms).toBe(3);
    expect(Object.isFrozen(condition)).toBe(true);
  });

  test("deve retornar erro se o número de quartos for negativo", () => {
    // Arrange
    const props = createValidProps({ numberOfRooms: -1 });

    // Act
    const result = HousingCondition.create(props);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe("HC-001"); // Ex: HousingCondition error 1
  });

  test("deve retornar erro se o número de banheiros for negativo", () => {
    // Arrange
    const props = createValidProps({ numberOfBathrooms: -1 });

    // Act
    const result = HousingCondition.create(props);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe("HC-002");
  });

  test("deve retornar erro se o número de banheiros for maior que o número de quartos", () => {
    // Arrange
    const props = createValidProps({ numberOfRooms: 2, numberOfBathrooms: 3 });

    // Act
    const result = HousingCondition.create(props);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe("HC-003");
  });

  test("deve permitir que o número de banheiros seja igual ao número de quartos", () => {
    // Arrange
    const props = createValidProps({ numberOfRooms: 2, numberOfBathrooms: 2 });

    // Act
    const result = HousingCondition.create(props);

    // Assert
    expect(result.isOk).toBe(true);
  });

  test("não permite residências sem nenhum cômodo habitável", () => {
    const props = createValidProps({ numberOfRooms: 0 });

    const result = HousingCondition.create(props);

    expect(result.isErr).toBe(true);
  });
});


describe("copyWith", () => {
    // Helper do seu arquivo de teste
    const createValidProps = (overrides = {}) => ({
      housingConditionType: HOUSING_CONDITION_TYPE.OWNED,
      wallMaterial: WALL_MATERIAL.MASONRY,
      numberOfRooms: 3,
      numberOfBathrooms: 2,
      isInGeographicRiskArea: false,
      isInSocialConflictArea: false,
      electricityAccess: ELECTRICITY_ACCESS.METERED_CONNECTION,
      sewerDisposalMethod: SEWAGE_DISPOSAL_METHOD.OPEN_SEWAGE,
      wasteCollectionType: WASTE_COLLECTION_TYPE.DIRECT_COLLECTION,
      accessibilityLevel: ACCESSIBILITY_LEVEL.FULLY_ACCESSIBLE,
      waterSupplyType: WATER_SUPPLY_TYPE.OTHER,
      ...overrides,
    });
    
    const makeCondition = (props = {}) => HousingCondition.create(createValidProps(props)).unwrap();

    test("deve atualizar com sucesso (ex: numberOfBathrooms)", () => {
      const original = makeCondition({ numberOfRooms: 5, numberOfBathrooms: 2 });
      const result = original.copyWith({ numberOfBathrooms: 3 }); // Válido (3 <= 5)

      expect(result.isOk).toBe(true);
      expect(result.unwrap().numberOfBathrooms).toBe(3);
      expect(result.unwrap().numberOfRooms).toBe(5);
    });

    test("deve falhar a revalidação se banheiros > quartos", () => {
      const original = makeCondition({ numberOfRooms: 3, numberOfBathrooms: 1 });
      const result = original.copyWith({ numberOfBathrooms: 4 }); // Inválido (4 > 3)

      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(HC.BathroomsExceedRooms().code); // "HC-003"
    });

    test("deve falhar a revalidação se número de quartos for negativo", () => {
      const original = makeCondition();
      const result = original.copyWith({ numberOfRooms: -1 });

      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(HC.NegativeRooms().code); // "HC-001"
    });

    test("deve falhar a revalidação se número de banheiros for negativo", () => {
      const original = makeCondition();
      const result = original.copyWith({ numberOfBathrooms: -1 });

      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(HC.NegativeBathrooms().code); // "HC-002"
    });
  });

  describe("HousingCondition props — catálogo de eletricidade", () => {
  const expectedElectricityCatalog = {
    METERED_CONNECTION: "METERED_CONNECTION",
    IRREGULAR_CONNECTION: "IRREGULAR_CONNECTION",
    NO_ACCESS: "NO_ACCESS",
  } as const;

  test("exponha apenas valores documentados para acesso à eletricidade", () => {
    expect(ELECTRICITY_ACCESS).toEqual(expectedElectricityCatalog);
  });

  test("não mistura fontes de água com o catálogo elétrico", () => {
    const values = Object.values(ELECTRICITY_ACCESS);
    const waterSources = [
      "WELL_OR_SPRING",
      "RAINWATER_HARVEST",
      "WATER_TRUCK",
    ];

    waterSources.forEach((source) => {
      expect(values).not.toContain(source);
    });
  });
});