import { describe, expect, test } from "bun:test";
import { PersonId, PID } from "@conecta/social-care";
import { Result } from "@conecta/result";

const VALID_ID = "01890E18-257B-7B32-B264-93C9D46242AB";
const LOWER_ID = VALID_ID.toLowerCase();

describe("PersonId.valueObject (FP Refactor - RED)", () => {
  describe("Factory", () => {
    test("create normaliza (trim + lowercase)", () => {
      const result = PersonId.create(`  ${VALID_ID}  `);
      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result).toString()).toBe(LOWER_ID);
    });

    test("create gera novo ID se vazio", () => {
      const result = PersonId.create();
      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result).toString()).toHaveLength(36);
    });

    test("create falha com UUID inválido", () => {
      const result = PersonId.create("invalid");
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(PID.InvalidFormat("invalid").code);
    });
  });

  describe("Namespace Helpers", () => {
    test("equals compara valores", () => {
      const id1 = Result.unwrap(PersonId.create(VALID_ID));
      const id2 = Result.unwrap(PersonId.create(LOWER_ID));
      
      expect(PersonId.equals(id1, id2)).toBe(true);
    });
  });
});
