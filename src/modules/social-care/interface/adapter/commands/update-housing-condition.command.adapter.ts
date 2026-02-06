import { err, ok, type Result } from "@conecta/shared";
import { CmdError } from "@conecta/social-care/application/errors/command.error";
import type { UpdateHousingConditionCommand } from "@conecta/social-care/application/ports/commands/update-housing-condition.command";
import { mapHousingConditionDtoToDomain } from "../mappers/social-assessment.mapper";
import {
  ACCESSIBILITY_LEVEL,
  ELECTRICITY_ACCESS,
  HOUSING_CONDITION_TYPE,
  SEWAGE_DISPOSAL_METHOD,
  WALL_MATERIAL,
  WASTE_COLLECTION_TYPE,
  WATER_SUPPLY_TYPE,
} from "../../dto/enums/housing-condition.enums";
import z from "zod";

const enumValues = <T extends Record<string, string>>(obj: T) =>
  Object.values(obj) as [string, ...string[]];

const HousingConditionSchema = z.object({
  housingConditionType: z.enum(enumValues(HOUSING_CONDITION_TYPE)),
  wallMaterial: z.enum(enumValues(WALL_MATERIAL)),
  numberOfRooms: z.number(),
  numberOfBathrooms: z.number(),
  waterSupplyType: z.enum(enumValues(WATER_SUPPLY_TYPE)),
  electricityAccess: z.enum(enumValues(ELECTRICITY_ACCESS)),
  sewerDisposalMethod: z.enum(enumValues(SEWAGE_DISPOSAL_METHOD)),
  wasteCollectionType: z.enum(enumValues(WASTE_COLLECTION_TYPE)),
  accessibilityLevel: z.enum(enumValues(ACCESSIBILITY_LEVEL)),
  isInGeographicRiskArea: z.boolean(),
  isInSocialConflictArea: z.boolean(),
});

const UpdateHousingConditionCommandSchema = z.object({
  patientId: z.uuidv7(),
  condition: HousingConditionSchema,
});

export const createUpdateHousingConditionCommand = (
  data: unknown,
): Result<
  UpdateHousingConditionCommand,
  ReturnType<typeof CmdError.InvalidCommandInput>
> => {
  const parseResult = UpdateHousingConditionCommandSchema.safeParse(data);
  if (!parseResult.success)
    return err(
      CmdError.InvalidCommandInput(
        z.prettifyError(parseResult.error),
        parseResult.error,
      ),
    );
  const conditionResult = mapHousingConditionDtoToDomain(
    parseResult.data.condition,
  );
  if (conditionResult.isErr) {
    return err(
      CmdError.InvalidCommandInput(
        conditionResult.error.message ?? "Invalid housing condition",
        conditionResult.error,
      ),
    );
  }
  return ok({
    patientId: parseResult.data.patientId,
    condition: conditionResult.value,
  });
};
