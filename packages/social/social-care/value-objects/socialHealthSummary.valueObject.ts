import {ImutableList} from "@conecta/fn/fn-types";
import {err, ok, Result} from "@conecta/result";
import { DomainError } from "@conecta/domain-error/DomainError"
import { SHSDE } from "../err/SocialHealthSummary.error";

export class _SocialHealthSummary {
    constructor(readonly requiresConstantCare: boolean, readonly hasMobilityImpairment: boolean, readonly functionalDependencies: string[], readonly hasRelevantDrugTheapy: boolean) {}

    static create(requiresConstantCare: boolean, hasMobilityImpairment: boolean, functionalDependencies: ImutableList<string>, hasRelevantDrugTheapy: boolean): Result<SocialHealthSummary, DomainError> {
        if(functionalDependencies.isEmpty()) return err(SHSDE.FunctionalDependenciesEmpty());
        return ok(new _SocialHealthSummary(requiresConstantCare, hasMobilityImpairment, functionalDependencies.getUnique().getAll(), hasRelevantDrugTheapy));
    }


}

export const SocialHealthSummary = Object.freeze(_SocialHealthSummary);