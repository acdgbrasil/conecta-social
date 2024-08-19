import { FamilyCompositionPerson } from "../../../../domain/entity/familyComposition";
import { CustomError } from "../../../error/error";
import { familyCompositionModel } from "../models/familyCompositionModel";

export const createFamilyPerson = async (familyCompositionPerson:FamilyCompositionPerson,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new Error("NOT FOUND")
        familyComposition.familyCompositionPerson.push(familyCompositionPerson)
        familyComposition.isInUse = true 
        familyComposition.save()
        return ""
    } catch (err) {
        throw err 
    }
}

