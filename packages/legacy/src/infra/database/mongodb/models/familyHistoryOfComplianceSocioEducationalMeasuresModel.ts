import mongoose from "mongoose";
import { FamilyHistoryOfComplianceSocioEducationalMeasures } from "../../../../domain/entity/familyHistoryOfComplianceSocioEducationalMeasures.ts";
import { observation } from "./observationModel.ts";

const familyHistoryOfComplianceSocioEducationalMeasuresSchema = new mongoose.Schema<FamilyHistoryOfComplianceSocioEducationalMeasures>({
    anotationsOfPersons:{
        type:[String]
    },
    isInUse:{
        type:Boolean
    },
    observations:[{
        type:observation
    }]
})

export const familyHistoryOfComplianceSocioEducationalMeasuresModel = mongoose.model('familyHistoryOfComplianceSocioEducationalMeasures',familyHistoryOfComplianceSocioEducationalMeasuresSchema);
