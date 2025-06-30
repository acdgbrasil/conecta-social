import mongoose from "mongoose";
import {  RG } from "../../../../domain/entity/referencePerson.ts";

export const rg = new mongoose.Schema<RG>({
    issueDate:{
        type:String,
        required:true
    },
    issuingBody:{
        type:String,
        required:true
    },
    number:{
        required:true,
        type:String
    },
    uf:{
        required:true,
        type:String
    }
})