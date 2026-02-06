import type { HousingCondition } from "@conecta/social-care";

export type UpdateHousingConditionCommand = Readonly<{
  patientId: string;
  condition: HousingCondition;
}>;
