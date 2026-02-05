import type { HousingConditionDTO } from "../../application/dto/social-assessment.dto";

export type UpdateHousingConditionInput = {
  patientId: string;
  condition: HousingConditionDTO;
};
