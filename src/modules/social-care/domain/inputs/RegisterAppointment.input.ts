export type RegisterAppointmentInput = {
  patientId: string;
  professionalId: string;
  summary: string;
  actionPlan?: string;
  date?: Date;
  type?: string;
};
