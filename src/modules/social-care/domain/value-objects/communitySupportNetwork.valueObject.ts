import type { DomainError } from "@conecta/domain-error/DomainError";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import { CSN } from "../errors/CommunitySupportNetwork.error";

const MAX_FAMILY_CONFLICTS_LENGTH = 300;

export type CommunitySupportNetworkProps = {
  readonly hasSupportFromRelatives: boolean;
  readonly hasSupportFromNeighbors: boolean;
  readonly familyConflicts: string;
  readonly patientParticipatesInGroups: boolean;
  readonly familyParticipatesInGroups: boolean;
  readonly patientHasAccessToLeisure: boolean;
  readonly facesDiscriminationInCommunity: boolean;
};

export type CommunitySupportNetwork = DeepReadonly<CommunitySupportNetworkProps>;

export const CommunitySupportNetwork = {
  create(props: CommunitySupportNetworkProps): Result<CommunitySupportNetwork, DomainError> {
    const rawConflicts = props.familyConflicts ?? "";
    const trimmed = rawConflicts.trim();
    
    if (rawConflicts !== "" && trimmed.length === 0) {
      return Result.err(CSN.FamilyConflictsWhitespace());
    }

    if (trimmed.length > MAX_FAMILY_CONFLICTS_LENGTH) {
      return Result.err(CSN.FamilyConflictsTooLong());
    }

    return Result.ok({
      ...props,
      familyConflicts: rawConflicts === "" ? "" : trimmed,
    });
  }
} as const;