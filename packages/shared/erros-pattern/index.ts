export type { DomainError } from "./DomainError";
export { SpecificDomainError } from "./DomainError";

export { DomainErrorFactory } from "./DomainError.factory";
export type { Template as DomainErrorTemplate } from "./DomainError.factory";

export {
  ErrorTaxonomy,
  ObservabilitySeverity,
  makeDomainErrorFactory,
} from "./DomainError.composition";
export type {
  ErrorCategory,
  ObservabilitySeverityLevel,
  Template as DomainErrorCatalogTemplate,
} from "./DomainError.composition";

export { shortcuts } from "./DomainError.shortcuts";
