import { makeEvent } from "./factory";
import type { DomainEvent } from "@conecta/shared/protocols/event-bus.protocol";

export const SocialCareAppointmentRegisteredEvent = (props: {
  patientId: string;
  appointmentId: string;
  professionalInChargeId: string;
  type: string;
  occurredAt: Date;
}): DomainEvent => makeEvent(
  "SocialCareAppointmentRegistered",
  {
    patientId: props.patientId,
    appointmentId: props.appointmentId,
    professionalInChargeId: props.professionalInChargeId,
    type: props.type,
  },
  props.occurredAt
);
