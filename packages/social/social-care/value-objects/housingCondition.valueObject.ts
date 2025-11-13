import type { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { HC } from "../err/HousingCondition.error";
import { HousingConditionProps } from "./props/housingCondition.props";

export class HousingCondition implements HousingConditionProps {
    readonly housingConditionType: HousingConditionProps['housingConditionType'];
    readonly wallMaterial: HousingConditionProps['wallMaterial'];
    readonly numberOfRooms: number;
    readonly numberOfBathrooms: number;
    readonly isInGeographicRiskArea: boolean;
    readonly isInSocialConflictArea: boolean;
    readonly electricityAccess: HousingConditionProps['electricityAccess'];
    readonly sewerDisposalMethod: HousingConditionProps['sewerDisposalMethod'];
    readonly wasteCollectionType: HousingConditionProps['wasteCollectionType'];
    readonly accessibilityLevel: HousingConditionProps['accessibilityLevel'];
    readonly waterSupplyType: HousingConditionProps['waterSupplyType'];

    private constructor(props: HousingConditionProps) {
        this.housingConditionType = props.housingConditionType;
        this.wallMaterial = props.wallMaterial;
        this.numberOfRooms = props.numberOfRooms;
        this.numberOfBathrooms = props.numberOfBathrooms;
        this.isInGeographicRiskArea = props.isInGeographicRiskArea;
        this.isInSocialConflictArea = props.isInSocialConflictArea;
        this.electricityAccess = props.electricityAccess;
        this.sewerDisposalMethod = props.sewerDisposalMethod;
        this.wasteCollectionType = props.wasteCollectionType;
        this.accessibilityLevel = props.accessibilityLevel;
        this.waterSupplyType = props.waterSupplyType;
        
        Object.freeze(this);
    }
    

    static create(props: HousingConditionProps): Result<HousingCondition, DomainError> {
        if (props.numberOfRooms < 0) return err(HC.NegativeRooms());
        if (props.numberOfBathrooms < 0) return err(HC.NegativeBathrooms());
        if (props.numberOfBathrooms > props.numberOfRooms) return err(HC.BathroomsExceedRooms());
        
        return ok(new HousingCondition(props));
    }

    copyWith(props: Partial<HousingConditionProps>): Result<HousingCondition, DomainError> {
        return HousingCondition.create({
            housingConditionType: props.housingConditionType ?? this.housingConditionType,
            wallMaterial: props.wallMaterial ?? this.wallMaterial,
            numberOfRooms: props.numberOfRooms ?? this.numberOfRooms,
            numberOfBathrooms: props.numberOfBathrooms ?? this.numberOfBathrooms,
            isInGeographicRiskArea: props.isInGeographicRiskArea ?? this.isInGeographicRiskArea,
            isInSocialConflictArea: props.isInSocialConflictArea ?? this.isInSocialConflictArea,
            electricityAccess: props.electricityAccess ?? this.electricityAccess,
            sewerDisposalMethod: props.sewerDisposalMethod ?? this.sewerDisposalMethod,
            wasteCollectionType: props.wasteCollectionType ?? this.wasteCollectionType,
            accessibilityLevel: props.accessibilityLevel ?? this.accessibilityLevel,
            waterSupplyType: props.waterSupplyType ?? this.waterSupplyType,
        });
    }
}
