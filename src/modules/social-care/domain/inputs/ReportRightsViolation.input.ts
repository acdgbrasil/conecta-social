export type ReportRightsViolationInput = {
  patientId: string;
  victimId: string;
  violationType: string;
  reportDate: Date;
  incidentDate: Date;
  descriptionOfFact: string;
  actionsTaken?: string;
  id?: string;
};
