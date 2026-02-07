import type { DomainError } from "@conecta/domain-error";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import { DE } from "../errors/Diagnosis.error";
import type { ICDCode } from "./icdCode.valueObject";
import { Timestamp } from "./timestamp.valueObject";

/**
 * Propriedades necessárias para criar um diagnóstico.
 */
export type DiagnosisProps = {
  readonly id: ICDCode;
  readonly date: Timestamp;
  readonly description: string;
};

/**
 * Representa um diagnóstico clínico associado ao paciente.
 */
export type Diagnosis = DeepReadonly<DiagnosisProps>;

export const Diagnosis = {
  create(
    props: DiagnosisProps,
    now: Timestamp,
  ): Result<Diagnosis, DomainError> {
    if (Timestamp.isAfter(props.date, now))
      return Result.err(DE.DateInFuture(Timestamp.toISOString(props.date), Timestamp.toISOString(now)));

    const year = Timestamp.getFullYear(props.date);
    if (year < 0) return Result.err(DE.DateBeforeYearZero(year));

    if (!props.description || props.description.trim().length === 0)
      return Result.err(DE.DescriptionEmpty(props.description));

    return Result.ok({
      id: props.id,
      date: props.date,
      description: props.description.trim(),
    });
  }
} as const;