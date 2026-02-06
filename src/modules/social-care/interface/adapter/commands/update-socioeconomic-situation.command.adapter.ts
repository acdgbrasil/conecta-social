import { err, ok, type Result } from "@conecta/shared";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { UpdateSocioEconomicSituationCommand } from "@conecta/social-care/application/ports/commands/update-socioeconomic-situation.command";
import { mapSocioEconomicSituationDtoToDomain } from "../mappers/social-assessment.mapper";
import z from "zod";

const SocialBenefitSchema = z.object({
  benefitName: z.string().min(1, "Benefit name is required"),
  amount: z.number(),
  beneficiaryId: z.uuidv7(),
});

const SocioEconomicSituationSchema = z.object({
  totalFamilyIncome: z.number(),
  incomePerCapita: z.number(),
  receivesSocialBenefit: z.boolean(),
  socialBenefits: z.array(SocialBenefitSchema),
  mainSourceOfIncome: z.string().min(1, "Main source of income is required"),
  hasUnemployed: z.boolean(),
});

const UpdateSocioEconomicSituationCommandSchema = z.object({
  patientId: z.uuidv7(),
  situation: SocioEconomicSituationSchema,
});

export const createUpdateSocioEconomicSituationCommand = (
  data: unknown,
): Result<
  UpdateSocioEconomicSituationCommand,
  ReturnType<typeof CmdError.InvalidCommandInput>
> => {
  const parseResult = UpdateSocioEconomicSituationCommandSchema.safeParse(data);
  if (!parseResult.success)
    return err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  const situationResult = mapSocioEconomicSituationDtoToDomain(
    parseResult.data.situation,
  );
  if (situationResult.isErr) {
    return err(
      CmdError.InvalidCommandInput(
        situationResult.error.message ?? "Invalid socioeconomic situation",
        situationResult.error,
      ),
    );
  }
  return ok({
    patientId: parseResult.data.patientId,
    situation: situationResult.value,
  });
};
