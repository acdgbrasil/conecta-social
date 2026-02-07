import { makeEvent } from "./factory";
import type { DomainEvent } from "@conecta/shared/protocols/event-bus.protocol";

export const ReferralCreatedEvent = (props: {
  patientId: string;
  referralId: string;
  referredPersonId: string;
  destinationService: string;
  status: string;
  occurredAt: Date;
}): DomainEvent => makeEvent(
  "ReferralCreated",
  {
    patientId: props.patientId,
    referralId: props.referralId,
    referredPersonId: props.referredPersonId,
    destinationService: props.destinationService,
    status: props.status,
  },
  props.occurredAt
);
