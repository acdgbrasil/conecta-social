export * from "./DomainError";
export * from "./DomainError.composition";
export * from "./DomainError.shortcuts";

import { ErrorTaxonomy, ObservabilitySeverity } from "./DomainError";
import { makeDomainErrorFactory } from "./DomainError.composition";
import { shortcuts } from "./DomainError.shortcuts";

/**
 * Namespace unificado para erros de domínio.
 */
export const DomainError = {
  Taxonomy: ErrorTaxonomy,
  Severity: ObservabilitySeverity,
  makeFactory: makeDomainErrorFactory,
  shortcuts,
};