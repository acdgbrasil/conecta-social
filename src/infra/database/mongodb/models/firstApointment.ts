import mongoose from "mongoose";

const firstApointment = new mongoose.Schema({
    firstApointmentForm:{
        type:String,
    },
    appointmentWasScheduled:{
        type:Boolean,
    },
    whoSendName:{
        type:String,
    },
    whoSendUnity:{
        type:String,
    },
    whoSendReasons:{
        type:String,
    },
    reasonsOfFirtApointment:{
        type:String,
    },
    familyHasBenefits:{
        type:String,
        enum:['BOLSA_FAMILIA','BPC','PETI','OUTROS']
    },
    familyBenefitsOthers:{
        type:String,
    },
    whoIsTheResponsible:{
        type:String,
    }, 
});

export const FirstApointmentModel = mongoose.model('firstApointment',firstApointment)