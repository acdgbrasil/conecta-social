import { describe, expect, test } from "bun:test";
import { FamilyMemberId, FMIE } from "@conecta/social-care";
import { Result } from "@conecta/result";

const VALID_ID = "01890E18-257B-7B32-B264-93C9D46242AB";
const LOWER_ID = VALID_ID.toLowerCase();

describe("FamilyMemberId.valueObject (FP Refactor - RED)", () => {
  describe("Factory", () => {
    test("create normaliza e valida", () => {
      const result = FamilyMemberId.create(VALID_ID);
      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result).toString()).toBe(LOWER_ID);
    });

    test("create falha com ID inválido", () => {
      const result = FamilyMemberId.create("bad-id");
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(FMIE.InvalidFormat("bad-id").code);
    });
  });

  describe("Namespace Helpers", () => {
    test("equals compara valores de forma segura", () => {
      const id1 = Result.unwrap(FamilyMemberId.create(VALID_ID));
      const id2 = Result.unwrap(FamilyMemberId.create(LOWER_ID));
      
      expect(FamilyMemberId.equals(id1, id2)).toBe(true);
    });
  });
});
