"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.familySituationViolenceDTO = void 0;
const error_1 = require("../../../error/error");
const familySituationViolenceModel_1 = require("../models/familySituationViolenceModel");
const familySituationViolenceDTO = (familySituationViolationId, familySituationViolation) => __awaiter(void 0, void 0, void 0, function* () {
    const familySituationViolence = yield familySituationViolenceModel_1.familySituationViolenceModel.findById(familySituationViolationId);
    if (!familySituationViolence)
        throw new error_1.CustomError("FAMILY_SITUATION_NOT_FOUND", 404, "Family Situation Violation not found", "Family Situation Violation not found");
    familySituationViolence.childLabel.thisSituationOcurrent = familySituationViolation.childLabel.thisSituationOcurrent;
    familySituationViolence.childLabel.thisSituationsOcurrentNow = familySituationViolation.childLabel.thisSituationsOcurrentNow;
    familySituationViolence.sexualExploitation.thisSituationOcurrent = familySituationViolation.sexualExploitation.thisSituationOcurrent;
    familySituationViolence.sexualExploitation.thisSituationsOcurrentNow = familySituationViolation.sexualExploitation.thisSituationsOcurrentNow;
    familySituationViolence.sexualAbuse.thisSituationOcurrent = familySituationViolation.sexualAbuse.thisSituationOcurrent;
    familySituationViolence.sexualAbuse.thisSituationsOcurrentNow = familySituationViolation.sexualAbuse.thisSituationsOcurrentNow;
    familySituationViolence.physicalAbuse.thisSituationOcurrent = familySituationViolation.physicalAbuse.thisSituationOcurrent;
    familySituationViolence.physicalAbuse.thisSituationsOcurrentNow = familySituationViolation.physicalAbuse.thisSituationsOcurrentNow;
    familySituationViolence.psychologicalAbuse.thisSituationOcurrent = familySituationViolation.psychologicalAbuse.thisSituationOcurrent;
    familySituationViolence.psychologicalAbuse.thisSituationsOcurrentNow = familySituationViolation.psychologicalAbuse.thisSituationsOcurrentNow;
    familySituationViolence.elderNeglect.thisSituationOcurrent = familySituationViolation.elderNeglect.thisSituationOcurrent;
    familySituationViolence.elderNeglect.thisSituationsOcurrentNow = familySituationViolation.elderNeglect.thisSituationsOcurrentNow;
    familySituationViolence.childNeglect.thisSituationOcurrent = familySituationViolation.childNeglect.thisSituationOcurrent;
    familySituationViolence.childNeglect.thisSituationsOcurrentNow = familySituationViolation.childNeglect.thisSituationsOcurrentNow;
    familySituationViolence.pcdNeglect.thisSituationOcurrent = familySituationViolation.pcdNeglect.thisSituationOcurrent;
    familySituationViolence.pcdNeglect.thisSituationsOcurrentNow = familySituationViolation.pcdNeglect.thisSituationsOcurrentNow;
    familySituationViolence.homelessSituation.thisSituationOcurrent = familySituationViolation.homelessSituation.thisSituationOcurrent;
    familySituationViolence.homelessSituation.thisSituationsOcurrentNow = familySituationViolation.homelessSituation.thisSituationsOcurrentNow;
    familySituationViolence.humanTrafficking.thisSituationOcurrent = familySituationViolation.humanTrafficking.thisSituationOcurrent;
    familySituationViolence.humanTrafficking.thisSituationsOcurrentNow = familySituationViolation.humanTrafficking.thisSituationsOcurrentNow;
    familySituationViolence.violenceWithElderOrPcd.thisSituationOcurrent = familySituationViolation.violenceWithElderOrPcd.thisSituationOcurrent;
    familySituationViolence.violenceWithElderOrPcd.thisSituationsOcurrentNow = familySituationViolation.violenceWithElderOrPcd.thisSituationsOcurrentNow;
    familySituationViolence.other.thisSituationOcurrent = familySituationViolation.other.thisSituationOcurrent;
    familySituationViolence.other.thisSituationsOcurrentNow = familySituationViolation.other.thisSituationsOcurrentNow;
    familySituationViolence.other.nameOfSituation = familySituationViolation.other.nameOfSituation;
    yield familySituationViolence.save();
    return familySituationViolence;
});
exports.familySituationViolenceDTO = familySituationViolenceDTO;
