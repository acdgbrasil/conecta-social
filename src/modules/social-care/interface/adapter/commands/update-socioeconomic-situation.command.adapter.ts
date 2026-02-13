import { Result } from "@conecta/result";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { UpdateSocioEconomicSituationCommand } from "@conecta/social-care/application/ports/commands/update-socioeconomic-situation.command";
import {
  FamilyMemberId,
  SocialBenefit,
  SocialBenefitsCollection,
  SocioEconomicSituation,
} from "@conecta/social-care";
import type { DomainError } from "@conecta/domain-error/DomainError";
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
  deps: {
    createFamilyMemberId: (value?: string) => Result<any, DomainError>;
  } = {
    createFamilyMemberId: FamilyMemberId.create,
  },
): Result<
  UpdateSocioEconomicSituationCommand,
  ReturnType<typeof CmdError.InvalidCommandInput>
> => {
  const parseResult = UpdateSocioEconomicSituationCommandSchema.safeParse(data);
  if (!parseResult.success)
    return Result.err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  const socialBenefits: SocialBenefit[] = [];
  for (const item of parseResult.data.situation.socialBenefits) {
    const beneficiaryId = deps.createFamilyMemberId(item.beneficiaryId);
    if (Result.isErr(beneficiaryId)) {
      return Result.err(
        CmdError.InvalidCommandInput(
          beneficiaryId.error.message ?? "Invalid social benefit beneficiary",
          beneficiaryId.error,
        ),
      );
    }

    const benefit = SocialBenefit.create({
      benefitName: item.benefitName,
      amount: item.amount,
      beneficiaryId: beneficiaryId.value,
    });
    if (Result.isErr(benefit)) {
      return Result.err(
        CmdError.InvalidCommandInput(
          benefit.error.message ?? "Invalid social benefit",
          benefit.error,
        ),
      );
    }
    socialBenefits.push(benefit.value);
  }

  const collection = SocialBenefitsCollection.create(socialBenefits);
  if (Result.isErr(collection)) {
    return Result.err(
      CmdError.InvalidCommandInput(
        collection.error.message ?? "Invalid social benefits collection",
        collection.error,
      ),
    );
  }

  const situationResult = SocioEconomicSituation.create({
    ...parseResult.data.situation,
    socialBenefits: collection.value,
  });

  if (Result.isErr(situationResult)) {
    return Result.err(
      CmdError.InvalidCommandInput(
        situationResult.error.message ?? "Invalid socioeconomic situation",
        situationResult.error,
      ),
    );
  }
  return Result.ok({
    patientId: parseResult.data.patientId,
    situation: situationResult.value,
  });
};
