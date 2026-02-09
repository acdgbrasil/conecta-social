import { Result } from "@conecta/result";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { RegisterAppointmentCommand } from "@conecta/social-care/application/ports/commands/register-appointment.command";
import { SocialCareAppointmentType } from "@conecta/social-care/domain/entities/SocialCareAppointment.entity";
import z from "zod";

const RegisterAppointmentCommandSchema = z.object({
  patientId: z.uuidv7(),
  professionalId: z.uuidv7(),
  summary: z.string().min(1, "Summary is required"),
  actionPlan: z.string().min(1, "Action plan is required").optional(),
  date: z.coerce.date().optional(),
  type: z.nativeEnum(SocialCareAppointmentType).optional(),
});

export const createRegisterAppointmentCommand = (
  data: unknown,
): Result<
  RegisterAppointmentCommand,
  ReturnType<typeof CmdError.InvalidCommandInput>
> => {
  const parseResult = RegisterAppointmentCommandSchema.safeParse(data);
  if (!parseResult.success)
    return Result.err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  return Result.ok(parseResult.data as RegisterAppointmentCommand);
};
