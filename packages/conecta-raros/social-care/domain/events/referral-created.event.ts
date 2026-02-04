import type { DomainEvent } from "@conecta/shared/protocols/event-bus.protocol";
import { Uuid } from "@conecta/shared/uuid-pattern/uuid";

export const ReferralCreatedEvent = (props: {
  patientId: string;
  referralId: string;
  referredPersonId: string;
  destinationService: string;
  status: string;
  occurredAt: Date;
}): DomainEvent => ({
  name: "ReferralCreated",
  id: Uuid.create().unwrap().toString(),
  occurredAt: props.occurredAt,
  payload: {
    patientId: props.patientId,
    referralId: props.referralId,
    referredPersonId: props.referredPersonId,
    destinationService: props.destinationService,
    status: props.status,
  },
});
