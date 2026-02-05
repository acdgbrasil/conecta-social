import { describe, expect, test } from "bun:test";
import {
  CommunitySupportNetwork,
  CSN,
} from "@conecta/social-care";

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

  test("impede descrições de conflitos excessivamente longas", () => {
    const veryLongConflicts = "Conflito ".repeat(300);
    const result = CommunitySupportNetwork.create(
      createValidProps({ familyConflicts: veryLongConflicts }),
    );

    expect(result.isErr).toBe(true);
  });
});

describe("copyWith", () => {
  // Helper do seu arquivo de teste
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

  const makeNetwork = () =>
    CommunitySupportNetwork.create(createValidProps()).unwrap();

  test("deve atualizar parcialmente (ex: familyConflicts) e aplicar trim", () => {
    const original = makeNetwork();
    const result = original.copyWith({
      familyConflicts: "  Novos conflitos  ",
    });

    expect(result.isOk).toBe(true);
    const copied = result.unwrap();

    expect(copied.familyConflicts).toBe("Novos conflitos"); // Trim aplicado
    expect(copied.hasSupportFromRelatives).toBe(
      original.hasSupportFromRelatives,
    ); // Outro campo mantido
  });

  test("deve falhar a revalidação se o campo for apenas whitespace", () => {
    const original = makeNetwork();
    const result = original.copyWith({ familyConflicts: "   " }); // Inválido

    expect(result.isErr).toBe(true);
    expect(result.unwrapErr().code).toBe(CSN.FamilyConflictsWhitespace().code); // "CSN-001"
  });
});
