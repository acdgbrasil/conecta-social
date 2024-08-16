import mongoose from "mongoose";
import { Documents, FamilyComposition, FamilyCompositionPerson } from "../../../../domain/entity/familyComposition";
import { observation } from "./observationModel";

const documents = new mongoose.Schema<Documents>({
    cn:{
        type:Boolean,
    },
    rg:{
        type:Boolean,
    },
    ctps:{
        type:Boolean,
    },
    cpf:{
        type:Boolean,
    },
    te:{
        type:Boolean,
    }
});

const familyCompositionPerson = new mongoose.Schema<FamilyCompositionPerson>({
    fullName:{
        type:String,
    },
    birthDate:{
        type:Date,
    },
    biologicalGender:{
        type:String,
    },
    personWithDisability:{
        type:Boolean,
    },
    documents:[{
        type:documents
    }],
    kinship:{
        type:Number,
    }
});

const familyComposition = new mongoose.Schema<FamilyComposition>({
    socialEspecification:{
        type:String,
    },
    espeficationEthnicity:{
        type:String,
    },
    familyCompositionPerson:[{
        type:familyCompositionPerson
    }],
    observation:[{
        type:observation
    }],
    isInUse:{
        type:Boolean,
        default:false
    }
})

export const familyCompositionModel = mongoose.model('familyComposition',familyComposition);