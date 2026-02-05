import { systemClock } from "@conecta/adapters";
import type { DomainError } from "@conecta/domain-error";
import type { ClockPort } from "@conecta/ports";
import { err, ok, type Result } from "@conecta/result";
import { TE } from "../errors/Timestamp.error";
import type { TimestampProps } from "./props/timestamp.props";

export class Timestamp {
  private constructor(private readonly value: Date) {
    Object.freeze(this);
  }

  static create(props: TimestampProps): Result<Timestamp, DomainError> {
    return Timestamp.fromDate(props.value);
  }

  static now(
    clock: ClockPort = systemClock,
  ): Result<Timestamp, DomainError> {
    return Timestamp.fromDate(clock.now());
  }

  static createFromISOString(
    isoString: string,
  ): Result<Timestamp, DomainError> {
    return Timestamp.fromDate(new Date(isoString));
  }

  copyWith(props: Partial<TimestampProps>): Result<Timestamp, DomainError> {
    return Timestamp.fromDate(props.value ?? this.value);
  }

  isAfter(other: Timestamp): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  isBefore(other: Timestamp): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  equals(other: Timestamp): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  getFullYear(): number {
    return this.value.getUTCFullYear();
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  toDate(): Date {
    return Timestamp.clone(this.value);
  }

  private static fromDate(candidate: Date): Result<Timestamp, DomainError> {
    if (!(candidate instanceof Date)) {
      return err(TE.InvalidDate({ value: String(candidate) }));
    }

    const value = Timestamp.clone(candidate);
    const ms = value.getUTCMilliseconds();

    if (Number.isNaN(value.getTime())) {
      return err(TE.InvalidDate({ value: String(candidate) }));
    }

    return ok(new Timestamp(ms > 0 ? new Date(value.getTime() - ms) : value));
  }

  private static clone(source: Date): Date {
    return new Date(source.getTime());
  }
}
