import type { DomainError } from "@conecta/domain-error";
import type { Result } from "@conecta/result";
import { err, ok } from "@conecta/result";
import { DE } from "../err/Diagnosis.error";
import { ICDCode } from "./icdCode.valueObject";
import { Timestamp } from "./timestamp.valueObject";

import { DiagnosisProps } from "./props/diagnosis.props";

export class Diagnosis {
    private constructor(readonly id: ICDCode, readonly date: Timestamp, readonly description: string) {
        Object.freeze(this);
    }

    static create(props: DiagnosisProps, now: Timestamp): Result<Diagnosis, DomainError> {
        if (props.date.isAfter(now)) return err(DE.DateInFuture(props.date.toISOString(), now.toISOString()));

        const year = props.date.getFullYear();
        if (year < 0) return err(DE.DateBeforeYearZero(year));

        if (!props.description || props.description.trim().length === 0) return err(DE.DescriptionEmpty(props.description));

        return ok(new Diagnosis(props.id, props.date, props.description));
    }

    copyWith(
        props: Partial<DiagnosisProps>,
        now: Timestamp
      ): Result<Diagnosis, DomainError> {
        return Diagnosis.create(
          {
            id: props.id ?? this.id,
            date: props.date ?? this.date,
            description: props.description ?? this.description,
          },
          now
        );
      }
}
