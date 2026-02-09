import { Result } from "@conecta/result";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { RegisterNewPatientCommand } from "@conecta/social-care/application/ports/commands/register-new-patient.command";
import z from "zod";

const RegisterNewPatientCommandSchema = z.object({
  personId: z.uuidv7(),
  initialDiagnoses: z.array(
    z.object({
      icdCode: z.string().min(3, "ICD code must be at least 3 characters long"),
      date: z.coerce.date(),
      description: z.string().min(10, "Description must be at least 10 characters long"),
    })
  ).min(1, "At least one initial diagnosis is required"),
})


export const createRegisterNewPatientCommand = (data: unknown): Result<RegisterNewPatientCommand,  ReturnType<typeof CmdError.InvalidCommandInput>> => {
  const parseResult = RegisterNewPatientCommandSchema.safeParse(data);
  if (!parseResult.success) return Result.err(CmdError.InvalidCommandInput(z.prettifyError(parseResult.error),parseResult.error));
  return Result.ok(parseResult.data as RegisterNewPatientCommand);
}