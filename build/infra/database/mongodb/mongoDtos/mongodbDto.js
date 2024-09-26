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
exports.deleteCode = exports.findCode = exports.createCode = exports.testConnection = exports.connectionMongose = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongooseClientSingleton_1 = require("../mongooseClientSingleton");
const mongoModels_1 = require("../mongoModels");
const connectionMongose = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield mongoose_1.default.connect('mongodb+srv://gabrieladeraldo:tomate98@cluster0.rp1kbki.mongodb.net/conecta-social');
        return client;
    }
    catch (error) {
        console.log('Error to connect MongoDB', error);
    }
});
exports.connectionMongose = connectionMongose;
const testConnection = () => {
    const client = mongooseClientSingleton_1.MongooseClientSingleton.getInstance;
    if (client && client.connection.readyState === 1) {
        console.log('Mongose is connected');
    }
};
exports.testConnection = testConnection;
const createCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expiredCode = mongoModels_1.CodeModel.create({ code: code });
        return expiredCode;
    }
    catch (error) {
        throw new Error('Error to create code');
    }
});
exports.createCode = createCode;
const findCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expiredCode = yield mongoModels_1.CodeModel.findOne({
            code: code
        });
        return expiredCode;
    }
    catch (error) {
        throw new Error('Error to find code');
    }
});
exports.findCode = findCode;
const deleteCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expiredCode = yield mongoModels_1.CodeModel.deleteOne({
            code: code
        });
        return expiredCode;
    }
    catch (error) {
        throw new Error('Error to delete code');
    }
});
exports.deleteCode = deleteCode;
