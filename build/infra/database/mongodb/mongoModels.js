"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
//const client:mongoose.Mongoose = MongooseClientSingleton.getInstance;
const FIVE_MINUTES = (60 * 15) * 5;
const codeSchema = new mongoose_1.default.Schema({
    code: {
        type: String,
        required: true
    },
    createdAt: { type: Date, expires: FIVE_MINUTES, default: Date.now, index: true },
    expireAt: {
        type: Date,
        expires: FIVE_MINUTES,
        default: Date.now
    }
});
codeSchema.index({ createdAt: 1 }, { expireAfterSeconds: FIVE_MINUTES });
exports.CodeModel = mongoose_1.default.model('Code', codeSchema);
