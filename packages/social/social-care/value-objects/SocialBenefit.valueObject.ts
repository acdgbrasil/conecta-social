import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { BE } from "../err/SocialBenefit.error";
import { SocialBenefitProps } from "./props/socialBenefit.props";
import { FamilyMemberId } from "./FamilyMemberId.valueObject";
import { None, Some } from "src";
import { unSafe } from "@conecta/shared/option-pattern/Option";

export class SocialBenefit {
    private constructor(readonly benefitName: string, readonly amount: number, readonly beneficiaryId: string) {}

    static create(props: SocialBenefitProps): Result<SocialBenefit, DomainError> {
        const beneficiaryIdNormalized = props.beneficiaryId.toString().trim().toLowerCase();
        const beneficiaryNameNormalized = props.benefitName.trim().replace(/\s+/g, ' ');
        if(!beneficiaryNameNormalized || beneficiaryNameNormalized.length === 0) return err(BE.BenefitNameEmpty());
        if(props.amount <= 0) return err(BE.AmountInvalid({ amount: props.amount }));
        return ok(Object.freeze(new SocialBenefit(beneficiaryNameNormalized, props.amount, beneficiaryIdNormalized)));
    }

    copyWith(props: Partial<SocialBenefitProps>): Result<SocialBenefit, DomainError> {
        const unSafeBeneficiaryId = unSafe(props.beneficiaryId?.value);
        const safeBeneficiaryId = unSafeBeneficiaryId.isSome ? unSafeBeneficiaryId.unwrap() : this.beneficiaryId;
        const beneficiaryId = FamilyMemberId.create(safeBeneficiaryId).isErr ? err(BE.BeneficiaryIdInvalid(safeBeneficiaryId)) : FamilyMemberId.create(safeBeneficiaryId);
        if(beneficiaryId.isErr) return err(beneficiaryId.unwrapErr());
        const socialBenefitObject =  SocialBenefit.create({
          benefitName: props.benefitName ?? this.benefitName,
          amount: props.amount ?? this.amount,
          beneficiaryId: beneficiaryId.unwrap(),
        }); 

        if(socialBenefitObject.isErr) return err(socialBenefitObject.unwrapErr());
        return ok(socialBenefitObject.unwrap());
      }
}
