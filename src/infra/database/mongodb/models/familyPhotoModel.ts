import mongoose from "mongoose";
import { FamilyPhoto } from "../../../../domain/entity/referencePerson";

const familyPhoto = new mongoose.Schema<FamilyPhoto>({
    fileBuffer:{
        type:Buffer,
        required:true
    },
    fileExtension:{
        type:String,
        required:true,
        enum:["png","jpeg","jpg"]
    }
})

export const familyPhotoModel = mongoose.model('familyPhoto',familyPhoto);