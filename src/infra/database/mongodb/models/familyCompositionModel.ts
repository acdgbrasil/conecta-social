import mongoose from "mongoose";
import { Documents, EducationConditionPerson, FamilyComposition, FamilyCompositionPerson, OcurruncyBolsaFamilia, ParticipationAndSocialServices, Pregnant, WorkConditionPerson } from "../../../../domain/entity/familyComposition";
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

const participationAndSocialServices = new mongoose.Schema<ParticipationAndSocialServices>({
    isInUser:{
        type:Boolean,
    },
    serviceProgramOrProject:{
        type:String,
    },
    unityRealization:{
        type:String,
    },
    dateRealization:{
        type:Date,
    },
    dateConclusion:{
        type:Date,
    },
});

const pregnant = new mongoose.Schema<Pregnant>({
    pregnancyMonths:{
        type:Number,
    },
    hasPreNatal:{
        type:Boolean,
    },
    isInUse:{
        type:Boolean,
    },
});

const ocurruncyBolsaFamilia = new mongoose.Schema<OcurruncyBolsaFamilia>({
    ocurruncyDate:{
        type:Date,
    },
    efect:{
        type:Number,
    },
    suspensionSolicitation:{
        type:Boolean,
    },
});

const educationConditionPerson = new mongoose.Schema<EducationConditionPerson>({
    isInUse:{
        type:Boolean,
    },
    knowHowToRead:{
        type:Boolean,
    },
    schoolShip:{
        type:String,
    },
    isStudying:{
        type:Boolean,
    },
    ocorruncyBolsaFamilia:{
        type:ocurruncyBolsaFamilia
    }
});

const workConditionPerson = new mongoose.Schema<WorkConditionPerson>({
    isInUse:{
        type:Boolean,
    },
    hasWorkCard:{
        type:Boolean,
    },
    workCondition:{
        type:String,
    },
    workQualification:{
        type:String,
    },
    workValue:{
        type:Number,
    }
})

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
    documents:{
        type:documents
    },
    kinship:{
        type:Number,
    },
    educationConditionPerson:{
        type:educationConditionPerson
    },
    workConditionPerson:{
        type:workConditionPerson
    },
    participationAndSocialServices:{
        type:participationAndSocialServices
    },
    pregnant:{
        type:pregnant
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