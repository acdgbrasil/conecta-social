import type { SocialBenefitsCollection } from "../SocialBenefitsCollection.valueObject";

export type SocioEconomicSituationProps = {
  totalFamilyIncome: number;
  incomePerCapita: number;
  receivesSocialBenefit: boolean;
  socialBenefits: SocialBenefitsCollection;
  mainSourceOfIncome: string;
  hasUnemployed: boolean;
};
