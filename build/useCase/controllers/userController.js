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
exports.UserController = void 0;
const user_1 = require("../../domain/entity/user");
const databaseService_1 = require("../../infra/database/databaseService");
const encryptService_1 = require("../../infra/encrypt/encryptService");
const error_1 = require("../../infra/error/error");
const smtpService_1 = require("../../infra/smtp/smtpService");
class UserController {
    getPersonReferencePhoto(photoId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.getPersonReferencePhoto(photoId);
            }
            catch (e) {
                throw e;
            }
        });
    }
    createHomeConditions(homeConditions, homeConditionsId) {
        try {
            const db = new databaseService_1.DatabaseService();
            return db.createHomeConditions(homeConditions, homeConditionsId);
        }
        catch (e) {
            throw e;
        }
    }
    createHomeConditionsObservation(observation, homeConditionsId) {
        try {
            const db = new databaseService_1.DatabaseService();
            return db.createHomeConditionsObservation(observation, homeConditionsId);
        }
        catch (e) {
            throw e;
        }
    }
    createEtnicalEspecifications(etnicalEspecifications, familyCompositionID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.createEtnicalEspecifications(etnicalEspecifications, familyCompositionID);
            }
            catch (e) {
                throw e;
            }
        });
    }
    createDocuments(documents, familyCompositionID, kinship) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.createDocuments(documents, familyCompositionID, kinship);
            }
            catch (e) {
                throw e;
            }
        });
    }
    createSocialEspecifications(socialEspecifications, familyCompositionID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.createSocialEspecifications(socialEspecifications, familyCompositionID);
            }
            catch (e) {
                throw e;
            }
        });
    }
    createFamilyCompositionObservation(observation, familyCompositionID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.createFamilyCompositionObservation(observation, familyCompositionID);
            }
            catch (e) {
                throw e;
            }
        });
    }
    createFamilyPerson(familyCompositionPerson, familyCompositionID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.createFamilyPerson(familyCompositionPerson, familyCompositionID);
            }
            catch (e) {
                throw e;
            }
        });
    }
    getFirstEntryInUnity(firstEntryInUnityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.getFirstEntryInUnity(firstEntryInUnityId);
            }
            catch (e) {
                throw e;
            }
        });
    }
    createFirstEntryInUnityObservation(firstEntryInUnityId, observation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.createFirstEntryInUnityObservation(firstEntryInUnityId, observation);
            }
            catch (e) {
                throw e;
            }
        });
    }
    firstEntryInUnity(firstEntry, firstEntryInUnityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.firstEntryInUnity(firstEntry, firstEntryInUnityId);
            }
            catch (e) {
                throw e;
            }
        });
    }
    getReferencePersonWithObservations(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.getReferencePersonWithObservations(id);
            }
            catch (e) {
                throw e;
            }
        });
    }
    getByIdReferencePerson(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.getByIdReferencePerson(id);
            }
            catch (e) {
                throw e;
            }
        });
    }
    listAllReferencePerson() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.listAllReferencePerson();
            }
            catch (e) {
                throw e;
            }
        });
    }
    createReferencePersonObservation(observations, referencePersonId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.createReferencePersonObservation(observations, referencePersonId);
            }
            catch (e) {
                throw e;
            }
        });
    }
    createReferencePerson(referencePerson) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                const rp = yield db.createReferencePerson(referencePerson);
                return rp;
            }
            catch (err) {
                throw err;
            }
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                return yield db.findByEmail(email);
            }
            catch (e) {
                throw e;
            }
        });
    }
    create(user, isAdm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = new databaseService_1.DatabaseService();
                const cryptoService = new encryptService_1.CryptoService();
                const hashPass = yield cryptoService.hashPass(user.password);
                const newUser = new user_1.User(user.id, user.fullName, user.email, hashPass, user.crm, user.role, user.createdAt, user.updatedAt, user.isActive);
                const userCreate = yield db.create(newUser, isAdm);
                if (userCreate != null) {
                    const smtp = new smtpService_1.SmtpService();
                    const email = yield smtp.sendGenericEmail('noreply@acdgbrasil.com.br', newUser.email, 'Cadastro Realizando com sucesso', 'Cadastro Realizando com sucesso, a senha da sua conta é padrão. Por favor altere a senha: ' + user.password);
                    if (!email)
                        throw new error_1.CustomError('Internal Server Error', 500, 'Internal Server Error', 'Error to send email');
                    return userCreate;
                }
                throw new error_1.CustomError('Internal Server Error', 500, 'Internal Server Error', 'Error to create user');
            }
            catch (e) {
                throw e;
            }
        });
    }
    delete(email) {
        throw new Error("Method not implemented.");
    }
}
exports.UserController = UserController;
