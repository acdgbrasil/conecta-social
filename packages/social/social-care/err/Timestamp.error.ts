import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
} from "@conecta/domain-error/DomainError.composition";
import { shortcuts } from "@conecta/domain-error/DomainError.shortcuts";

// 1) Tipos
type TimestampKind = "InvalidDate";

// 2) Catálogo
export const TimestampErrors = makeDomainErrorFactory<TimestampKind>({
  bc: "SOCIAL",
  module: "social-care/timestamp",
  codePrefix: "TS",
  catalog: {
    InvalidDate: {
      code: "TS-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ value }) => `O valor fornecido ('${value}') não é uma data válida.`,
    },
  },
});

// 3) Atalhos
export const TE = shortcuts(TimestampErrors, {
  InvalidDate: ["value"] as const,
});
