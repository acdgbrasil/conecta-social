import { None, Some, Option } from "@conecta/option";
import { ICDCode, Timestamp, PersonId, Diagnosis, DiagnosisProps } from "packages/conecta-raros/social-care";
import { Result, ok, err } from "@conecta/result";
import { DomainError } from "@conecta/domain-error";

export const createDtoPersonID = (inputPersonID: string) : Result<PersonId,DomainError> => PersonId.create(inputPersonID).isOk ? ok(PersonId.create(inputPersonID).unwrap()) : err(PersonId.create(inputPersonID).unwrapErr());

export const createDtoIcdCode = (inputIcdCode: string) : Result<ICDCode,DomainError> => ICDCode.create(inputIcdCode).isOk ? ok(ICDCode.create(inputIcdCode).unwrap()) : err(ICDCode.create(inputIcdCode).unwrapErr());

export const createDtoTimestamp = (inputDate: Date) : Result<Timestamp,DomainError> => Timestamp.create({value: inputDate}).isOk ? ok(Timestamp.create({value: inputDate}).unwrap()) : err(Timestamp.create({value: inputDate}).unwrapErr());

export const createDtoDiagnosis = (input: DiagnosisProps,timestamp: Timestamp) : Option<Diagnosis> => Diagnosis.create(input, timestamp).isOk ? Some(Diagnosis.create(input, timestamp).unwrap()) : None();