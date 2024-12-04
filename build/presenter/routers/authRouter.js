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
const express_1 = require("express");
const authController_1 = require("../../useCase/controllers/authController");
const error_1 = require("../../infra/error/error");
const userController_1 = require("../../useCase/controllers/userController");
const authRouter = (0, express_1.Router)();
const authController = new authController_1.AuthController();
const userController = new userController_1.UserController();
authRouter.post('/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, pass } = req.body;
        if (!email)
            throw new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Email is required');
        if (!pass)
            throw new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Password is required');
        const authController = new authController_1.AuthController();
        const response = yield authController.login(email, pass);
        return res.status(200).json(response);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            console.log(e);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
authRouter.post('/auth/forgot/password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email)
            throw new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Email is required');
        const response = yield authController.forgotPassword(email);
        return res.status(200).json({ message: "Code sent to user email" });
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            console.log(e);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
authRouter.post('/auth/reset/password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, email, code, newPassword } = req.body;
        if (!email)
            throw new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Email is required');
        if (!code)
            throw new error_1.CustomError('Bad Request', 400, 'Bad Request', 'Code is required');
        if (!newPassword)
            throw new error_1.CustomError('Bad Request', 400, 'Bad Request', 'New password is required');
        const response = yield authController.resetPassword(email, code, newPassword);
        return res.status(200).json(response);
    }
    catch (e) {
        if (e instanceof error_1.CustomError) {
            res.status(e.statusCode).json(e.toJson(e.message));
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));
exports.default = authRouter;
