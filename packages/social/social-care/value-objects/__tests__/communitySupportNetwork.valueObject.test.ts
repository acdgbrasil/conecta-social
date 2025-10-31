import { describe, expect, test } from "bun:test";
import { CommunitySupportNetwork } from "../communitySupportNetwort.valueObject";

describe("CommunitySupportNetwork.valueObject", () => {
  const createValidProps = (overrides = {}) => ({
    hasSupportFromRelatives: true,
    hasSupportFromNeighbors: false,
    familyConflicts: "Conflitos sobre finanças.",
    patientParticipatesInGroups: true,
    familyParticipatesInGroups: false,
    patientHasAccessToLeisure: true,
    facesDiscriminationInCommunity: false,
    ...overrides,
  });

  test("deve criar uma rede de apoio com dados válidos", () => {
    // Arrange
    const props = createValidProps();
    
    // Act
    const result = CommunitySupportNetwork.create(props);

    // Assert
    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const network = result.unwrap();
    expect(network.hasSupportFromRelatives).toBe(true);
    expect(network.familyConflicts).toBe("Conflitos sobre finanças.");
    expect(Object.isFrozen(network)).toBe(true);
  });

  test("deve permitir um campo de conflitos vazio", () => {
    // Arrange
    const props = createValidProps({ familyConflicts: "" });

    // Act
    const result = CommunitySupportNetwork.create(props);

    // Assert
    expect(result.isOk).toBe(true);
  });

  test("deve retornar erro se o campo de conflitos contiver apenas espaços em branco", () => {
    // Arrange
    const props = createValidProps({ familyConflicts: "   " });

    // Act
    const result = CommunitySupportNetwork.create(props);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe("CSN-001"); // Ex: CommunitySupportNetwork error 1
  });
});