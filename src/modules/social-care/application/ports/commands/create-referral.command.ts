import type { ReferralDestinationService } from "../../../domain/entities/Referral.entity";

export type CreateReferralCommand = Readonly<{
  patientId: string;
  referredPersonId: string;
  destinationService: ReferralDestinationService;
  reason: string;
  date?: Date;
  professionalId?: string;
}>;
