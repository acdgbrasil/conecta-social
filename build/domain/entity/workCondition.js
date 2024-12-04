"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkCondition = void 0;
class WorkCondition {
    constructor(familyIncome, perCapitaIncome, hasSocialIncome, bolsaFamiliaValue, bpcValue, petiValue, othersValue, bcpBenefitPerson, hasRetiredPerson, totalFamilyIncome, totalPerCapitaIncome) {
        this.familyIncome = familyIncome;
        this.perCapitaIncome = perCapitaIncome;
        this.hasSocialIncome = hasSocialIncome;
        this.bolsaFamiliaValue = bolsaFamiliaValue;
        this.bpcValue = bpcValue;
        this.petiValue = petiValue;
        this.othersValue = othersValue;
        this.bcpBenefitPerson = bcpBenefitPerson;
        this.hasRetiredPerson = hasRetiredPerson;
        this.totalFamilyIncome = totalFamilyIncome;
        this.totalPerCapitaIncome = totalPerCapitaIncome;
    }
}
exports.WorkCondition = WorkCondition;
