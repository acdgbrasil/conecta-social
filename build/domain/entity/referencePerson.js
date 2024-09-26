"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RG = exports.FamilyPhoto = exports.ReferencePerson = exports.LOCAL_LOCALIZATION = void 0;
var LOCAL_LOCALIZATION;
(function (LOCAL_LOCALIZATION) {
    LOCAL_LOCALIZATION["urban"] = "URBAN";
    LOCAL_LOCALIZATION["rural"] = "RURAL";
})(LOCAL_LOCALIZATION || (exports.LOCAL_LOCALIZATION = LOCAL_LOCALIZATION = {}));
class ReferencePerson {
    constructor(fullName, socialName, motherName, nis, cpf, diagnosis, rgNumber, biologicalGender, rgUf, rgIssuingBody, rgIssueDate, isShelter, localLocalization, cep, adress, neighborhood, adressNumber, adressComplement, state, city, phone, fileBuffer, fileExtension, birthDate, whoIsOpeningId, observations, familyCompositionId, fistEntryInUnityId, homeConditionsId) {
        const rg = new RG(rgNumber, rgUf, rgIssuingBody, rgIssueDate);
        const familyPhoto = new FamilyPhoto(fileBuffer, fileExtension);
        this.familyPhoto = familyPhoto;
        this.rg = rg;
        this.adress = adress;
        this.adressComplement = adressComplement;
        this.adressNumber = adressNumber;
        this.cep = cep;
        this.city = city;
        this.cpf = cpf;
        this.diagnosis = diagnosis;
        this.fullName = fullName;
        this.isShelter = isShelter;
        this.localLocalization = localLocalization;
        this.neighborhood = neighborhood;
        this.state = state;
        this.phone = phone;
        this.motherName = motherName;
        this.socialName = socialName;
        this.observations = observations;
        this.whoIsOpeningId = whoIsOpeningId;
        this.nis = nis;
        this.familyCompositionId = familyCompositionId;
        this.fistEntryInUnityId = fistEntryInUnityId;
        this.birthDate = birthDate;
        this.biologicalGender = biologicalGender;
        this.homeConditionsId = homeConditionsId;
    }
}
exports.ReferencePerson = ReferencePerson;
class FamilyPhoto {
    constructor(fileBufer, fileExtension) {
        this.fileBuffer = fileBufer;
        this.fileExtension = fileExtension;
    }
}
exports.FamilyPhoto = FamilyPhoto;
class RG {
    constructor(number, uf, issuingBody, issueDate) {
        this.issueDate = issueDate;
        this.number = number;
        this.uf = uf;
        this.issuingBody = issuingBody;
    }
}
exports.RG = RG;
