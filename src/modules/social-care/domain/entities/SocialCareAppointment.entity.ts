import type { DomainError } from "@conecta/domain-error";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
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

export type AppointmentDraft = Partial<Omit<SocialCareAppointmentProps, "summary">> &
  Pick<SocialCareAppointmentProps, "summary">;

const SUMMARY_LIMIT = 500;
const ACTION_PLAN_LIMIT = 2000;

export type SocialCareAppointment = DeepReadonly<SocialCareAppointmentProps>;

export const SocialCareAppointment = {
  create(
    props: SocialCareAppointmentProps,
    referenceDate: Date,
  ): Result<SocialCareAppointment, DomainError> {
    const nowResult = Timestamp.create({ value: referenceDate });
    if (Result.isErr(nowResult)) return Result.err(nowResult.error);
    const now = nowResult.value;

    if (Timestamp.isAfter(props.date, now)) {
      return Result.err(SCAE.DateInFuture());
    }

    const summary = props.summary?.trim() ?? "";
    const actionPlan = props.actionPlan?.trim() ?? "";

    if (summary.length === 0 && actionPlan.length === 0) {
      return Result.err(SCAE.MissingNarrative());
    }

    if (summary.length > SUMMARY_LIMIT) {
      return Result.err(SCAE.SummaryTooLong({ limit: SUMMARY_LIMIT }));
    }

    if (actionPlan.length > ACTION_PLAN_LIMIT) {
      return Result.err(SCAE.ActionPlanTooLong({ limit: ACTION_PLAN_LIMIT }));
    }

    return Result.ok({
      ...props,
      summary,
      actionPlan,
    });
  },

  equals(a: SocialCareAppointment, b: SocialCareAppointment): boolean {
    return a.id.equals(b.id);
  }
} as const;