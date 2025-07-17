import mongoose from "mongoose";
import { FamilyHistoryInstitutionalComplet } from "../../../../domain/entity/familyHistoryInstitutionalComplet.ts";
import { observation } from "./observationModel.ts";

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