import type { DomainError } from "@conecta/domain-error";
import { None, type Option, Some } from "@conecta/option";
import { err, ok, type Result } from "@conecta/result";
import {
  Diagnosis,
  type DiagnosisProps,
  ICDCode,
  PersonId,
  Timestamp,
} from "packages/conecta-raros/social-care";

export const createDtoPersonID = (
  inputPersonID: string,
): Result<PersonId, DomainError> =>
  PersonId.create(inputPersonID).isOk
    ? ok(PersonId.create(inputPersonID).unwrap())
    : err(PersonId.create(inputPersonID).unwrapErr());

export const createDtoIcdCode = (
  inputIcdCode: string,
): Result<ICDCode, DomainError> =>
  ICDCode.create(inputIcdCode).isOk
    ? ok(ICDCode.create(inputIcdCode).unwrap())
    : err(ICDCode.create(inputIcdCode).unwrapErr());

export const createDtoTimestamp = (
  inputDate: Date,
): Result<Timestamp, DomainError> =>
  Timestamp.create({ value: inputDate }).isOk
    ? ok(Timestamp.create({ value: inputDate }).unwrap())
    : err(Timestamp.create({ value: inputDate }).unwrapErr());

export const createDtoDiagnosis = (
  input: DiagnosisProps,
  timestamp: Timestamp,
): Option<Diagnosis> =>
  Diagnosis.create(input, timestamp).isOk
    ? Some(Diagnosis.create(input, timestamp).unwrap())
    : None();
