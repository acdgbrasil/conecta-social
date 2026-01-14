export type { DomainError } from "./DomainError";
export { SpecificDomainError } from "./DomainError";
export type {
  ErrorCategory,
  ObservabilitySeverityLevel,
  Template as DomainErrorCatalogTemplate,
} from "./DomainError.composition";
export {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  ObservabilitySeverity,
} from "./DomainError.composition";
export type { Template as DomainErrorTemplate } from "./DomainError.factory";
export { DomainErrorFactory } from "./DomainError.factory";

export { shortcuts } from "./DomainError.shortcuts";
