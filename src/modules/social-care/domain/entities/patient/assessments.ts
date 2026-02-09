import { Result } from "@conecta/result";
import { Option } from "@conecta/option";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { HousingCondition, SocioEconomicSituation } from "../../value-objects";
import type { Patient } from "./types";
import { copyWith } from "./core";

export const PatientAssessments = {
  updateHousingCondition(patient: Patient, condition: HousingCondition): Result<Patient, DomainError> {
    return Result.ok(copyWith(patient, { housingCondition: Option.some(condition) }));
  },

  updateSocioEconomicSituation(patient: Patient, situation: SocioEconomicSituation): Result<Patient, DomainError> {
    return Result.ok(copyWith(patient, { socioeconomicSituation: Option.some(situation) }));
  }
} as const;
