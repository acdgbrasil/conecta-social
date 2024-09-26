"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstEntryInUnityModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const observationModel_1 = require("./observationModel");
const firstEntryInUnity = new mongoose_1.default.Schema({
    firstEntryInUnity: {
        type: String
    },
    motivationForFirstEntry: {
        type: String
    },
    nameOfUnityToSendFirstEntry: {
        type: String
    },
    ContactEmailOfUnityToSendFirstEntry: {
        type: String
    },
    familyBenefits: {
        type: String
    },
    isInUse: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    observations: [{
            type: observationModel_1.observation
        }],
});
exports.firstEntryInUnityModel = mongoose_1.default.model('firstEntryInUnity', firstEntryInUnity);
