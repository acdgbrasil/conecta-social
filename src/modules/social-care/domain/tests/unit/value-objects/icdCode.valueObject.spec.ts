import { describe, expect, test } from "bun:test";
import { ICDCode, ICDError } from "@conecta/social-care";
import { Result } from "@conecta/result";

describe("ICDCode.valueObject (FP Refactor - RED)", () => {
  describe("Factory & Validation", () => {
    test("create normaliza código CID", () => {
      const result = ICDCode.create("b201");
      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result).value).toBe("B20.1");
    });

    test("create permite códigos sem ponto quando válido", () => {
      const result = ICDCode.create("A00");
      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result).value).toBe("A00");
    });

    test("create falha com código vazio", () => {
      const result = ICDCode.create("");
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(ICDError.EmptyCidCode().code);
    });
  });

  describe("Namespace Helpers", () => {
    test("toDisplay formata string", () => {
      expect(ICDCode.toDisplay("  c509 ")).toBe("C50.9");
    });

    test("toNormalized remove ponto", () => {
      const code = Result.unwrap(ICDCode.create("C50.9"));
      expect(ICDCode.toNormalized(code)).toBe("C509");
    });

    test("is verifica validade de string crua", () => {
      expect(ICDCode.is("C50.9")).toBe(true);
      expect(ICDCode.is("invalid")).toBe(false);
    });
  });
});
