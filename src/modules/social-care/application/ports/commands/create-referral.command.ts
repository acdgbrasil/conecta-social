export type CreateReferralCommand = Readonly<{
  patientId: string;
  referredPersonId: string;
  destinationService: string;
  reason: string;
  date?: Date;
  professionalId?: string;
}>;
