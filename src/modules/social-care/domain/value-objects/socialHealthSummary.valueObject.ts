import type { DomainError } from "@conecta/domain-error";
import { type DeepReadonly, List } from "@conecta/fn";
import { Result } from "@conecta/result";
import { SHSDE } from "../errors/SocialHealthSummary.error";

export type SocialHealthSummaryProps = {
  readonly requiresConstantCare: boolean;
  readonly hasMobilityImpairment: boolean;
  readonly functionalDependencies: readonly string[];
  readonly hasRelevantDrugTheapy: boolean;
};

export type SocialHealthSummary = DeepReadonly<SocialHealthSummaryProps>;

export const SocialHealthSummary = {
  create(props: SocialHealthSummaryProps): Result<SocialHealthSummary, DomainError> {
    const { hasEmpty, unique } = normalizeDependencies(props.functionalDependencies);
    if (hasEmpty) return Result.err(SHSDE.FunctionalDependenciesEmpty());

    return Result.ok({
      requiresConstantCare: props.requiresConstantCare,
      hasMobilityImpairment: props.hasMobilityImpairment,
      functionalDependencies: unique,
      hasRelevantDrugTheapy: props.hasRelevantDrugTheapy,
    });
  }
} as const;

function normalizeDependencies(dependencies: readonly string[]): {
  hasEmpty: boolean;
  unique: readonly string[];
} {
  const trimmed = dependencies.map((dependency) => dependency.trim());
  const hasEmpty = trimmed.some((dependency) => dependency.length === 0);
  if (hasEmpty) {
    return { hasEmpty, unique: [] };
  }

  return { hasEmpty, unique: List.unique(List.from(trimmed)) };
}