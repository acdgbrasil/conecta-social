"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyComposition = exports.FamilyCompositionPerson = exports.WorkConditionPerson = exports.EducationConditionPerson = exports.OcurruncyBolsaFamilia = exports.Pregnant = exports.ParticipationAndSocialServices = exports.Documents = void 0;
class Documents {
    constructor(cn, rg, ctps, cpf, te) {
        this.cn = cn;
        this.rg = rg;
        this.ctps = ctps;
        this.cpf = cpf;
        this.te = te;
    }
}
exports.Documents = Documents;
class ParticipationAndSocialServices {
    constructor(isInUser, serviceProgramOrProject, unityRealization, dateRealization, dateConclusion) {
        this.isInUser = isInUser;
        this.serviceProgramOrProject = serviceProgramOrProject;
        this.unityRealization = unityRealization;
        this.dateRealization = dateRealization;
        this.dateConclusion = dateConclusion;
    }
}
exports.ParticipationAndSocialServices = ParticipationAndSocialServices;
class Pregnant {
    constructor(pregnancyMonths, hasPreNatal, isInUse) {
        this.pregnancyMonths = pregnancyMonths;
        this.hasPreNatal = hasPreNatal;
        this.isInUse = isInUse;
    }
}
exports.Pregnant = Pregnant;
class OcurruncyBolsaFamilia {
    constructor(ocurruncyDate, efect, suspensionSolicitation) {
        this.ocurruncyDate = ocurruncyDate;
        this.efect = efect;
        this.suspensionSolicitation = suspensionSolicitation;
    }
}
exports.OcurruncyBolsaFamilia = OcurruncyBolsaFamilia;
class EducationConditionPerson {
    constructor(isInUse, literate, schoolShip, isStudying, ocorruncyBolsaFamilia) {
        this.isInUse = isInUse;
        this.literate = literate;
        this.schoolShip = schoolShip;
        this.isStudying = isStudying;
        this.ocorruncyBolsaFamilia = ocorruncyBolsaFamilia;
    }
}
exports.EducationConditionPerson = EducationConditionPerson;
class WorkConditionPerson {
    constructor(isInUse, workCondition, hasWorkCard, workQualification, workValue) {
        this.isInUse = isInUse;
        this.workCondition = workCondition;
        this.hasWorkCard = hasWorkCard;
        this.workQualification = workQualification;
        this.workValue = workValue;
    }
}
exports.WorkConditionPerson = WorkConditionPerson;
class FamilyCompositionPerson {
    constructor(fullName, birthDate, biologicalGender, personWithDisability, documents, kinship, _id) {
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.biologicalGender = biologicalGender;
        this.personWithDisability = personWithDisability;
        this.documents = documents;
        this.kinship = kinship;
        this._id = _id;
    }
}
exports.FamilyCompositionPerson = FamilyCompositionPerson;
class FamilyComposition {
    constructor(socialEspecification, familyCompositionPerson, espeficationEthnicity, observation, isInUse) {
        this.socialEspecification = socialEspecification;
        this.familyCompositionPerson = familyCompositionPerson;
        this.espeficationEthnicity = espeficationEthnicity;
        this.observation = observation;
        this.isInUse = isInUse;
        
    }
}
exports.FamilyComposition = FamilyComposition;
