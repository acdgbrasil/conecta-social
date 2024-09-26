"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rg = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.rg = new mongoose_1.default.Schema({
    issueDate: {
        type: String,
        required: true
    },
    issuingBody: {
        type: String,
        required: true
    },
    number: {
        required: true,
        type: String
    },
    uf: {
        required: true,
        type: String
    }
});
