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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../useCase/controllers/userController");
const user_1 = require("../../domain/entity/user");
const error_1 = require("../../infra/error/error");
const referencePerson_1 = require("../../domain/entity/referencePerson");
const multer_1 = __importDefault(require("multer"));
const observations_1 = require("../../domain/entity/observations");
const firstEntryInUnity_1 = require("../../domain/entity/firstEntryInUnity");
const familyComposition_1 = require("../../domain/entity/familyComposition");
const homeConditions_1 = require("../../domain/entity/homeConditions");
const workCondition_1 = require("../../domain/entity/workCondition");
const familySituationViolation_1 = require("../../domain/entity/familySituationViolation");
const uploads = (0, multer_1.default)();
const userRouter = (0, express_1.Router)();
const userControle = new userController_1.UserController();
userRouter.post('/create/violence/situation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { childLabel, childLabelOcurrentNow, sexualExploitation, sexualExploitationOcurrentNow, sexualAbuse, sexualAbuseNow, physicalAbuse, physicalAbuseNow, psychologicalAbuse, psychologicalAbuseNow, elderNeglect, elderNeglectNow, childNeglect, childNeglectNow, pcdNeglect, pcdNeglectNow, homelessSituation, homelessSituationNow, humanTrafficking, humanTraffickingNow, violenceWithElderOrPcd, violenceWithElderOrPcdNow, otherName, otherNow, otherBool, violenceId } = req.body;
        if (!violenceId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Violence Id is required');
            return res.status(400).json(error.toJson('Violence Id is required'));
        }
        if (!(typeof childLabel == "boolean") || childLabel == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Child Label is required');
            return res.status(400).json(error.toJson('Child Label is required'));
        }
        if (!(typeof childLabelOcurrentNow == "boolean") || childLabelOcurrentNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Child Label Ocurrent Now is required');
            return res.status(400).json(error.toJson('Child Label Ocurrent Now is required'));
        }
        if (!(typeof sexualExploitation == "boolean") || sexualExploitation == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Sexual Exploitation is required');
            return res.status(400).json(error.toJson('Sexual Exploitation is required'));
        }
        if (!(typeof sexualExploitationOcurrentNow == "boolean") || sexualExploitationOcurrentNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Sexual Exploitation Ocurrent Now is required');
            return res.status(400).json(error.toJson('Sexual Exploitation Ocurrent Now is required'));
        }
        if (!(typeof sexualAbuse == "boolean") || sexualAbuse == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Sexual Abuse is required');
            return res.status(400).json(error.toJson('Sexual Abuse is required'));
        }
        if (!(typeof sexualAbuseNow == "boolean") || sexualAbuseNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Sexual Abuse Now is required');
            return res.status(400).json(error.toJson('Sexual Abuse Now is required'));
        }
        if (!(typeof physicalAbuse == "boolean") || physicalAbuse == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Physical Abuse is required');
            return res.status(400).json(error.toJson('Physical Abuse is required'));
        }
        if (!(typeof physicalAbuseNow == "boolean") || physicalAbuseNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Physical Abuse Now is required');
            return res.status(400).json(error.toJson('Physical Abuse Now is required'));
        }
        if (!(typeof psychologicalAbuse == "boolean") || psychologicalAbuse == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Psychological Abuse is required');
            return res.status(400).json(error.toJson('Psychological Abuse is required'));
        }
        if (!(typeof psychologicalAbuseNow == "boolean") || psychologicalAbuseNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Psychological Abuse Now is required');
            return res.status(400).json(error.toJson('Psychological Abuse Now is required'));
        }
        if (!(typeof elderNeglect == "boolean") || elderNeglect == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Elder Neglect is required');
            return res.status(400).json(error.toJson('Elder Neglect is required'));
        }
        if (!(typeof elderNeglectNow == "boolean") || elderNeglectNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Elder Neglect Now is required');
            return res.status(400).json(error.toJson('Elder Neglect Now is required'));
        }
        if (!(typeof childNeglect == "boolean") || childNeglect == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Child Neglect is required');
            return res.status(400).json(error.toJson('Child Neglect is required'));
        }
        if (!(typeof childNeglectNow == "boolean") || childNeglectNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Child Neglect Now is required');
            return res.status(400).json(error.toJson('Child Neglect Now is required'));
        }
        if (!(typeof pcdNeglect == "boolean") || pcdNeglect == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Pcd Neglect is required');
            return res.status(400).json(error.toJson('Pcd Neglect is required'));
        }
        if (!(typeof pcdNeglectNow == "boolean") || pcdNeglectNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Pcd Neglect Now is required');
            return res.status(400).json(error.toJson('Pcd Neglect Now is required'));
        }
        if (!(typeof homelessSituation == "boolean") || homelessSituation == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Homeless Situation is required');
            return res.status(400).json(error.toJson('Homeless Situation is required'));
        }
        if (!(typeof homelessSituationNow == "boolean") || homelessSituationNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Homeless Situation Now is required');
            return res.status(400).json(error.toJson('Homeless Situation Now is required'));
        }
        if (!(typeof humanTrafficking == "boolean") || humanTrafficking == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Human Trafficking is required');
            return res.status(400).json(error.toJson('Human Trafficking is required'));
        }
        if (!(typeof humanTraffickingNow == "boolean") || humanTraffickingNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Human Trafficking Now is required');
            return res.status(400).json(error.toJson('Human Trafficking Now is required'));
        }
        if (!(typeof violenceWithElderOrPcd == "boolean") || violenceWithElderOrPcd == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Violence With Elder Or Pcd is required');
            return res.status(400).json(error.toJson('Violence With Elder Or Pcd is required'));
        }
        if (!(typeof violenceWithElderOrPcdNow == "boolean") || violenceWithElderOrPcdNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Violence With Elder Or Pcd Now is required');
            return res.status(400).json(error.toJson('Violence With Elder Or Pcd Now is required'));
        }
        if (!(typeof otherName == "string") || otherName == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Other Name is required');
            return res.status(400).json(error.toJson('Other Name is required'));
        }
        if (!(typeof otherNow == "boolean") || otherNow == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Other Now is required');
            return res.status(400).json(error.toJson('Other Now is required'));
        }
        if (!(typeof otherBool == "boolean") || otherBool == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Other Bool is required');
            return res.status(400).json(error.toJson('Other Bool is required'));
        }
        const childStruct = new familySituationViolation_1.FamilySituationViolationStruct(childLabel, childLabelOcurrentNow);
        const sexualExploitationStruct = new familySituationViolation_1.FamilySituationViolationStruct(sexualExploitation, sexualExploitationOcurrentNow);
        const sexualAbuseStruct = new familySituationViolation_1.FamilySituationViolationStruct(sexualAbuse, sexualAbuseNow);
        const physicalAbuseStruct = new familySituationViolation_1.FamilySituationViolationStruct(physicalAbuse, physicalAbuseNow);
        const psychologicalAbuseStruct = new familySituationViolation_1.FamilySituationViolationStruct(psychologicalAbuse, psychologicalAbuseNow);
        const elderNeglectStruct = new familySituationViolation_1.FamilySituationViolationStruct(elderNeglect, elderNeglectNow);
        const childNeglectStruct = new familySituationViolation_1.FamilySituationViolationStruct(childNeglect, childNeglectNow);
        const pcdNeglectStruct = new familySituationViolation_1.FamilySituationViolationStruct(pcdNeglect, pcdNeglectNow);
        const homelessSituationStruct = new familySituationViolation_1.FamilySituationViolationStruct(homelessSituation, homelessSituationNow);
        const humanTraffickingStruct = new familySituationViolation_1.FamilySituationViolationStruct(humanTrafficking, humanTraffickingNow);
        const violenceWithElderOrPcdStruct = new familySituationViolation_1.FamilySituationViolationStruct(violenceWithElderOrPcd, violenceWithElderOrPcdNow);
        const otherStruct = new familySituationViolation_1.FamilySituationViolationStructOther(otherBool, otherNow, otherName);
        const familySituation = new familySituationViolation_1.FamilySituationViolation(childStruct, sexualExploitationStruct, sexualAbuseStruct, physicalAbuseStruct, psychologicalAbuseStruct, elderNeglectStruct, childNeglectStruct, pcdNeglectStruct, homelessSituationStruct, humanTraffickingStruct, violenceWithElderOrPcdStruct, otherStruct, true);
        const familySituationCreated = yield userControle.createSituationViolation(familySituation, violenceId);
        return res.status(201).json(familySituationCreated);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            console.log(e);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.post('/create/work/condition', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hasSocialIncome, perCapitaIncome, bolsaFamiliaValue, bpcValue, petiValue, othersValue, bcpBenefitPerson, hasRetiredPerson, totalFamilyIncome, totalPerCapitaIncome, workConditionBody, hasWorkCard, workQualification, workValue, familyCompositionID, personId, workConditionId } = req.body;
        const workCondition = new workCondition_1.WorkCondition(hasSocialIncome, perCapitaIncome, hasSocialIncome, bolsaFamiliaValue, bpcValue, petiValue, othersValue, bcpBenefitPerson, hasRetiredPerson, totalFamilyIncome, totalPerCapitaIncome);
        const workConditionPerson = new familyComposition_1.WorkConditionPerson(true, workConditionBody, hasWorkCard, workQualification, workValue);
        const workConditionResult = yield userControle.createWorkConditionPerson(workCondition, workConditionPerson, familyCompositionID, personId, workConditionId);
        return res.status(201).json(workConditionResult);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.post('/create/home/conditions/observation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { observation, whoIsObservingId, homeConditionsId } = req.body;
        if (!observation) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if (!whoIsObservingId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if (!homeConditionsId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Home Conditions Id is required');
            return res.status(400).json(error.toJson('Home Conditions Id is required'));
        }
        const newObservation = new observations_1.Observations(observation, whoIsObservingId);
        const observationCreated = yield userControle.createHomeConditionsObservation(newObservation, homeConditionsId);
        return res.status(201).json(observationCreated);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.post('/create/home/conditions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { typeResidence, materialOfExternalWalls, hasAcessEnergy, waterSupply, sewageDisposal, garbageCollection, hasWasteCollection, homeConditionIsInRiskArea, difficultyToAccessHome, hasHomeInsurance, hasHomeInsuranceValue, numberOfRooms, numberOfBedrooms, numberOfPeapleInBedrooms, homeConditionsId } = req.body;
        if (typeResidence == "" || typeResidence == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Type Residence is required');
            return res.status(400).json(error.toJson('Type Residence is required'));
        }
        if (materialOfExternalWalls == "" || materialOfExternalWalls == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Material Of External Walls is required');
            return res.status(400).json(error.toJson('Material Of External Walls is required'));
        }
        if (hasAcessEnergy == "" || hasAcessEnergy == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Has Acess Energy is required');
            return res.status(400).json(error.toJson('Has Acess Energy is required'));
        }
        if (waterSupply == "" || waterSupply == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Water Supply is required');
            return res.status(400).json(error.toJson('Water Supply is required'));
        }
        if (sewageDisposal == "" || sewageDisposal == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Sewage Disposal is required');
            return res.status(400).json(error.toJson('Sewage Disposal is required'));
        }
        if (garbageCollection == "" || garbageCollection == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Garbage Collection is required');
            return res.status(400).json(error.toJson('Garbage Collection is required'));
        }
        if (!(typeof hasWasteCollection == "boolean") || hasWasteCollection == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Has Waste Collection is required');
            return res.status(400).json(error.toJson('Has Waste Collection is required'));
        }
        if (!(typeof homeConditionIsInRiskArea == "boolean") || homeConditionIsInRiskArea == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Home Condition Is In Risk Area is required');
            return res.status(400).json(error.toJson('Home Condition Is In Risk Area is required'));
        }
        if (!(typeof difficultyToAccessHome == "boolean") || difficultyToAccessHome == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Difficulty To Access Home is required');
            return res.status(400).json(error.toJson('Difficulty To Access Home is required'));
        }
        if (!(typeof hasHomeInsurance == "boolean") || hasHomeInsurance == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Has Home Insurance is required');
            return res.status(400).json(error.toJson('Has Home Insurance is required'));
        }
        if (hasHomeInsuranceValue == "" || hasHomeInsuranceValue == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Has Home Insurance Value is required');
            return res.status(400).json(error.toJson('Has Home Insurance Value is required'));
        }
        if (numberOfRooms == "" || numberOfRooms == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Number Of Rooms is required');
            return res.status(400).json(error.toJson('Number Of Rooms is required'));
        }
        if (numberOfBedrooms == "" || numberOfBedrooms == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Number Of Bedrooms is required');
            return res.status(400).json(error.toJson('Number Of Bedrooms is required'));
        }
        if (numberOfPeapleInBedrooms == "" || numberOfPeapleInBedrooms == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Number Of Peaple In Bedrooms is required');
            return res.status(400).json(error.toJson('Number Of Peaple In Bedrooms is required'));
        }
        if (homeConditionsId == "" || homeConditionsId == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Home Conditions Id is required');
            return res.status(400).json(error.toJson('Home Conditions Id is required'));
        }
        const homeConditions = new homeConditions_1.HomeConditions(typeResidence, materialOfExternalWalls, hasAcessEnergy, waterSupply, sewageDisposal, garbageCollection, hasWasteCollection, homeConditionIsInRiskArea, difficultyToAccessHome, hasHomeInsurance, hasHomeInsuranceValue, numberOfRooms, numberOfBedrooms, numberOfPeapleInBedrooms);
        const homeConditionsCreated = yield userControle.createHomeConditions(homeConditions, homeConditionsId);
        return res.status(201).json(homeConditionsCreated);
    }
    catch (e) {
        console.log(e);
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.post('/create/family/composition/observation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { observation, whoIsObservingId, familyCompositionID } = req.body;
        if (!observation) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if (!whoIsObservingId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if (!familyCompositionID) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Family Composition ID is required');
            return res.status(400).json(error.toJson('Family Composition ID is required'));
        }
        const newObservation = new observations_1.Observations(observation, whoIsObservingId);
        const observationCreated = yield userControle.createFamilyCompositionObservation(newObservation, familyCompositionID);
        return res.status(201).json(observationCreated);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.post('/create/etinical/documents', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { document, familyCompositionID, personId } = req.body;
        if (!familyCompositionID) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Family Composition ID is required');
            return res.status(400).json(error.toJson('Family Composition ID is required'));
        }
        if (!personId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Kinship is required');
            return res.status(400).json(error.toJson('Kinship is required'));
        }
        const documents = new familyComposition_1.Documents(document[0], document[1], document[2], document[3], document[4]);
        const familyComposition = yield userControle.createDocuments(documents, familyCompositionID, personId);
        return res.status(201).json(familyComposition);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.post('/create/etnical/especifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { etnicalEspecifications, familyCompositionID } = req.body;
        if (!etnicalEspecifications) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Etnical Especifications is required');
            return res.status(400).json(error.toJson('Etnical Especifications is required'));
        }
        if (!familyCompositionID) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Family Composition ID is required');
            return res.status(400).json(error.toJson('Family Composition ID is required'));
        }
        const familyComposition = yield userControle.createEtnicalEspecifications(etnicalEspecifications, familyCompositionID);
        return res.status(201).json(familyComposition);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.post('/create/family/person', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, birthDate, biologicalGender, kinship, personWithDisabilities, familyPersonId } = req.body;
        if (!fullname) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
            return res.status(400).json(error.toJson('Full Name is required'));
        }
        if (!birthDate) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Birth Date is required');
            return res.status(400).json(error.toJson('Birth Date is required'));
        }
        if (!biologicalGender) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'biologicalGender is required');
            return res.status(400).json(error.toJson('biologicalGender is required'));
        }
        if (!kinship) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Kinship is required');
            return res.status(400).json(error.toJson('Kinship is required'));
        }
        if (!familyPersonId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Family Person Id is required');
            return res.status(400).json(error.toJson('Family Person Id is required'));
        }
        if (!(typeof personWithDisabilities == "boolean") || personWithDisabilities == null) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Person With Disabilities is required');
            return res.status(400).json(error.toJson('Person With Disabilities is required'));
        }
        const documents = new familyComposition_1.Documents(false, false, false, false, false);
        const dateArray = birthDate.split('/');
        const date = new Date(dateArray[2], dateArray[1], dateArray[0]);
        const familyCompositionPerson = new familyComposition_1.FamilyCompositionPerson(fullname, date, biologicalGender, personWithDisabilities, documents, kinship);
        const familyPerson = yield userControle.createFamilyPerson(familyCompositionPerson, familyPersonId);
        return res.status(201).json(familyPerson);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.get('/list/first/entry/in/unity/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'First Entry In Unity Id is required');
            return res.status(400).json(error.toJson('First Entry In Unity Id is required'));
        }
        const firstEntryInUnity = yield userControle.getFirstEntryInUnity(id);
        return res.status(200).json(firstEntryInUnity);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.post('/create/first/entry/observation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { observation, whoIsObservingId, firstEntryInUnityId } = req.body;
        if (!observation) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if (!whoIsObservingId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if (!firstEntryInUnityId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'First Entry In Unity Id is required');
            return res.status(400).json(error.toJson('First Entry In Unity Id is required'));
        }
        const newObservation = new observations_1.Observations(observation, whoIsObservingId);
        const observationCreated = yield userControle.createFirstEntryInUnityObservation(firstEntryInUnityId, newObservation);
        return res.status(201).json(observationCreated);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.post('/create/first/entry/in/unity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstEntryInUnity, motivationForFirstEntry, nameOfUnityToSendFirstEntry, ContactEmailOfUnityToSendFirstEntry, familyBenefits, whoIsResponsibleForFirstEntryId, firstEntryInUnityID } = req.body;
        if (!firstEntryInUnity) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'First Entry In Unity is required');
            return res.status(400).json(error.toJson('First Entry In Unity is required'));
        }
        if (!motivationForFirstEntry) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Motivation For First Entry is required');
            return res.status(400).json(error.toJson('Motivation For First Entry is required'));
        }
        if (!nameOfUnityToSendFirstEntry) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Name Of Unity To Send First Entry is required');
            return res.status(400).json(error.toJson('Name Of Unity To Send First Entry is required'));
        }
        if (!ContactEmailOfUnityToSendFirstEntry) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Contact Email Of Unity To Send First Entry is required');
            return res.status(400).json(error.toJson('Contact Email Of Unity To Send First Entry is required'));
        }
        if (!familyBenefits) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Family Benefits is required');
            return res.status(400).json(error.toJson('Family Benefits is required'));
        }
        if (!whoIsResponsibleForFirstEntryId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Who Is Responsible For First Entry Id is required');
            return res.status(400).json(error.toJson('Who Is Responsible For First Entry Id is required'));
        }
        if (!firstEntryInUnityID) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'First Entry In Unity ID is required');
            return res.status(400).json(error.toJson('First Entry In Unity ID is required'));
        }
        const newFirstEntryInUnity = new firstEntryInUnity_1.FirstEntryInUnity(firstEntryInUnity, motivationForFirstEntry, familyBenefits, true, new Date(), new Date(), nameOfUnityToSendFirstEntry, ContactEmailOfUnityToSendFirstEntry, firstEntryInUnity);
        const firstEntryInUnityCreated = yield userControle.firstEntryInUnity(newFirstEntryInUnity, firstEntryInUnityID);
        return res.status(201).json(firstEntryInUnityCreated);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
userRouter.get('/list/reference/person/observation/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const referencePerson = yield userControle.getReferencePersonWithObservations(id);
        return res.status(200).json(referencePerson);
    }
    catch (err) {
        return res.status(500).json(err);
    }
}));
userRouter.get('/list/reference/person/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const referencePerson = yield userControle.getByIdReferencePerson(id);
        return res.status(200).json(referencePerson);
    }
    catch (err) {
        return res.status(500).json(err);
    }
}));
userRouter.get('/list/reference/person', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const referencePerson = yield userControle.listAllReferencePerson();
        return res.status(200).json(referencePerson);
    }
    catch (err) {
        return res.status(500).json(err);
    }
}));
userRouter.get('/list/reduced/reference/person', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const referencePerson = yield userControle.listAllReducedReferencePerson();
        return res.status(200).json(referencePerson);
    }
    catch (err) {
        return res.status(500).json(err);
    }
}));
userRouter.post('/create/reference/person/observation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { observation, whoIsObservingId, referencePersonId } = req.body;
    try {
        if (!observation) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Observation is required');
            return res.status(400).json(error.toJson('Observation is required'));
        }
        if (!whoIsObservingId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if (!referencePersonId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Reference Person Id is required');
            return res.status(400).json(error.toJson('Reference Person Id is required'));
        }
        const newObservation = new observations_1.Observations(observation, whoIsObservingId);
        const observationCreated = yield userControle.createReferencePersonObservation(newObservation, referencePersonId);
        return res.status(201).json(observationCreated);
    }
    catch (err) {
        return res.status(500).json(err);
    }
}));
userRouter.post('/create/reference/person', uploads.single('photo'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { fullName, socialName, motherName, cpf, nis, diagnosis, rgNumber, rgUf, rgIssue, rgDateIssue, isShelter, localLocalization, cep, adress, neighborhood, adressNumber, adressComplement, state, city, phone, whoIsObservingId, birthDate, biologicalGender } = req.body;
        const fileBuffer = (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer;
        const fileExtension = (_b = req.file) === null || _b === void 0 ? void 0 : _b.mimetype.split('/')[1];
        if (!fileBuffer) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Photo is required');
            return res.status(400).json(error.toJson('Photo is required'));
        }
        if (!birthDate) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Birth Date is required');
            return res.status(400).json(error.toJson('Birth Date is required'));
        }
        if (!biologicalGender) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'biologicalGender is required');
            return res.status(400).json(error.toJson('biologicalGender is required'));
        }
        if (!whoIsObservingId) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Who Is Observing Id is required');
            return res.status(400).json(error.toJson('Who Is Observing Id is required'));
        }
        if (!fullName) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
            return res.status(400).json(error.toJson('Full Name is required'));
        }
        if (!socialName) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Social Name is required');
            return res.status(400).json(error.toJson('Social Name is required'));
        }
        if (!motherName) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Mother Name is required');
            return res.status(400).json(error.toJson('Mother Name is required'));
        }
        if (!cpf) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Cpf is required');
            return res.status(400).json(error.toJson('Cpf is required'));
        }
        if (!diagnosis) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Diagnosis is required');
            return res.status(400).json(error.toJson('Diagnosis is required'));
        }
        if (!rgNumber) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Rg Number is required');
            return res.status(400).json(error.toJson('Rg Number is required'));
        }
        if (!rgUf) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Rg Uf is required');
            return res.status(400).json(error.toJson('Rg Uf is required'));
        }
        if (!rgIssue) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Rg Issue is required');
            return res.status(400).json(error.toJson('Rg Issue is required'));
        }
        if (!rgDateIssue) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Rg Date Issue is required');
            return res.status(400).json(error.toJson('Rg Date Issue is required'));
        }
        if (!isShelter) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Is Shelter is required');
            return res.status(400).json(error.toJson('Is Shelter is required'));
        }
        if (!localLocalization) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Local Localization is required');
            return res.status(400).json(error.toJson('Local Localization is required'));
        }
        if (!adress) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Adress is required');
            return res.status(400).json(error.toJson('Adress is required'));
        }
        if (!neighborhood) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Neighborhood is required');
            return res.status(400).json(error.toJson('Neighborhood is required'));
        }
        if (!adressNumber) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Adress Number is required');
            return res.status(400).json(error.toJson('Adress Number is required'));
        }
        if (!adressComplement) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Adress Complement is required');
            return res.status(400).json(error.toJson('Adress Complement is required'));
        }
        if (!state) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'State is required');
            return res.status(400).json(error.toJson('State is required'));
        }
        if (!city) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'City is required');
            return res.status(400).json(error.toJson('City is required'));
        }
        if (!phone) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Phone is required');
            return res.status(400).json(error.toJson('Phone is required'));
        }
        if (!fileExtension) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'File Extension is required');
            return res.status(400).json(error.toJson('File Extension is required'));
        }
        const birthDateFormatted = new Date(birthDate);
        const newReferencePerson = new referencePerson_1.ReferencePerson('0', fullName, socialName, motherName, nis, cpf, diagnosis, rgNumber, biologicalGender, rgUf, rgIssue, rgDateIssue, isShelter, localLocalization, cep, adress, neighborhood, adressNumber, adressComplement, state, city, phone, fileBuffer, fileExtension, birthDateFormatted, whoIsObservingId);
        const referencePerson = yield userControle.createReferencePerson(newReferencePerson);
        return res.status(201).json(referencePerson);
    }
    catch (err) {
        return res.status(500).json(err);
    }
}));
userRouter.post('/create/adm', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, fullName, admEmail } = req.body;
        const superAdmEmail = process.env.SUPER_ADM_EMAIL;
        const isSuperAdm = superAdmEmail === admEmail;
        if (!isSuperAdm) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'You are not allowed to create a new adm');
            return res.status(400).json(error.toJson('You are not allowed to create a new adm'));
        }
        if (!email) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Email is required');
            return res.status(400).json(error.toJson('Email is required'));
        }
        if (!fullName) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
            return res.status(400).json(error.toJson('Full Name is required'));
        }
        const newUser = new user_1.User(0, fullName, email, 'Senh@123', null, 'adm', new Date(), new Date(), true);
        const user = yield userControle.create(newUser, true);
        return res.status(201).json(user);
    }
    catch (e) {
        return res.status(500).json(e);
    }
}));
userRouter.post('/create/user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { admEmail, email, fullName, crm } = req.body;
        if (!email) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Email is required');
            return res.status(400).json(error.toJson('Email is required'));
        }
        if (!fullName) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Full Name is required');
            return res.status(400).json(error.toJson('Full Name is required'));
        }
        if (!crm) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Crm is required');
            return res.status(400).json(error.toJson('Crm is required'));
        }
        const isAdm = (yield userControle.findByEmail(admEmail)).role === 'admin';
        if (!isAdm) {
            const error = new error_1.CustomError('Bad Request', 400, 'Bad Request', 'You are not allowed to create a new user');
            return res.status(400).json(error.toJson('You are not allowed to create a new user'));
        }
        const newUser = new user_1.User(0, fullName, email, 'Senh@123', crm, 'user', new Date(), new Date(), true);
        const user = yield userControle.create(newUser, false);
        return res.status(201).json(user);
    }
    catch (e) {
        return res.status(500).json(e);
    }
}));
exports.default = userRouter;
