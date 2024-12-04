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
exports.createReferencePerson = exports.createReferencePersonObservation = exports.listAllReferencePerson = exports.getByIdReferencePerson = void 0;
const familyComposition_1 = require("../../../../domain/entity/familyComposition");
const familySituationViolation_1 = require("../../../../domain/entity/familySituationViolation");
const error_1 = require("../../../error/error");
const familyCompositionModel_1 = require("../models/familyCompositionModel");
const familyPhotoModel_1 = require("../models/familyPhotoModel");
const familySituationViolenceModel_1 = require("../models/familySituationViolenceModel");
const firstEntryInUnityModel_1 = require("../models/firstEntryInUnityModel");
const homeConditionsModel_1 = require("../models/homeConditionsModel");
const referencePersonModel_1 = require("../models/referencePersonModel");
const workConditionModel_1 = require("../models/workConditionModel");
const getByIdReferencePerson = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const referencePerson = yield referencePersonModel_1.referencePersonModel.findById(id);
        return referencePerson;
    }
    catch (error) {
        throw error;
    }
});
exports.getByIdReferencePerson = getByIdReferencePerson;
const listAllReferencePerson = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const referencePerson = yield referencePersonModel_1.referencePersonModel.find();
        return referencePerson;
    }
    catch (error) {
        throw error;
    }
});
exports.listAllReferencePerson = listAllReferencePerson;
const createReferencePersonObservation = (observations, referencePersonId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const getReferencePerson = yield referencePersonModel_1.referencePersonModel.findById(referencePersonId);
        if (!getReferencePerson) {
            throw new error_1.CustomError('REFERENCE_PERSON_NOT_FOUND', 404, 'REFERENCE_PERSON_NOT_FOUND', 'Reference Person not found');
        }
        (_a = getReferencePerson.observations) === null || _a === void 0 ? void 0 : _a.push(observations);
        yield getReferencePerson.save();
        return getReferencePerson;
    }
    catch (error) {
        throw error;
    }
});
exports.createReferencePersonObservation = createReferencePersonObservation;
const createReferencePerson = (rp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _referencePerson = yield referencePersonModel_1.referencePersonModel.findOne({ cpf: rp.cpf });
        if (_referencePerson) {
            throw new error_1.CustomError('CPF_ALREADY_EXISTS', 400, 'CPF_ALREADY_EXISTS', 'CPF already exists');
        }
        const familyPhoto = yield familyPhotoModel_1.familyPhotoModel.create({
            fileBuffer: rp.familyPhoto.fileBuffer,
            fileExtension: rp.familyPhoto.fileExtension
        });
        const familyComposition = yield familyCompositionModel_1.familyCompositionModel.create({});
        const documents = new familyComposition_1.Documents(false, false, false, false, false);
        const familyCompositionReferencePerson = new familyComposition_1.FamilyCompositionPerson(rp.fullName, rp.birthDate, rp.biologicalGender, true, documents, 1);
        familyComposition.familyCompositionPerson.push(familyCompositionReferencePerson);
        familyComposition.save();
        const fistEntryInUnity = yield firstEntryInUnityModel_1.firstEntryInUnityModel.create({});
        const homeCondition = yield homeConditionsModel_1.homeConditionsModel.create({});
        const workCondition = yield workConditionModel_1.WorkConditionModel.create({});
        const childLabel = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const sexualExploitation = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const sexualAbuse = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const physicalAbuse = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const psychologicalAbuse = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const elderNeglect = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const childNeglect = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const pcdNeglect = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const homelessSituation = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const humanTrafficking = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const violenceWithElderOrPcd = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false };
        const other = { thisSituationOcurrent: false, thisSituationsOcurrentNow: false, nameOfSituation: '' };
        const familyViolation = new familySituationViolation_1.FamilySituationViolation(childLabel, sexualExploitation, sexualAbuse, physicalAbuse, psychologicalAbuse, elderNeglect, childNeglect, pcdNeglect, homelessSituation, humanTrafficking, violenceWithElderOrPcd, other, false);
        const familySituationViolation = yield familySituationViolenceModel_1.familySituationViolenceModel.create(familyViolation);
        const referencePerson = yield referencePersonModel_1.referencePersonModel.create({
            fullName: rp.fullName,
            socialName: rp.socialName,
            adress: rp.adress,
            adressComplement: rp.adressComplement,
            adressNumber: rp.adressNumber,
            cep: rp.cep,
            city: rp.city,
            cpf: rp.cpf,
            diagnosis: rp.diagnosis,
            familyPhoto: familyPhoto.id,
            isShelter: rp.isShelter,
            localLocalization: rp.localLocalization,
            motherName: rp.motherName,
            neighborhood: rp.neighborhood,
            nis: rp.nis,
            phone: rp.phone,
            rg: rp.rg,
            state: rp.state,
            whoIsOpeningId: rp.whoIsOpeningId,
            fistEntryInUnityId: fistEntryInUnity.id,
            familyCompositionId: familyComposition.id,
            birthDate: rp.birthDate,
            biologicalGender: rp.biologicalGender,
            homeConditionsId: homeCondition.id,
            workConditionId: workCondition.id,
            familySituationViolationId: familySituationViolation.id
        });
        return referencePerson;
    }
    catch (error) {
        throw error;
    }
});
exports.createReferencePerson = createReferencePerson;
