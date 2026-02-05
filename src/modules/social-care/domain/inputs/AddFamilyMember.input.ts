export type AddFamilyMemberInput = {
  patientId: string;
  memberPersonId: string;
  relationship: string;
  isResiding: boolean;
  isCaregiver: boolean;
};