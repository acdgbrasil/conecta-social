import { makeEvent } from "./factory";
import type { DomainEvent } from "@conecta/shared";

type PatientCreatedEventProps = {
  patientId: string;
  personId: string;
  occurredAt: Date;
};

export const PatientCreatedEvent = (
  props: PatientCreatedEventProps,
): DomainEvent => makeEvent(
  "PatientCreated",
  {
    patientId: props.patientId,
    personId: props.personId,
  },
  props.occurredAt
);
