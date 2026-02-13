import { Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/ports";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

// Importações dos Comandos para Tipagem Fina
import type { RegisterNewPatientCommand } from "@conecta/social-care/application/ports/commands/register-new-patient.command";
import type { AddFamilyMemberCommand } from "@conecta/social-care/application/ports/commands/add-family-member.command";
import type { RemoveFamilyMemberCommand } from "@conecta/social-care/application/ports/commands/remove-family-member.command";
import type { RegisterAppointmentCommand } from "@conecta/social-care/application/ports/commands/register-appointment.command";
import type { CreateReferralCommand } from "@conecta/social-care/application/ports/commands/create-referral.command";
import type { ReportRightsViolationCommand } from "@conecta/social-care/application/ports/commands/report-rights-violation.command";
import type { UpdateHousingConditionCommand } from "@conecta/social-care/application/ports/commands/update-housing-condition.command";
import type { UpdateSocioEconomicSituationCommand } from "@conecta/social-care/application/ports/commands/update-socioeconomic-situation.command";

import { registerPatientController } from "./controllers/register-patient.controller";
import { addFamilyMemberController } from "./controllers/add-family-member.controller";
import { removeFamilyMemberController } from "./controllers/remove-family-member.controller";
import { registerAppointmentController } from "./controllers/register-appointment.controller";
import { createReferralController } from "./controllers/create-referral.controller";
import { reportRightsViolationController } from "./controllers/report-rights-violation.controller";
import { updateHousingConditionController } from "./controllers/update-housing-condition.controller";
import { updateSocioEconomicSituationController } from "./controllers/update-socioeconomic-situation.controller";

// --- Schemas de Resposta Padronizados ---
const ErrorSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({ example: "Mensagem de erro explicativa" }),
  details: z.unknown().optional(),
});

const SuccessSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.unknown(), // Substituído any por unknown para maior segurança
});

/**
 * Interface para os Casos de Uso injetados no Adaptador HTTP.
 */
export type SocialCareUseCases = {
  registerPatient: UseCasePort<RegisterNewPatientCommand, Result<unknown, DomainError>>;
  addFamilyMember: UseCasePort<AddFamilyMemberCommand, Result<unknown, DomainError>>;
  removeFamilyMember: UseCasePort<RemoveFamilyMemberCommand, Result<unknown, DomainError>>;
  registerAppointment: UseCasePort<RegisterAppointmentCommand, Result<unknown, DomainError>>;
  createReferral: UseCasePort<CreateReferralCommand, Result<unknown, DomainError>>;
  reportRightsViolation: UseCasePort<ReportRightsViolationCommand, Result<unknown, DomainError>>;
  updateHousingCondition: UseCasePort<UpdateHousingConditionCommand, Result<unknown, DomainError>>;
  updateSocioEconomicSituation: UseCasePort<UpdateSocioEconomicSituationCommand, Result<unknown, DomainError>>;
};

// --- Definição das Rotas (Contracts) ---

const registerPatientRoute = createRoute({
  method: "post",
  path: "/patients",
  summary: "Registrar Paciente",
  description: "Cria um novo prontuário de assistência social para uma pessoa já cadastrada no sistema base.",
  tags: ["Patients"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            personId: z.string().uuid().openapi({ 
              description: "UUID da pessoa no sistema de cadastro base",
              example: "018f4a7a-1e37-7b2c-8f00-123456789abc" 
            }),
            initialDiagnoses: z.array(z.object({
              icdCode: z.string().openapi({ 
                description: "Código CID-10",
                example: "F84.0" 
              }),
              date: z.string().openapi({ 
                description: "Data do diagnóstico (ISO 8601)",
                example: "2024-01-01" 
              }),
              description: z.string().openapi({ 
                description: "Observações detalhadas do diagnóstico",
                example: "Diagnóstico inicial de autismo realizado por neuropediatra" 
              }),
            })).min(1).openapi({ description: "Lista de diagnósticos iniciais obrigatória" }),
          }),
        },
      },
    },
  },
  responses: {
    201: { 
      content: { "application/json": { schema: SuccessSchema } }, 
      description: "Paciente registrado com sucesso. Retorna o ID do recurso criado.",
      headers: z.object({
        Location: z.string().openapi({ example: "/social-care/patients/018f4a7a-1e37-7b2c-8f00-123456789abc" })
      })
    },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Erro de validação nos dados de entrada" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Paciente já possui prontuário social ativo" },
    422: { content: { "application/json": { schema: ErrorSchema } }, description: "Erro de negócio ao processar o registro" },
  },
});

const addFamilyMemberRoute = createRoute({
  method: "post",
  path: "/patients/{id}/family-members",
  summary: "Adicionar Membro Familiar",
  description: "Vincula uma pessoa como membro do núcleo familiar do paciente.",
  tags: ["Family"],
  request: {
    params: z.object({ 
      id: z.string().uuid().openapi({ description: "UUID do Paciente", example: "018f4a7a-1e37-7b2c-8f00-123456789abc" }) 
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            memberPersonId: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-999999999999" }),
            relationship: z.string().openapi({ example: "Mother", description: "Grau de parentesco" }),
            isResiding: z.boolean().openapi({ example: true, description: "Reside com o paciente?" }),
            isCaregiver: z.boolean().openapi({ example: true, description: "É o cuidador principal?" }),
          }),
        },
      },
    },
  },
  responses: {
    200: { content: { "application/json": { schema: SuccessSchema } }, description: "Membro familiar adicionado com sucesso" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Paciente não encontrado" },
    422: { content: { "application/json": { schema: ErrorSchema } }, description: "Membro já faz parte do núcleo familiar" },
  },
});

const removeFamilyMemberRoute = createRoute({
  method: "delete",
  path: "/patients/{id}/family-members/{memberId}",
  summary: "Remover Membro Familiar",
  description: "Remove o vínculo de um membro familiar do prontuário do paciente.",
  tags: ["Family"],
  request: {
    params: z.object({ 
      id: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-123456789abc" }),
      memberId: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-999999999999" })
    }),
  },
  responses: {
    200: { content: { "application/json": { schema: SuccessSchema } }, description: "Membro removido com sucesso" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Paciente ou membro não encontrado" },
  },
});

const registerAppointmentRoute = createRoute({
  method: "post",
  path: "/patients/{id}/appointments",
  summary: "Registrar Atendimento",
  description: "Registra uma evolução ou atendimento realizado pela assistência social.",
  tags: ["Appointments"],
  request: {
    params: z.object({ 
      id: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-123456789abc" }) 
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            professionalId: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-888888888888" }),
            summary: z.string().openapi({ example: "Atendimento de acompanhamento mensal", description: "Resumo da evolução" }),
            actionPlan: z.string().optional().openapi({ example: "Encaminhar para CRAS", description: "Plano de ação derivado" }),
            date: z.string().optional().openapi({ example: "2024-02-11T14:30:00Z" }),
            type: z.string().optional().openapi({ example: "DOMICILIARY", description: "Tipo de atendimento" }),
          }),
        },
      },
    },
  },
  responses: {
    201: { content: { "application/json": { schema: SuccessSchema } }, description: "Atendimento registrado com sucesso" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Paciente não encontrado" },
  },
});

const createReferralRoute = createRoute({
  method: "post",
  path: "/patients/{id}/referrals",
  summary: "Criar Encaminhamento",
  description: "Gera um encaminhamento para serviços externos (Saúde, Educação, etc).",
  tags: ["Referrals"],
  request: {
    params: z.object({ 
      id: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-123456789abc" }) 
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            referredPersonId: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-777777777777" }),
            destinationService: z.string().openapi({ example: "HEALTH_CARE", description: "Serviço de destino (CRAS, CREAS, HEALTH_CARE, etc)" }),
            reason: z.string().openapi({ example: "Routine checkup", description: "Motivo do encaminhamento" }),
            date: z.string().optional().openapi({ example: "2024-02-11" }),
            professionalId: z.string().uuid().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: { content: { "application/json": { schema: SuccessSchema } }, description: "Encaminhamento criado com sucesso" },
  },
});

const reportRightsViolationRoute = createRoute({
  method: "post",
  path: "/patients/{id}/rights-violations",
  summary: "Relatar Violação de Direitos",
  description: "Registra uma ocorrência de violação de direitos identificada.",
  tags: ["Compliance"],
  request: {
    params: z.object({ 
      id: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-123456789abc" }) 
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            victimId: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-123456789abc" }),
            violationType: z.string().openapi({ example: "NEGLIGENCIA", description: "Tipo de violação" }),
            reportDate: z.string().openapi({ example: "2024-01-01" }),
            incidentDate: z.string().openapi({ example: "2024-01-01" }),
            descriptionOfFact: z.string().openapi({ example: "Descrição detalhada do ocorrido" }),
            actionsTaken: z.string().optional().openapi({ example: "Notificado Conselho Tutelar" }),
          }),
        },
      },
    },
  },
  responses: {
    201: { 
      content: { "application/json": { schema: SuccessSchema } }, 
      description: "Violação registrada",
      headers: z.object({
        Location: z.string().openapi({ example: "/social-care/patients/.../rights-violations/report-123" })
      })
    },
  },
});

const updateHousingConditionRoute = createRoute({
  method: "patch",
  path: "/patients/{id}/housing-condition",
  summary: "Atualizar Condições de Moradia",
  description: "Atualiza os dados de infraestrutura e risco da residência do paciente.",
  tags: ["Socioeconomic"],
  request: {
    params: z.object({ 
      id: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-123456789abc" }) 
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            housingConditionType: z.string().openapi({ example: "OWNED" }),
            wallMaterial: z.string().openapi({ example: "MASONRY" }),
            numberOfRooms: z.number().openapi({ example: 4 }),
            numberOfBathrooms: z.number().openapi({ example: 2 }),
            waterSupplyType: z.string().openapi({ example: "PUBLIC_NETWORK" }),
            electricityAccess: z.string().openapi({ example: "METERED_CONNECTION" }),
            sewerDisposalMethod: z.string().openapi({ example: "PUBLIC_SEWER" }),
            wasteCollectionType: z.string().openapi({ example: "DIRECT_COLLECTION" }),
            accessibilityLevel: z.string().openapi({ example: "FULLY_ACCESSIBLE" }),
            isInGeographicRiskArea: z.boolean().openapi({ example: false }),
            isInSocialConflictArea: z.boolean().openapi({ example: false }),
          }),
        },
      },
    },
  },
  responses: {
    200: { content: { "application/json": { schema: SuccessSchema } }, description: "Condições habitacionais atualizadas" },
  },
});

const updateSocioEconomicSituationRoute = createRoute({
  method: "patch",
  path: "/patients/{id}/socioeconomic-situation",
  summary: "Atualizar Situação Socioeconômica",
  description: "Atualiza dados de renda, benefícios e emprego do núcleo familiar.",
  tags: ["Socioeconomic"],
  request: {
    params: z.object({ 
      id: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-123456789abc" }) 
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            totalFamilyIncome: z.number().openapi({ example: 5000 }),
            incomePerCapita: z.number().openapi({ example: 1250 }),
            receivesSocialBenefit: z.boolean().openapi({ example: true }),
            socialBenefits: z.array(z.object({
              benefitName: z.string().openapi({ example: "Bolsa Familia" }),
              amount: z.number().openapi({ example: 600 }),
              beneficiaryId: z.string().uuid().openapi({ example: "018f4a7a-1e37-7b2c-8f00-999999999999" }),
            })),
            mainSourceOfIncome: z.string().openapi({ example: "Salary" }),
            hasUnemployed: z.boolean().openapi({ example: false }),
          }),
        },
      },
    },
  },
  responses: {
    200: { content: { "application/json": { schema: SuccessSchema } }, description: "Situação socioeconômica atualizada" },
  },
});

// --- Adaptador ---

export const makeSocialCareHttpAdapter = (useCases: SocialCareUseCases) => {
  const app = new OpenAPIHono();

  app.openapi(registerPatientRoute, registerPatientController(useCases.registerPatient));
  app.openapi(addFamilyMemberRoute, addFamilyMemberController(useCases.addFamilyMember));
  app.openapi(removeFamilyMemberRoute, removeFamilyMemberController(useCases.removeFamilyMember));
  app.openapi(registerAppointmentRoute, registerAppointmentController(useCases.registerAppointment));
  app.openapi(createReferralRoute, createReferralController(useCases.createReferral));
  app.openapi(reportRightsViolationRoute, reportRightsViolationController(useCases.reportRightsViolation));
  app.openapi(updateHousingConditionRoute, updateHousingConditionController(useCases.updateHousingCondition));
  app.openapi(updateSocioEconomicSituationRoute, updateSocioEconomicSituationController(useCases.updateSocioEconomicSituation));

  return app;
};
