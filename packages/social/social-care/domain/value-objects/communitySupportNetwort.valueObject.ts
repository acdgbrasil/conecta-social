import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { CSN } from "../errors/CommunitySupportNetwork.error";
import { CommunitySupportNetworkProps } from "./props/communitySupportNetwork.props";

const MAX_FAMILY_CONFLICTS_LENGTH = 300;

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
        const rawConflicts = props.familyConflicts ?? "";
        const trimmed = rawConflicts.trim();
        if (rawConflicts !== "" && trimmed.length === 0) {
            return err(CSN.FamilyConflictsWhitespace());
        }

        if ( trimmed.length > MAX_FAMILY_CONFLICTS_LENGTH ) {
            return err(CSN.FamilyConflictsTooLong());
        }

        return ok(
            new CommunitySupportNetwork({
                ...props,
                familyConflicts: rawConflicts === "" ? "" : trimmed,
            }),
        );
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
