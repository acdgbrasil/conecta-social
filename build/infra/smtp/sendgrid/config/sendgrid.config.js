"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendGridConfig = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const sendGridConfig = (to, from, subject, text, html) => {
    mail_1.default.setApiKey('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');
    const info = {
        to: to,
        from: from,
        subject: subject,
        text: text,
        html: html
    };
    return info;
};
exports.sendGridConfig = sendGridConfig;
