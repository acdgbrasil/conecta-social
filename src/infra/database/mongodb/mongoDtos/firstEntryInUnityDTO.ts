import { FirstEntryInUnity } from "../../../../domain/entity/firstEntryInUnity";
import { firstEntryInUnityModel } from "../models/firstEntryInUnityModel";

export const firstEntryInUnity = async (firstEntry:FirstEntryInUnity,firstEntryInUnityId:string) => {
    try{
        const firstEntryResult = await firstEntryInUnityModel.findOneAndUpdate({_id:firstEntryInUnityId},{
            firstEntryInUnity:firstEntry.firstEntryInUnity,
            motivationForFirstEntry:firstEntry.motivationForFirstEntry,
            nameOfUnityToSendFirstEntry:firstEntry.nameOfUnityToSendFirstEntry,
            ContactEmailOfUnityToSendFirstEntry:firstEntry.ContactEmailOfUnityToSendFirstEntry,
            familyBenefits:firstEntry.familyBenefits,
            isInUse:firstEntry.isInUse,
            updatedAt:Date.now(),
            whoIsResponsibleForFirstEntryId:firstEntry.whoIsResponsibleForFirstEntryId,
        },{new:true});
        if(!firstEntryResult){
            return new Error('FIRST_ENTRY_NOT_FOUND');
        }

        firstEntryResult.save();

        return firstEntryResult.toObject();
    }catch(e){
        throw e;
    }
}