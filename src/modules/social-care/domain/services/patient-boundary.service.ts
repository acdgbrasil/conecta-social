import { ImutableListFactory, type ImutableList } from "@conecta/fn";
import type { Uuid } from "@conecta/uuid";

import type { FamilyMember } from "../entities/FamilyMember.entity";
import type { PersonId } from "../value-objects/personId.valueObject";

export const belongsToBoundary = (
  targetId: Uuid,
  patientPersonId: PersonId,
  familyMembers: ImutableList<FamilyMember>,
): boolean => {
  const candidate = targetId.toString();
  if (patientPersonId.toString() === candidate) return true;
  return ImutableListFactory.getAll(familyMembers).some(
    (member) => member.personId.toString() === candidate,
  );
};
