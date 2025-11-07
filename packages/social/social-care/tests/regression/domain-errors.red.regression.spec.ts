import { describe, expect, test } from "bun:test";

import { ICDError } from "../../err/ICDCode.error";
import { P } from "../../err/Patient.error";
import { ImutableListFactory } from "../../../../shared/fn-pattern/imutable-list";
import { BE } from "../../err/SocialBenefit.error";

describe("ICDError helpers", () => {
  test("INVALID_CID_NUMBER template usa ∅ para valores ausentes", () => {
    const template = ICDError.catalog.INVALID_CID_NUMBER.template;

    const message = template({
      received: undefined,
      candidate: null,
      expectedPattern: undefined,
    } as any);

    expect(message).toContain("Valor '∅' não representa um CID válido.");
    expect(message).toContain("Candidato normalizado: '∅'.");
    expect(message).toContain("Esperado padrão ∅.");
  });

  test("RetiredCidCode preserva contexto e causa informados", () => {
    const cause = new Error("CID aposentado em tabela oficial");

    const error = ICDError.RetiredCidCode("B11.2", "2020-05-01", cause);

    expect(error.kind).toBe("RETIRED_CID_CODE");
    expect(error.message).toContain("B11.2");
    expect(error.message).toContain("2020-05-01");
    expect(error.cause).toBe(cause);
    expect(error.safeContext).toMatchObject({
      code: "B11.2",
      retiredAt: "2020-05-01",
    });
    expect(ICDError.toHttp(error).status).toBe(409);
  });

  test("ContextConflict inclui o contexto clínico informado", () => {
    const error = ICDError.ContextConflict("C50.9", "gestante");

    expect(error.kind).toBe("ICD_CONTEXT_CONFLICT");
    expect(error.message).toContain("C50.9");
    expect(error.message).toContain("gestante");
    expect(error.safeContext).toMatchObject({
      code: "C50.9",
      context: "gestante",
    });
    expect(error.observability.severity).toBe("ERROR");
  });

  test("InvalidCidNumber injeta flags requireDot/autoDot e padrão correto", () => {
    const error = ICDError.InvalidCidNumber("A001", "A00.1", {
      requireDot: true,
      autoDot: false,
    });

    expect(error.context).toMatchObject({
      received: "A001",
      candidate: "A00.1",
      requireDot: true,
      autoDot: false,
    });
    expect(error.message).toContain(
      "Esperado padrão ^[A-TV-Z]\\d{2}\\.[A-Z0-9]{1,4}$",
    );
  });

  test("EmptyCidCode usa campo padrão quando não informado", () => {
    const error = ICDError.EmptyCidCode();

    expect(error.context.field).toBe("icdCode");
    expect(error.message).toBe(
      "Nenhum CID foi informado para o campo 'icdCode'.",
    );
  });
});

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

describe("ImutableList.hasDuplicates", () => {
  const makeCircularNode = (value: number) => {
    const node: { value: number; self?: unknown } = { value };
    node.self = node;
    return node;
  };

  test("detecta duplicatas mesmo com estruturas circulares", () => {
    const list = ImutableListFactory.fromArray([
      makeCircularNode(1),
      makeCircularNode(1),
    ]);

    expect(() => list.hasDuplicates()).not.toThrow();
    expect(list.hasDuplicates()).toBe(true);
  });

  test("setUnique remove duplicatas sem mutar lista original", () => {
    const original = ImutableListFactory.fromArray([1, 1, 2]);

    const unique = original.setUnique();

    expect(unique.getAll()).toEqual([1, 2]);
    expect(original.getAll()).toEqual([1, 1, 2]); // imutável
  });

  test("hasDuplicates retorna false quando todos elementos são únicos", () => {
    const list = ImutableListFactory.fromArray([{ id: 1 }, { id: 2 }]);

    expect(list.hasDuplicates()).toBe(false);
  });
});

describe("SocialBenefit errors", () => {
  test("BenefitNameEmpty usa mensagem padrão quando campo está em branco", () => {
    const error = BE.BenefitNameEmpty();

    expect(error.code).toBe("BENEFIT-001");
    expect(error.message).toBe("O nome do benefício não pode ser vazio.");
  });

  test("AmountInvalid inclui o valor informado na mensagem", () => {
    const error = BE.AmountInvalid(0);

    expect(error.code).toBe("BENEFIT-002");
    expect(error.message).toContain("(0)");
    expect(error.context.amount).toBe(0);
  });

  test("BeneficiaryIdInvalid inclui o identificador inválido na mensagem", () => {
    const error = BE.BeneficiaryIdInvalid("beneficiary-xyz");

    expect(error.code).toBe("BENEFIT-003");
    expect(error.message).toContain("beneficiary-xyz");
    expect(error.context.beneficiaryId).toBe("beneficiary-xyz");
  });
});
