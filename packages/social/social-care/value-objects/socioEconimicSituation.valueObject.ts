import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { SocialBenefit } from "./socialBenefits.valueObjects";
import { ImutableListFactory } from "@conecta/fn/imutable-list";
import { SES } from "../err/SocioEconomicSituation.error";




export class SocioEconomicSituation {
    private constructor(readonly totalFamilyIncome: number, readonly incomePerCapita: number, readonly receivesSocialBenefit: boolean, readonly socialBenefits: SocialBenefit[], readonly mainSourceOfIncome: string, readonly hasUnemployed: boolean) {}

    static create(totalFamilyIncome: number, incomePerCapita: number, receivesSocialBenefit: boolean, socialBenefits: SocialBenefit[], mainSourceOfIncome: string, hasUnemployed: boolean): Result<SocioEconomicSituation, DomainError> {
        if (receivesSocialBenefit == false && socialBenefits.length > 0) return err(SES.InconsistentSocialBenefit());
        if (receivesSocialBenefit == true && socialBenefits.length === 0) return err(SES.MissingSocialBenefits());
        if(totalFamilyIncome < 0) return err(SES.NegativeFamilyIncome({ totalFamilyIncome }));
        if(incomePerCapita < 0) return err(SES.NegativeIncomePerCapita({ incomePerCapita }));
        if(!mainSourceOfIncome || mainSourceOfIncome.trim().length === 0) return err(SES.EmptyMainSourceOfIncome());

        const imutableSocialBenefits = ImutableListFactory.fromArray(socialBenefits);
        
        return ok(Object.freeze(new SocioEconomicSituation(totalFamilyIncome, incomePerCapita, receivesSocialBenefit, imutableSocialBenefits.getAll(), mainSourceOfIncome, hasUnemployed)));
    }
}