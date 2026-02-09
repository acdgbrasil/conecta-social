import { Result } from "@conecta/result";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { CreateReferralCommand } from "@conecta/social-care/application/ports/commands/create-referral.command";
import { ReferralDestinationService } from "@conecta/social-care/domain/entities/Referral.entity";
import z from "zod";

const CreateReferralCommandSchema = z.object({
  patientId: z.uuidv7(),
  referredPersonId: z.uuidv7(),
  destinationService: z.nativeEnum(ReferralDestinationService),
  reason: z.string().min(1, "Reason is required"),
  date: z.coerce.date().optional(),
  professionalId: z.uuidv7().optional(),
});

export const createCreateReferralCommand = (
  data: unknown,
): Result<CreateReferralCommand, ReturnType<typeof CmdError.InvalidCommandInput>> => {
  const parseResult = CreateReferralCommandSchema.safeParse(data);
  if (!parseResult.success)
    return Result.err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  return Result.ok(parseResult.data as CreateReferralCommand);
};
