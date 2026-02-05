import type { DomainEvent } from "@conecta/shared/protocols/event-bus.protocol";
import { Uuid } from "@conecta/shared/uuid-pattern/uuid";

type PatientCreatedEventProps = {
  patientId: string;
  personId: string;
  occurredAt: Date;
};

export const PatientCreatedEvent = (
  props: PatientCreatedEventProps,
): DomainEvent => ({
  name: "PatientCreated",
  id: Uuid.create().unwrap().toString(),
  occurredAt: props.occurredAt,
  payload: {
    patientId: props.patientId,
    personId: props.personId,
  },
});
