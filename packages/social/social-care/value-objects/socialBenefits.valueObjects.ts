import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { BE } from "../err/SocialBenefit.error";
import { isUuidSupported } from "../../../shared/uuid-pattern/uuid";

export class SocialBenefit {
    private constructor(readonly benefitName: string, readonly amount: number, readonly beneficiaryId:string) {}

    static create(benefitName: string, amount: number, beneficiaryId:string): Result<SocialBenefit, DomainError> {
        if(!benefitName || benefitName.trim().length === 0) return err(BE.BenefitNameEmpty());
        if(amount <= 0) return err(BE.AmountInvalid({ amount }));
        if (isUuidSupported(beneficiaryId) === false) return err(BE.BeneficiaryIdInvalid({ beneficiaryId }));
        return ok(Object.freeze(new SocialBenefit(benefitName, amount, beneficiaryId)));
    }

}