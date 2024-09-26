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
exports.AuthController = void 0;
const databaseService_1 = require("../../infra/database/databaseService");
const bcryptDto_1 = require("../../infra/encrypt/bcrypt/bcryptDto");
const encryptService_1 = require("../../infra/encrypt/encryptService");
const error_1 = require("../../infra/error/error");
const jwtToken_1 = require("../../infra/jwt/jwtToken");
const smtpService_1 = require("../../infra/smtp/smtpService");
const ONE_MOUTH = 60 * 60 * 24 * 30;
class AuthController {
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const databaseService = new databaseService_1.DatabaseService();
                const hasUser = yield databaseService.findByEmail(email);
                if (!(hasUser.email == email))
                    throw new error_1.CustomError('INVALID_EMAIL', 400, 'INVALID_EMAIL', 'Invalid email');
                const passIsValid = yield (0, bcryptDto_1.verifyPass)(password, hasUser.password);
                if (!hasUser.isActive)
                    throw new error_1.CustomError('INVALID_USER', 400, 'INVALID_USER', 'The user you want to access are disabled');
                if (!passIsValid)
                    throw new error_1.CustomError('INVALID_PASSWORD', 400, 'INVALID_PASSWORD', 'Invalid password');
                const jwtToken = (0, jwtToken_1.createToken)(hasUser.id.toString(), ONE_MOUTH);
                return { user: hasUser, token: jwtToken };
            }
            catch (e) {
                throw e;
            }
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const databaseService = new databaseService_1.DatabaseService();
                const hasUser = yield databaseService.findByEmail(email);
                if (!hasUser)
                    throw new error_1.CustomError('USER_NOT_FOUND', 404, 'USER_NOT_FOUND', 'User not found');
                const expiredCode = yield databaseService.forgotPassword(email);
                const smtp = new smtpService_1.SmtpService();
                const responseEmail = yield smtp.sendGenericEmail('noreply@acdgbrasil.com.br', email, 'Reset de Senha', 'Seu codigo, para resetar sua senha é: ' + expiredCode);
                if (!responseEmail)
                    throw new error_1.CustomError('Internal Server Error', 500, 'Internal Server Error', 'Error to send email');
                return expiredCode;
            }
            catch (e) {
                throw e;
            }
        });
    }
    resetPassword(email, code, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const databaseService = new databaseService_1.DatabaseService();
                const encrypt = new encryptService_1.CryptoService();
                const hashPass = yield encrypt.hashPass(newPassword);
                const user = databaseService.resetPassword(email, code, hashPass);
                return user;
            }
            catch (e) {
                throw e;
            }
        });
    }
}
exports.AuthController = AuthController;
