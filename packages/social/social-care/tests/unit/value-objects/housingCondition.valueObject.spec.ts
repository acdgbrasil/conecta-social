import { describe, expect, test } from "bun:test";
import { HousingCondition } from "@conecta/social-care";
import {
  ACCESSIBILITY_LEVEL,
  ELETRICITY_ACCESS,
  HOUSING_CONDITION_TYPE,
  SEWAGE_DISPOSAL_METHOD,
  WALL_MATERIAL,
  WASTE_COLLECTION_TYPE,
} from "@conecta/social-care/value-objects/props/housingCondition.props";

describe("HousingCondition.valueObject", () => {
  const createValidProps = (overrides = {}) => ({
    housingConditionType: HOUSING_CONDITION_TYPE.OWNED,
    wallMaterial: WALL_MATERIAL.MASONRY,
    numberOfRooms: 3,
    numberOfBathrooms: 2,
    isInGeographicRiskArea: false,
    isInSocialConflictArea: false,
    electricityAccess: ELETRICITY_ACCESS.METERED_CONNECTION,
    sewerDisposalMethod: SEWAGE_DISPOSAL_METHOD.OPEN_SEWAGE,
    wasteCollectionType: WASTE_COLLECTION_TYPE.DIRECT_COLLECTION,
    accessibilityLevel: ACCESSIBILITY_LEVEL.FULLY_ACCESSIBLE,
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
