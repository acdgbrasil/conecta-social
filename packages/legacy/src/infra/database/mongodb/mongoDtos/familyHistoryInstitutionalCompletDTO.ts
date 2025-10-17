import { FamilyHistoryInstitutionalComplet } from "../../../../domain/entity/familyHistoryInstitutionalComplet.ts";
import { Observations } from "../../../../domain/entity/observations.ts";
import { CustomError } from "../../../error/error.ts";
import { FamilyHistoryInstitutionalCompletModel } from "../models/familyHistoryInstutionalCompletModel.ts";

export const familyHistoryIntitutionalCompletDto = async (familyHistoryIntitutionalComplet:FamilyHistoryInstitutionalComplet,familuInstitucionalHistoryId:string) => {
    try{
        const familyHistoryInstitutionalComplet = await FamilyHistoryInstitutionalCompletModel.findById(familuInstitucionalHistoryId)
        if(!familyHistoryInstitutionalComplet) throw new CustomError('FAMILY_HISTORY_INSTITUTIONAL_COMPLET_NOT_FOUND',404,'FAMILY_HISTORY_INSTITUTIONAL_COMPLET_NOT_FOUND','Family History Institutional Complet not found')
        familyHistoryInstitutionalComplet.familyInstitutionalShelterHistory = familyHistoryIntitutionalComplet.familyInstitutionalShelterHistory
        familyHistoryInstitutionalComplet.childCustodyHistory = familyHistoryIntitutionalComplet.childCustodyHistory
        familyHistoryInstitutionalComplet.otherFamilySeparationSituations = familyHistoryIntitutionalComplet.otherFamilySeparationSituations
        familyHistoryInstitutionalComplet.isInUse = familyHistoryIntitutionalComplet.isInUse
        await familyHistoryInstitutionalComplet.save()
        return familyHistoryInstitutionalComplet
    }catch(e){
        throw e
    }
}

export const familyHistoryIntitutionalCompletObservationDto = async (observation:Observations,familuInstitucionalHistoryId:string) => {
    try{
        const familyHistoryInstitutionalComplet = await FamilyHistoryInstitutionalCompletModel.findById(familuInstitucionalHistoryId)
        if(!familyHistoryInstitutionalComplet) throw new CustomError('FAMILY_HISTORY_INSTITUTIONAL_COMPLET_NOT_FOUND',404,'FAMILY_HISTORY_INSTITUTIONAL_COMPLET_NOT_FOUND','Family History Institutional Complet not found')
        familyHistoryInstitutionalComplet.observation?.push(observation)
        await familyHistoryInstitutionalComplet.save()
        return familyHistoryInstitutionalComplet
    }catch(e){
        throw e
    }
}