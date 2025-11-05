import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { TE } from "../err/Timestamp.error";
import { TimestampProps } from "./props/timestamp.props";

export class Timestamp {
  private constructor(private readonly value: Date) {
    Object.freeze(this);
  }

  static create(props: TimestampProps): Result<Timestamp, DomainError> {
    const candidate = props.value;

    if (!(candidate instanceof Date)) {
      return err(
        TE.InvalidDate({
          value: String(candidate),
        }),
      );
    }

    const value = Timestamp.clone(candidate);

    if (Number.isNaN(value.getTime())) {
      return err(
        TE.InvalidDate({
          value: String(candidate),
        }),
      );
    }

    return ok(new Timestamp(value));
  }

  copyWith(props: Partial<TimestampProps>): Result<Timestamp, DomainError> {
    return Timestamp.create({
      value: Timestamp.clone(props.value ?? this.value),
    });
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

  private static clone(source: Date): Date {
    return new Date(source.getTime());
  }
}
