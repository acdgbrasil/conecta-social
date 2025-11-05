import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { BE } from "../err/SocialBenefit.error";
import { SocialBenefitProps } from "./props/socialBenefit.props";
import { FamilyMemberId } from "./FamilyMemberId.valueObject";

export class SocialBenefit {
    private constructor(readonly benefitName: string, readonly amount: number, readonly beneficiaryId: string) {}

    static create(props: SocialBenefitProps): Result<SocialBenefit, DomainError> {
        if(!props.benefitName || props.benefitName.trim().length === 0) return err(BE.BenefitNameEmpty());
        if(props.amount <= 0) return err(BE.AmountInvalid({ amount: props.amount }));
        return ok(Object.freeze(new SocialBenefit(props.benefitName, props.amount, props.beneficiaryId.toString())));
    }

    copyWith(props: Partial<SocialBenefitProps>): Result<SocialBenefit, DomainError> {
        const beneficiaryId = FamilyMemberId.create(this.beneficiaryId).isErr ? err(BE.BeneficiaryIdInvalid(this.beneficiaryId)) : FamilyMemberId.create(this.beneficiaryId);
        return SocialBenefit.create({
          benefitName: props.benefitName ?? this.benefitName,
          amount: props.amount ?? this.amount,
          beneficiaryId: beneficiaryId.unwrap(),
        });
      }
}
