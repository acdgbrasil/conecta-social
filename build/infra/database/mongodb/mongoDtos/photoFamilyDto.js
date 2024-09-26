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
exports.getPersonReferencePhotoDto = void 0;
const error_1 = require("../../../error/error");
const familyPhotoModel_1 = require("../models/familyPhotoModel");
const getPersonReferencePhotoDto = (photoId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!photoId) {
            throw new error_1.CustomError('PHOTO_ID_IS_NOT_FIND', 404, 'PHOTO_ID_IS_NOT_FIND', 'The photo id is not find');
        }
        const photoModel = yield familyPhotoModel_1.familyPhotoModel.findById(photoId);
        if (!photoModel) {
            console.log('Reference Person not found');
            throw new error_1.CustomError('PHOTO_NOT_FOUND', 404, 'PHOTO_NOT_FOUND', 'The photo is not find');
        }
        const photoBuffer = photoModel.fileBuffer;
        const photoExtension = photoModel.fileExtension;
        const photoResponse = {
            fileBuffer: photoBuffer,
            fileExtension: photoExtension
        };
        return photoResponse;
    }
    catch (error) {
        throw error;
    }
});
exports.getPersonReferencePhotoDto = getPersonReferencePhotoDto;
