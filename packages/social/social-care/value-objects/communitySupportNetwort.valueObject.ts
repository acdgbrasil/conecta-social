import { DomainError } from "@conecta/domain-error";
import { ok, Result } from "@conecta/result";
import { CommunitySupportNetworkProps } from "./props/communitySupportNetwork.props";

export class CommunitySupportNetwork implements CommunitySupportNetworkProps {
    readonly hasSupportFromRelatives:boolean;
    readonly hasSupportFromNeighbors:boolean;
    readonly familyConflicts:string;
    readonly patientParticipatesInGroups:boolean;
    readonly familyParticipatesInGroups:boolean;
    readonly patientHasAccessToLeisure:boolean;
    readonly facesDiscriminationInCommunity:boolean;

    private constructor(props: CommunitySupportNetworkProps) {
        this.hasSupportFromRelatives = props.hasSupportFromRelatives;
        this.hasSupportFromNeighbors = props.hasSupportFromNeighbors;
        this.familyConflicts = props.familyConflicts;
        this.patientParticipatesInGroups = props.patientParticipatesInGroups;
        this.familyParticipatesInGroups = props.familyParticipatesInGroups;
        this.patientHasAccessToLeisure = props.patientHasAccessToLeisure;
        this.facesDiscriminationInCommunity = props.facesDiscriminationInCommunity;
        Object.freeze(this);
    }

    static create(props: CommunitySupportNetworkProps): Result<CommunitySupportNetwork, DomainError> {
        return ok(new CommunitySupportNetwork(props));
    }

    copyWith(props: Partial<CommunitySupportNetworkProps>): Result<CommunitySupportNetwork, DomainError> {
        return CommunitySupportNetwork.create({
            hasSupportFromRelatives: props.hasSupportFromRelatives ?? this.hasSupportFromRelatives,
            hasSupportFromNeighbors: props.hasSupportFromNeighbors ?? this.hasSupportFromNeighbors,
            familyConflicts: props.familyConflicts ?? this.familyConflicts,
            patientParticipatesInGroups: props.patientParticipatesInGroups ?? this.patientParticipatesInGroups,
            familyParticipatesInGroups: props.familyParticipatesInGroups ?? this.familyParticipatesInGroups,
            patientHasAccessToLeisure: props.patientHasAccessToLeisure ?? this.patientHasAccessToLeisure,
            facesDiscriminationInCommunity: props.facesDiscriminationInCommunity ?? this.facesDiscriminationInCommunity,
        });
    }
}