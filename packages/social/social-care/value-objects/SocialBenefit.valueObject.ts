import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { BE } from "../err/SocialBenefit.error";
import { SocialBenefitProps } from "./props/socialBenefit.props";
import { FamilyMemberId } from "./FamilyMemberId.valueObject";
import { unSafe } from "@conecta/option";

export class SocialBenefit {
  private constructor(readonly benefitName: string, readonly amount: number, readonly beneficiaryId: string) { }

  static create(props: SocialBenefitProps): Result<SocialBenefit, DomainError> {
    const beneficiaryIdNormalized = props.beneficiaryId.toString().trim().toLowerCase();
    const beneficiaryNameNormalized = props.benefitName.trim().replace(/\s+/g, ' ');
    if (!beneficiaryNameNormalized || beneficiaryNameNormalized.length === 0) return err(BE.BenefitNameEmpty());
    if (props.amount <= 0) return err(BE.AmountInvalid({ amount: props.amount }));
    return ok(Object.freeze(new SocialBenefit(beneficiaryNameNormalized, props.amount, beneficiaryIdNormalized)));
  }

  copyWith(props: Partial<SocialBenefitProps>): Result<SocialBenefit, DomainError> {
    const rawOption = unSafe(props.beneficiaryId?.value);
    const safeValue = rawOption.isSome ? rawOption.unwrap() : this.beneficiaryId;
    const newBeneficiaryIdResult = FamilyMemberId.create(safeValue);
    if (newBeneficiaryIdResult.isErr) return err(newBeneficiaryIdResult.unwrapErr());
      const newBeneficiaryId = newBeneficiaryIdResult.unwrap();
      const sbResult = SocialBenefit.create({
      benefitName: props.benefitName ?? this.benefitName,
      amount: props.amount ?? this.amount,
      beneficiaryId: newBeneficiaryId,
    });
    return sbResult.isErr ? err(sbResult.unwrapErr()) : ok(sbResult.unwrap());
  }
}
