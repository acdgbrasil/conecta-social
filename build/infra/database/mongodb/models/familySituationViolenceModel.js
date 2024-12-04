"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.familySituationViolenceModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const familySituationViolationStruct = new mongoose_1.default.Schema({
    thisSituationOcurrent: {
        type: Boolean,
    },
    thisSituationsOcurrentNow: {
        type: Boolean,
    },
});
const familySituationViolationStructOther = new mongoose_1.default.Schema({
    thisSituationOcurrent: {
        type: Boolean,
    },
    thisSituationsOcurrentNow: {
        type: Boolean,
    },
    nameOfSituation: {
        type: String,
    }
});
const familySituationViolation = new mongoose_1.default.Schema({
    childLabel: familySituationViolationStruct,
    sexualExploitation: familySituationViolationStruct,
    sexualAbuse: familySituationViolationStruct,
    physicalAbuse: familySituationViolationStruct,
    psychologicalAbuse: familySituationViolationStruct,
    elderNeglect: familySituationViolationStruct,
    childNeglect: familySituationViolationStruct,
    pcdNeglect: familySituationViolationStruct,
    homelessSituation: familySituationViolationStruct,
    humanTrafficking: familySituationViolationStruct,
    violenceWithElderOrPcd: familySituationViolationStruct,
    other: familySituationViolationStructOther,
    isInUse: {
        type: Boolean,
    }
});
exports.familySituationViolenceModel = mongoose_1.default.model('FamilySituationViolence', familySituationViolation);
