import { ok, Result } from "@conecta/result";
import { TimestampProps } from "./props/timestamp.props";

export class Timestamp {
    private constructor(readonly value: Date) {
        Object.freeze(this);
    }

    static create(props: TimestampProps): Result<Timestamp, never> {
        return ok(new Timestamp(props.value));
    }

    copyWith(props: Partial<TimestampProps>): Result<Timestamp, never> {
        return Timestamp.create({ value: props.value ?? this.value });
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
        return this.value.getFullYear();
    }

    toISOString(): string {
        return this.value.toISOString();
    }

    toDate(): Date {
        return new Date(this.value.getTime());
    }
}
