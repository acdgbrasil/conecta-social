import type { DomainError } from "@conecta/domain-error";
import { err, ok, type Result } from "@conecta/result";
import { SHSDE } from "../errors/SocialHealthSummary.error";
import type { SocialHealthSummaryProps } from "./props/socialHealthSummary.props";

export class SocialHealthSummary {
  readonly requiresConstantCare: boolean;
  readonly hasMobilityImpairment: boolean;
  readonly functionalDependencies: readonly string[];
  readonly hasRelevantDrugTheapy: boolean;

  private constructor(props: {
    requiresConstantCare: boolean;
    hasMobilityImpairment: boolean;
    functionalDependencies: readonly string[];
    hasRelevantDrugTheapy: boolean;
  }) {
    this.requiresConstantCare = props.requiresConstantCare;
    this.hasMobilityImpairment = props.hasMobilityImpairment;
    this.functionalDependencies = Object.freeze(props.functionalDependencies);
    this.hasRelevantDrugTheapy = props.hasRelevantDrugTheapy;
    Object.freeze(this);
  }

  static create(
    props: SocialHealthSummaryProps,
  ): Result<SocialHealthSummary, DomainError> {
    const { hasEmpty, unique } =
      SocialHealthSummary.normalizeDependencies(props.functionalDependencies);
    if (hasEmpty) return err(SHSDE.FunctionalDependenciesEmpty());

    return ok(
      new SocialHealthSummary({
        ...props,
        functionalDependencies: unique,
      }),
    );
  }

  copyWith(
    props: Partial<SocialHealthSummaryProps>,
  ): Result<SocialHealthSummary, DomainError> {
    return SocialHealthSummary.create({
      requiresConstantCare:
        props.requiresConstantCare ?? this.requiresConstantCare,
      hasMobilityImpairment:
        props.hasMobilityImpairment ?? this.hasMobilityImpairment,
      functionalDependencies:
        props.functionalDependencies ?? this.functionalDependencies,
      hasRelevantDrugTheapy:
        props.hasRelevantDrugTheapy ?? this.hasRelevantDrugTheapy,
    });
  }

  private static normalizeDependencies(dependencies: readonly string[]): {
    hasEmpty: boolean;
    unique: readonly string[];
  } {
    const trimmed = dependencies.map((dependency) => dependency.trim());
    const hasEmpty = trimmed.some((dependency) => dependency.length === 0);
    if (hasEmpty) {
      return { hasEmpty, unique: [] };
    }

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const dependency of trimmed) {
      if (!seen.has(dependency)) {
        seen.add(dependency);
        unique.push(dependency);
      }
    }

    return { hasEmpty, unique };
  }
}
