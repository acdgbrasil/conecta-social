import { err, ok, type Result } from "@conecta/shared";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { RemoveFamilyMemberCommand } from "@conecta/social-care/application/ports/commands/remove-family-member.command";
import z from "zod";

const RemoveFamilyMemberCommandSchema = z.object({
  patientId: z.uuidv7(),
  memberPersonId: z.uuidv7(),
});

export const createRemoveFamilyMemberCommand = (
  data: unknown,
): Result<
  RemoveFamilyMemberCommand,
  ReturnType<typeof CmdError.InvalidCommandInput>
> => {
  const parseResult = RemoveFamilyMemberCommandSchema.safeParse(data);
  if (!parseResult.success)
    return err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  return ok(parseResult.data as RemoveFamilyMemberCommand);
};
