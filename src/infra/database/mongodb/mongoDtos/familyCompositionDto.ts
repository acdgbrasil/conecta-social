import { FamilyCompositionPerson } from "../../../../domain/entity/familyComposition";
import { CustomError } from "../../../error/error";
import { familyCompositionModel } from "../models/familyCompositionModel";

export const createFamilyPerson = async (familyCompositionPerson:FamilyCompositionPerson,familyCompositionID:string) => {
    try {
        const familyComposition = await familyCompositionModel.findById(familyCompositionID)
        if(!familyComposition) throw new CustomError('FAMILY_COMPOSITION_NOT_FOUND',404,'FAMILY_COMPOSITION_NOT_FOUND','Family Composition not found')
        familyComposition.familyCompositionPerson.push(familyCompositionPerson)
        familyComposition.isInUse = true 
        familyComposition.save()
        return familyComposition
    } catch (err) {
        throw err 
    }
}

