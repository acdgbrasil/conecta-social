import type { DomainError } from "@conecta/domain-error/DomainError";
import type { DeepReadonly } from "@conecta/fn";
import { Result } from "@conecta/result";
import { HC } from "../errors/HousingCondition.error";

export const HOUSING_CONDITION_TYPE = {
  OWNED: "OWNED",
  RENTED: "RENTED",
  CEDED: "CEDED",
  SQUATTED: "SQUATTED",
} as const;

export const WALL_MATERIAL = {
  MASONRY: "MASONRY",
  FINISHED_WOOD: "FINISHED_WOOD",
  MAKESHIFT_MATERIALS: "MAKESHIFT_MATERIALS",
} as const;

export const WATER_SUPPLY_TYPE = {
  PUBLIC_NETWORK: "PUBLIC_NETWORK",
  WELL_OR_SPRING: "WELL_OR_SPRING",
  RAINWATER_HARVEST: "RAINWATER_HARVEST",
  WATER_TRUCK: "WATER_TRUCK",
  OTHER: "OTHER",
} as const;

export const ELECTRICITY_ACCESS = {
  METERED_CONNECTION: "METERED_CONNECTION",
  IRREGULAR_CONNECTION: "IRREGULAR_CONNECTION",
  NO_ACCESS: "NO_ACCESS",
} as const;

export const SEWAGE_DISPOSAL_METHOD = {
  PUBLIC_SEWER: "PUBLIC_SEWER",
  SEPTIC_TANK: "SEPTIC_TANK",
  RUDIMENTARY_PIT: "RUDIMENTARY_PIT",
  OPEN_SEWAGE: "OPEN_SEWAGE",
  NO_BATHROOM: "NO_BATHROOM",
} as const;

export const WASTE_COLLECTION_TYPE = {
  DIRECT_COLLECTION: "DIRECT_COLLECTION",
  INDIRECT_COLLECTION: "INDIRECT_COLLECTION",
  NO_COLLECTION: "NO_COLLECTION",
} as const;

export const ACCESSIBILITY_LEVEL = {
  FULLY_ACCESSIBLE: "FULLY_ACCESSIBLE",
  PARTIALLY_ACCESSIBLE: "PARTIALLY_ACCESSIBLE",
  NOT_ACCESSIBLE: "NOT_ACCESSIBLE",
} as const;

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
