import type { DomainError } from "@conecta/domain-error/DomainError";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import type { Uuid } from "@conecta/uuid";
import { RVR } from "../errors/RightsViolationReport.error";
import { Timestamp } from "../value-objects/timestamp.valueObject";

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

export type ViolationDraft = Partial<
  Omit<RightsViolationReportProps, "victimId" | "violationType">
> &
  Pick<RightsViolationReportProps, "victimId" | "violationType">;

export type RightsViolationReport = DeepReadonly<RightsViolationReportProps>;

export const RightsViolationReport = {
  create(
    props: RightsViolationReportProps,
    referenceDate: Date,
  ): Result<RightsViolationReport, DomainError> {
    const nowResult = Timestamp.create({ value: referenceDate });
    if (Result.isErr(nowResult)) return Result.err(nowResult.error);
    const now = nowResult.value;

    if (Timestamp.isAfter(props.reportDate, now)) {
      return Result.err(RVR.ReportDateInFuture());
    }

    if (
      props.incidentDate &&
      Timestamp.isAfter(props.incidentDate, props.reportDate)
    ) {
      return Result.err(RVR.IncidentAfterReport());
    }

    const description = props.descriptionOfFact?.trim() ?? "";
    if (description.length === 0) {
      return Result.err(RVR.EmptyDescription());
    }

    return Result.ok({
      ...props,
      descriptionOfFact: description,
      actionsTaken: props.actionsTaken?.trim() ?? "",
    });
  },

  updateActions(report: RightsViolationReport, newActions: string): RightsViolationReport {
    return {
      ...report,
      actionsTaken: newActions.trim(),
    };
  },

  equals(a: RightsViolationReport, b: RightsViolationReport): boolean {
    return a.id === b.id;
  }
} as const;
