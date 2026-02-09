import { describe, expect, test } from "bun:test";
import { FamilyMember, FamilyMemberId, FM, PersonId } from "@conecta/social-care";
import { Result } from "@conecta/result";

describe("FamilyMember.entity (FP Refactor - RED)", () => {
  const createValidProps = () => ({
    id: Result.unwrap(FamilyMemberId.create()),
    personId: Result.unwrap(PersonId.create()),
    relationship: "PARENT",
    isPrimaryCaregiver: false,
    residesWithPatient: true
  });

  describe("Factory", () => {
    test("create falha sem personId", () => {
      const props = { ...createValidProps(), personId: undefined as any };
      const result = FamilyMember.create(props);
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(FM.MissingPerson().code);
    });

    test("create retorna objeto plano readonly", () => {
      const result = FamilyMember.create(createValidProps());
      expect(Result.isOk(result)).toBe(true);
      const member = Result.unwrap(result);
      expect(member.relationship).toBe("PARENT");
    });
  });

  describe("Behavior (Namespace Functions)", () => {
    test("assignAsPrimaryCaregiver retorna nova instancia", () => {
      const initial = Result.unwrap(FamilyMember.create(createValidProps()));
      const updated = FamilyMember.assignAsPrimaryCaregiver(initial);
      
      expect(updated.isPrimaryCaregiver).toBe(true);
      expect(initial.isPrimaryCaregiver).toBe(false);
    });

    test("assignAsPrimaryCaregiver é idempotente (retorna mesma ref)", () => {
      const initial = Result.unwrap(FamilyMember.create({ ...createValidProps(), isPrimaryCaregiver: true }));
      const updated = FamilyMember.assignAsPrimaryCaregiver(initial);
      
      expect(updated).toBe(initial);
    });
  });
});
