import { makeEvent } from "./factory";
import type { DomainEvent } from "@conecta/shared/protocols/event-bus.protocol";

export const RightsViolationReportedEvent = (props: {
  patientId: string;
  reportId: string;
  victimId: string;
  violationType: string;
  occurredAt: Date;
}): DomainEvent => makeEvent(
  "RightsViolationReported",
  {
    patientId: props.patientId,
    reportId: props.reportId,
    victimId: props.victimId,
    violationType: props.violationType,
  },
  props.occurredAt
);
