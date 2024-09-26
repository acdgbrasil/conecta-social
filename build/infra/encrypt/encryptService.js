"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const error_1 = require("../error/error");
const bcryptDto_1 = require("./bcrypt/bcryptDto");
class CryptoService {
    hashPass(password) {
        try {
            const hasPass = (0, bcryptDto_1.hashPass)(password);
            return hasPass;
        }
        catch (e) {
            throw new error_1.CustomError('Internal Server Error', 500, 'Hash Pass Error', 'Error to hash pass');
        }
    }
    verifyPass(pass, hash) {
        try {
            const hasPass = (0, bcryptDto_1.verifyPass)(pass, hash);
            return hasPass;
        }
        catch (e) {
            throw new error_1.CustomError('Internal Server Error', 500, 'Hash Pass Error', 'Error to hash pass');
        }
    }
}
exports.CryptoService = CryptoService;
