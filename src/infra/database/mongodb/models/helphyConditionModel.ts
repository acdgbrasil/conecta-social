import mongoose from "mongoose";
import { HelphyCondition, HelphyConditionStruct } from "../../../../domain/entity/healthCondition";

const helphyConditionStructSchema = new mongoose.Schema<HelphyConditionStruct>({
    fullName:{
        type:String,
        required:true
    },
    complement:{
        type:String,
        required:true
    },
})

const helpyConditionSchema = new mongoose.Schema<HelphyCondition>({
    familyMemberAbusesAlcoholList:[
        {
            type:helphyConditionStructSchema,
            required:true
        }
    ],
    familyMemberAbusesDrugsList:[
        {
            type:helphyConditionStructSchema,
            required:true
        }
    ],
    familyMemberNeedsConstantCareList:[
        {
            type:helphyConditionStructSchema,
            required:true
        }
    ],
    familyMemberUsesControlledMedicationList:[
        {
            type:helphyConditionStructSchema,
            required:true
        }
    ],
    hasFamilyIndicatesFoodInsecurity:{
        type:Boolean,
        required:true
    },
    hasFamilyMemberAbusesAlcohol:{
        type:Boolean,
        required:true
    },
    hasFamilyMemberAbusesDrugs:{
        type:Boolean,
        required:true
    },
    hasFamilyMemberNeedsConstantCare:{
        type:Boolean,
        required:true
    },
    hasFamilyMemberUsesControlledMedication:{
        type:Boolean,
        required:true
    },
    hasSevereIllness:{
        type:Boolean,
        required:true
    },
    severeIllnessList:[
        {
            type:helphyConditionStructSchema,
            required:true
        }
    ],
    observations:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'observation',
            required:true
        }
    ],
    updatedAt:{
        type:Date,
        required:true
    },
    createdAt:{
        type:Date,
        required:true
    }

})

export const helphyConditionModel = mongoose.model('helphyCondition',helpyConditionSchema);