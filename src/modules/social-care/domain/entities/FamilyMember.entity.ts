import type { DomainError } from "@conecta/domain-error";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import { FM } from "../errors/FamilyMember.error";
import type { FamilyMemberId } from "../value-objects/FamilyMemberId.valueObject";
import type { PersonId } from "../value-objects/personId.valueObject";

export type FamilyMemberProps = {
  id: FamilyMemberId;
  personId: PersonId;
  relationship: string;
  isPrimaryCaregiver: boolean;
  residesWithPatient: boolean;
};

export type FamilyMember = DeepReadonly<FamilyMemberProps>;

export const FamilyMember = {
  create(props: FamilyMemberProps): Result<FamilyMember, DomainError> {
    if (!props.personId) {
      return Result.err(FM.MissingPerson());
    }

    if (!props.relationship || props.relationship.trim().length === 0) {
      return Result.err(FM.InvalidRelationship());
    }

    return Result.ok({
      ...props,
      relationship: props.relationship.trim(),
    });
  },

  assignAsPrimaryCaregiver(member: FamilyMember): FamilyMember {
    if (member.isPrimaryCaregiver) {
      return member;
    }
    return { ...member, isPrimaryCaregiver: true };
  },

  revokePrimaryCaregiver(member: FamilyMember): FamilyMember {
    if (!member.isPrimaryCaregiver) {
      return member;
    }
    return { ...member, isPrimaryCaregiver: false };
  },

  equals(a: FamilyMember, b: FamilyMember): boolean {
    return a.id === b.id; // Primitivos branded comparam por valor/referência
  }
} as const;