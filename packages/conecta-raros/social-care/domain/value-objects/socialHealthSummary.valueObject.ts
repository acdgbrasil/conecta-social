import type { DomainError } from "@conecta/domain-error";
import { ImutableListFactory } from "@conecta/fn";
import { unSafe } from "@conecta/option";
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
    const uniqueDependencies = props.functionalDependencies
      .setUnique()
      .getAll();
    const hasEmptyDependencies = uniqueDependencies.some(
      (dependeces) => dependeces.trim().length === 0,
    );

    if (hasEmptyDependencies) return err(SHSDE.FunctionalDependenciesEmpty());

    return ok(
      new SocialHealthSummary({
        ...props,
        functionalDependencies: uniqueDependencies,
      }),
    );
  }

  copyWith(
    props: Partial<SocialHealthSummaryProps>,
  ): Result<SocialHealthSummary, DomainError> {
    const unSafeList = unSafe(props.functionalDependencies);
    const safeList = unSafeList.isSome
      ? unSafeList.unwrap().setUnique().getAll()
      : this.functionalDependencies;
    const normalizedSafeList = ImutableListFactory.fromArray(
      safeList.map((dep) => dep.trim()),
    )
      ? ImutableListFactory.fromArray(
          safeList.map((dep) => dep.trim()),
        ).getAll()
      : [];
    const imutabilidadeSafeList = normalizedSafeList.some(
      (dependeces) => dependeces.trim().length !== 0,
    )
      ? ImutableListFactory.fromArray(safeList.map((dep) => dep.trim()))
      : ImutableListFactory.fromArray(
          this.functionalDependencies.map((dep) => dep.trim()),
        );

    return SocialHealthSummary.create({
      requiresConstantCare:
        props.requiresConstantCare ?? this.requiresConstantCare,
      hasMobilityImpairment:
        props.hasMobilityImpairment ?? this.hasMobilityImpairment,
      functionalDependencies: imutabilidadeSafeList,
      hasRelevantDrugTheapy:
        props.hasRelevantDrugTheapy ?? this.hasRelevantDrugTheapy,
    });
  }
}
