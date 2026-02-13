import { describe, expect, test } from "bun:test";
import { P } from "@conecta/social-care";

describe("PatientErrors shortcuts", () => {
  test("InitialDiagnosesCantBeEmpty retorna mensagem de catálogo", () => {
    const error = P.InitialDiagnosesCantBeEmpty();

    expect(error.code).toBe("PAT-001");
    expect(error.message).toContain("sem um diagnóstico inicial");
  });

  test("InitialDiagnosesCantHaveDuplicates retorna mensagem de catálogo", () => {
    const error = P.InitialDiagnosesCantHaveDuplicates();

    expect(error.code).toBe("PAT-010");
    expect(error.message).toContain("diagnósticos iniciais duplicados");
  });

  test("InitialIdIsRequired e InitialPersonIdIsRequired cobrem validações obrigatórias", () => {
    const missingId = P.InitialIdIsRequired();
    const missingPersonId = P.InitialPersonIdIsRequired();

    expect(missingId.code).toBe("PAT-002");
    expect(missingPersonId.code).toBe("PAT-009");
  });

  test("PatientNotFound e PersonIdAlreadyExists incluem contexto correto", () => {
    const notFound = P.PatientNotFound("patient-123");
    const duplicatedPersonId = P.PersonIdAlreadyExists("person-123");

    expect(notFound.code).toBe("PAT-011");
    expect(notFound.message).toContain("patient-123");
    expect(duplicatedPersonId.code).toBe("PAT-012");
    expect(duplicatedPersonId.message).toContain("person-123");
  });

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
