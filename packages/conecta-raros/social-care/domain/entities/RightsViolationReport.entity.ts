import type { DomainError } from "@conecta/domain-error";
import { err, ok, type Result } from "@conecta/result";
import type { Uuid } from "@conecta/uuid";

import { RVR } from "../errors/RightsViolationReport.error";
import type { Timestamp } from "../value-objects/timestamp.valueObject";

export const ViolationType = {
  NEGLECT: "NEGLECT",
  PSYCHOLOGICAL_VIOLENCE: "PSYCHOLOGICAL_VIOLENCE",
  PHYSICAL_VIOLENCE: "PHYSICAL_VIOLENCE",
  SEXUAL_ABUSE: "SEXUAL_ABUSE",
  SEXUAL_EXPLOITATION: "SEXUAL_EXPLOITATION",
  CHILD_LABOR: "CHILD_LABOR",
  FINANCIAL_EXPLOITATION: "FINANCIAL_EXPLOITATION",
  DISCRIMINATION: "DISCRIMINATION",
  OTHER: "OTHER",
} as const;

export type RightsViolationReportProps = {
  id: Uuid;
  reportDate: Timestamp;
  incidentDate?: Timestamp;
  victimId: Uuid;
  violationType: (typeof ViolationType)[keyof typeof ViolationType];
  descriptionOfFact: string;
  actionsTaken: string;
};

export class RightsViolationReport {
  private constructor(readonly props: RightsViolationReportProps) {
    Object.freeze(this.props);
    Object.freeze(this);
  }

  static create(
    props: RightsViolationReportProps,
    referenceDate: Date,
  ): Result<RightsViolationReport, DomainError> {
    if (props.reportDate.toDate().getTime() > referenceDate.getTime()) {
      return err(RVR.ReportDateInFuture());
    }

    if (
      props.incidentDate &&
      props.incidentDate.toDate().getTime() >
        props.reportDate.toDate().getTime()
    ) {
      return err(RVR.IncidentAfterReport());
    }

    const description = props.descriptionOfFact?.trim() ?? "";
    if (description.length === 0) {
      return err(RVR.EmptyDescription());
    }

    return ok(
      new RightsViolationReport({
        ...props,
        descriptionOfFact: description,
        actionsTaken: props.actionsTaken?.trim() ?? "",
      }),
    );
  }

  get id(): Uuid {
    return this.props.id;
  }

  get violationType(): string {
    return this.props.violationType;
  }

  get actionsTaken(): string {
    return this.props.actionsTaken;
  }

  updateActions(newActions: string): RightsViolationReport {
    return new RightsViolationReport({
      ...this.props,
      actionsTaken: newActions.trim(),
    });
  }

  equals(other: RightsViolationReport): boolean {
    return this.id.equals(other.id);
  }
}
