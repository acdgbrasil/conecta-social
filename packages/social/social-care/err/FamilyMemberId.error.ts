import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
} from "@conecta/domain-error/DomainError.composition";
import { shortcuts } from "@conecta/domain-error/DomainError.shortcuts";

// 1) Tipos de Erro
type FamilyMemberIdKind = "InvalidFormat";

// 2) Catálogo de Erros
export const FamilyMemberIdErrors = makeDomainErrorFactory<FamilyMemberIdKind>({
  bc: "SOCIAL",
  module: "social-care/family-member-id",
  codePrefix: "FMID",
  catalog: {
    InvalidFormat: {
      code: "FMID-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ value }) =>
        `O ID do membro da família fornecido ('${value}') não é um UUID v7 válido.`,
    },
  },
});

// 3) Atalhos para facilitar o uso
export const FMIE = shortcuts(FamilyMemberIdErrors, {
  InvalidFormat: ["value"] as const,
});
