import type { DomainEvent } from "@conecta/shared/protocols/event-bus.protocol";
import { Uuid } from "@conecta/shared/uuid-pattern/uuid";

export const RightsViolationReportedEvent = (props: {
  patientId: string;
  reportId: string;
  victimId: string;
  violationType: string;
  occurredAt: Date;
}): DomainEvent => ({
  name: "RightsViolationReported",
  id: Uuid.create().unwrap().toString(),
  occurredAt: props.occurredAt,
  payload: {
    patientId: props.patientId,
    reportId: props.reportId,
    victimId: props.victimId,
    violationType: props.violationType,
  },
});
