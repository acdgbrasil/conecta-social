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
exports.getAllFamilyComposition = exports.getFamilyComposition = exports.createFamilyCompositionObservation = exports.createSocialEspecifications = exports.createDocuments = exports.createEtnicalEspecifications = exports.createFamilyPerson = void 0;
const error_1 = require("../../../error/error");
const familyCompositionModel_1 = require("../models/familyCompositionModel");
const createFamilyPerson = (familyCompositionPerson, familyCompositionID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const familyComposition = yield familyCompositionModel_1.familyCompositionModel.findById(familyCompositionID);
        if (!familyComposition)
            throw new error_1.CustomError('FAMILY_COMPOSITION_NOT_FOUND', 404, 'FAMILY_COMPOSITION_NOT_FOUND', 'Family Composition not found');
        familyComposition.familyCompositionPerson.push(familyCompositionPerson);
        familyComposition.isInUse = true;
        familyComposition.save();
        return familyComposition;
    }
    catch (err) {
        throw err;
    }
});
exports.createFamilyPerson = createFamilyPerson;
const createEtnicalEspecifications = (etnicalEspecifications, familyCompositionID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const familyComposition = yield familyCompositionModel_1.familyCompositionModel.findById(familyCompositionID);
        if (!familyComposition)
            throw new error_1.CustomError('FAMILY_COMPOSITION_NOT_FOUND', 404, 'FAMILY_COMPOSITION_NOT_FOUND', 'Family Composition not found');
        familyComposition.espeficationEthnicity = etnicalEspecifications;
        familyComposition.isInUse = true;
        familyComposition.save();
        return familyComposition;
    }
    catch (err) {
        throw err;
    }
});
exports.createEtnicalEspecifications = createEtnicalEspecifications;
const createDocuments = (documents, familyCompositionID, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const familyComposition = yield familyCompositionModel_1.familyCompositionModel.findById(familyCompositionID);
        if (!familyComposition)
            throw new error_1.CustomError('FAMILY_COMPOSITION_NOT_FOUND', 404, 'FAMILY_COMPOSITION_NOT_FOUND', 'Family Composition not found');
        const familyCompositionPerson = familyComposition.familyCompositionPerson.find((person) => person._id == id);
        if (!familyCompositionPerson)
            throw new error_1.CustomError('FAMILY_COMPOSITION_PERSON_NOT_FOUND', 404, 'FAMILY_COMPOSITION_PERSON_NOT_FOUND', 'Family Composition Person not found');
        familyCompositionPerson.documents = documents;
        familyComposition.isInUse = true;
        yield familyComposition.save();
        return familyComposition;
    }
    catch (err) {
        throw err;
    }
});
exports.createDocuments = createDocuments;
const createSocialEspecifications = (socialEspecifications, familyCompositionID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const familyComposition = yield familyCompositionModel_1.familyCompositionModel.findById(familyCompositionID);
        if (!familyComposition)
            throw new error_1.CustomError('FAMILY_COMPOSITION_NOT_FOUND', 404, 'FAMILY_COMPOSITION_NOT_FOUND', 'Family Composition not found');
        familyComposition.socialEspecification = socialEspecifications;
        familyComposition.isInUse = true;
        familyComposition.save();
        return familyComposition;
    }
    catch (err) {
        throw err;
    }
});
exports.createSocialEspecifications = createSocialEspecifications;
const createFamilyCompositionObservation = (observation, familyCompositionID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const familyComposition = yield familyCompositionModel_1.familyCompositionModel.findById(familyCompositionID);
        if (!familyComposition)
            throw new error_1.CustomError('FAMILY_COMPOSITION_NOT_FOUND', 404, 'FAMILY_COMPOSITION_NOT_FOUND', 'Family Composition not found');
        familyComposition.observation.push(observation);
        familyComposition.isInUse = true;
        familyComposition.save();
        return familyComposition;
    }
    catch (err) {
        throw err;
    }
});
exports.createFamilyCompositionObservation = createFamilyCompositionObservation;
const getFamilyComposition = (familyCompositionID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const familyComposition = yield familyCompositionModel_1.familyCompositionModel.findById(familyCompositionID);
        if (!familyComposition)
            throw new error_1.CustomError('FAMILY_COMPOSITION_NOT_FOUND', 404, 'FAMILY_COMPOSITION_NOT_FOUND', 'Family Composition not found');
        return familyComposition;
    }
    catch (err) {
        throw err;
    }
});
exports.getFamilyComposition = getFamilyComposition;
const getAllFamilyComposition = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const familyComposition = yield familyCompositionModel_1.familyCompositionModel.find();
        return familyComposition;
    }
    catch (err) {
        throw err;
    }
});
exports.getAllFamilyComposition = getAllFamilyComposition;
