import type { DomainError } from "@conecta/domain-error/DomainError";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import type { Uuid } from "@conecta/uuid";
import { RE } from "../errors/Referral.error";
import { Timestamp } from "../value-objects/timestamp.valueObject";

export type ReferralStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export const ReferralDestinationService = {
  CRAS: "CRAS",
  CREAS: "CREAS",
  HEALTH_CARE: "HEALTH_CARE",
  EDUCATION: "EDUCATION",
  LEGAL: "LEGAL",
  OTHER: "OTHER",
} as const;

export type ReferralDestinationService =
  (typeof ReferralDestinationService)[keyof typeof ReferralDestinationService];

export type ReferralProps = {
  id: Uuid;
  date: Timestamp;
  requestingProfessionalId: Uuid;
  referredPersonId: Uuid;
  destinationService: ReferralDestinationService;
  reason: string;
  status?: ReferralStatus;
};

export type ReferralDraft = Partial<Omit<ReferralProps, "referredPersonId">> &
  Pick<ReferralProps, "referredPersonId">;

export type Referral = DeepReadonly<Required<ReferralProps>>;

export const Referral = {
  create(
    props: ReferralProps,
    referenceDate: Date,
  ): Result<Referral, DomainError> {
    const nowResult = Timestamp.create({ value: referenceDate });
    if (Result.isErr(nowResult)) return Result.err(nowResult.error);
    const now = nowResult.value;

    if (Timestamp.isAfter(props.date, now)) {
      return Result.err(RE.DateInFuture());
    }

    if (!Object.values(ReferralDestinationService).includes(props.destinationService)) {
      return Result.err(
        RE.InvalidDestinationService(
          props.destinationService,
          Object.values(ReferralDestinationService).join(", "),
        ),
      );
    }

    const reason = props.reason?.trim() ?? "";
    if (reason.length === 0) {
      return Result.err(RE.ReasonMissing());
    }

    return Result.ok({
      ...props,
      reason,
      status: props.status ?? "PENDING",
    });
  },

  complete(referral: Referral): Result<Referral, DomainError> {
    return transition(referral, "COMPLETED");
  },

  cancel(referral: Referral): Result<Referral, DomainError> {
    return transition(referral, "CANCELLED");
  },

  equals(a: Referral, b: Referral): boolean {
    return a.id === b.id;
  }
} as const;

function transition(referral: Referral, next: ReferralStatus): Result<Referral, DomainError> {
  if (referral.status !== "PENDING") {
    return Result.err(RE.InvalidStatusTransition(referral.status, next));
  }
  return Result.ok({ ...referral, status: next });
}
