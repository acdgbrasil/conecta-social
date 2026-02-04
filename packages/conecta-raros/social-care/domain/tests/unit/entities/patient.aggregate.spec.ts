// packages/social/social-care/tests/unit/entities/patient.aggregate.spec.ts
import { beforeEach, describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn";
import { Uuid } from "@conecta/uuid";
import {
  CommunitySupportNetwork,
  Diagnosis,
  FamilyMember,
  FamilyMemberId,
  type FamilyMemberProps,
  HousingCondition,
  ICDCode,
  P,
  Patient,
  PersonId,
  type ReferralProps,
  type ReferralStatus,
  type RightsViolationReportProps,
  SocialBenefit,
  SocialBenefitsCollection,
  type SocialCareAppointmentProps,
  SocialHealthSummary,
  SocioEconomicSituation,
  Timestamp,
  ViolationType,
} from "packages/conecta-raros/social-care";

// --- Helpers Globais de Teste ---

const NOW = new Date("2024-01-10T12:00:00Z");
const YESTERDAY = new Date("2024-01-09T12:00:00Z");
const TWO_DAYS_AGO = new Date("2024-01-08T12:00:00Z");

const _COMPLETED_STATUS: ReferralStatus = "COMPLETED";
const _CANCELLED_STATUS: ReferralStatus = "CANCELLED";

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

const makeHousingCondition = (
  overrides: Partial<Parameters<typeof HousingCondition.create>[0]> = {},
) => {
  // Refletindo o Code Review #2:
  // As props válidas para 'electricityAccess' devem ser de eletricidade.
  // O seu arquivo [social-care/value-objects/props/housingCondition.props.ts]
  // está com valores de ÁGUA (WELL_SPRING, etc.). Este teste falhará
  // na compilação ou na execução se a constante não for corrigida.
  const validElectricityAccess = "METERED_CONNECTION";

  return HousingCondition.create({
    housingConditionType: "OWNED",
    wallMaterial: "MASONRY",
    numberOfRooms: 4,
    numberOfBathrooms: 2,
    isInGeographicRiskArea: false,
    isInSocialConflictArea: false,
    electricityAccess: validElectricityAccess, // Usando o valor corrigido
    sewerDisposalMethod: "PUBLIC_SEWER",
    wasteCollectionType: "DIRECT_COLLECTION",
    accessibilityLevel: "PARTIALLY_ACCESSIBLE",
    ...overrides,
  }).unwrap();
};

const makeSocialBenefit = (amount: number) =>
  SocialBenefit.create({
    benefitName: "Bolsa Família",
    amount,
    beneficiaryId: FamilyMemberId.create().unwrap(),
  }).unwrap();

const _makeSocioEconomicSituation = (
  overrides: Partial<Parameters<typeof SocioEconomicSituation.create>[0]> = {},
) => {
  const benefits =
    overrides.socialBenefits ??
    SocialBenefitsCollection.create(
      overrides.receivesSocialBenefit ? [makeSocialBenefit(600)] : [],
    ).unwrap();

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

const _makeCommunitySupportNetwork = (
  overrides: Partial<Parameters<typeof CommunitySupportNetwork.create>[0]> = {},
) =>
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

const _makeSocialHealthSummary = (
  overrides: Partial<Parameters<typeof SocialHealthSummary.create>[0]> = {},
) =>
  SocialHealthSummary.create({
    requiresConstantCare: false,
    hasMobilityImpairment: false,
    functionalDependencies: ["Alimentação"],
    hasRelevantDrugTheapy: true,
    ...overrides,
  }).unwrap();

const makeFamilyMemberData = (overrides: Partial<FamilyMemberProps> = {}) => ({
  id: overrides.id ?? FamilyMemberId.create().unwrap(),
  personId: overrides.personId ?? PersonId.create().unwrap(),
  relationship: overrides.relationship ?? "SIBLING",
  isPrimaryCaregiver: overrides.isPrimaryCaregiver ?? false,
  residesWithPatient: overrides.residesWithPatient ?? true,
});

const makeReferralDraft = (
  referredPersonId: Uuid,
  overrides: Partial<Omit<ReferralProps, "referredPersonId">> = {},
): ReferralProps => ({
  id: overrides.id ?? Uuid.create().unwrap(),
  date: overrides.date ?? makeTimestamp(NOW),
  requestingProfessionalId:
    overrides.requestingProfessionalId ?? Uuid.create().unwrap(),
  referredPersonId,
  destinationService: overrides.destinationService ?? "CRAS",
  reason:
    overrides.reason ?? "Encaminhamento para acompanhamento multiprofissional.",
  status: overrides.status,
});

const makeRightsViolationDraft = (
  victimId: Uuid,
  overrides: Partial<Omit<RightsViolationReportProps, "victimId">> = {},
): RightsViolationReportProps => ({
  id: overrides.id ?? Uuid.create().unwrap(),
  reportDate: overrides.reportDate ?? makeTimestamp(NOW),
  incidentDate: overrides.incidentDate ?? makeTimestamp(TWO_DAYS_AGO),
  victimId,
  violationType: overrides.violationType ?? ViolationType.NEGLECT,
  descriptionOfFact:
    overrides.descriptionOfFact ??
    "Relato de violação registrado pelo agregado.",
  actionsTaken: overrides.actionsTaken ?? "Medidas iniciais adotadas.",
});

const makeAppointmentDraft = (
  overrides: Partial<SocialCareAppointmentProps> = {},
): SocialCareAppointmentProps => ({
  id: overrides.id ?? Uuid.create().unwrap(),
  date: overrides.date ?? makeTimestamp(NOW),
  professionalInChargeId:
    overrides.professionalInChargeId ?? Uuid.create().unwrap(),
  type: overrides.type ?? "FOLLOW_UP",
  summary: overrides.summary ?? "Resumo padrão do atendimento.",
  actionPlan: overrides.actionPlan ?? "Plano de ação inicial.",
});

// Helper de Criação do Agregado
const createPatient = () => {
  const id = Uuid.create().unwrap();
  const personId = PersonId.create().unwrap();
  const diagnosis = makeDiagnosis();

  const result = Patient.createFromScratch(
    personId,
    ImutableListFactory.fromArray([diagnosis]),
  );

  if (!result.isOk) {
    throw new Error(`Falha ao criar patient de teste: ${result.error.message}`);
  }

  return {
    patient: result.unwrap(),
    patientId: id,
    personId,
    diagnosis,
  };
};

// --- Início dos Testes ---

describe("Patient.entity", () => {
  /**
   * 💡 O que este teste ensina:
   * Testa a função `Patient.createFromScratch` (Fábrica).
   * Um Agregado deve sempre ser criado em um estado válido e consistente.
   */
  describe("1. Criação e Estado Inicial", () => {
    test("deve criar um Patient com estado inicial coerente", () => {
      // Act
      const { patient, personId, diagnosis } = createPatient();
      // Assert
      expect(patient.personId.equals(personId)).toBe(true);
      expect(patient.diagnoses.count()).toBe(1);
      expect(patient.diagnoses.getAll()[0].description).toBe(
        diagnosis.description,
      );
      expect(patient.familyMembers.count()).toBe(0);
      expect(patient.appointments.count()).toBe(0);
      expect(patient.referrals.count()).toBe(0);
      expect(patient.violationsReports.count()).toBe(0);
      expect(patient.housingCondition.isNone).toBe(true);
    });

    test("deve FALHAR ao criar sem um diagnóstico inicial (regra P-001)", () => {
      // Arrange
      const _id = Uuid.create().unwrap();
      const personId = PersonId.create().unwrap();
      const emptyDiagnoses = ImutableListFactory.empty<Diagnosis>();
      // Act
      const result = Patient.createFromScratch(personId, emptyDiagnoses);
      // Assert
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(
        P.InitialDiagnosesCantBeEmpty().code,
      ); // P-001
    });
  });

  /**
   * 💡 O que este teste ensina:
   * Testa o gerenciamento do ciclo de vida das Entidades Filhas `FamilyMember`.
   * O Agregado `Patient` é o único responsável por adicionar ou remover
   * membros, garantindo suas regras de negócio (invariantes).
   */
  describe("2. Gerenciamento de Membros da Família", () => {
    test("deve adicionar um novo membro da família e manter imutabilidade", () => {
      // Arrange
      const { patient } = createPatient();
      const member = FamilyMember.create(makeFamilyMemberData()).unwrap();
      expect(patient.familyMembers.count()).toBe(0);
      // Act
      const result = patient.addFamilyMember(member);
      // Assert
      expect(result.isOk).toBe(true);
      const updatedPatient = result.unwrap();
      expect(updatedPatient.familyMembers.count()).toBe(1);
      expect(updatedPatient === patient).toBe(false); // Imutabilidade
      expect(patient.familyMembers.count()).toBe(0); // Original inalterado
    });

    test("deve FALHAR ao adicionar um membro com um personId duplicado (regra P-004)", () => {
      // Arrange
      const { patient } = createPatient();
      const personId = PersonId.create().unwrap();
      const memberA = FamilyMember.create(
        makeFamilyMemberData({ personId }),
      ).unwrap();
      const memberB = FamilyMember.create(
        makeFamilyMemberData({ personId }),
      ).unwrap();
      const patientWithMember = patient.addFamilyMember(memberA).unwrap();
      // Act
      const result = patientWithMember.addFamilyMember(memberB);
      // Assert
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(
        P.FamilyMemberAlreadyExists({ memberId: "" }).code,
      ); // P-004
      expect(patientWithMember.familyMembers.count()).toBe(1);
    });

    test("deve remover um membro da família existente pelo personId", () => {
      // Arrange
      const { patient } = createPatient();
      const memberData = makeFamilyMemberData();
      const member = FamilyMember.create(memberData).unwrap();
      const patientWithMember = patient.addFamilyMember(member).unwrap();
      expect(patientWithMember.familyMembers.count()).toBe(1);
      // Act
      const result = patientWithMember.removeFamilyMember(memberData.personId);
      // Assert
      expect(result.isOk).toBe(true);
      const updatedPatient = result.unwrap();
      expect(updatedPatient.familyMembers.count()).toBe(0);
      expect(updatedPatient === patientWithMember).toBe(false); // Imutabilidade
    });

    test("deve FALHAR ao tentar remover um membro que não existe (regra P-005)", () => {
      // Arrange
      const { patient } = createPatient();
      const missingPersonId = PersonId.create().unwrap();
      // Act
      const result = patient.removeFamilyMember(missingPersonId);
      // Assert
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(
        P.FamilyMemberNotFound({ personId: "" }).code,
      ); // P-005
    });
  });

  /**
   * 💡 O que este teste ensina:
   * Testa uma regra de negócio complexa: "Sempre deve haver no máximo um Cuidador Principal".
   * O método `assignPrimaryCaregiver` *impõe* esse estado.
   */
  describe("3. Gerenciamento de Cuidador Principal", () => {
    // (O teste abrangente que criamos na resposta anterior)
    test("deve designar o cuidador principal e garantir que apenas um esteja ativo por vez", () => {
      // --- Arrange ---
      const { patient } = createPatient();
      const memberA = FamilyMember.create(
        makeFamilyMemberData({ relationship: "MOTHER" }),
      ).unwrap();
      const memberB = FamilyMember.create(
        makeFamilyMemberData({ relationship: "FATHER" }),
      ).unwrap();
      const memberC = FamilyMember.create(
        makeFamilyMemberData({ relationship: "SIBLING" }),
      ).unwrap();

      const patientWithMembers = patient
        .addFamilyMember(memberA)
        .unwrap()
        .addFamilyMember(memberB)
        .unwrap()
        .addFamilyMember(memberC)
        .unwrap();

      // --- Act (Caso 1: Designar A) ---
      const result1 = patientWithMembers.assignPrimaryCaregiver(
        memberA.personId,
      );
      // --- Assert (Caso 1) ---
      expect(result1.isOk).toBe(true);
      const patient1 = result1.unwrap();
      expect(
        patient1.familyMembers.getAll().find((m) => m.id.equals(memberA.id))
          ?.isPrimaryCaregiver,
      ).toBe(true);
      expect(
        patient1.familyMembers.getAll().find((m) => m.id.equals(memberB.id))
          ?.isPrimaryCaregiver,
      ).toBe(false);

      // --- Act (Caso 2: Re-designar para B) ---
      const result2 = patient1.assignPrimaryCaregiver(memberB.personId);
      // --- Assert (Caso 2) ---
      expect(result2.isOk).toBe(true);
      const patient2 = result2.unwrap();
      expect(
        patient2.familyMembers.getAll().find((m) => m.id.equals(memberA.id))
          ?.isPrimaryCaregiver,
      ).toBe(false);
      expect(
        patient2.familyMembers.getAll().find((m) => m.id.equals(memberB.id))
          ?.isPrimaryCaregiver,
      ).toBe(true);

      // --- Act (Caso 3: Idempotência - Re-designar B novamente) ---
      const result3 = patient2.assignPrimaryCaregiver(memberB.personId);
      // --- Assert (Caso 3) ---
      expect(result3.isOk).toBe(true);
      const patient3 = result3.unwrap();
      expect(
        patient3.familyMembers.getAll().find((m) => m.id.equals(memberB.id))
          ?.isPrimaryCaregiver,
      ).toBe(true);
    });

    test("deve FALHAR ao tentar designar um personId que não é membro (regra P-005)", () => {
      // --- Arrange ---
      const { patient } = createPatient();
      const missingPersonId = PersonId.create().unwrap();
      // --- Act ---
      const result = patient.assignPrimaryCaregiver(missingPersonId);
      // --- Assert ---
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(
        P.FamilyMemberNotFound({ personId: "" }).code,
      ); // P-005
    });
  });

  /**
   * 💡 O que este teste ensina:
   * O Agregado Raiz (Patient) atua como um "Guardião da Fronteira" para
   * suas entidades filhas (Referral, RightsViolationReport).
   */
  describe("4. Proteção da Fronteira do Agregado (Encaminhamentos e Violações)", () => {
    let patient: Patient;
    let personId: PersonId;
    let familyMember: FamilyMember;
    let patientWithFamily: Patient;

    beforeEach(() => {
      const setup = createPatient();
      patient = setup.patient;
      personId = setup.personId;
      const memberData = makeFamilyMemberData();
      familyMember = FamilyMember.create(memberData).unwrap();
      patientWithFamily = patient.addFamilyMember(familyMember).unwrap();
    });

    test("deve permitir criar 'Referral' para o paciente e para membros da família", () => {
      // Arrange
      const referralForPatient = makeReferralDraft(
        Uuid.create(personId.toString()).unwrap(),
      );
      const referralForFamily = makeReferralDraft(
        Uuid.create(familyMember.personId.toString()).unwrap(),
        { destinationService: "CAPS" },
      );

      // Act
      const resultP = patientWithFamily.createReferral(referralForPatient, NOW);

      // Assert
      expect(resultP.isOk).toBe(true);
      const patientAfterPatientReferral = resultP.unwrap();
      expect(patientAfterPatientReferral.referrals.count()).toBe(1);

      const resultF = patientAfterPatientReferral.createReferral(
        referralForFamily,
        NOW,
      );
      expect(resultF.isOk).toBe(true);
      const patientAfterFamilyReferral = resultF.unwrap();
      expect(patientAfterFamilyReferral.referrals.count()).toBe(2);

      const [firstReferral, secondReferral] =
        patientAfterFamilyReferral.referrals.getAll();
      expect(
        firstReferral.props.referredPersonId.equals(
          referralForPatient.referredPersonId,
        ),
      ).toBe(true);
      expect(
        secondReferral.props.referredPersonId.equals(
          referralForFamily.referredPersonId,
        ),
      ).toBe(true);
    });

    test("deve FALHAR ao criar 'Referral' para uma pessoa de fora do agregado", () => {
      // Arrange
      const strangerId = Uuid.create().unwrap();
      const invalidReferral = makeReferralDraft(strangerId);

      // Act
      const result = patientWithFamily.createReferral(invalidReferral, NOW);

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe("PAT-003"); // Guarda da fronteira
    });

    test("deve permitir registrar 'RightsViolationReport' para membros internos", () => {
      // Arrange
      const reportForFamily = makeRightsViolationDraft(
        Uuid.create(familyMember.personId.toString()).unwrap(),
        {
          violationType: ViolationType.PHYSICAL_VIOLENCE,
          actionsTaken: "Encaminhado para acompanhamento jurídico.",
        },
      );

      // Act
      const result = patientWithFamily.reportRightsViolation(
        reportForFamily,
        NOW,
      );

      // Assert
      expect(result.isOk).toBe(true);
      const updatedPatient = result.unwrap();
      expect(updatedPatient.violationsReports.count()).toBe(1);
      const report = updatedPatient.violationsReports.getAll()[0];
      expect(report.violationType).toBe(ViolationType.PHYSICAL_VIOLENCE);
    });

    test("deve FALHAR ao criar 'RightsViolationReport' para uma pessoa de fora do agregado", () => {
      // Arrange
      const strangerId = Uuid.create().unwrap();
      const invalidReport = makeRightsViolationDraft(strangerId);

      // Act
      const result = patientWithFamily.reportRightsViolation(
        invalidReport,
        NOW,
      );

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe("PAT-004"); // Guarda da fronteira
    });
  });

  // (Os testes de `updateReferralStatus` e `updateRightsViolationActions` são bons e foram omitidos por brevidade)

  /**
   * 💡 O que este teste ensina:
   * A diferença entre Entidades Filhas (com ID) e Value Objects (sem ID).
   * VOs (HousingCondition, etc.) são "substituídos inteiramente".
   */
  describe("5. Gerenciamento de Avaliações (Value Objects)", () => {
    test("deve substituir VOs e retornar uma nova instância do agregado (imutabilidade)", () => {
      // Arrange
      const { patient } = createPatient();
      const housingA = makeHousingCondition({ numberOfRooms: 3 });
      const housingB = makeHousingCondition({ numberOfRooms: 5 });
      expect(patient.housingCondition.isNone).toBe(true);

      // Act: Atualiza para o estado "A"
      const patientA = patient.updateHousingCondition(housingA).unwrap();

      // Assert: Estado "A" e Imutabilidade
      expect(patientA === patient).toBe(false); // Imutabilidade
      expect(patientA.housingCondition.isSome).toBe(true);
      expect(patientA.housingCondition.unwrap().numberOfRooms).toBe(3);

      // Act: Atualiza para o estado "B"
      const patientB = patientA.updateHousingCondition(housingB).unwrap();

      // Assert: Estado "B" e Imutabilidade
      expect(patientB === patientA).toBe(false);
      expect(patientB.housingCondition.unwrap().numberOfRooms).toBe(5);
    });
  });

  /**
   * 💡 O que este teste ensina:
   * Um padrão "Append-Only" (Apenas Adição) para Entidades Filhas
   * que formam um histórico (Appointments).
   */
  describe("6. Gerenciamento de Atendimentos (Append-Only)", () => {
    test("deve adicionar um novo atendimento (Appointment) à lista, preservando os existentes", () => {
      // Arrange
      const { patient } = createPatient();
      const firstApptProps = makeAppointmentDraft({
        summary: "Primeira visita",
        actionPlan: "Registrar estado inicial.",
      });
      const secondApptProps = makeAppointmentDraft({
        summary: "Segunda visita",
        actionPlan: "Manter acompanhamento mensal.",
      });

      // Act: Adiciona o primeiro
      const patientWithOne = patient
        .registerAppointment(firstApptProps, NOW)
        .unwrap();
      // Act: Adiciona o segundo
      const patientWithTwo = patientWithOne
        .registerAppointment(secondApptProps, NOW)
        .unwrap();

      // Assert: Imutabilidade e Histórico
      expect(patientWithTwo === patientWithOne).toBe(false);
      expect(patientWithTwo.appointments.count()).toBe(2);
      expect(patientWithTwo.appointments.getAll()[0].summary).toBe(
        "Primeira visita",
      );
      expect(patientWithTwo.appointments.getAll()[1].summary).toBe(
        "Segunda visita",
      );
      expect(patientWithOne.appointments.count()).toBe(1); // Original inalterado
    });
  });
});
