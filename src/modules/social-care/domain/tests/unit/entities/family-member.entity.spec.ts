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

    test("create falha quando relationship é vazio", () => {
      const result = FamilyMember.create({
        ...createValidProps(),
        relationship: "   ",
      });

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(FM.InvalidRelationship().code);
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

    test("revokePrimaryCaregiver remove status quando ativo", () => {
      const initial = Result.unwrap(
        FamilyMember.create({ ...createValidProps(), isPrimaryCaregiver: true }),
      );
      const updated = FamilyMember.revokePrimaryCaregiver(initial);

      expect(updated.isPrimaryCaregiver).toBe(false);
      expect(initial.isPrimaryCaregiver).toBe(true);
    });

    test("revokePrimaryCaregiver é idempotente quando já está false", () => {
      const initial = Result.unwrap(
        FamilyMember.create({ ...createValidProps(), isPrimaryCaregiver: false }),
      );
      const updated = FamilyMember.revokePrimaryCaregiver(initial);

      expect(updated).toBe(initial);
    });

    test("equals compara pelo id", () => {
      const base = Result.unwrap(FamilyMember.create(createValidProps()));
      const sameId = { ...base, relationship: "OTHER" };
      const other = Result.unwrap(FamilyMember.create(createValidProps()));

      expect(FamilyMember.equals(base, sameId)).toBe(true);
      expect(FamilyMember.equals(base, other)).toBe(false);
    });
  });
});
