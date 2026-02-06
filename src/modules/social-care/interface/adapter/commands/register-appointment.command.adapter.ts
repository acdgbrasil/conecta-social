import { err, ok, type Result } from "@conecta/shared";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { RegisterAppointmentCommand } from "@conecta/social-care/application/ports/commands/register-appointment.command";
import z from "zod";

const RegisterAppointmentCommandSchema = z.object({
  patientId: z.uuidv7(),
  professionalId: z.uuidv7(),
  summary: z.string().min(1, "Summary is required"),
  actionPlan: z.string().min(1, "Action plan is required").optional(),
  date: z.coerce.date().optional(),
  type: z.string().min(1, "Type is required").optional(),
});

export const createRegisterAppointmentCommand = (
  data: unknown,
): Result<
  RegisterAppointmentCommand,
  ReturnType<typeof CmdError.InvalidCommandInput>
> => {
  const parseResult = RegisterAppointmentCommandSchema.safeParse(data);
  if (!parseResult.success)
    return err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  return ok(parseResult.data as RegisterAppointmentCommand);
};
