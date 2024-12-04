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
exports.DatabaseService = void 0;
const error_1 = require("../error/error");
const postgressDTO_1 = require("../database/postgress/postgressDTO");
const mongodbDto_1 = require("./mongodb/mongoDtos/mongodbDto");
const personReferenceDTO_1 = require("./mongodb/mongoDtos/personReferenceDTO");
const firstEntryInUnityDTO_1 = require("./mongodb/mongoDtos/firstEntryInUnityDTO");
const familyCompositionDto_1 = require("./mongodb/mongoDtos/familyCompositionDto");
const homeConditionsModelDTO_1 = require("./mongodb/mongoDtos/homeConditionsModelDTO");
const photoFamilyDto_1 = require("./mongodb/mongoDtos/photoFamilyDto");
const workConditionDto_1 = require("./mongodb/mongoDtos/workConditionDto");
const familySituationViolenceDTO_1 = require("./mongodb/mongoDtos/familySituationViolenceDTO");
class DatabaseService {
    createSituationViolation(situationViolation, familySituationId) {
        try {
            const familySituation = (0, familySituationViolenceDTO_1.familySituationViolenceDTO)(familySituationId, situationViolation);
            return familySituation;
        }
        catch (e) {
            throw e;
        }
    }
    createWorkConditionPerson(workCondition, workConditionPerson, familyCompositionID, personId, workConditionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workConditionResult = yield (0, workConditionDto_1.createWorkConditionPersonDto)(workCondition, workConditionPerson, familyCompositionID, personId, workConditionId);
                return workConditionResult;
            }
            catch (e) {
                throw e;
            }
        });
    }
    getPersonReferencePhoto(photoId) {
        try {
            const photo = (0, photoFamilyDto_1.getPersonReferencePhotoDto)(photoId);
            return photo;
        }
        catch (e) {
            throw e;
        }
    }
    createHomeConditions(homeConditions, homeConditionsId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const familyComposition = yield (0, homeConditionsModelDTO_1.createHomeConditionsdDTO)(homeConditions, homeConditionsId);
                return familyComposition;
            }
            catch (e) {
                throw e;
            }
        });
    }
    createHomeConditionsObservation(observation, homeConditionsId) {
        try {
            const familyComposition = (0, homeConditionsModelDTO_1.createHomeConditionsObservation)(observation, homeConditionsId);
            return familyComposition;
        }
        catch (e) {
            throw e;
        }
    }
    createEtnicalEspecifications(etnicalEspecifications, familyCompositionID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const familyComposition = yield (0, familyCompositionDto_1.createEtnicalEspecifications)(etnicalEspecifications, familyCompositionID);
                return familyComposition;
            }
            catch (e) {
                throw e;
            }
        });
    }
    createDocuments(documents, familyCompositionID, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const familyComposition = yield (0, familyCompositionDto_1.createDocuments)(documents, familyCompositionID, id);
                return familyComposition;
            }
            catch (e) {
                throw e;
            }
        });
    }
    createSocialEspecifications(socialEspecifications, familyCompositionID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const familyComposition = yield (0, familyCompositionDto_1.createSocialEspecifications)(socialEspecifications, familyCompositionID);
                return familyComposition;
            }
            catch (e) {
                throw e;
            }
        });
    }
    createFamilyCompositionObservation(observation, familyCompositionID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const observationResult = yield (0, familyCompositionDto_1.createFamilyCompositionObservation)(observation, familyCompositionID);
                return observationResult;
            }
            catch (e) {
                throw e;
            }
        });
    }
    createFamilyPerson(familyCompositionPerson, familyCompositionID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const familyComposition = yield (0, familyCompositionDto_1.createFamilyPerson)(familyCompositionPerson, familyCompositionID);
                return familyComposition;
            }
            catch (e) {
                throw e;
            }
        });
    }
    getFirstEntryInUnity(firstEntryInUnityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const firstEntry = yield (0, firstEntryInUnityDTO_1.getFirstEntryInUnity)(firstEntryInUnityId);
                return firstEntry;
            }
            catch (e) {
                throw e;
            }
        });
    }
    createFirstEntryInUnityObservation(firstEntryInUnityId, observation) {
        try {
            const firstEntry = (0, firstEntryInUnityDTO_1.createFirstEntryInUnityObservation)(firstEntryInUnityId, observation);
            return firstEntry;
        }
        catch (e) {
            throw e;
        }
    }
    firstEntryInUnity(firstEntry, firstEntryInUnityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const firstEntryResult = yield (0, firstEntryInUnityDTO_1.createFirstEntryInUnity)(firstEntry, firstEntryInUnityId);
                return firstEntryResult;
            }
            catch (e) {
                throw e;
            }
        });
    }
    getReferencePersonWithObservations(id) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    getByIdReferencePerson(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const referencePerson = yield (0, personReferenceDTO_1.getByIdReferencePerson)(id);
                if (!referencePerson) {
                    return new error_1.CustomError('REFERENCE_PERSON_NOT_FOUND', 404, 'REFERENCE_PERSON_NOT_FOUND', 'Reference Person not found');
                }
                return referencePerson;
            }
            catch (err) {
                throw err;
            }
        });
    }
    listAllReferencePerson() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const referencePersons = yield (0, personReferenceDTO_1.listAllReferencePerson)();
                return referencePersons;
            }
            catch (err) {
                throw err;
            }
        });
    }
    createReferencePersonObservation(observations, referencePersonId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Observations = yield (0, personReferenceDTO_1.createReferencePersonObservation)(observations, referencePersonId);
                return observations;
            }
            catch (err) {
                throw err;
            }
        });
    }
    createReferencePerson(referencePerson) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rp = yield (0, personReferenceDTO_1.createReferencePerson)(referencePerson);
                return rp;
            }
            catch (err) {
                throw err;
            }
        });
    }
    deactivateUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield (0, postgressDTO_1.deactivateUser)(email);
                return !users.isActive;
            }
            catch (err) {
                throw err;
            }
        });
    }
    listAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield (0, postgressDTO_1.listAllUsers)();
                return users;
            }
            catch (err) {
                throw err;
            }
        });
    }
    resetPassword(email, code, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hasCode = yield (0, mongodbDto_1.findCode)(code);
                console.log(hasCode);
                if (!hasCode) {
                    throw new error_1.CustomError('CODE_NOT_FOUND', 404, 'CODE_NOT_FOUND', 'Code not found');
                }
                const newUser = yield (0, postgressDTO_1.changePassword)(email, newPassword);
                yield hasCode.deleteOne();
                return newUser;
            }
            catch (e) {
                throw e;
            }
        });
    }
    login(email, password) {
        throw new Error('Method not implemented.');
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield (0, postgressDTO_1.findByEmail)(email);
                if (user === false) {
                    throw new error_1.CustomError('USER_NOT_FOUND', 404, 'USER_NOT_FOUND', 'User not found');
                }
                const code = Math.random().toString(36).substring(2, 7);
                const expiredCode = yield (0, mongodbDto_1.createCode)(code);
                return expiredCode.toJSON().code;
            }
            catch (e) {
                throw e;
            }
        });
    }
    create(user, isAdm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hasUser = yield (0, postgressDTO_1.findByEmail)(user.email);
                if (hasUser !== false) {
                    throw new error_1.CustomError('USER_ALREADY_EXISTS', 409, 'USER_ALREADY_EXISTS', 'User already exists');
                }
                if (isAdm) {
                    const createUser = yield (0, postgressDTO_1.createADM)(user);
                    return createUser;
                }
                else {
                    const createUser = yield (0, postgressDTO_1.create)(user);
                    return createUser;
                }
            }
            catch (e) {
                throw e;
            }
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield (0, postgressDTO_1.findByEmail)(email);
                if (user === false) {
                    throw new error_1.CustomError('USER_NOT_FOUND', 404, 'USER_NOT_FOUND', 'User not found');
                }
                return user;
            }
            catch (e) {
                throw e;
            }
        });
    }
    delete(email) {
        throw new Error('Method not implemented.');
    }
}
exports.DatabaseService = DatabaseService;
