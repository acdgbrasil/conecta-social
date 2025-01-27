import mongoose from "mongoose";
import { FamilyHistoryInstitutionalComplet } from "../../../../domain/entity/familyHistoryInstitutionalComplet";
import { observation } from "./observationModel";

export const FamilyHistoryInstitutionalCompletSchema = new mongoose.Schema<FamilyHistoryInstitutionalComplet>({
    childCustodyHistory: {
        type: String,
    },
    familyInstitutionalShelterHistory: {
        type: String,
    },
    isInUse: {
        type: Boolean,
    },
    observation:[
        {
            type:observation
        }
    ],
    otherFamilySeparationSituations: {
        hasMemberInPrision: {
            type: Boolean,
        },
        hasMemberInadolescentInSocioEducationalInternment: {
            type: Boolean,
        }
    }
})

export const FamilyHistoryInstitutionalCompletModel = mongoose.model<FamilyHistoryInstitutionalComplet>('FamilyHistoryInstitutionalComplet', FamilyHistoryInstitutionalCompletSchema);