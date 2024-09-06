import { PhotoResponse } from "../../../../domain/repository/userRepository";
import { CustomError } from "../../../error/error";
import { familyPhotoModel } from "../models/familyPhotoModel"

export const getPersonReferencePhotoDto = async (photoId:string) => {
    try {
        if(!photoId){
            throw new CustomError('PHOTO_ID_IS_NOT_FIND',404,'PHOTO_ID_IS_NOT_FIND','The photo id is not find');
        }
        const photoModel = await familyPhotoModel.findById(photoId);
        
        if(!photoModel){
            console.log('Reference Person not found');
            throw new CustomError('PHOTO_NOT_FOUND',404,'PHOTO_NOT_FOUND','The photo is not find');
        }

        const photoBuffer = photoModel.fileBuffer;
        const photoExtension = photoModel.fileExtension;

        const photoResponse: PhotoResponse = {
            fileBuffer: photoBuffer,
            fileExtension: photoExtension
        }

        return photoResponse;

    } catch (error) {
        throw error
    }
}