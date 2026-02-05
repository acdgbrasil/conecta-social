import type { DomainEvent } from "@conecta/shared/protocols/event-bus.protocol";
import { Uuid } from "@conecta/shared/uuid-pattern/uuid";

export const SocialCareAppointmentRegisteredEvent = (props: {
  patientId: string;
  appointmentId: string;
  professionalInChargeId: string;
  type: string;
  occurredAt: Date;
}): DomainEvent => ({
  name: "SocialCareAppointmentRegistered",
  id: Uuid.create().unwrap().toString(),
  occurredAt: props.occurredAt,
  payload: {
    patientId: props.patientId,
    appointmentId: props.appointmentId,
    professionalInChargeId: props.professionalInChargeId,
    type: props.type,
  },
});
