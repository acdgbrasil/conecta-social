import type { DomainError } from "@conecta/domain-error";
import { err, ok, type Result } from "@conecta/result";
import { ImutableListFactory, type ImutableList } from "@conecta/fn";

import { P } from "../errors/Patient.error";
import type { FamilyMember } from "../entities/FamilyMember.entity";
import type { PersonId } from "../value-objects/personId.valueObject";

export const ensureFamilyMemberNotExists = (
  member: FamilyMember,
  familyMembers: ImutableList<FamilyMember>,
): Result<void, DomainError> => {
  const exists = familyMembers
    .getAll()
    .some((current) => current.personId.equals(member.personId));

  if (exists) {
    return err(
      P.FamilyMemberAlreadyExists({
        memberId: member.personId.toString(),
      }),
    );
  }

  return ok(undefined);
};

export const findFamilyMemberByPersonId = (
  personId: PersonId,
  familyMembers: ImutableList<FamilyMember>,
): Result<FamilyMember, DomainError> => {
  const member = familyMembers
    .getAll()
    .find((candidate) => candidate.personId.equals(personId));

  if (!member) {
    return err(
      P.FamilyMemberNotFound({
        personId: personId.toString(),
      }),
    );
  }

  return ok(member);
};

export type PrimaryCaregiverUpdate = {
  members: ImutableList<FamilyMember>;
  isNoop: boolean;
};

export const updatePrimaryCaregiverMembers = (
  personId: PersonId,
  familyMembers: ImutableList<FamilyMember>,
): Result<PrimaryCaregiverUpdate, DomainError> => {
  const members = familyMembers.getAll();
  const target = members.find((member) => member.personId.equals(personId));

  if (!target) {
    return err(
      P.FamilyMemberNotFound({
        personId: personId.toString(),
      }),
    );
  }

  if (target.isPrimaryCaregiver) {
    return ok({ members: familyMembers, isNoop: true });
  }

  const updatedMembers = members.map((member) =>
    member.personId.equals(personId)
      ? member.assignAsPrimaryCaregiver()
      : member.revokePrimaryCaregiver(),
  );

  return ok({
    members: ImutableListFactory.fromArray(updatedMembers),
    isNoop: false,
  });
};
