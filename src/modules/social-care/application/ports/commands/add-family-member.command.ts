export type AddFamilyMemberCommand = Readonly<{
  patientId: string;
  memberPersonId: string;
  relationship: string;
  isResiding: boolean;
  isCaregiver: boolean;
}>;
