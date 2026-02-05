// social-care/diagnosis/err/Diagnosis.error.ts
import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

// 1) Tipos
type DiagnosisKind =
  | "DateInFuture"
  | "DateBeforeYearZero"
  | "DescriptionEmpty"
  | "InvalidICDCode";

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
        `Data do diagnóstico (${date}) não pode estar no futuro (agora: ${now}).`,
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
    InvalidICDCode: {
      code: "DIAG-004",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ id }) =>
        `O código CID '${id}' fornecido para o diagnóstico é inválido.`,
      redact: ["id"],
    },
  },
});

export const DE = shortcuts(DiagnosisErrors, {
  DateInFuture: ["date", "now"] as const,
  DateBeforeYearZero: ["year"] as const,
  DescriptionEmpty: [] as const,
  InvalidICDCode: ["id"] as const,
});
