import { List } from "@conecta/fn";
import { Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error/DomainError";
import { FamilyMemberAddedEvent } from "../../events";
import { P } from "../../errors/Patient.error";
import type { PersonId } from "../../value-objects";
import { FamilyMember } from "../FamilyMember.entity";
import type { Patient } from "./types";
import { copyWith } from "./core";

export const PatientFamily = {
  addFamilyMember(patient: Patient, member: FamilyMember, now: Date): Result<Patient, DomainError> {
    const exists = patient.props.familyMembers.some((current) =>
      current.personId === member.personId
    );

    if (exists) {
      return Result.err(P.FamilyMemberAlreadyExists({ memberId: member.personId.toString() }));
    }

    const updatedMembers = List.add(patient.props.familyMembers, member);
    
    const event = FamilyMemberAddedEvent({
      memberId: member.personId.toString(),
      patientId: patient.id.toString(),
      relationship: member.relationship,
      occurredAt: now,
    });

    return Result.ok(copyWith(patient, { familyMembers: updatedMembers }, [event]));
  },

  removeFamilyMember(patient: Patient, personId: PersonId): Result<Patient, DomainError> {
    const member = patient.props.familyMembers.find((m) => m.personId === personId);

    if (!member) {
      return Result.err(P.FamilyMemberNotFound({ personId: personId.toString() }));
    }
    
    const updatedMembers = List.remove(patient.props.familyMembers, member);
    return Result.ok(copyWith(patient, { familyMembers: updatedMembers }));
  },

  assignPrimaryCaregiver(patient: Patient, personId: PersonId): Result<Patient, DomainError> {
    const target = patient.props.familyMembers.find((m) => m.personId === personId);

    if (!target) {
      return Result.err(P.FamilyMemberNotFound({ personId: personId.toString() }));
    }

    if (target.isPrimaryCaregiver) return Result.ok(patient);

    const updatedMembers = patient.props.familyMembers.map((m) =>
      m.personId === personId
        ? FamilyMember.assignAsPrimaryCaregiver(m)
        : FamilyMember.revokePrimaryCaregiver(m),
    );

    return Result.ok(copyWith(patient, { familyMembers: List.from(updatedMembers) }));
  }
} as const;
