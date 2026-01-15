import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

export type PatientErrorKind =
  | "InitialDiagnosesCantBeEmpty"
  | "InitialIdIsRequired"
  | "InitialPersonIdIsRequired"
  | "FamilyMemberAlreadyExists"
  | "FamilyMemberNotFound"
  | "MemberAlreadyIsPrimaryCaregiver"
  | "FamilyMemberAlreadyContainsPrimaryCaregiver"
  | "ReferralTargetOutsideBoundary"
  | "ViolationTargetOutsideBoundary"
  | "InitialDiagnosesCantHaveDuplicates"
  | "PatientNotFound";

export const PatientErrors = makeDomainErrorFactory<PatientErrorKind>({
  bc: "SOCIAL",
  module: "social-care/patient",
  codePrefix: "PAT",
  catalog: {
    InitialDiagnosesCantBeEmpty: {
      code: "PAT-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () =>
        "Paciente não pode ser criado sem um diagnóstico inicial.",
    },
    InitialIdIsRequired: {
      code: "PAT-002",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "Id inicial é obrigatório para criar um paciente.",
    },
    ReferralTargetOutsideBoundary: {
      code: "PAT-003",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ targetId }) =>
        `Encaminhamentos só podem ser criados para pessoas dentro do agregado. '${targetId}' está fora da fronteira.`,
    },
    ViolationTargetOutsideBoundary: {
      code: "PAT-004",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ targetId }) =>
        `Relatos de violação só podem ser criados para pessoas dentro do agregado. '${targetId}' está fora da fronteira.`,
    },
    FamilyMemberAlreadyExists: {
      code: "PAT-005",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ memberId }) =>
        `O membro da família '${memberId}' já está associado a este paciente.`,
    },
    FamilyMemberNotFound: {
      code: "PAT-006",
      http: 404,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ personId }) =>
        `Nenhum membro da família associado ao PersonId '${personId}' foi encontrado.`,
    },
    MemberAlreadyIsPrimaryCaregiver: {
      code: "PAT-007",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ personId }) =>
        `O membro com PersonId '${personId}' já é o cuidador principal.`,
    },
    FamilyMemberAlreadyContainsPrimaryCaregiver: {
      code: "PAT-008",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ currentCaregiverId }) =>
        `O paciente já possui um cuidador principal (${currentCaregiverId}).`,
    },
    InitialPersonIdIsRequired: {
      code: "PAT-009",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "PersonId inicial é obrigatório para criar um paciente.",
    },
    InitialDiagnosesCantHaveDuplicates: {
      code: "PAT-010",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () =>
        "Paciente não pode ser criado com diagnósticos iniciais duplicados.",
    },
    PatientNotFound: {
      code: "PAT-011",
      http: 404,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ id }) => `Paciente com identificador '${id}' não foi encontrado.`,
    },
  },
});

export const P = shortcuts(PatientErrors, {
  InitialDiagnosesCantBeEmpty: [] as const,
  InitialIdIsRequired: [] as const,
  InitialPersonIdIsRequired: [] as const,
  FamilyMemberAlreadyExists: ["memberId"] as const,
  FamilyMemberNotFound: ["personId"] as const,
  MemberAlreadyIsPrimaryCaregiver: ["personId"] as const,
  FamilyMemberAlreadyContainsPrimaryCaregiver: ["currentCaregiverId"] as const,
  ReferralTargetOutsideBoundary: ["targetId"] as const,
  ViolationTargetOutsideBoundary: ["targetId"] as const,
  InitialDiagnosesCantHaveDuplicates: [] as const,
  PatientNotFound: ["id"] as const,
});
