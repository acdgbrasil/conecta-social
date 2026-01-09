import type { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import type { Uuid } from "@conecta/uuid";

import { RE } from "../errors/Referral.error";
import { Timestamp } from "../value-objects/timestamp.valueObject";

export type ReferralStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export type ReferralProps = {
  id: Uuid;
  date: Timestamp;
  requestingProfessionalId: Uuid;
  referredPersonId: Uuid;
  destinationService: string;
  reason: string;
  status?: ReferralStatus;
};

export class Referral {
  private constructor(readonly props: Required<ReferralProps>) {
    Object.freeze(this.props);
    Object.freeze(this);
  }

  static create(
    props: ReferralProps,
    referenceDate: Date,
  ): Result<Referral, DomainError> {
    if (props.date.toDate().getTime() > referenceDate.getTime()) {
      return err(RE.DateInFuture());
    }

    const reason = props.reason?.trim() ?? "";
    if (reason.length === 0) {
      return err(RE.ReasonMissing());
    }

    return ok(
      new Referral({
        ...props,
        reason,
        status: props.status ?? "PENDING",
      }),
    );
  }

  get id(): Uuid {
    return this.props.id;
  }

  get status(): ReferralStatus {
    return this.props.status;
  }

  get destinationService(): string {
    return this.props.destinationService;
  }

  complete(): Result<Referral, DomainError> {
    return this.transition("COMPLETED");
  }

  cancel(): Result<Referral, DomainError> {
    return this.transition("CANCELLED");
  }

  equals(other: Referral): boolean {
    return this.id.equals(other.id);
  }

  private transition(next: ReferralStatus): Result<Referral, DomainError> {
    if (this.status !== "PENDING") {
      return err(RE.InvalidStatusTransition(this.status, next));
    }

    return ok(
      new Referral({
        ...this.props,
        status: next,
      }),
    );
  }
}
