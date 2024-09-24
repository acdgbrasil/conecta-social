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
exports.SmtpService = void 0;
const sendGridDto_1 = require("./sendgrid/sendGridDto");
/**
 * Service for sending generic emails using SMTP.
 */
class SmtpService {
    /**
     * Sends a generic email.
     * @param from - The email address of the sender.
     * @param to - The email address of the recipient.
     * @param subject - The subject of the email.
     * @param text - The plain text content of the email (optional).
     * @param html - The HTML content of the email (optional).
     * @returns A promise that resolves to a boolean indicating if the email was sent successfully, or an error if sending failed.
     * ``` EXAMPLE OF USAGE ```
     * EXAMPLE OF USAGE:
     * ```typescript
     * const smtp = new SmtpService();
     * const result = await smtp.sendGenericEmail('noreply@acdgbrasil.com.br','gaderaldo10@gmail.com','Teste do SMTP','Teste do SMTP');
     * if(!result) return res.status(500).send('error to send email');
     * return res.status(200).send('Email sent');
     * ```
     */
    sendGenericEmail(from, to, subject, text, html) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sendEmailResult = yield (0, sendGridDto_1.sendGenericEmail)(from, to, subject, text, html);
                return sendEmailResult;
            }
            catch (e) {
                throw e;
            }
        });
    }
}
exports.SmtpService = SmtpService;
