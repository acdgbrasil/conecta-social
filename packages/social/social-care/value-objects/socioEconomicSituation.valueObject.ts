import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { SocialBenefitsCollection } from "./SocialBenefitsCollection.valueObject";
import { SES } from "../err/SocioEconomicSituation.error";
import { SocioEconomicSituationProps } from "./props/socioEconomicSituation.props";

export class SocioEconomicSituation implements SocioEconomicSituationProps {
    readonly totalFamilyIncome: number;
    readonly incomePerCapita: number;
    readonly receivesSocialBenefit: boolean;
    readonly socialBenefits: SocialBenefitsCollection;
    readonly mainSourceOfIncome: string;
    readonly hasUnemployed: boolean;
    
    private constructor(props: SocioEconomicSituationProps) {
        this.totalFamilyIncome = props.totalFamilyIncome;
        this.incomePerCapita = props.incomePerCapita;
        this.receivesSocialBenefit = props.receivesSocialBenefit;
        this.socialBenefits = props.socialBenefits;
        this.mainSourceOfIncome = props.mainSourceOfIncome;
        this.hasUnemployed = props.hasUnemployed;
        Object.freeze(this);
    }

    static create(props: SocioEconomicSituationProps): Result<SocioEconomicSituation, DomainError> {
        if (props.receivesSocialBenefit === false && !props.socialBenefits.isEmpty()) {
            return err(SES.InconsistentSocialBenefit());
        }
        if (props.receivesSocialBenefit === true && props.socialBenefits.isEmpty()) {
            return err(SES.MissingSocialBenefits());
        }
        if(props.totalFamilyIncome < 0) return err(SES.NegativeFamilyIncome({ totalFamilyIncome: props.totalFamilyIncome }));
        if(props.incomePerCapita < 0) return err(SES.NegativeIncomePerCapita({ incomePerCapita: props.incomePerCapita }));
        if(!props.mainSourceOfIncome || props.mainSourceOfIncome.trim().length === 0) return err(SES.EmptyMainSourceOfIncome());
        if(props.incomePerCapita > props.totalFamilyIncome) return err(SES.InconsistentIncomePerCapita(props.incomePerCapita, props.totalFamilyIncome));
        const socioEconomicSituation = new SocioEconomicSituation({hasUnemployed: props.hasUnemployed, mainSourceOfIncome: props.mainSourceOfIncome.trim(), socialBenefits: props.socialBenefits, receivesSocialBenefit: props.receivesSocialBenefit, incomePerCapita: props.incomePerCapita, totalFamilyIncome: props.totalFamilyIncome});
        return ok(new SocioEconomicSituation(socioEconomicSituation));
    }

    copyWith(props: Partial<SocioEconomicSituationProps>): Result<SocioEconomicSituation, DomainError> {
        return SocioEconomicSituation.create({
            totalFamilyIncome: props.totalFamilyIncome ?? this.totalFamilyIncome,
            incomePerCapita: props.incomePerCapita ?? this.incomePerCapita,
            receivesSocialBenefit: props.receivesSocialBenefit ?? this.receivesSocialBenefit,
            socialBenefits: props.socialBenefits ?? this.socialBenefits,
            mainSourceOfIncome: props.mainSourceOfIncome ?? this.mainSourceOfIncome,
            hasUnemployed: props.hasUnemployed ?? this.hasUnemployed
        });
    }
}