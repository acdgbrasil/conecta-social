import { describe, expect, mock, test } from "bun:test";
import { guardLet, ifLet, None, Some } from "@conecta/option";

describe("guardCause", () => {
  describe("guardLet", () => {
    test("retorna o valor encapsulado quando Option é some", () => {
      const option = Some("usable");

      const result = guardLet(option);

      expect(result).toBe("usable");
    });

    test("executa elseBlock e retorna o valor fornecido quando Option é none", () => {
      const fallback = mock(() => "fallback");

      const result = guardLet(None<string>(), fallback);

      expect(result).toBe("fallback");
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    test("lança erro padrão quando Option é none e nenhum elseBlock é informado", () => {
      expect(() => guardLet(None())).toThrow(
        "GuardLet failed: expected Some, got None",
      );
    });
  });

  describe("ifLet", () => {
    test("reutiliza guardLet retornando o valor encapsulado", () => {
      const option = Some(10);

      const result = ifLet(option);

      expect(result).toBe(10);
    });

    test("propaga erro de guardLet quando Option é none", () => {
      expect(() => ifLet(None())).toThrow(
        "GuardLet failed: expected Some, got None",
      );
    });
  });
});
