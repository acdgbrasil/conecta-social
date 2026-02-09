import type { DomainError } from "@conecta/domain-error/DomainError";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import { BE } from "../errors/SocialBenefit.error";
import { FamilyMemberId } from "./FamilyMemberId.valueObject";

export type SocialBenefitProps = {
  readonly benefitName: string;
  readonly amount: number;
  readonly beneficiaryId: FamilyMemberId;
};

export type SocialBenefit = DeepReadonly<{
  readonly benefitName: string;
  readonly amount: number;
  readonly beneficiaryId: string;
}>;

export const SocialBenefit = {
  create(props: SocialBenefitProps): Result<SocialBenefit, DomainError> {
    const beneficiaryNameNormalized = props.benefitName.trim().replace(/\s+/g, " ");
    
    if (!beneficiaryNameNormalized || beneficiaryNameNormalized.length === 0)
      return Result.err(BE.BenefitNameEmpty());
    
    if (props.amount <= 0)
      return Result.err(BE.AmountInvalid({ amount: props.amount }));

    const beneficiaryIdNormalized = props.beneficiaryId.toString().trim().toLowerCase();

    return Result.ok({
      benefitName: beneficiaryNameNormalized,
      amount: props.amount,
      beneficiaryId: beneficiaryIdNormalized,
    });
  }
} as const;