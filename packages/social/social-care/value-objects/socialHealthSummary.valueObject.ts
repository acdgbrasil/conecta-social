import { ImutableListFactory } from "@conecta/fn";
import { err, ok, Result } from "@conecta/result";
import { DomainError } from "@conecta/domain-error";
import { SHSDE } from "../err/SocialHealthSummary.error";
import { SocialHealthSummaryProps } from "./props/socialHealthSummary.props";

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

    static create(props: SocialHealthSummaryProps): Result<SocialHealthSummary, DomainError> {
        
        const uniqueDependencies = props.functionalDependencies.setUnique().getAll();
        const hasEmptyDependencies = uniqueDependencies.some((dependeces) => dependeces.trim().length === 0);

        if (hasEmptyDependencies) return err(SHSDE.FunctionalDependenciesEmpty());
            
        return ok(new SocialHealthSummary({
            ...props,
            functionalDependencies: uniqueDependencies,
        }));
    }

    copyWith(props: Partial<SocialHealthSummaryProps>): Result<SocialHealthSummary, DomainError> {
        const currentDeps = ImutableListFactory.fromArray([...this.functionalDependencies]);

        return SocialHealthSummary.create({
            requiresConstantCare: props.requiresConstantCare ?? this.requiresConstantCare,
            hasMobilityImpairment: props.hasMobilityImpairment ?? this.hasMobilityImpairment,
            functionalDependencies: props.functionalDependencies ?? currentDeps,
            hasRelevantDrugTheapy: props.hasRelevantDrugTheapy ?? this.hasRelevantDrugTheapy,
        });
    }
}
