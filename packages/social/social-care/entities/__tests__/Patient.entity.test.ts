import { beforeEach, describe, expect, test } from "bun:test";
import { Patient } from "../Patient.entity";
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
// Presume que FamilyMember.entity.ts foi atualizado conforme nossa discussão
import { FamilyMember, FamilyMemberProps } from "../FamilyMember.entity"; 
import { None } from "src"; // 'src' presumivelmente exporta 'None' de @conecta/option

// --- Helpers Globais de Teste ---

const NOW = new Date("2024-01-10T12:00:00Z");
const YESTERDAY = new Date("2024-01-09T12:00:00Z");
const TWO_DAYS_AGO = new Date("2024-01-08T12:00:00Z");

const COMPLETED_STATUS: ReferralStatus = "COMPLETED";
const CANCELLED_STATUS: ReferralStatus = "CANCELLED";

// Helpers para criar VOs
const makeTimestamp = (value: Date) => Timestamp.create({ value }).unwrap();

const makeDiagnosis = () => {
  const diagnosisDate = makeTimestamp(YESTERDAY);
  const reference = makeTimestamp(NOW);
  return Diagnosis.create(
    {
      id: ICDCode.create("A00.0").unwrap(), //
      date: diagnosisDate,
      description: "Cólera devido a Vibrio cholerae clássico.",
    },
    reference,
  ).unwrap(); //
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
  }).unwrap(); //

const makeSocialBenefit = (amount: number) =>
  SocialBenefit.create({
    benefitName: "Bolsa Família",
    amount,
    beneficiaryId: FamilyMemberId.create().unwrap(), //
  }).unwrap(); //

const makeSocioEconomicSituation = (overrides: Partial<Parameters<typeof SocioEconomicSituation.create>[0]> = {}) => {
  const benefits =
    overrides.socialBenefits ??
    SocialBenefitsCollection.create(overrides.receivesSocialBenefit ? [makeSocialBenefit(600)] : []).unwrap(); //

  return SocioEconomicSituation.create({
    totalFamilyIncome: overrides.receivesSocialBenefit ? 1200 : 1800,
    incomePerCapita: overrides.receivesSocialBenefit ? 240 : 360,
    receivesSocialBenefit: overrides.receivesSocialBenefit ?? false,
    socialBenefits: benefits,
    mainSourceOfIncome: "Informal jobs",
    hasUnemployed: true,
    ...overrides,
  }).unwrap(); //
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
  }).unwrap(); //

const makeSocialHealthSummary = (overrides: Partial<Parameters<typeof SocialHealthSummary.create>[0]> = {}) =>
  SocialHealthSummary.create({
    requiresConstantCare: false,
    hasMobilityImpairment: false,
    functionalDependencies: ImutableListFactory.fromArray(["Alimentação"]),
    hasRelevantDrugTheapy: true,
    ...overrides,
  }).unwrap(); //

const makeFamilyMemberData = (overrides: Partial<FamilyMemberProps> = {}) => ({
  id: overrides.id ?? FamilyMemberId.create().unwrap(),
  personId: overrides.personId ?? PersonId.create().unwrap(), //
  relationship: overrides.relationship ?? "SIBLING",
  isPrimaryCaregiver: overrides.isPrimaryCaregiver ?? false,
  residesWithPatient: overrides.residesWithPatient ?? true,
});

// Helper de Criação do Agregado
const createPatient = () => {
  const id = Uuid.create().unwrap();
  const personId = PersonId.create().unwrap();
  const diagnosis = makeDiagnosis();
  
  // Usamos ImutableListFactory conforme a assinatura de Patient.create
  const result = Patient.create(id, personId, ImutableListFactory.fromArray([diagnosis]));

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
   * Testa a função `Patient.create` (Fábrica).
   * Um Agregado deve sempre ser criado em um estado válido e consistente.
   * Ele garante que o estado inicial (props) está correto:
   * - IDs obrigatórios (`personId`) estão presentes.
   * - Listas de entidades filhas (`familyMembers`, `referrals`, etc.) começam vazias.
   * - Value Objects opcionais (`housingCondition`, etc.) começam como `None()`.
   */
  describe("1. Criação e Estado Inicial", () => {
    test("deve criar um Patient com estado inicial coerente", () => {
      // Act
      const { patient, patientId, personId, diagnosis } = createPatient();

      // Assert
      expect(patient.id.equals(patientId)).toBe(true);
      expect(patient.personId.equals(personId)).toBe(true);
      
      // Valida Diagnóstico inicial
      expect(patient.diagnoses.count()).toBe(1);
      expect(patient.diagnoses.getAll()[0].description).toBe(diagnosis.description);
      
      // Valida listas vazias
      expect(patient.familyMembers.count()).toBe(0);
      expect(patient.appointments.count()).toBe(0);
      expect(patient.referrals.count()).toBe(0);
      expect(patient.violationsReports.count()).toBe(0);
      
      // Valida VOs opcionais
      expect(patient.housingCondition.isNone).toBe(true);
      expect(patient.socioeconomicSituation.isNone).toBe(true);
      expect(patient.communitySupportNetwork.isNone).toBe(true);
      expect(patient.socialHealthSummary.isNone).toBe(true);
    });

    test("deve FALHAR ao criar sem um diagnóstico inicial", () => {
      // Arrange
      const id = Uuid.create().unwrap();
      const personId = PersonId.create().unwrap();
      const emptyDiagnoses = ImutableListFactory.empty<Diagnosis>();

      // Act
      const result = Patient.create(id, personId, emptyDiagnoses);

      // Assert
      expect(result.isErr).toBe(true);
      // P-001 = InitialDiagnosesCantBeEmpty
      expect(result.unwrapErr().code).toBe("P-001");
    });
    
    // (Outros testes de falha na criação, como P-002 e P-003, seguiriam aqui)
  });

  /**
   * 💡 O que este teste ensina:
   * Testa o gerenciamento do ciclo de vida das Entidades Filhas `FamilyMember`.
   * O Agregado `Patient` é o único responsável por adicionar ou remover
   * membros, garantindo regras de negócio (invariantes) como:
   * 1. A *mesma pessoa* (`personId`) não pode ser adicionada duas vezes.
   * 2. Você só pode remover um membro que de fato existe.
   * 3. Todas as operações retornam uma *nova instância* do Agregado (imutabilidade).
   */
  describe("2. Gerenciamento de Membros da Família", () => {
    
    test("deve adicionar um novo membro da família e manter imutabilidade", () => {
      // Arrange
      const { patient } = createPatient();
      const member = FamilyMember.create(makeFamilyMemberData()).unwrap(); //
      
      expect(patient.familyMembers.count()).toBe(0); // Estado inicial

      // Act
      const result = patient.addFamilyMember(member);

      // Assert
      expect(result.isOk).toBe(true);
      const updatedPatient = result.unwrap();
      
      expect(updatedPatient.familyMembers.count()).toBe(1);
      expect(updatedPatient.familyMembers.getAll()[0].id.equals(member.id)).toBe(true);
      
      // Valida imutabilidade
      expect(updatedPatient).not.toBe(patient);
      expect(patient.familyMembers.count()).toBe(0);
    });
    
    test("deve FALHAR ao adicionar um membro com um personId duplicado", () => {
      // Arrange
      const { patient } = createPatient();
      const personId = PersonId.create().unwrap();
      
      const memberA = FamilyMember.create(makeFamilyMemberData({ personId })).unwrap();
      // 'memberB' é uma pessoa diferente (outro 'id'), mas com o mesmo 'personId'
      const memberB = FamilyMember.create(makeFamilyMemberData({ personId })).unwrap(); 
      
      const patientWithMember = patient.addFamilyMember(memberA).unwrap();
      expect(patientWithMember.familyMembers.count()).toBe(1);

      // Act
      const result = patientWithMember.addFamilyMember(memberB);

      // Assert
      expect(result.isErr).toBe(true);
      // P-004 = FamilyMemberAlreadyExists
      expect(result.unwrapErr().code).toBe("P-004"); 
      
      // Garante que o estado original não mudou
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
      
      // Valida imutabilidade
      expect(updatedPatient).not.toBe(patientWithMember);
      expect(patientWithMember.familyMembers.count()).toBe(1);
    });
    
    test("deve FALHAR ao tentar remover um membro que não existe", () => {
      // Arrange
      const { patient } = createPatient();
      const missingPersonId = PersonId.create().unwrap();
      
      expect(patient.familyMembers.count()).toBe(0);

      // Act
      const result = patient.removeFamilyMember(missingPersonId);

      // Assert
      expect(result.isErr).toBe(true);
      // P-005 = FamilyMemberNotFound
      expect(result.unwrapErr().code).toBe("P-005");
    });
  });
  
  /**
   * 💡 O que este teste ensina:
   * Testa uma regra de negócio complexa que atravessa múltiplas Entidades Filhas.
   * A regra é: "Sempre deve haver no máximo um Cuidador Principal".
   * O método `assignPrimaryCaregiver` *impõe* esse estado:
   * 1. O 'personId' alvo é definido como `isPrimaryCaregiver = true`.
   * 2. *Todos os outros* membros são definidos como `isPrimaryCaregiver = false`.
   * 3. Ele falha se o `personId` alvo não for um membro (Validação de Guarda).
   * 4. O método é idempotente (chamar de novo para o mesmo cuidador funciona).
   */
  describe("3. Gerenciamento de Cuidador Principal", () => {
    test("deve designar o cuidador principal e garantir que apenas um esteja ativo por vez", () => {
      // --- Arrange ---
      const { patient } = createPatient();

      // 1. Criar dados de 3 membros
      const memberAProps = makeFamilyMemberData({ relationship: "MOTHER" });
      const memberBProps = makeFamilyMemberData({ relationship: "FATHER" });
      const memberCProps = makeFamilyMemberData({ relationship: "SIBLING" });
      
      // 2. Criar as entidades FamilyMember
      const memberA = FamilyMember.create(memberAProps).unwrap();
      const memberB = FamilyMember.create(memberBProps).unwrap();
      const memberC = FamilyMember.create(memberCProps).unwrap();

      // 3. Adicionar os 3 membros ao paciente
      const patientWithMembers = patient
        .addFamilyMember(memberA)
        .unwrap()
        .addFamilyMember(memberB)
        .unwrap()
        .addFamilyMember(memberC)
        .unwrap();

      // Estado Inicial: [A(false), B(false), C(false)]
      expect(patientWithMembers.familyMembers.count()).toBe(3);
      expect(patientWithMembers.familyMembers.getAll().every(m => !m.isPrimaryCaregiver)).toBe(true);

      // --- Act (Caso 1: Designar A) ---
      const result1 = patientWithMembers.assignPrimaryCaregiver(memberA.personId);

      // --- Assert (Caso 1) ---
      expect(result1.isOk).toBe(true);
      const patient1 = result1.unwrap();
      
      // Testa imutabilidade
      expect(patient1).not.toBe(patientWithMembers); 
      
      // Testa o estado: [A(true), B(false), C(false)]
      expect(patient1.familyMembers.getAll().find(m => m.id.equals(memberA.id))?.isPrimaryCaregiver).toBe(true);
      expect(patient1.familyMembers.getAll().find(m => m.id.equals(memberB.id))?.isPrimaryCaregiver).toBe(false);
      expect(patient1.familyMembers.getAll().find(m => m.id.equals(memberC.id))?.isPrimaryCaregiver).toBe(false);

      // --- Act (Caso 2: Re-designar para B) ---
      // Isto testa que A será corretamente definido como 'false'.
      const result2 = patient1.assignPrimaryCaregiver(memberB.personId);
      
      // --- Assert (Caso 2) ---
      expect(result2.isOk).toBe(true);
      const patient2 = result2.unwrap();

      // Testa imutabilidade
      expect(patient2).not.toBe(patient1);

      // Testa o estado: [A(false), B(true), C(false)]
      expect(patient2.familyMembers.getAll().find(m => m.id.equals(memberA.id))?.isPrimaryCaregiver).toBe(false);
      expect(patient2.familyMembers.getAll().find(m => m.id.equals(memberB.id))?.isPrimaryCaregiver).toBe(true);
      expect(patient2.familyMembers.getAll().find(m => m.id.equals(memberC.id))?.isPrimaryCaregiver).toBe(false);

      // --- Act (Caso 3: Idempotência - Re-designar B novamente) ---
      // Isto testa que a lógica não quebra se chamada novamente para o mesmo cuidador.
      const result3 = patient2.assignPrimaryCaregiver(memberB.personId);

      // --- Assert (Caso 3) ---
      expect(result3.isOk).toBe(true);
      const patient3 = result3.unwrap();
      
      // Testa o estado (deve ser o mesmo): [A(false), B(true), C(false)]
      expect(patient3.familyMembers.getAll().find(m => m.id.equals(memberA.id))?.isPrimaryCaregiver).toBe(false);
      expect(patient3.familyMembers.getAll().find(m => m.id.equals(memberB.id))?.isPrimaryCaregiver).toBe(true);
      expect(patient3.familyMembers.getAll().find(m => m.id.equals(memberC.id))?.isPrimaryCaregiver).toBe(false);
    });

    test("deve FALHAR ao tentar designar um personId que não é membro da família", () => {
      // --- Arrange ---
      const { patient } = createPatient();
      const missingPersonId = PersonId.create().unwrap();
  
      // --- Act (Caso 4: Erro - Membro não encontrado) ---
      const result = patient.assignPrimaryCaregiver(missingPersonId);
  
      // --- Assert (Caso 4) ---
      expect(result.isErr).toBe(true);
      
      // Deve falhar com o erro P-005 (FamilyMemberNotFound)
      expect(result.unwrapErr().code).toBe("P-005");
    });
  });

  /**
   * 💡 O que este teste ensina:
   * O Agregado Raiz (Patient) atua como um "Guardião da Fronteira".
   * Esta funcionalidade (createReferral) valida que um encaminhamento
   * (uma Entidade Filha) só pode ser criado se pertencer a alguém
   * *dentro* da fronteira do agregado (o paciente ou um familiar).
   * Isso impede que um encaminhamento de uma pessoa aleatória seja
   * associado a este paciente, garantindo a consistência dos dados.
   */
  describe("4. Gerenciamento de Encaminhamentos (Referral)", () => {
    
    // Helper de setup para este bloco
    let patient: Patient;
    let personId: PersonId;
    let familyMember: FamilyMember;
    let patientWithFamily: Patient;

    // Usamos 'beforeEach' para garantir que cada teste rode com um paciente "limpo"
    beforeEach(() => {
      const setup = createPatient();
      patient = setup.patient;
      personId = setup.personId;
      
      const memberData = makeFamilyMemberData();
      familyMember = FamilyMember.create(memberData).unwrap();
      
      patientWithFamily = patient.addFamilyMember(familyMember).unwrap();
    });

    test("deve criar um encaminhamento (Referral) para o PRÓPRIO paciente", () => {
      // Arrange
      const referralForPatient = {
        id: Uuid.create().unwrap(),
        date: makeTimestamp(TWO_DAYS_AGO),
        requestingProfessionalId: Uuid.create().unwrap(),
        referredPersonId: Uuid.create(personId.toString()).unwrap(), // O alvo é o próprio paciente
        destinationService: "CRAS",
        reason: "Acompanhar adesão a benefícios.",
      };

      // Act
      const result = patientWithFamily.createReferral(referralForPatient, NOW);

      // Assert
      expect(result.isOk).toBe(true);
      const updatedPatient = result.unwrap();
      expect(updatedPatient.referrals.count()).toBe(1);
      expect(updatedPatient.referrals.getAll()[0].destinationService).toBe("CRAS");
    });

    test("deve criar um encaminhamento (Referral) para um MEMBRO DA FAMÍLIA", () => {
      // Arrange
      const referralForFamily = {
        id: Uuid.create().unwrap(),
        date: makeTimestamp(TWO_DAYS_AGO),
        requestingProfessionalId: Uuid.create().unwrap(),
        referredPersonId: Uuid.create(familyMember.personId.toString()).unwrap(), // O alvo é o familiar
        destinationService: "CRAS",
        reason: "Acompanhar adesão a benefícios.",
      };

      // Act
      const result = patientWithFamily.createReferral(referralForFamily, NOW);

      // Assert
      expect(result.isOk).toBe(true);
      const updatedPatient = result.unwrap();
      expect(updatedPatient.referrals.count()).toBe(1);
    });

    test("deve FALHAR ao criar encaminhamento para uma pessoa de fora do agregado (um 'estranho')", () => {
      // Arrange
      const strangerPersonId = PersonId.create().unwrap(); // Um ID aleatório

      const invalidReferral = {
        id: Uuid.create().unwrap(),
        date: makeTimestamp(TWO_DAYS_AGO),
        requestingProfessionalId: Uuid.create().unwrap(),
        referredPersonId: Uuid.create(strangerPersonId.toString()).unwrap(), // O alvo é um estranho
        destinationService: "CRAS",
        reason: "Acompanhar adesão a benefícios.",
      };

      // Act
      const result = patientWithFamily.createReferral(invalidReferral, NOW);

      // Assert
      expect(result.isErr).toBe(true);
      // "PAT-003" é o código do seu teste original.
      // Idealmente, viria de `P.REFERRAL_TARGET_NOT_IN_AGGREGATE`
      expect(result.unwrapErr().code).toBe("PAT-003");
    });

    test("deve atualizar o status de um encaminhamento existente e garantir imutabilidade", () => {
      // Arrange
      const referralProps = {
        id: Uuid.create().unwrap(),
        date: makeTimestamp(TWO_DAYS_AGO),
        requestingProfessionalId: Uuid.create().unwrap(),
        referredPersonId: Uuid.create(personId.toString()).unwrap(),
        destinationService: "CREAS",
        reason: "Atendimento especializado.",
      };

      const patientWithReferral = patient.createReferral(referralProps, NOW).unwrap();
      expect(patientWithReferral.referrals.getAll()[0].status).toBe("PENDING"); //

      // Act
      const result = patientWithReferral.updateReferralStatus(referralProps.id, COMPLETED_STATUS, "Encaminhamento concluído.");

      // Assert: Sucesso
      expect(result.isOk).toBe(true);
      const updatedPatient = result.unwrap();
      const updatedReferral = updatedPatient.referrals.find((item) => item.id.equals(referralProps.id));
      
      expect(updatedReferral?.status).toBe("COMPLETED");
      
      // Testa imutabilidade
      expect(updatedPatient).not.toBe(patientWithReferral);
      expect(patientWithReferral.referrals.getAll()[0].status).toBe("PENDING");
    });
    
    test("deve FALHAR ao tentar atualizar um encaminhamento que não existe", () => {
      // Arrange
      const nonExistentId = Uuid.create().unwrap();

      // Act
      const result = patient.updateReferralStatus(nonExistentId, CANCELLED_STATUS, "Sem atendimento.");

      // Assert
      expect(result.isErr).toBe(true);
      // "PAT-005" é o código do seu teste original.
      expect(result.unwrapErr().code).toBe("PAT-005");
    });
  });

  /**
   * 💡 O que este teste ensina:
   *
   * Similar ao 'Referral', este teste prova que o Agregado 'Patient'
   * protege sua fronteira. Um 'RightsViolationReport' só pode ser
   * associado a este 'Patient' se a vítima (victimId) for
   * o próprio paciente ou um membro da família reconhecido.
   */
  describe("5. Gerenciamento de Relatos de Violação", () => {

    let patient: Patient;
    let personId: PersonId;
    let familyMember: FamilyMember;
    let patientWithFamily: Patient;
    let baseReportProps: Omit<RightsViolationReportProps, "id" | "victimId">;

    beforeEach(() => {
      const setup = createPatient();
      patient = setup.patient;
      personId = setup.personId;
      
      const memberData = makeFamilyMemberData();
      familyMember = FamilyMember.create(memberData).unwrap();
      
      patientWithFamily = patient.addFamilyMember(familyMember).unwrap();
      
      baseReportProps = {
        reportDate: makeTimestamp(YESTERDAY),
        incidentDate: makeTimestamp(TWO_DAYS_AGO),
        violationType: ViolationType.NEGLECT, //
        descriptionOfFact: "Paciente encontrado sozinho em casa.",
        actionsTaken: "Notificação enviada ao Conselho Tutelar.",
      };
    });

    test("deve criar um relato de violação para o PRÓPRIO paciente", () => {
      // Arrange
      const reportForPatient = {
        ...baseReportProps,
        id: Uuid.create().unwrap(),
        victimId: Uuid.create(personId.toString()).unwrap(), // Vítima é o paciente
      };
      
      // Act
      const result = patientWithFamily.reportRightsViolation(reportForPatient, NOW);

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.unwrap().violationsReports.count()).toBe(1);
    });

    test("deve criar um relato de violação para um MEMBRO DA FAMÍLIA", () => {
      // Arrange
      const reportForFamily = {
        ...baseReportProps,
        id: Uuid.create().unwrap(),
        victimId: Uuid.create(familyMember.personId.toString()).unwrap(), // Vítima é o familiar
      };
      
      // Act
      const result = patientWithFamily.reportRightsViolation(reportForFamily, NOW);

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.unwrap().violationsReports.count()).toBe(1);
    });
    
    test("deve FALHAR ao criar relato de violação para uma pessoa de fora do agregado", () => {
      // Arrange
      const strangerId = Uuid.create().unwrap();
      const invalidReport = {
        ...baseReportProps,
        id: Uuid.create().unwrap(),
        victimId: strangerId, // Vítima é um estranho
      };

      // Act
      const result = patientWithFamily.reportRightsViolation(invalidReport, NOW);

      // Assert
      expect(result.isErr).toBe(true);
      // "PAT-004" é o código do seu teste original.
      expect(result.unwrapErr().code).toBe("PAT-004");
    });

    test("deve atualizar as ações de um relato de violação existente", () => {
      // Arrange
      const reportProps = {
        ...baseReportProps,
        id: Uuid.create().unwrap(),
        victimId: Uuid.create(personId.toString()).unwrap(),
      };
      
      const patientWithReport = patient.reportRightsViolation(reportProps, NOW).unwrap();
      const originalAction = patientWithReport.violationsReports.getAll()[0].actionsTaken;
      expect(originalAction).toContain("Notificação"); //

      // Act
      const newAction = "Equipe realizou visita domiciliar de acompanhamento.";
      const result = patientWithReport.updateRightsViolationActions(reportProps.id, newAction);

      // Assert: Sucesso
      expect(result.isOk).toBe(true);
      const updatedPatient = result.unwrap();
      const updatedReport = updatedPatient.violationsReports.find((item) => item.id.equals(reportProps.id));
      
      expect(updatedReport?.actionsTaken).toBe(newAction);

      // Assert: Imutabilidade
      expect(updatedPatient).not.toBe(patientWithReport);
      expect(patientWithReport.violationsReports.getAll()[0].actionsTaken).toBe(originalAction);
    });
    
    test("deve FALHAR ao tentar atualizar um relato que não existe", () => {
      // Arrange
      const { patient } = createPatient();
      const nonExistentId = Uuid.create().unwrap();

      // Act
      const result = patient.updateRightsViolationActions(nonExistentId, "Ação nova.");

      // Assert
      expect(result.isErr).toBe(true);
      // "PAT-006" é o código do seu teste original.
      expect(result.unwrapErr().code).toBe("PAT-006");
    });
  });

  /**
   * 💡 O que este teste ensina:
   *
   * A diferença entre Entidades Filhas (com ID) e Value Objects (sem ID).
   * VOs (como HousingCondition, SocioEconomicSituation) representam
   * "fatos" ou "avaliações". Eles não são "atualizados"; eles são
   * **substituídos inteiramente**.
   * Este teste garante que a substituição de um VO também resulta em uma
   * nova instância do agregado (imutabilidade).
   */
  describe("6. Gerenciamento de Avaliações (Value Objects)", () => {
    
    test("deve substituir VOs e retornar uma nova instância do agregado (imutabilidade)", () => {
      // Arrange
      const { patient } = createPatient();
      
      const housingA = makeHousingCondition({ numberOfRooms: 3 });
      const housingB = makeHousingCondition({ numberOfRooms: 5 });
      
      const socioA = makeSocioEconomicSituation({ totalFamilyIncome: 1000 });
      const summaryA = makeSocialHealthSummary({ requiresConstantCare: false });

      // Assert: Estado inicial (tudo é None)
      expect(patient.housingCondition.isNone).toBe(true);
      expect(patient.socioeconomicSituation.isNone).toBe(true);

      // Act: Atualiza VOs para o estado "A"
      // Usamos '.unwrap()' pois esperamos que sempre funcione
      const patientA = patient
        .updateHousingCondition(housingA)
        .unwrap()
        .updateSocioeconomicSituation(socioA)
        .unwrap();

      // Assert: Estado "A" e Imutabilidade
      expect(patientA).not.toBe(patient); // Imutabilidade
      expect(patientA.housingCondition.unwrap()).toBe(housingA);
      expect(patientA.socioeconomicSituation.unwrap()).toBe(socioA);

      // Act: Atualiza APENAS o HousingCondition para o estado "B"
      const patientB = patientA.updateHousingCondition(housingB).unwrap();

      // Assert: Estado "B" e Imutabilidade
      expect(patientB).not.toBe(patientA);
      expect(patientB.housingCondition.unwrap()).toBe(housingB); // Mudou
      expect(patientB.socioeconomicSituation.unwrap()).toBe(socioA); // Permaneceu
    });
  });

  /**
   * 💡 O que este teste ensina:
   *
   * Este é um padrão "Append-Only" (Apenas Adição) para Entidades Filhas.
   * 'Appointments' (atendimentos) formam um histórico. Você não
   * os "atualiza" ou "remove"; você apenas adiciona novos.
   *
   * O teste garante que ao adicionar um novo atendimento, a lista cresce
   * e a imutabilidade do agregado é mantida.
   */
  describe("7. Gerenciamento de Atendimentos (Append-Only)", () => {

    test("deve adicionar um novo atendimento (Appointment) à lista, preservando os existentes", () => {
      // Arrange
      const { patient } = createPatient();
      
      const firstAppointmentProps = {
        id: Uuid.create().unwrap(),
        date: makeTimestamp(TWO_DAYS_AGO),
        professionalInChargeId: Uuid.create().unwrap(),
        type: "HOME_VISIT",
        summary: "Primeira visita domiciliar realizada.",
        actionPlan: "Monitorar adesão ao plano terapêutico.",
      }; //

      const secondAppointmentProps = {
        ...firstAppointmentProps,
        id: Uuid.create().unwrap(),
        date: makeTimestamp(YESTERDAY),
        summary: "Retorno para avaliação da rede de apoio.",
      };
      
      expect(patient.appointments.count()).toBe(0); // Estado inicial

      // Act: Adiciona o primeiro atendimento
      const result1 = patient.registerAppointment(firstAppointmentProps, NOW);

      // Assert: Primeiro atendimento
      expect(result1.isOk).toBe(true);
      const patientWithOne = result1.unwrap();
      
      expect(patientWithOne).not.toBe(patient); // Imutabilidade
      expect(patientWithOne.appointments.count()).toBe(1);
      expect(patientWithOne.appointments.getAll()[0].summary).toContain("Primeira visita");

      // Act: Adiciona o segundo atendimento
      const result2 = patientWithOne.registerAppointment(secondAppointmentProps, NOW);
      
      // Assert: Segundo atendimento
      expect(result2.isOk).toBe(true);
      const patientWithTwo = result2.unwrap();
      
      expect(patientWithTwo).not.toBe(patientWithOne); // Imutabilidade
      expect(patientWithTwo.appointments.count()).toBe(2);
      
      // Verifica se o histórico foi preservado
      expect(patientWithTwo.appointments.getAll()[0].summary).toContain("Primeira visita");
      expect(patientWithTwo.appointments.getAll()[1].summary).toContain("Retorno para avaliação");
      
      // Garante que o estado anterior não foi modificado
      expect(patientWithOne.appointments.count()).toBe(1);
    });
  });

});