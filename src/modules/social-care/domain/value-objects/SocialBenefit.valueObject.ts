import type { DomainError } from "@conecta/domain-error";
import { unSafe } from "@conecta/option";
import { err, ok, type Result } from "@conecta/result";
import { BE } from "../errors/SocialBenefit.error";
import { FamilyMemberId } from "./FamilyMemberId.valueObject";
import type { SocialBenefitProps } from "./props/socialBenefit.props";

export class SocialBenefit {
  private constructor(
    readonly benefitName: string,
    readonly amount: number,
    readonly beneficiaryId: string,
  ) {}

  static create(props: SocialBenefitProps): Result<SocialBenefit, DomainError> {
    const beneficiaryIdNormalized = props.beneficiaryId
      .toString()
      .trim()
      .toLowerCase();
    const beneficiaryNameNormalized = props.benefitName
      .trim()
      .replace(/\s+/g, " ");
    if (!beneficiaryNameNormalized || beneficiaryNameNormalized.length === 0)
      return err(BE.BenefitNameEmpty());
    if (props.amount <= 0)
      return err(BE.AmountInvalid({ amount: props.amount }));
    return ok(
      Object.freeze(
        new SocialBenefit(
          beneficiaryNameNormalized,
          props.amount,
          beneficiaryIdNormalized,
        ),
      ),
    );
  }

  copyWith(
    props: Partial<SocialBenefitProps>,
  ): Result<SocialBenefit, DomainError> {
    const rawOption = unSafe(props.beneficiaryId?.value);
    const safeValue = Option.isSome(rawOption)
      ? Option.unwrap(rawOption)
      : this.beneficiaryId;
    const newBeneficiaryIdResult = FamilyMemberId.create(safeValue);
    if (newBeneficiaryIdResult.isErr)
      return err(newBeneficiaryIdResult.error);
    const newBeneficiaryId = newBeneficiaryIdResult.value;
    const sbResult = SocialBenefit.create({
      benefitName: props.benefitName ?? this.benefitName,
      amount: props.amount ?? this.amount,
      beneficiaryId: newBeneficiaryId,
    });
    return sbResult;
  }
}
