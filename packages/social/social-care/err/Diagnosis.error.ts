// social-care/diagnosis/err/Diagnosis.error.ts
import { ErrorTaxonomy, makeDomainErrorFactory } from "../../../shared/erros-pattern/DomainError.composition";
import {shortcuts } from "../../../shared/erros-pattern/DomainError.shortcuts";

// 1) Tipos
type DiagnosisKind =
  | "DateInFuture"
  | "DateBeforeYearZero"
  | "DescriptionEmpty";

// 2) Catálogo
export const DiagnosisErrors = makeDomainErrorFactory<DiagnosisKind>({
  bc: "SOCIAL_CARE",
  module: "diagnosis",
  catalog: {
    DateInFuture: {
      code: "PAT-DIAG-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ date, now }) =>
        `Data do diagnóstico (${new Date(date as any).toISOString()}) não pode estar no futuro (agora: ${new Date(now as any).toISOString()}).`,
    },
    DateBeforeYearZero: {
      code: "PAT-DIAG-002",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ year }) =>
        `Ano do diagnóstico (${year}) não pode ser anterior a 0 (calendário ISO).`,
    },
    DescriptionEmpty: {
      code: "PAT-DIAG-003",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "Descrição do diagnóstico não pode ser vazia.",
      redact: ["raw"], // se quiser ocultar a descrição crua
    },
  },
});

export const DE = shortcuts(DiagnosisErrors, {
  DateInFuture: ["date", "now"] as const,
  DateBeforeYearZero: ["year"] as const,
  DescriptionEmpty: ["raw"] as const,
});