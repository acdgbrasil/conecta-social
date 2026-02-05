export type RegisterNewPatientInput = {
  personId: string;
  initialDiagnoses: Array<{
    icdCode: string;
    date: Date;
    description: string;
  }>;
};