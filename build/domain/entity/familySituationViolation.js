"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilySituationViolation = exports.FamilySituationViolationStructOther = exports.FamilySituationViolationStruct = void 0;
class FamilySituationViolationStruct {
    constructor(thisSituationOcurrent, thisSituationsOcurrentNow) {
        this.thisSituationOcurrent = thisSituationOcurrent;
        this.thisSituationsOcurrentNow = thisSituationsOcurrentNow;
    }
}
exports.FamilySituationViolationStruct = FamilySituationViolationStruct;
class FamilySituationViolationStructOther {
    constructor(thisSituationOcurrent, thisSituationsOcurrentNow, nameOfSituation) {
        this.thisSituationOcurrent = thisSituationOcurrent;
        this.thisSituationsOcurrentNow = thisSituationsOcurrentNow;
        this.nameOfSituation = nameOfSituation;
    }
}
exports.FamilySituationViolationStructOther = FamilySituationViolationStructOther;
class FamilySituationViolation {
    constructor(childLabel, sexualExploitation, sexualAbuse, physicalAbuse, psychologicalAbuse, elderNeglect, childNeglect, pcdNeglect, homelessSituation, humanTrafficking, violenceWithElderOrPcd, other, isInUse) {
        this.childLabel = childLabel;
        this.sexualExploitation = sexualExploitation;
        this.sexualAbuse = sexualAbuse;
        this.physicalAbuse = physicalAbuse;
        this.psychologicalAbuse = psychologicalAbuse;
        this.elderNeglect = elderNeglect;
        this.childNeglect = childNeglect;
        this.pcdNeglect = pcdNeglect;
        this.homelessSituation = homelessSituation;
        this.humanTrafficking = humanTrafficking;
        this.violenceWithElderOrPcd = violenceWithElderOrPcd;
        this.other = other;
        this.isInUse = isInUse;
    }
}
exports.FamilySituationViolation = FamilySituationViolation;
