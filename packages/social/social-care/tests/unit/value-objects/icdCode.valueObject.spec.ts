import { describe, expect, test } from "bun:test";
import { ICDCode } from "@conecta/social-care";

describe("ICDCode.valueObject", () => {
  test("normaliza código CID inserindo ponto e caixa alta quando necessário", () => {
    const result = ICDCode.create("b201");

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().value).toBe("B20.1");
  });

  test("permite códigos válidos sem ponto quando não é obrigatório", () => {
    const result = ICDCode.create("A00");

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().value).toBe("A00");
  });

  test("retorna erro descritivo para código vazio", () => {
    const result = ICDCode.create("");

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("ICD-002");
  });

  test("retorna erro quando ponto é obrigatório e não pode ser inferido", () => {
    const result = ICDCode.create("C509", {
      requireDot: true,
      autoDot: false,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("ICD-001");
  });

  test("toDisplay formata a string para visualização humana", () => {
    expect(ICDCode.toDisplay("  c509 ")).toBe("C50.9");
  });

  test("toNormalized remove o ponto do código", () => {
    const created = ICDCode.create("C50.9");

    expect(created.isOk).toBe(true);
    if (!created.isOk) return;

    expect(ICDCode.toNormalized(created.unwrap())).toBe("C509");
  });

  test("is identifica códigos válidos", () => {
    expect(ICDCode.is("C50.9")).toBe(true);
    expect(ICDCode.is("invalid")).toBe(false);
  });

  test("rejeita códigos CID aposentados conhecidos", () => {
    const result = ICDCode.create("A15.0", { requireDot: true });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("ICD-003");
  });
});
