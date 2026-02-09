import type { DomainError } from "@conecta/domain-error/DomainError";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import { SES } from "../errors/SocioEconomicSituation.error";
import { SocialBenefitsCollection } from "./SocialBenefitsCollection.valueObject";

export type SocioEconomicSituationProps = {
  readonly totalFamilyIncome: number;
  readonly incomePerCapita: number;
  readonly receivesSocialBenefit: boolean;
  readonly socialBenefits: SocialBenefitsCollection;
  readonly mainSourceOfIncome: string;
  readonly hasUnemployed: boolean;
};

export type SocioEconomicSituation = DeepReadonly<SocioEconomicSituationProps>;

export const SocioEconomicSituation = {
  create(props: SocioEconomicSituationProps): Result<SocioEconomicSituation, DomainError> {
    if (props.receivesSocialBenefit === false && !SocialBenefitsCollection.isEmpty(props.socialBenefits)) {
      return Result.err(SES.InconsistentSocialBenefit());
    }
    if (props.receivesSocialBenefit === true && SocialBenefitsCollection.isEmpty(props.socialBenefits)) {
      return Result.err(SES.MissingSocialBenefits());
    }
    if (props.totalFamilyIncome < 0) {
      return Result.err(SES.NegativeFamilyIncome({ totalFamilyIncome: props.totalFamilyIncome }));
    }
    if (props.incomePerCapita < 0) {
      return Result.err(SES.NegativeIncomePerCapita({ incomePerCapita: props.incomePerCapita }));
    }
    if (!props.mainSourceOfIncome || props.mainSourceOfIncome.trim().length === 0) {
      return Result.err(SES.EmptyMainSourceOfIncome());
    }
    if (props.incomePerCapita > props.totalFamilyIncome) {
      return Result.err(SES.InconsistentIncomePerCapita(props.incomePerCapita, props.totalFamilyIncome));
    }

    return Result.ok({
      ...props,
      mainSourceOfIncome: props.mainSourceOfIncome.trim()
    });
  }
} as const;