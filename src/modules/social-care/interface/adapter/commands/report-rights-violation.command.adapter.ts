import { err, ok, type Result } from "@conecta/shared";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { ReportRightsViolationCommand } from "@conecta/social-care/application/ports/commands/report-rights-violation.command";
import z from "zod";

const ReportRightsViolationCommandSchema = z.object({
  patientId: z.uuidv7(),
  victimId: z.uuidv7(),
  violationType: z.string().min(1, "Violation type is required"),
  reportDate: z.coerce.date(),
  incidentDate: z.coerce.date(),
  descriptionOfFact: z.string().min(1, "Description is required"),
  actionsTaken: z.string().optional(),
  id: z.uuidv7().optional(),
});

export const createReportRightsViolationCommand = (
  data: unknown,
): Result<
  ReportRightsViolationCommand,
  ReturnType<typeof CmdError.InvalidCommandInput>
> => {
  const parseResult = ReportRightsViolationCommandSchema.safeParse(data);
  if (!parseResult.success)
    return err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  return ok(parseResult.data as ReportRightsViolationCommand);
};
