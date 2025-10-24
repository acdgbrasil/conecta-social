import { describe, expect, test } from "bun:test";
import { ICDCodeClass } from "../icdCode.valueObject";

describe("ICDCode.valueObject", () => {
  test("normaliza código CID inserindo ponto e caixa alta quando necessário", () => {
    const result = ICDCodeClass.createFromString("b201");

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap()).toBe("B20.1");
  });

  test("permite códigos válidos sem ponto quando não é obrigatório", () => {
    const result = ICDCodeClass.createFromString("A00");

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap()).toBe("A00");
  });

  test("retorna erro descritivo para código vazio", () => {
    const result = ICDCodeClass.createFromString("");

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("ICD-002");
  });

  test("retorna erro quando ponto é obrigatório e não pode ser inferido", () => {
    const result = ICDCodeClass.createFromString("C509", {
      requireDot: true,
      autoDot: false,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("ICD-001");
  });

  test("toDisplay formata a string para visualização humana", () => {
    expect(ICDCodeClass.toDisplay("  c509 ")).toBe("C50.9");
  });

  test("toNormalized remove o ponto do código", () => {
    const created = ICDCodeClass.createFromString("C50.9");

    expect(created.isOk).toBe(true);
    if (!created.isOk) return;

    expect(ICDCodeClass.toNormalized(created.unwrap())).toBe("C509");
  });

  test("is identifica códigos válidos", () => {
    expect(ICDCodeClass.is("C50.9")).toBe(true);
    expect(ICDCodeClass.is("invalid")).toBe(false);
  });
});
