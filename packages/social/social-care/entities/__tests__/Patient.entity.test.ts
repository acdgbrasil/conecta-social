import { describe, expect, test } from "bun:test";
import { Patient } from "../Patient.entity"; // Irá falhar (ainda não implementado)
import { Uuid } from "@conecta/uuid";
import { PersonId } from "../../value-objects/personId.valueObject";
import { Diagnosis } from "../../value-objects/Diagnosis.valueObject";
import { ICDCode } from "../../value-objects/icdCode.valueObject";
import { Timestamp } from "../../value-objects/timestamp.valueObject";
import { FamilyMemberId } from "../../value-objects/FamilyMemberId.valueObject";
import { HousingCondition } from "../../value-objects/housingCondition.valueObject";
import { SocioEconomicSituation } from "../../value-objects/socioEconomicSituation.valueObject";
import { SocialBenefitsCollection } from "../../value-objects/SocialBenefitsCollection.valueObject";
import { SocialBenefit } from "../../value-objects/SocialBenefit.valueObject";
import { CommunitySupportNetwork } from "../../value-objects/communitySupportNetwort.valueObject";
import { SocialHealthSummary } from "../../value-objects/socialHealthSummary.valueObject";
import { ImutableListFactory } from "@conecta/fn";
import type { ReferralStatus } from "../Referral.entity";
import { ViolationType } from "../RightsViolationReport.entity";

const NOW = new Date("2024-01-10T12:00:00Z");
const YESTERDAY = new Date("2024-01-09T12:00:00Z");
const TWO_DAYS_AGO = new Date("2024-01-08T12:00:00Z");

const COMPLETED_STATUS: ReferralStatus = "COMPLETED";
const CANCELLED_STATUS: ReferralStatus = "CANCELLED";

const makeTimestamp = (value: Date) => Timestamp.create({ value }).unwrap();

const makeDiagnosis = () => {
  const diagnosisDate = makeTimestamp(YESTERDAY);
  const reference = makeTimestamp(NOW);
  return Diagnosis.create(
    {
      id: ICDCode.create("A00.0").unwrap(),
      date: diagnosisDate,
      description: "Cólera devido a Vibrio cholerae clássico.",
    },
    reference,
  ).unwrap();
};

const makeHousingCondition = (overrides: Partial<Parameters<typeof HousingCondition.create>[0]> = {}) =>
  HousingCondition.create({
    housingConditionType: "OWNED",
    wallMaterial: "MASONRY",
    numberOfRooms: 4,
    numberOfBathrooms: 2,
    isInGeographicRiskArea: false,
    isInSocialConflictArea: false,
    electricityAccess: "METERED_CONNECTION",
    sewerDisposalMethod: "PUBLIC_SEWER",
    wasteCollectionType: "DIRECT_COLLECTION",
    accessibilityLevel: "PARTIALLY_ACCESSIBLE",
    ...overrides,
  }).unwrap();

const makeSocialBenefit = (amount: number) =>
  SocialBenefit.create({
    benefitName: "Bolsa Família",
    amount,
    beneficiaryId: FamilyMemberId.create().unwrap(),
  }).unwrap();

const makeSocioEconomicSituation = (overrides: Partial<Parameters<typeof SocioEconomicSituation.create>[0]> = {}) => {
  const benefits =
    overrides.socialBenefits ??
    SocialBenefitsCollection.create(overrides.receivesSocialBenefit ? [makeSocialBenefit(600)] : []).unwrap();

  return SocioEconomicSituation.create({
    totalFamilyIncome: overrides.receivesSocialBenefit ? 1200 : 1800,
    incomePerCapita: overrides.receivesSocialBenefit ? 240 : 360,
    receivesSocialBenefit: overrides.receivesSocialBenefit ?? false,
    socialBenefits: benefits,
    mainSourceOfIncome: "Informal jobs",
    hasUnemployed: true,
    ...overrides,
  }).unwrap();
};

const makeCommunitySupportNetwork = (overrides: Partial<Parameters<typeof CommunitySupportNetwork.create>[0]> = {}) =>
  CommunitySupportNetwork.create({
    hasSupportFromRelatives: true,
    hasSupportFromNeighbors: true,
    familyConflicts: "Conflitos esporádicos relacionados a finanças.",
    patientParticipatesInGroups: true,
    familyParticipatesInGroups: false,
    patientHasAccessToLeisure: true,
    facesDiscriminationInCommunity: false,
    ...overrides,
  }).unwrap();

const makeSocialHealthSummary = (overrides: Partial<Parameters<typeof SocialHealthSummary.create>[0]> = {}) =>
  SocialHealthSummary.create({
    requiresConstantCare: false,
    hasMobilityImpairment: false,
    functionalDependencies: ImutableListFactory.fromArray(["Alimentação"]),
    hasRelevantDrugTheapy: true,
    ...overrides,
  }).unwrap();

const makeFamilyMemberData = (overrides: Partial<{
  id: FamilyMemberId;
  personId: PersonId;
  relationship: string;
  isPrimaryCaregiver: boolean;
  residesWithPatient: boolean;
}> = {}) => ({
  id: overrides.id ?? FamilyMemberId.create().unwrap(),
  personId: overrides.personId ?? PersonId.create().unwrap(),
  relationship: overrides.relationship ?? "SIBLING",
  isPrimaryCaregiver: overrides.isPrimaryCaregiver ?? false,
  residesWithPatient: overrides.residesWithPatient ?? true,
});

const createPatient = () => {
  const id = Uuid.create().unwrap();
  const personId = PersonId.create().unwrap();
  const diagnosis = makeDiagnosis();
  const result = Patient.create({ id }, personId, diagnosis);

  if (!result.isOk) {
    throw new Error("Falha ao criar patient de teste.");
  }

  return {
    patient: result.unwrap(),
    patientId: id,
    personId,
    diagnosis,
  };
};

describe("Patient.entity", () => {
  test("deve criar um Patient com estado inicial coerente e imutável", () => {
    // Act
    const { patient, patientId, personId, diagnosis } = createPatient();

    // Assert
    expect(patient.id.equals(patientId)).toBe(true);
    expect(patient.personId.equals(personId)).toBe(true);
    expect(patient.diagnosis.description).toBe(diagnosis.description);
    expect(patient.familyMembers.length).toBe(0);
    expect(patient.appointments.length).toBe(0);
    expect(patient.referrals.length).toBe(0);
    expect(patient.violationReports.length).toBe(0);
    expect(Object.isFrozen(patient)).toBe(true);
  });

  test("não deve permitir adicionar mais de um membro da família com o mesmo personId", () => {
    // Arrange
    const { patient } = createPatient();
    const memberData = makeFamilyMemberData();

    const firstAddition = patient.addFamilyMember(memberData);
    expect(firstAddition.isOk).toBe(true);
    if (!firstAddition.isOk) return;
    const patientWithMember = firstAddition.unwrap();

    // Act
    const duplicateAddition = patientWithMember.addFamilyMember({
      ...makeFamilyMemberData(),
      personId: memberData.personId,
    });

    // Assert
    expect(patient.familyMembers.length).toBe(0);
    expect(patientWithMember.familyMembers.length).toBe(1);
    expect(duplicateAddition.isErr).toBe(true);
    if (!duplicateAddition.isErr) return;
    expect(duplicateAddition.error.code).toBe("PAT-001");
  });

  test("deve remover um membro da família existente e manter imutabilidade", () => {
    // Arrange
    const { patient } = createPatient();
    const memberData = makeFamilyMemberData();
    const withMemberResult = patient.addFamilyMember(memberData);
    expect(withMemberResult.isOk).toBe(true);
    if (!withMemberResult.isOk) return;
    const withMember = withMemberResult.unwrap();

    // Act
    const removalResult = withMember.removeFamilyMember(memberData.id);

    // Assert
    expect(removalResult.isOk).toBe(true);
    if (!removalResult.isOk) return;
    const withoutMember = removalResult.unwrap();
    expect(withMember.familyMembers.length).toBe(1);
    expect(withoutMember.familyMembers.length).toBe(0);
    expect(withoutMember).not.toBe(withMember);

    const missingRemoval = withMember.removeFamilyMember(FamilyMemberId.create().unwrap());
    expect(missingRemoval.isErr).toBe(true);
    if (!missingRemoval.isErr) return;
    expect(missingRemoval.error.code).toBe("PAT-002");
  });

  test("deve garantir que apenas um cuidador principal esteja designado por vez", () => {
    // Arrange
    const { patient } = createPatient();
    const primaryCandidate = makeFamilyMemberData({ relationship: "MOTHER" });
    const secondaryCandidate = makeFamilyMemberData({ relationship: "FATHER" });

    const withFirstResult = patient.addFamilyMember(primaryCandidate);
    expect(withFirstResult.isOk).toBe(true);
    if (!withFirstResult.isOk) return;
    const withFirst = withFirstResult.unwrap();

    const withBothResult = withFirst.addFamilyMember(secondaryCandidate);
    expect(withBothResult.isOk).toBe(true);
    if (!withBothResult.isOk) return;
    const withBoth = withBothResult.unwrap();

    // Act
    const assignPrimaryResult = withBoth.assignPrimaryCaregiver(primaryCandidate.id);

    // Assert
    expect(assignPrimaryResult.isOk).toBe(true);
    if (!assignPrimaryResult.isOk) return;
    const withPrimary = assignPrimaryResult.unwrap();
    const firstMember = withPrimary.familyMembers.find((member) => member.id.equals(primaryCandidate.id));
    const secondMember = withPrimary.familyMembers.find((member) => member.id.equals(secondaryCandidate.id));
    expect(firstMember?.isPrimaryCaregiver).toBe(true);
    expect(secondMember?.isPrimaryCaregiver).toBe(false);

    const reassignResult = withPrimary.assignPrimaryCaregiver(secondaryCandidate.id);
    expect(reassignResult.isOk).toBe(true);
    if (!reassignResult.isOk) return;
    const reassigned = reassignResult.unwrap();
    const firstAfter = reassigned.familyMembers.find((member) => member.id.equals(primaryCandidate.id));
    const secondAfter = reassigned.familyMembers.find((member) => member.id.equals(secondaryCandidate.id));
    expect(firstAfter?.isPrimaryCaregiver).toBe(false);
    expect(secondAfter?.isPrimaryCaregiver).toBe(true);
    expect(reassigned).not.toBe(withPrimary);

    const missingCaregiver = withBoth.assignPrimaryCaregiver(FamilyMemberId.create().unwrap());
    expect(missingCaregiver.isErr).toBe(true);
    if (!missingCaregiver.isErr) return;
    expect(missingCaregiver.error.code).toBe("PAT-002");
  });

  test("deve exigir que o encaminhamento pertença ao paciente ou a um familiar", () => {
    // Arrange
    const { patient, personId } = createPatient();
    const familyMember = makeFamilyMemberData();
    const withFamilyResult = patient.addFamilyMember(familyMember);
    expect(withFamilyResult.isOk).toBe(true);
    if (!withFamilyResult.isOk) return;
    const withFamily = withFamilyResult.unwrap();

    const referralForPatient = {
      id: Uuid.create().unwrap(),
      date: makeTimestamp(TWO_DAYS_AGO),
      requestingProfessionalId: Uuid.create().unwrap(),
      referredPersonId: Uuid.create(personId.toString()).unwrap(),
      destinationService: "CRAS",
      reason: "Acompanhar adesão a benefícios.",
    };

    const referralForFamily = {
      ...referralForPatient,
      id: Uuid.create().unwrap(),
      referredPersonId: Uuid.create(familyMember.personId.toString()).unwrap(),
    };

    const invalidReferral = {
      ...referralForPatient,
      id: Uuid.create().unwrap(),
      referredPersonId: Uuid.create().unwrap(),
    };

    // Act
    const patientReferralResult = withFamily.createReferral(referralForPatient, NOW);
    const familyReferralResult = withFamily.createReferral(referralForFamily, NOW);
    const invalidReferralResult = withFamily.createReferral(invalidReferral, NOW);

    // Assert
    expect(patientReferralResult.isOk).toBe(true);
    expect(familyReferralResult.isOk).toBe(true);
    expect(invalidReferralResult.isErr).toBe(true);
    if (patientReferralResult.isOk) {
      expect(patientReferralResult.unwrap().referrals.length).toBe(1);
    }
    if (familyReferralResult.isOk) {
      expect(familyReferralResult.unwrap().referrals.length).toBe(1);
    }
    if (!invalidReferralResult.isErr) return;
    expect(invalidReferralResult.error.code).toBe("PAT-003");
  });

  test("deve atualizar o status de um encaminhamento existente", () => {
    // Arrange
    const { patient, personId } = createPatient();
    const referralProps = {
      id: Uuid.create().unwrap(),
      date: makeTimestamp(TWO_DAYS_AGO),
      requestingProfessionalId: Uuid.create().unwrap(),
      referredPersonId: Uuid.create(personId.toString()).unwrap(),
      destinationService: "CREAS",
      reason: "Atendimento especializado.",
    };

    const withReferralResult = patient.createReferral(referralProps, NOW);
    expect(withReferralResult.isOk).toBe(true);
    if (!withReferralResult.isOk) return;
    const withReferral = withReferralResult.unwrap();

    // Act
    const completedResult = withReferral.updateReferralStatus(referralProps.id, COMPLETED_STATUS, "Encaminhamento concluído.");

    // Assert
    expect(completedResult.isOk).toBe(true);
    if (!completedResult.isOk) return;
    const completedPatient = completedResult.unwrap();
    const referral = completedPatient.referrals.find((item) => item.id.equals(referralProps.id));
    expect(referral?.status).toBe("COMPLETED");
    expect(completedPatient).not.toBe(withReferral);

    const missingResult = withReferral.updateReferralStatus(Uuid.create().unwrap(), CANCELLED_STATUS, "Sem atendimento.");
    expect(missingResult.isErr).toBe(true);
    if (!missingResult.isErr) return;
    expect(missingResult.error.code).toBe("PAT-005");
  });

  test("deve validar que relatos de violação pertençam ao agregado", () => {
    // Arrange
    const { patient, personId } = createPatient();
    const familyMember = makeFamilyMemberData();
    const withFamilyResult = patient.addFamilyMember(familyMember);
    expect(withFamilyResult.isOk).toBe(true);
    if (!withFamilyResult.isOk) return;
    const withFamily = withFamilyResult.unwrap();

    const patientReport = {
      id: Uuid.create().unwrap(),
      reportDate: makeTimestamp(YESTERDAY),
      incidentDate: makeTimestamp(TWO_DAYS_AGO),
      victimId: Uuid.create(personId.toString()).unwrap(),
      violationType: ViolationType.NEGLECT,
      descriptionOfFact: "Paciente encontrado sozinho em casa.",
      actionsTaken: "Notificação enviada ao Conselho Tutelar.",
    };

    const familyReport = {
      ...patientReport,
      id: Uuid.create().unwrap(),
      victimId: Uuid.create(familyMember.personId.toString()).unwrap(),
    };

    const invalidReport = {
      ...patientReport,
      id: Uuid.create().unwrap(),
      victimId: Uuid.create().unwrap(),
    };

    // Act
    const patientReportResult = withFamily.reportRightsViolation(patientReport, NOW);
    const familyReportResult = withFamily.reportRightsViolation(familyReport, NOW);
    const invalidReportResult = withFamily.reportRightsViolation(invalidReport, NOW);

    // Assert
    expect(patientReportResult.isOk).toBe(true);
    expect(familyReportResult.isOk).toBe(true);
    expect(invalidReportResult.isErr).toBe(true);
    if (patientReportResult.isOk) {
      expect(patientReportResult.unwrap().violationReports.length).toBe(1);
    }
    if (familyReportResult.isOk) {
      expect(familyReportResult.unwrap().violationReports.length).toBe(1);
    }
    if (!invalidReportResult.isErr) return;
    expect(invalidReportResult.error.code).toBe("PAT-004");
  });

  test("deve atualizar as ações de um relato de violação existente", () => {
    // Arrange
    const { patient, personId } = createPatient();
    const reportProps = {
      id: Uuid.create().unwrap(),
      reportDate: makeTimestamp(YESTERDAY),
      incidentDate: makeTimestamp(TWO_DAYS_AGO),
      victimId: Uuid.create(personId.toString()).unwrap(),
      violationType: ViolationType.PHYSICAL_VIOLENCE,
      descriptionOfFact: "Relato de agressões recorrentes.",
      actionsTaken: "Encaminhamento inicial para atendimento psicológico.",
    };

    const withReportResult = patient.reportRightsViolation(reportProps, NOW);
    expect(withReportResult.isOk).toBe(true);
    if (!withReportResult.isOk) return;
    const withReport = withReportResult.unwrap();

    // Act
    const updateResult = withReport.updateRightsViolationActions(
      reportProps.id,
      "Equipe realizou visita domiciliar de acompanhamento.",
    );

    // Assert
    expect(updateResult.isOk).toBe(true);
    if (!updateResult.isOk) return;
    const updatedPatient = updateResult.unwrap();
    const report = updatedPatient.violationReports.find((item) => item.id.equals(reportProps.id));
    expect(report?.actionsTaken).toBe("Equipe realizou visita domiciliar de acompanhamento.");
    expect(updatedPatient).not.toBe(withReport);

    const missingUpdate = withReport.updateRightsViolationActions(Uuid.create().unwrap(), "Registro não encontrado.");
    expect(missingUpdate.isErr).toBe(true);
    if (!missingUpdate.isErr) return;
    expect(missingUpdate.error.code).toBe("PAT-006");
  });

  test("deve atualizar value objects retornando novas instâncias do agregado", () => {
    // Arrange
    const { patient } = createPatient();
    const housingA = makeHousingCondition();
    const housingB = makeHousingCondition({ numberOfRooms: 5 });
    const socioA = makeSocioEconomicSituation();
    const socioB = makeSocioEconomicSituation({ totalFamilyIncome: 2200, incomePerCapita: 440 });
    const networkA = makeCommunitySupportNetwork();
    const networkB = makeCommunitySupportNetwork({ hasSupportFromNeighbors: false });
    const summaryA = makeSocialHealthSummary();
    const summaryB = makeSocialHealthSummary({
      requiresConstantCare: true,
      functionalDependencies: ImutableListFactory.fromArray(["Alimentação", "Higiene"]),
    });

    // Act
    const withHousingResult = patient.updateHousingCondition(housingA);
    expect(withHousingResult.isOk).toBe(true);
    if (!withHousingResult.isOk) return;
    const withHousing = withHousingResult.unwrap();

    const withSocioResult = patient.updateSocioeconomicSituation(socioA);
    expect(withSocioResult.isOk).toBe(true);
    if (!withSocioResult.isOk) return;
    const withSocio = withSocioResult.unwrap();

    const withNetworkResult = patient.updateCommunitySupportNetwork(networkA);
    expect(withNetworkResult.isOk).toBe(true);
    if (!withNetworkResult.isOk) return;
    const withNetwork = withNetworkResult.unwrap();

    const withSummaryResult = patient.updateSocialHealthSummary(summaryA);
    expect(withSummaryResult.isOk).toBe(true);
    if (!withSummaryResult.isOk) return;
    const withSummary = withSummaryResult.unwrap();

    const updatedHousingResult = withHousing.updateHousingCondition(housingB);
    expect(updatedHousingResult.isOk).toBe(true);
    if (!updatedHousingResult.isOk) return;
    const updatedHousing = updatedHousingResult.unwrap();

    const updatedSocioResult = withSocio.updateSocioeconomicSituation(socioB);
    expect(updatedSocioResult.isOk).toBe(true);
    if (!updatedSocioResult.isOk) return;
    const updatedSocio = updatedSocioResult.unwrap();

    const updatedNetworkResult = withNetwork.updateCommunitySupportNetwork(networkB);
    expect(updatedNetworkResult.isOk).toBe(true);
    if (!updatedNetworkResult.isOk) return;
    const updatedNetwork = updatedNetworkResult.unwrap();

    const updatedSummaryResult = withSummary.updateSocialHealthSummary(summaryB);
    expect(updatedSummaryResult.isOk).toBe(true);
    if (!updatedSummaryResult.isOk) return;
    const updatedSummary = updatedSummaryResult.unwrap();

    // Assert
    expect(withHousing).not.toBe(patient);
    expect(withSocio).not.toBe(patient);
    expect(withNetwork).not.toBe(patient);
    expect(withSummary).not.toBe(patient);

    expect(withHousing.housingCondition).toBe(housingA);
    expect(updatedHousing.housingCondition).toBe(housingB);
    expect(patient.housingCondition ?? null).toBeNull();

    expect(withSocio.socioeconomicSituation).toBe(socioA);
    expect(updatedSocio.socioeconomicSituation).toBe(socioB);
    expect(patient.socioeconomicSituation ?? null).toBeNull();

    expect(withNetwork.communitySupportNetwork).toBe(networkA);
    expect(updatedNetwork.communitySupportNetwork).toBe(networkB);
    expect(patient.communitySupportNetwork ?? null).toBeNull();

    expect(withSummary.socialHealthSummary).toBe(summaryA);
    expect(updatedSummary.socialHealthSummary).toBe(summaryB);
    expect(patient.socialHealthSummary ?? null).toBeNull();
  });

  test("deve registrar atendimentos preservando o histórico existente", () => {
    // Arrange
    const { patient } = createPatient();
    const firstAppointment = {
      id: Uuid.create().unwrap(),
      date: makeTimestamp(TWO_DAYS_AGO),
      professionalInChargeId: Uuid.create().unwrap(),
      type: "HOME_VISIT",
      summary: "Primeira visita domiciliar realizada.",
      actionPlan: "Monitorar adesão ao plano terapêutico.",
    };

    const secondAppointment = {
      ...firstAppointment,
      id: Uuid.create().unwrap(),
      summary: "Retorno para avaliação da rede de apoio.",
    };

    // Act
    const firstResult = patient.registerAppointment(firstAppointment, NOW);
    expect(firstResult.isOk).toBe(true);
    if (!firstResult.isOk) return;
    const withFirst = firstResult.unwrap();

    const secondResult = withFirst.registerAppointment(secondAppointment, NOW);

    // Assert
    expect(secondResult.isOk).toBe(true);
    if (!secondResult.isOk) return;
    const withBoth = secondResult.unwrap();
    expect(withFirst.appointments.length).toBe(1);
    expect(withBoth.appointments.length).toBe(2);
    expect(withBoth.appointments[0].summary).toContain("Primeira visita domiciliar");
    expect(withBoth.appointments[1].summary).toContain("Retorno para avaliação");
    expect(withBoth).not.toBe(withFirst);
  });
});
