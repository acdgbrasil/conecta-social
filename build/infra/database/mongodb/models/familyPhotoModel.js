"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.familyPhotoModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const familyPhoto = new mongoose_1.default.Schema({
    fileBuffer: {
        type: Buffer,
        required: true
    },
    fileExtension: {
        type: String,
        required: true,
    }
});
exports.familyPhotoModel = mongoose_1.default.model('familyPhoto', familyPhoto);
