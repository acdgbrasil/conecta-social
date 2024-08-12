import mongoose from "mongoose";
import { Observations } from "../../../../domain/entity/observations";

const observation = new mongoose.Schema<Observations>({
    observation:{
        required:true,
        type:String
    },
    whoIsObservingId:{
        required:true,
        type:String
    },
    createdAt:{
        type:Date,
        default: Date.now()
    },
    updatedAt:{
        type:Date,
        default: Date.now()
    }
})

export const observationModel = mongoose.model('Observations',observation);