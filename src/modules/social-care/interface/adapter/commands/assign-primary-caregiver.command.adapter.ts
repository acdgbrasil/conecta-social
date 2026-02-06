import { err, ok, type Result } from "@conecta/shared";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { AssignPrimaryCaregiverCommand } from "@conecta/social-care/application/ports/commands/assign-primary-caregiver.command";
import z from "zod";

const AssignPrimaryCaregiverCommandSchema = z.object({
  patientId: z.uuidv7(),
  memberPersonId: z.uuidv7(),
});

export const createAssignPrimaryCaregiverCommand = (
  data: unknown,
): Result<
  AssignPrimaryCaregiverCommand,
  ReturnType<typeof CmdError.InvalidCommandInput>
> => {
  const parseResult = AssignPrimaryCaregiverCommandSchema.safeParse(data);
  if (!parseResult.success)
    return err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  return ok(parseResult.data as AssignPrimaryCaregiverCommand);
};
