"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.observation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.observation = new mongoose_1.default.Schema({
    observation: {
        required: true,
        type: String
    },
    whoIsObservingId: {
        required: true,
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
});
