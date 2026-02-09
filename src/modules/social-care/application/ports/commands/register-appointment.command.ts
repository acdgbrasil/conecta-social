import type { SocialCareAppointmentType } from "../../../domain/entities/SocialCareAppointment.entity";

export type RegisterAppointmentCommand = Readonly<{
  patientId: string;
  professionalId: string;
  summary: string;
  actionPlan?: string;
  date?: Date;
  type?: SocialCareAppointmentType;
}>;
