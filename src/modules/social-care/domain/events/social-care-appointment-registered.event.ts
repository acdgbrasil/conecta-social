import { makeEvent } from "./factory";
import type { DomainEvent } from "@conecta/ports";
import type { SocialCareAppointmentType } from "../entities/SocialCareAppointment.entity";

export const SocialCareAppointmentRegisteredEvent = (props: {
  patientId: string;
  appointmentId: string;
  professionalInChargeId: string;
  type: SocialCareAppointmentType;
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
