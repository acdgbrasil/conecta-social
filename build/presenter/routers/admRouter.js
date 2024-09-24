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
const error_1 = require("../../infra/error/error");
const admController_1 = require("../../useCase/controllers/admController");
const admRouter = (0, express_1.Router)();
const admController = new admController_1.AdmController();
admRouter.get('/adm/list/all/:admEmail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { admEmail } = req.params;
        const superAdmEmail = process.env.SUPER_ADM_EMAIL;
        const isSuperAd = superAdmEmail === admEmail;
        if (!isSuperAd) {
            throw new error_1.CustomError('Unauthorized', 401, 'Unauthorized', 'Your access is denied, because you are not allowed');
        }
        const users = yield admController.listAllUsers();
        return res.status(200).json({ response: users });
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
admRouter.patch('/adm/deactivate/user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { admEmail, email } = req.body;
        const superAdmEmail = process.env.SUPER_ADM_EMAIL;
        const isSuperAd = superAdmEmail === admEmail;
        if (!isSuperAd) {
            throw new error_1.CustomError('Unauthorized', 401, 'Unauthorized', 'Your access is denied, because you are not allowed');
        }
        const hasSuccesfull = yield admController.deactivateUser(email);
        if (hasSuccesfull)
            return res.status(200).json({ "message": "User has been successfully deactivated!" });
        return res.status(200).json({ "message": "Failed to deactivate user!" });
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
exports.default = admRouter;
