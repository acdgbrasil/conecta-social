"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeConditionsModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const observationModel_1 = require("./observationModel");
const homeConditions = new mongoose_1.default.Schema({
    typeResidence: {
        type: String,
    },
    materialOfExternalWalls: {
        type: String,
    },
    hasAcessEnergy: {
        type: String,
    },
    waterSupply: {
        type: String,
    },
    sewageDisposal: {
        type: String,
    },
    garbageCollection: {
        type: String,
    },
    hasWasteCollection: {
        type: Boolean,
    },
    homeConditionIsInRiskArea: {
        type: Boolean,
    },
    difficultyToAccessHome: {
        type: Boolean,
    },
    hasHomeInsurance: {
        type: Boolean,
    },
    hasHomeInsuranceValue: {
        type: Number,
    },
    numberOfRooms: {
        type: Number,
    },
    numberOfBedrooms: {
        type: Number,
    },
    numberOfPeapleInBedrooms: {
        type: Number,
    },
    observations: [{
            type: observationModel_1.observation
        }],
    isInUse: {
        type: Boolean,
        default: false
    }
});
exports.homeConditionsModel = mongoose_1.default.model('HomeConditions', homeConditions);
