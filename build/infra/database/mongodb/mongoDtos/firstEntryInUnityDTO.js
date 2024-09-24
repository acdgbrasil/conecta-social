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
exports.createFirstEntryInUnityObservation = exports.getFirstEntryInUnity = exports.createFirstEntryInUnity = void 0;
const error_1 = require("../../../error/error");
const firstEntryInUnityModel_1 = require("../models/firstEntryInUnityModel");
const createFirstEntryInUnity = (firstEntry, firstEntryInUnityId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const firstEntryResult = yield firstEntryInUnityModel_1.firstEntryInUnityModel.findOneAndUpdate({ _id: firstEntryInUnityId }, {
            firstEntryInUnity: firstEntry.firstEntryInUnity,
            motivationForFirstEntry: firstEntry.motivationForFirstEntry,
            nameOfUnityToSendFirstEntry: firstEntry.nameOfUnityToSendFirstEntry,
            ContactEmailOfUnityToSendFirstEntry: firstEntry.ContactEmailOfUnityToSendFirstEntry,
            familyBenefits: firstEntry.familyBenefits,
            isInUse: firstEntry.isInUse,
            updatedAt: Date.now(),
            whoIsResponsibleForFirstEntryId: firstEntry.whoIsResponsibleForFirstEntryId,
        }, { new: true });
        if (!firstEntryResult) {
            throw new error_1.CustomError('FIRST_ENTRY_NOT_FOUND', 404, 'FIRST_ENTRY_NOT_FOUND', 'First Entry not found');
        }
        firstEntryResult.save();
        return firstEntryResult.toObject();
    }
    catch (e) {
        throw e;
    }
});
exports.createFirstEntryInUnity = createFirstEntryInUnity;
const getFirstEntryInUnity = (firstEntryInUnityId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const firstEntryResult = yield firstEntryInUnityModel_1.firstEntryInUnityModel.findOne({ _id: firstEntryInUnityId });
        if (!firstEntryResult) {
            throw new error_1.CustomError('FIRST_ENTRY_NOT_FOUND', 404, 'FIRST_ENTRY_NOT_FOUND', 'First Entry not found');
        }
        return firstEntryResult.toObject();
    }
    catch (e) {
        throw e;
    }
});
exports.getFirstEntryInUnity = getFirstEntryInUnity;
const createFirstEntryInUnityObservation = (firstEntryInUnityId, observation) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const firstEntryResult = yield firstEntryInUnityModel_1.firstEntryInUnityModel.findById(firstEntryInUnityId);
        if (!firstEntryResult) {
            throw new error_1.CustomError('FIRST_ENTRY_NOT_FOUND', 404, 'FIRST_ENTRY_NOT_FOUND', 'First Entry not found');
        }
        (_a = firstEntryResult.observations) === null || _a === void 0 ? void 0 : _a.push(observation);
        firstEntryResult.save();
        return firstEntryResult;
    }
    catch (e) {
        throw e;
    }
});
exports.createFirstEntryInUnityObservation = createFirstEntryInUnityObservation;
