export type RegisterAppointmentCommand = Readonly<{
  patientId: string;
  professionalId: string;
  summary: string;
  actionPlan?: string;
  date?: Date;
  type?: string;
}>;
