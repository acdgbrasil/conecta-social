import { err, ok, type Result } from "@conecta/shared";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { AddFamilyMemberCommand } from "@conecta/social-care/application/ports/commands/add-family-member.command";
import z from "zod";

const AddFamilyMemberCommandSchema = z.object({
  patientId: z.uuidv7(),
  memberPersonId: z.uuidv7(),
  relationship: z.string().min(1, "Relationship is required"),
  isResiding: z.boolean(),
  isCaregiver: z.boolean(),
});

export const createAddFamilyMemberCommand = (
  data: unknown,
): Result<
  AddFamilyMemberCommand,
  ReturnType<typeof CmdError.InvalidCommandInput>
> => {
  const parseResult = AddFamilyMemberCommandSchema.safeParse(data);
  if (!parseResult.success)
    return err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  return ok(parseResult.data as AddFamilyMemberCommand);
};
