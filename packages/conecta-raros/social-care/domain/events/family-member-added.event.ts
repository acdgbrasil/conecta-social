import type { DomainEvent } from "@conecta/shared/protocols/event-bus.protocol";
import { Uuid } from "@conecta/shared/uuid-pattern/uuid";

export const FamilyMemberAddedEvent = (props: {
  patientId: string;
  memberId: string;
  relationship: string;
  occurredAt: Date;
}): DomainEvent => ({
  name: "FamilyMemberAdded",
  id: Uuid.create().unwrap().toString(),
  occurredAt: props.occurredAt,
  payload: {
    patientId: props.patientId,
    memberId: props.memberId,
    relationship: props.relationship,
  },
});
