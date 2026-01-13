import { describe, expect, test } from "bun:test";
import { P } from "packages/conecta-raros/social-care";

describe("PatientErrors shortcuts", () => {
  test("MemberAlreadyIsPrimaryCaregiver inclui o personId no template", () => {
    const error = P.MemberAlreadyIsPrimaryCaregiver("person-123");

    expect(error.message).toContain("person-123");
    expect(error.context.personId).toBe("person-123");
  });

  test("FamilyMemberAlreadyContainsPrimaryCaregiver cita o cuidador atual", () => {
    const error = P.FamilyMemberAlreadyContainsPrimaryCaregiver("caregiver-9");

    expect(error.message).toContain("caregiver-9");
    expect(error.context.currentCaregiverId).toBe("caregiver-9");
  });

  test("ReferralTargetOutsideBoundary indica o alvo fora da fronteira", () => {
    const error = P.ReferralTargetOutsideBoundary("target-xyz");

    expect(error.message).toContain("'target-xyz'");
    expect(error.context.targetId).toBe("target-xyz");
  });

  test("ViolationTargetOutsideBoundary também referencia targetId", () => {
    const error = P.ViolationTargetOutsideBoundary("target-xyz");

    expect(error.message).toContain("'target-xyz'");
    expect(error.context.targetId).toBe("target-xyz");
  });

  test("FamilyMemberAlreadyExists mantém memberId no contexto", () => {
    const error = P.FamilyMemberAlreadyExists("member-1");

    expect(error.message).toContain("'member-1'");
    expect(error.context.memberId).toBe("member-1");
  });

  test("FamilyMemberNotFound cita o personId pesquisado", () => {
    const error = P.FamilyMemberNotFound("person-9");

    expect(error.message).toContain("'person-9'");
    expect(error.context.personId).toBe("person-9");
  });
});
