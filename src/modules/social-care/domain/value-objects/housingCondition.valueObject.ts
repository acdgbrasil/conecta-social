import type { DomainError } from "@conecta/domain-error";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import { HC } from "../errors/HousingCondition.error";
import {
  ACCESSIBILITY_LEVEL,
  ELECTRICITY_ACCESS,
  HOUSING_CONDITION_TYPE,
  SEWAGE_DISPOSAL_METHOD,
  WALL_MATERIAL,
  WASTE_COLLECTION_TYPE,
  WATER_SUPPLY_TYPE,
} from "./props/housingCondition.props";

export type HousingConditionProps = {
  readonly housingConditionType: keyof typeof HOUSING_CONDITION_TYPE;
  readonly wallMaterial: keyof typeof WALL_MATERIAL;
  readonly numberOfRooms: number;
  readonly numberOfBathrooms: number;
  readonly waterSupplyType: keyof typeof WATER_SUPPLY_TYPE;
  readonly electricityAccess: keyof typeof ELECTRICITY_ACCESS;
  readonly sewerDisposalMethod: keyof typeof SEWAGE_DISPOSAL_METHOD;
  readonly wasteCollectionType: keyof typeof WASTE_COLLECTION_TYPE;
  readonly accessibilityLevel: keyof typeof ACCESSIBILITY_LEVEL;
  readonly isInGeographicRiskArea: boolean;
  readonly isInSocialConflictArea: boolean;
};

export type HousingCondition = DeepReadonly<HousingConditionProps>;

export const HousingCondition = {
  create(props: HousingConditionProps): Result<HousingCondition, DomainError> {
    if (props.numberOfRooms < 0) return Result.err(HC.NegativeRooms());
    if (props.numberOfBathrooms < 0) return Result.err(HC.NegativeBathrooms());
    if (props.numberOfBathrooms > props.numberOfRooms)
      return Result.err(HC.BathroomsExceedRooms());

    return Result.ok(props);
  }
} as const;