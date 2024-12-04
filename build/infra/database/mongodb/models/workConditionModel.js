"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkConditionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const workConditionSchema = new mongoose_1.default.Schema({
    familyIncome: {
        type: Number,
    },
    perCapitaIncome: {
        type: Number,
    },
    hasSocialIncome: {
        type: Boolean,
    },
    bolsaFamiliaValue: {
        type: Number,
    },
    bpcValue: {
        type: Number,
    },
    petiValue: {
        type: Number,
    },
    othersValue: {
        type: Number,
    },
    bcpBenefitPerson: {
        type: [String],
    },
    hasRetiredPerson: {
        type: [String],
    },
    totalFamilyIncome: {
        type: Number,
    },
    totalPerCapitaIncome: {
        type: Number,
    },
    isInUse: {
        type: Boolean,
    },
    observations: {
        type: [String],
    }
});
exports.WorkConditionModel = mongoose_1.default.model('workCondition', workConditionSchema);
