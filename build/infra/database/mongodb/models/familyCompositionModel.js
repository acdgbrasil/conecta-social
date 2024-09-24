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
