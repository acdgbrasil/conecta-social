export type RegisterNewPatientCommand = Readonly<{
    personId: string;
    initialDiagnoses: ReadonlyArray<{
      icdCode: string;
      date: Date;
      description: string;
    }>;
  }>;