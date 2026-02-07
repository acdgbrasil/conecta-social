import type { DomainError } from "@conecta/domain-error";
import { type DeepReadonly, List } from "@conecta/fn";
import { Result } from "@conecta/result";
import { SBC } from "@conecta/social-care/domain/errors/SocialBenefitsCollection.error";
import type { SocialBenefit } from "./SocialBenefit.valueObject";

export type SocialBenefitsCollection = DeepReadonly<{
  items: readonly SocialBenefit[];
}>;

export const SocialBenefitsCollection = {
  create(benefits: readonly SocialBenefit[]): Result<SocialBenefitsCollection, DomainError> {
    if (benefits === null || benefits === undefined) return Result.err(SBC.BenefitsArrayNullOrUndefined());
    
    if (List.isEmpty(benefits)) return Result.ok({ items: List.empty() });

    const seenNames = new Set<string>();
    
    for (const benefit of benefits) {
      if (seenNames.has(benefit.benefitName)) {
        return Result.err(SBC.DuplicateBenefitNotAllowed(benefit.benefitName));
      }
      seenNames.add(benefit.benefitName);
    }

    return Result.ok({ items: List.from(benefits) });
  },

  getAll(col: SocialBenefitsCollection): readonly SocialBenefit[] {
    return col.items;
  },

  isEmpty(col: SocialBenefitsCollection): boolean {
    return List.isEmpty(col.items);
  },

  count(col: SocialBenefitsCollection): number {
    return List.count(col.items);
  },

  getTotalAmount(col: SocialBenefitsCollection): number {
    return col.items.reduce((total, benefit) => total + benefit.amount, 0);
  }
} as const;
