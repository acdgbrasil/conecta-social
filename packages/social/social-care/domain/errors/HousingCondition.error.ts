import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

type HousingConditionErrorKind =
  | "NegativeRooms"
  | "NegativeBathrooms"
  | "BathroomsExceedRooms";

export const HousingConditionErrors = makeDomainErrorFactory<HousingConditionErrorKind>({
  bc: "SOCIAL",
  module: "social-care/housing-condition",
  codePrefix: "HC",
  catalog: {
    NegativeRooms: {
      code: "HC-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "Número de quartos não pode ser negativo.",
    },
    NegativeBathrooms: {
      code: "HC-002",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "Número de banheiros não pode ser negativo.",
    },
    BathroomsExceedRooms: {
      code: "HC-003",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "Número de banheiros não pode ser maior que o número de quartos.",
    },
  },
});

export const HC = shortcuts(HousingConditionErrors, {
  NegativeRooms: [] as const,
  NegativeBathrooms: [] as const,
  BathroomsExceedRooms: [] as const,
});
