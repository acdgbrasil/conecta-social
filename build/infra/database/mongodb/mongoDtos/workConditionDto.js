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
exports.createWorkConditionPersonDto = void 0;
const workCondition_1 = require("../../../../domain/entity/workCondition");
const error_1 = require("../../../error/error");
const familyCompositionModel_1 = require("../models/familyCompositionModel");
const workConditionModel_1 = require("../models/workConditionModel");
const createWorkConditionPersonDto = (workCondition, workConditionPerson, familyCompositionID, personId, workConditionId) => __awaiter(void 0, void 0, void 0, function* () {
    const familyComposition = yield familyCompositionModel_1.familyCompositionModel.findById(familyCompositionID);
    if (!familyComposition)
        throw new error_1.CustomError('FAMILY_COMPOSITION_NOT_FOUND', 404, 'FAMILY_COMPOSITION_NOT_FOUND', 'Family Composition not found');
    const resultWorkCondition = yield workConditionModel_1.WorkConditionModel.findById(workConditionId);
    if (!resultWorkCondition)
        throw new error_1.CustomError('WORK_CONDITION_NOT_FOUND', 404, 'WORK_CONDITION_NOT_FOUND', 'Work Condition not found');
    const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person) => person._id == personId);
    if (!familyCompositionPerson)
        throw new error_1.CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND', 404, 'FAMILY_COMPOSITION_PERSON_NOT_FOUND', 'Family Composition Person not found');
    familyCompositionPerson.workConditionPerson = workConditionPerson;
    resultWorkCondition.bcpBenefitPerson = workCondition.bcpBenefitPerson;
    resultWorkCondition.bolsaFamiliaValue = workCondition.bolsaFamiliaValue;
    resultWorkCondition.bpcValue = workCondition.bpcValue;
    resultWorkCondition.familyIncome = workCondition.familyIncome;
    resultWorkCondition.hasRetiredPerson = workCondition.hasRetiredPerson;
    resultWorkCondition.hasSocialIncome = workCondition.hasSocialIncome;
    resultWorkCondition.othersValue = workCondition.othersValue;
    resultWorkCondition.petiValue = workCondition.petiValue;
    resultWorkCondition.totalFamilyIncome = workCondition.totalFamilyIncome;
    resultWorkCondition.totalPerCapitaIncome = workCondition.totalPerCapitaIncome;
    yield resultWorkCondition.save();
    resultWorkCondition.isInUse = true;
    familyComposition.isInUse = true;
    const result = new workCondition_1.WorkCondition(resultWorkCondition.familyIncome, resultWorkCondition.perCapitaIncome, resultWorkCondition.hasSocialIncome, resultWorkCondition.bolsaFamiliaValue, resultWorkCondition.bpcValue, resultWorkCondition.petiValue, resultWorkCondition.othersValue, resultWorkCondition.bcpBenefitPerson, resultWorkCondition.hasRetiredPerson, resultWorkCondition.totalFamilyIncome, resultWorkCondition.totalPerCapitaIncome);
    return result;
});
exports.createWorkConditionPersonDto = createWorkConditionPersonDto;
