"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.familyCompositionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const observationModel_1 = require("./observationModel");
const documents = new mongoose_1.default.Schema({
    cn: {
        type: Boolean,
    },
    rg: {
        type: Boolean,
    },
    ctps: {
        type: Boolean,
    },
    cpf: {
        type: Boolean,
    },
    te: {
        type: Boolean,
    }
});
const participationAndSocialServices = new mongoose_1.default.Schema({
    isInUser: {
        type: Boolean,
    },
    serviceProgramOrProject: {
        type: String,
    },
    unityRealization: {
        type: String,
    },
    dateRealization: {
        type: Date,
    },
    dateConclusion: {
        type: Date,
    },
});
const pregnant = new mongoose_1.default.Schema({
    pregnancyMonths: {
        type: Number,
    },
    hasPreNatal: {
        type: Boolean,
    },
    isInUse: {
        type: Boolean,
    },
});
const ocurruncyBolsaFamilia = new mongoose_1.default.Schema({
    ocurruncyDate: {
        type: Date,
    },
    efect: {
        type: Number,
    },
    suspensionSolicitation: {
        type: Boolean,
    },
});
const educationConditionPerson = new mongoose_1.default.Schema({
    isInUse: {
        type: Boolean,
    },
    literate: {
        type: Boolean,
    },
    schoolShip: {
        type: String,
    },
    isStudying: {
        type: Boolean,
    },
    ocorruncyBolsaFamilia: {
        type: ocurruncyBolsaFamilia
    }
});
const workConditionPerson = new mongoose_1.default.Schema({
    isInUse: {
        type: Boolean,
    },
    hasWorkCard: {
        type: Boolean,
    },
    workCondition: {
        type: String,
    },
    workQualification: {
        type: String,
    },
    workValue: {
        type: Number,
    }
});
const familyCompositionPerson = new mongoose_1.default.Schema({
    fullName: {
        type: String,
    },
    birthDate: {
        type: Date,
    },
    biologicalGender: {
        type: String,
    },
    personWithDisability: {
        type: Boolean,
    },
    documents: {
        type: documents
    },
    kinship: {
        type: Number,
    },
    educationConditionPerson: {
        type: educationConditionPerson
    },
    workConditionPerson: {
        type: workConditionPerson
    },
    participationAndSocialServices: {
        type: participationAndSocialServices
    },
    pregnant: {
        type: pregnant
    }
});
const familyComposition = new mongoose_1.default.Schema({
    socialEspecification: {
        type: String,
    },
    espeficationEthnicity: {
        type: String,
    },
    familyCompositionPerson: [{
            type: familyCompositionPerson
        }],
    observation: [{
            type: observationModel_1.observation
        }],
    isInUse: {
        type: Boolean,
        default: false
    }
});
exports.familyCompositionModel = mongoose_1.default.model('familyComposition', familyComposition);
