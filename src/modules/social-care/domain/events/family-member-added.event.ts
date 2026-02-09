import { makeEvent } from "./factory";
import type { DomainEvent } from "@conecta/ports";

export const FamilyMemberAddedEvent = (props: {
  patientId: string;
  memberId: string;
  relationship: string;
  occurredAt: Date;
}): DomainEvent => makeEvent(
  "FamilyMemberAdded",
  {
    patientId: props.patientId,
    memberId: props.memberId,
    relationship: props.relationship,
  },
  props.occurredAt
);
