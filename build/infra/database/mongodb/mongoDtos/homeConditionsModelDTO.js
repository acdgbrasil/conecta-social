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
exports.createHomeConditionsObservation = exports.createHomeConditionsdDTO = void 0;
const homeConditionsModel_1 = require("../models/homeConditionsModel");
const createHomeConditionsdDTO = (hc, homeConditionsId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const homeConditions = yield homeConditionsModel_1.homeConditionsModel.findById(homeConditionsId);
        if (!homeConditions) {
            throw new Error('HOME_CONDITIONS_NOT_FOUND');
        }
        homeConditions.typeResidence = hc.typeResidence;
        homeConditions.materialOfExternalWalls = hc.materialOfExternalWalls;
        homeConditions.hasAcessEnergy = hc.hasAcessEnergy;
        homeConditions.waterSupply = hc.waterSupply;
        homeConditions.sewageDisposal = hc.sewageDisposal;
        homeConditions.garbageCollection = hc.garbageCollection;
        homeConditions.hasWasteCollection = hc.hasWasteCollection;
        homeConditions.homeConditionIsInRiskArea = hc.homeConditionIsInRiskArea;
        homeConditions.difficultyToAccessHome = hc.difficultyToAccessHome;
        homeConditions.hasHomeInsurance = hc.hasHomeInsurance;
        homeConditions.hasHomeInsuranceValue = hc.hasHomeInsuranceValue;
        homeConditions.numberOfRooms = hc.numberOfRooms;
        homeConditions.numberOfBedrooms = hc.numberOfBedrooms;
        homeConditions.numberOfPeapleInBedrooms = hc.numberOfPeapleInBedrooms;
        homeConditions.isInUse = true;
        yield homeConditions.save();
        return homeConditions.toObject();
    }
    catch (e) {
        throw e;
    }
});
exports.createHomeConditionsdDTO = createHomeConditionsdDTO;
const createHomeConditionsObservation = (observation, homeConditionsId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const homeConditions = yield homeConditionsModel_1.homeConditionsModel.findById(homeConditionsId);
        if (!homeConditions) {
            throw new Error('HOME_CONDITIONS_NOT_FOUND');
        }
        (_a = homeConditions.observations) === null || _a === void 0 ? void 0 : _a.push(observation);
        yield homeConditions.save();
        return homeConditions.toObject();
    }
    catch (e) {
        throw e;
    }
});
exports.createHomeConditionsObservation = createHomeConditionsObservation;
