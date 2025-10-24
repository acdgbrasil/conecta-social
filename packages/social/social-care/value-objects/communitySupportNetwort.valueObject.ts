import { DomainError } from "@conecta/domain-error";
import { ok, Result } from "@conecta/result";

export class CommunitySupportNetwork {
    private constructor(readonly hasSupportFromRelatives:boolean, readonly hasSupportFromNeighbors:boolean, readonly familyConflicts:string, readonly patientParticipatesInGroups:boolean, readonly familyParticipatesInGroups:boolean, readonly patientHasAccessToLeisure:boolean, readonly facesDiscriminationInCommunity:boolean) {}

    static create(hasSupportFromRelatives:boolean, hasSupportFromNeighbors:boolean, familyConflicts:string, patientParticipatesInGroups:boolean, familyParticipatesInGroups:boolean, patientHasAccessToLeisure:boolean, facesDiscriminationInCommunity:boolean): Result<CommunitySupportNetwork, DomainError> {
        return ok(Object.freeze(new CommunitySupportNetwork(hasSupportFromRelatives, hasSupportFromNeighbors, familyConflicts, patientParticipatesInGroups, familyParticipatesInGroups, patientHasAccessToLeisure, facesDiscriminationInCommunity)));
    }
}