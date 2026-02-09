import { PatientCore } from "./core";
import { PatientFamily } from "./family";
import { PatientActivities } from "./activities";
import { PatientAssessments } from "./assessments";
import type {
  Patient as PatientAggregate,
  PatientProps,
} from "./types";

export type { PatientProps };
export type Patient = PatientAggregate;

/**
 * Namespace unificado para o Agregado Patient.
 * Combina core, gestão de família, atividades e avaliações.
 */
export const Patient = {
  ...PatientCore,
  ...PatientFamily,
  ...PatientActivities,
  ...PatientAssessments,
} as const;
