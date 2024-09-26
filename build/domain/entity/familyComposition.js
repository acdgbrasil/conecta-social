"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyComposition = exports.FamilyCompositionPerson = exports.Documents = void 0;
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
class FamilyCompositionPerson {
    constructor(fullName, birthDate, biologicalGender, personWithDisability, documents, kinship) {
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.biologicalGender = biologicalGender;
        this.personWithDisability = personWithDisability;
        this.documents = documents;
        this.kinship = kinship;
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
