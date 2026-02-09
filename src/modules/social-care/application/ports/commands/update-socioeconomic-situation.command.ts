import type { SocioEconomicSituation } from "@conecta/social-care";

export type UpdateSocioEconomicSituationCommand = Readonly<{
  patientId: string;
  situation: SocioEconomicSituation;
}>;
