import { describe, expect, test } from "bun:test";
import { FamilyMemberId, FMIE } from "@conecta/social-care";

const UPPERCASE_V7 = "01890E18-257B-7B32-B264-93C9D46242AB";
const LOWERCASE_V7 = UPPERCASE_V7.toLowerCase();

describe("FamilyMemberId.valueObject (RED tests)", () => {
  test("normaliza identificadores para caixa baixa ao criar a partir de string existente", () => {
    const result = FamilyMemberId.create(UPPERCASE_V7);

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().toString()).toBe(LOWERCASE_V7);
  });

  test("considera IDs equivalentes mesmo quando diferem apenas por caixa de caracteres", () => {
    const upperResult = FamilyMemberId.create(UPPERCASE_V7);
    const lowerResult = FamilyMemberId.create(LOWERCASE_V7);

    expect(upperResult.isOk && lowerResult.isOk).toBe(true);
    if (!upperResult.isOk || !lowerResult.isOk) return;

    expect(upperResult.unwrap().equals(lowerResult.unwrap())).toBe(true);
  });

  test("falha ao criar com formato de UUID inválido (não-v7)", () => {
    const invalidValue = "nao-e-um-uuid-v7";
    const result = FamilyMemberId.create(invalidValue);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    // Isso garante que o FamilyMemberId.error.ts foi "atingido"
    expect(result.unwrapErr().code).toBe(FMIE.InvalidFormat(invalidValue).code); // "FMID-001"
  });

  test("falha ao usar copyWith com formato de UUID inválido", () => {
    // Primeiro, crie um válido
    const validId = FamilyMemberId.create(LOWERCASE_V7).unwrap();
    
    const invalidValue = "id-invalido-no-copy";
    const result = validId.copyWith({ value: invalidValue }); // Tenta copiar com um valor inválido

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    // Isso também conta para a cobertura do arquivo de erro
    expect(result.unwrapErr().code).toBe(FMIE.InvalidFormat(invalidValue).code);
  });

});
