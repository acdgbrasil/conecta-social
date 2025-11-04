import { ok, Result } from "@conecta/result";
import { TimestampProps } from "./props/timestamp.props";
import { DomainError } from "src";

export class Timestamp {
    private constructor(readonly value: Date) {
        Object.freeze(this);
    }

    static create(props: TimestampProps): Result<Timestamp, DomainError> {
        const dateValue = new Date(props.value);
        return Object.freeze(ok(new Timestamp(dateValue.toISOString())));
    }

    copyWith(props: Partial<TimestampProps>): Result<Timestamp, never> {
        return Timestamp.create({value: props.value ?? new Date(this.value) });
    }

    isAfter(other: Timestamp): boolean {
        const thisTime = new Date(this.value).getTime();
        const otherTime = new Date(other.value).getTime();
        return thisTime > otherTime;
    }

    isBefore(other: Timestamp): boolean {
        const thisTime = new Date(this.value).getTime();
        const otherTime = new Date(other.value).getTime();
        return thisTime < otherTime;
    }

    equals(other: Timestamp): boolean {
        return this.value === other.value;
    }

    getFullYear(): number {
        return this.copyWith({}).unwrap().toDate().getFullYear();
    }

    toISOString(): string {
        return this.copyWith({}).unwrap().toDate().toISOString();
    }

    toDate(): Date {
        const dateValue = new Date(this.value);
        return new Date(dateValue.getTime());
    }
}
