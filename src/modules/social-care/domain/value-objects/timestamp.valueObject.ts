import { systemClock } from "@conecta/adapters";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { Branded } from "@conecta/fn";
import type { ClockPort } from "@conecta/ports";
import { Result } from "@conecta/result";
import { TE } from "../errors/Timestamp.error";

export type TimestampProps = {
  readonly value: Date;
};

export type Timestamp = Branded<Date, "Timestamp">;

export const Timestamp = {
  create(props: TimestampProps): Result<Timestamp, DomainError> {
    return Timestamp.fromDate(props.value);
  },

  now(clock: ClockPort = systemClock): Result<Timestamp, DomainError> {
    return Timestamp.fromDate(clock.now());
  },

  createFromISOString(isoString: string): Result<Timestamp, DomainError> {
    return Timestamp.fromDate(new Date(isoString));
  },

  isAfter(self: Timestamp, other: Timestamp): boolean {
    return self.getTime() > other.getTime();
  },

  isBefore(self: Timestamp, other: Timestamp): boolean {
    return self.getTime() < other.getTime();
  },

  equals(self: Timestamp, other: Timestamp): boolean {
    return self.getTime() === other.getTime();
  },

  getFullYear(self: Timestamp): number {
    return self.getUTCFullYear();
  },

  toISOString(self: Timestamp): string {
    return Date.prototype.toISOString.call(self);
  },

  toDate(self: Timestamp): Date {
    return new Date(self.getTime());
  },

  fromDate(candidate: Date): Result<Timestamp, DomainError> {
    if (!(candidate instanceof Date) || Number.isNaN(candidate.getTime())) {
      return Result.err(TE.InvalidDate({ value: String(candidate) }));
    }

    const value = new Date(candidate.getTime());
    const ms = value.getUTCMilliseconds();
    
    if (ms > 0) {
      value.setUTCMilliseconds(0);
    }

    return Result.ok(value as Timestamp);
  }
} as const;