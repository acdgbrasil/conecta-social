import mongoose from "mongoose";
import { FamilyHistoryOfComplianceSocioEducationalMeasures } from "../../../../domain/entity/familyHistoryOfComplianceSocioEducationalMeasures";
import { Observations } from "../../../../domain/entity/observations";
import { observation } from "./observationModel";

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
