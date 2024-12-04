"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.referencePersonModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const rgModel_1 = require("./rgModel");
const observationModel_1 = require("./observationModel");
const referencePerson = new mongoose_1.default.Schema({
    fullName: {
        required: true,
        type: String
    },
    socialName: {
        required: true,
        type: String
    },
    motherName: {
        required: true,
        type: String
    },
    nis: {
        type: String
    },
    cpf: {
        type: String,
        required: true
    },
    diagnosis: {
        required: true,
        type: String
    },
    rg: {
        type: rgModel_1.rg,
        required: true
    },
    isShelter: {
        required: true,
        type: Boolean
    },
    localLocalization: {
        type: String,
        required: true,
        enum: ["URBAN", "RURAL"]
    },
    cep: {
        type: String
    },
    adress: {
        required: true,
        type: String
    },
    neighborhood: {
        required: true,
        type: String
    },
    adressComplement: {
        required: true,
        type: String
    },
    adressNumber: {
        required: true,
        type: String
    },
    city: {
        required: true,
        type: String
    },
    phone: {
        required: true,
        type: String
    },
    state: {
        required: true,
        type: String
    },
    familyPhoto: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true,
        ref: 'familyPhoto'
    },
    whoIsOpeningId: {
        type: String,
        required: true
    },
    fistEntryInUnityId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'firstEntryInUnity'
    },
    familyCompositionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'familyComposition'
    },
    homeConditionsId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'homeConditions'
    },
    workConditionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'workCondition'
    },
    familySituationViolationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'familySituationViolence'
    },
    observations: [{
            type: observationModel_1.observation
        }],
    birthDate: {
        type: Date,
        required: true
    },
    biologicalGender: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
exports.referencePersonModel = mongoose_1.default.model('ReferencePerson', referencePerson);
