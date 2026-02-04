export type CreateReferralInput = {
  patientId: string;
  referredPersonId: string;
  destinationService: string;
  reason: string;
  date?: Date;
  professionalId?: string;
};
