import type { DomainError } from "@conecta/domain-error";
import { err, ok, type Result } from "@conecta/result";

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

export class FamilyMember {
  private constructor(readonly props: FamilyMemberProps) {
    Object.freeze(this.props);
    Object.freeze(this);
  }

  static create(props: FamilyMemberProps): Result<FamilyMember, DomainError> {
    if (!props.personId) {
      return err(FM.MissingPerson());
    }

    if (!props.relationship || props.relationship.trim().length === 0) {
      return err(FM.InvalidRelationship());
    }

    return ok(
      new FamilyMember({
        ...props,
        relationship: props.relationship.trim(),
        personId: props.personId,
      }),
    );
  }

  get id(): FamilyMemberId {
    return this.props.id;
  }

  get personId(): PersonId {
    return this.props.personId;
  }

  get relationship(): string {
    return this.props.relationship;
  }

  get isPrimaryCaregiver(): boolean {
    return this.props.isPrimaryCaregiver;
  }

  get residesWithPatient(): boolean {
    return this.props.residesWithPatient;
  }

  assignAsPrimaryCaregiver(): FamilyMember {
    if (this.isPrimaryCaregiver) {
      return this;
    }

    return new FamilyMember({
      ...this.props,
      isPrimaryCaregiver: true,
    });
  }

  revokePrimaryCaregiver(): FamilyMember {
    if (!this.isPrimaryCaregiver) {
      return this;
    }

    return new FamilyMember({
      ...this.props,
      isPrimaryCaregiver: false,
    });
  }

  equals(other: FamilyMember): boolean {
    return this.id.equals(other.id);
  }
}
