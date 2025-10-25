import { FamilyMemberId } from "../FamilyMemberId.valueObject";

export type SocialBenefitProps = {
    benefitName: string;
    amount: number;
    beneficiaryId: FamilyMemberId;
};
