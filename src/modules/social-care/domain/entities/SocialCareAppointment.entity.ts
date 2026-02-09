import type { DomainError } from "@conecta/domain-error/DomainError";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import type { Uuid } from "@conecta/uuid";
import { SCAE } from "../errors/SocialCareAppointment.error";
import { Timestamp } from "../value-objects/timestamp.valueObject";

export const SocialCareAppointmentType = {
  HOME_VISIT: "HOME_VISIT",
  OFFICE_APPOINTMENT: "OFFICE_APPOINTMENT",
  PHONE_CALL: "PHONE_CALL",
  MULTIDISCIPLINARY: "MULTIDISCIPLINARY",
  OTHER: "OTHER",
} as const;

export type SocialCareAppointmentType =
  (typeof SocialCareAppointmentType)[keyof typeof SocialCareAppointmentType];

export type SocialCareAppointmentProps = {
  id: Uuid;
  date: Timestamp;
  professionalInChargeId: Uuid;
  type: SocialCareAppointmentType;
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

    if (!Object.values(SocialCareAppointmentType).includes(props.type)) {
      return Result.err(
        SCAE.InvalidType(
          props.type,
          Object.values(SocialCareAppointmentType).join(", "),
        ),
      );
    }

    const summary = props.summary?.trim() ?? "";
    const actionPlan = props.actionPlan?.trim() ?? "";

    if (summary.length === 0 && actionPlan.length === 0) {
      return Result.err(SCAE.MissingNarrative());
    }

    if (summary.length > SUMMARY_LIMIT) {
      return Result.err(SCAE.SummaryTooLong(SUMMARY_LIMIT));
    }

    if (actionPlan.length > ACTION_PLAN_LIMIT) {
      return Result.err(SCAE.ActionPlanTooLong(ACTION_PLAN_LIMIT));
    }

    return Result.ok({
      ...props,
      summary,
      actionPlan,
    });
  },

  equals(a: SocialCareAppointment, b: SocialCareAppointment): boolean {
    return a.id === b.id;
  }
} as const;
