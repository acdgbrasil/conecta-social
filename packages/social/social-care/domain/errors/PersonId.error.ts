import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

type PersonIdErrorKind = "InvalidFormat";

export const PersonIdErrors = makeDomainErrorFactory<PersonIdErrorKind>({
  bc: "SOCIAL",
  module: "social-care/person-id",
  codePrefix: "PID",
  catalog: {
    InvalidFormat: {
      code: "PID-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ value }) =>
        `O identificador '${value}' não segue o padrão UUID v7 exigido pelo domínio.`,
    },
  },
});

export const PID = shortcuts(PersonIdErrors, {
  InvalidFormat: ["value"] as const,
});
