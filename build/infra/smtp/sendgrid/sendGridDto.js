"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendGenericEmail = sendGenericEmail;
const sendgrid_config_1 = require("./config/sendgrid.config");
const mail_1 = __importDefault(require("@sendgrid/mail"));
function sendGenericEmail(from, to, subject, text, html) {
    try {
        const info = (0, sendgrid_config_1.sendGridConfig)(to, from, subject, text, html);
        return new Promise((resolve, reject) => {
            var _a;
            mail_1.default.send({
                from: info.from,
                to: info.to,
                subject: info.subject,
                text: (_a = info.text) !== null && _a !== void 0 ? _a : "",
                html: info.html,
            }).then((res) => {
                return resolve(true);
            })
                .catch((err) => {
                return reject(err);
            });
        });
    }
    catch (e) {
        throw e;
    }
}
