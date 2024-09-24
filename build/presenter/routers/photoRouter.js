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
const userController_1 = require("../../useCase/controllers/userController");
const error_1 = require("../../infra/error/error");
const photoRouter = (0, express_1.Router)();
const userControle = new userController_1.UserController();
photoRouter.get('/photo/family/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const photo = yield userControle.getPersonReferencePhoto(id);
        if (!photo) {
            const error = new error_1.CustomError('Not Found', 404, 'Not Found', 'Photo not found');
            return res.status(404).json(error.toJson('Photo not found'));
        }
        const buffer = photo.fileBuffer;
        const extension = photo.fileExtension;
        res.set('Content-Type', `image/${extension}`);
        res.send(buffer);
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
exports.default = photoRouter;
