import { ErrorTaxonomy, makeDomainErrorFactory, shortcuts } from "@conecta/domain-error";

// 1) Tipos
export type PatientErrorKind =
  | "InitialDiagnosesCantBeEmpty"
  | "InitialPersonIdIsRequired"
  | "InitialIdIsRequired"
  | "FamilyMemberAlreadyExists"
  | "FamilyMemberNotFound"
  | "MemberAlreadyIsPrimaryCaregiver"
  | "FamilyMemberAlreadyContainsPrimaryCaregiver"

// 2) Catálogo
export const PatientErrors = makeDomainErrorFactory<PatientErrorKind>({
  bc: "SOCIAL",
  module: "social-care/patient",
  codePrefix: "P",
  catalog: {
    InitialDiagnosesCantBeEmpty: {
      code: "P-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "Paciente não pode ser criado sem um diagnóstico inicial.",
    },
    InitialPersonIdIsRequired: {
      code: "P-002",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "PersonId inicial é obrigatório para criar um paciente.",
    },
    InitialIdIsRequired: {
      code: "P-003",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "Id inicial é obrigatório para criar um paciente.",
    },
    FamilyMemberAlreadyExists: {
      code: "P-004",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "O membro da família já está associado a este paciente.",
    },
    FamilyMemberNotFound: {
      code: "P-005",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "Membro da família não encontrado para remoção.",
    },
    MemberAlreadyIsPrimaryCaregiver: {
      code: "P-006",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "O membro da família já é o cuidador principal.",
    },
    FamilyMemberAlreadyContainsPrimaryCaregiver: {
      code: "P-007",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "O paciente já possui um cuidador principal designado.",
    },
  },
});

// 3) Atalhos
export const P = shortcuts(PatientErrors, {
  InitialDiagnosesCantBeEmpty: [] as const,
  InitialPersonIdIsRequired: [] as const,
  InitialIdIsRequired: [] as const,
  FamilyMemberAlreadyExists: ["memberId"] as const,
  FamilyMemberNotFound: ["personId"] as const,
  MemberAlreadyIsPrimaryCaregiver: [] as const,
  FamilyMemberAlreadyContainsPrimaryCaregiver: [] as const,

});
