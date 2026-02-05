import type { SocioEconomicSituationDTO } from "../../application/dto/social-assessment.dto";

export type UpdateSocioEconomicSituationInput = {
  patientId: string;
  situation: SocioEconomicSituationDTO;
};
