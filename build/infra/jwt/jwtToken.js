"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = createToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../error/error");
/**
 * Creates a JWT token with the given payload and expiration time.
 * @param payload - The payload to be included in the token.
 * @param timer - The expiration time for the token in seconds.
 * @returns The generated JWT token.
 */
function createToken(payload, timer) {
    return jsonwebtoken_1.default.sign({ "pay": payload }, '17f4059980d9b11280eed7f86ca84cbe', { expiresIn: timer });
}
function _verifyToken(token) {
    let result = new Map();
    jsonwebtoken_1.default.verify(token, '17f4059980d9b11280eed7f86ca84cbe', function (err, decode) {
        if (err) {
            result.set("hasError", true);
            result.set("value", err);
        }
        else {
            result.set("hasError", false);
            result.set("value", decode);
        }
    });
    return result;
}
/**
 * Middleware function to verify the authenticity of a JWT token in the request header.
 * If the token is missing, malformatted, or invalid, it returns an error response.
 * Otherwise, it calls the next middleware function.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
function verifyToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        const error = new error_1.CustomError('Unauthorized', 401, 'Unauthorized', 'Token not provided');
        return res.status(401).json(error.toJson('Token not provided'));
    }
    const parts = header.split(' ');
    const partsLen = parts.length;
    if (partsLen !== 2) {
        const error = new error_1.CustomError('Unauthorized', 401, 'Unauthorized', 'Token malformatted');
        return res.status(401).json(error.toJson('Token malformatted'));
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        const error = new error_1.CustomError('Unauthorized', 401, 'Unauthorized', 'Token malformatted');
        return res.status(401).json(error.toJson('Token without Bearer'));
    }
    const jwtVerifyMap = _verifyToken(token);
    const hasError = jwtVerifyMap.get('hasError');
    const value = jwtVerifyMap.get('value');
    if (hasError == true) {
        const error = new error_1.CustomError('Unauthorized', 401, 'Unauthorized', 'Token invalid');
        return res.status(403).json(error.toJson('Token invalid'));
    }
    return next();
}
