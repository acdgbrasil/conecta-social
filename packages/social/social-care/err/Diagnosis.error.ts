// social-care/diagnosis/err/Diagnosis.error.ts
import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
} from "@conecta/domain-error/DomainError.composition";
import { shortcuts } from "@conecta/domain-error/DomainError.shortcuts";

// 1) Tipos
type DiagnosisKind =
  | "DateInFuture"
  | "DateBeforeYearZero"
  | "DescriptionEmpty";

// 2) Catálogo
export const DiagnosisErrors = makeDomainErrorFactory<DiagnosisKind>({
  bc: "SOCIAL",
  module: "social-care/diagnosis",
  codePrefix: "DIAG",
  catalog: {
    DateInFuture: {
      code: "DIAG-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ date, now }) =>
        `Data do diagnóstico (${new Date(date as any).toISOString()}) não pode estar no futuro (agora: ${new Date(now as any).toISOString()}).`,
    },
    DateBeforeYearZero: {
      code: "DIAG-002",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ year }) =>
        `Ano do diagnóstico (${year}) não pode ser anterior a 0 (calendário ISO).`,
    },
    DescriptionEmpty: {
      code: "DIAG-003",
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
