import type { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import type { Uuid } from "@conecta/uuid";

import { SCAE } from "../errors/SocialCareAppointment.error";
import { Timestamp } from "../value-objects/timestamp.valueObject";

export type SocialCareAppointmentProps = {
  id: Uuid;
  date: Timestamp;
  professionalInChargeId: Uuid;
  type: string;
  summary: string;
  actionPlan: string;
};

const SUMMARY_LIMIT = 500;
const ACTION_PLAN_LIMIT = 2000;

export class SocialCareAppointment {
  private constructor(readonly props: SocialCareAppointmentProps) {
    Object.freeze(this.props);
    Object.freeze(this);
  }

  static create(
    props: SocialCareAppointmentProps,
    referenceDate: Date,
  ): Result<SocialCareAppointment, DomainError> {
    if (props.date.toDate().getTime() > referenceDate.getTime()) {
      return err(SCAE.DateInFuture());
    }

    const summary = props.summary?.trim() ?? "";
    const actionPlan = props.actionPlan?.trim() ?? "";

    if (summary.length === 0 && actionPlan.length === 0) {
      return err(SCAE.MissingNarrative());
    }

    if (summary.length > SUMMARY_LIMIT) {
      return err(SCAE.SummaryTooLong({ limit: SUMMARY_LIMIT }));
    }

    if (actionPlan.length > ACTION_PLAN_LIMIT) {
      return err(SCAE.ActionPlanTooLong({ limit: ACTION_PLAN_LIMIT }));
    }

    return ok(
      new SocialCareAppointment({
        ...props,
        summary,
        actionPlan,
      }),
    );
  }

  get id(): Uuid {
    return this.props.id;
  }

  get date(): Timestamp {
    return this.props.date;
  }

  get professionalInChargeId(): Uuid {
    return this.props.professionalInChargeId;
  }

  get type(): string {
    return this.props.type;
  }

  get summary(): string {
    return this.props.summary;
  }

  get actionPlan(): string {
    return this.props.actionPlan;
  }

  equals(other: SocialCareAppointment): boolean {
    return this.id.equals(other.id);
  }
}
