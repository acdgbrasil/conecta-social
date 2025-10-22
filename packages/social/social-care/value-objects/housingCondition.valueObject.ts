import { DomainError } from "@conecta/domain-error";
import { ok, Result } from "@conecta/result";

const HOUSING_CONDITION_TYPE = {
    OWNED: "OWNED",
    RENTED: "RENTED",
    CEDED: "CEDED",
    SQUATTED: "SQUATTED",
} as const;

const WALL_MATERIAL = {
    MASONRY: "MASONRY",
    FINISHED_WOOD: "FINISHED_WOOD",
    MAKESHIFT_MATERIALS: "MAKESHIFT_MATERIALS",
} as const; 

const ELETRICITY_ACCESS = {
    METERED_CONNECTION: "METERED_CONNECTION",
    WELL_SPRING: "WELL_SPRING",
    RAINWATER_HARVESTING: "RAINWATER_HARVESTING",
    WATER_TRUCK: "WATER_TRUCK",
} as const;

const  SEWAGE_DISPOSAL_METHOD = {
    PUBLIC_SEWER: "PUBLIC_SEWER",
    SEPTIC_TANK: "SEPTIC_TANK",
    RUDIMENTARY_PIT: "RUDIMENTARY_PIT",
    OPEN_SEWAGE: "OPEN_SEWAGE",
} as const;

const WASTE_COLLECTION_TYPE = {
    DIRECT_COLLECTION: "DIRECT_COLLECTION",
    INDIRECT_COLLECTION: "INDIRECT_COLLECTION",
    NO_COLLECTION: "NO_COLLECTION",
} as const;

const ACCESSIBILITY_LEVEL = {
    FULLY_ACCESSIBLE: "FULLY_ACCESSIBLE",
    PARTIALLY_ACCESSIBLE: "PARTIALLY_ACCESSIBLE",
    NOT_ACCESSIBLE: "NOT_ACCESSIBLE",
} as const;



export class HousingCondition {

    private constructor(
        readonly housingConditionType: typeof HOUSING_CONDITION_TYPE,
        readonly wallMaterial: typeof WALL_MATERIAL,
        readonly numberOfRooms: number,
        readonly numberOfBathrooms: number,
        readonly isInGeographicRiskArea: boolean,
        readonly isInSocialConflictArea: boolean,
        readonly electricityAccess: typeof ELETRICITY_ACCESS,
        readonly sewerDisposalMethod: typeof SEWAGE_DISPOSAL_METHOD,
        readonly wasteCollectionType: typeof WASTE_COLLECTION_TYPE,
        readonly accessibilityLevel: typeof ACCESSIBILITY_LEVEL) {}

    static create(): Result<HousingCondition, DomainError> {
        
        return ok(Object.freeze(new HousingCondition(
            HOUSING_CONDITION_TYPE,
            WALL_MATERIAL,
            0,
            0,
            false,
            false,
            ELETRICITY_ACCESS,
            SEWAGE_DISPOSAL_METHOD,
            WASTE_COLLECTION_TYPE,
            ACCESSIBILITY_LEVEL
        )));
    }
}