import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";
import { jwt } from "hono/jwt";
// ... (outros imports mantidos)
import { createBunSqlAdapter } from "./infrastructure/runtime/bun/sql.adapter";
import { createBunEventBus } from "@conecta/adapters";
import { makeRegisterNewPatientUseCase } from "./modules/social-care/application/use-cases/register-patient.use-case";
import { makeAddFamilyMemberUseCase } from "./modules/social-care/application/use-cases/add-family-member.use-case";
import { makeRemoveFamilyMemberUseCase } from "./modules/social-care/application/use-cases/remove-family-member.use-case";
import { makeRegisterAppointmentUseCase } from "./modules/social-care/application/use-cases/register-appointment.use-case";
import { makeCreateReferralUseCase } from "./modules/social-care/application/use-cases/create-referral.use-case";
import { makeReportRightsViolationUseCase } from "./modules/social-care/application/use-cases/report-rights-violation.use-case";
import { makeUpdateHousingConditionUseCase } from "./modules/social-care/application/use-cases/update-housing-condition.use-case";
import { makeUpdateSocioEconomicSituationUseCase } from "./modules/social-care/application/use-cases/update-socioeconomic-situation.use-case";
import { makePatientPersistenceAdapter } from "./modules/social-care/interface/adapter/persistence/patient.persistence.adapter";
import { makeSocialCareHttpAdapter } from "./modules/social-care/interface/adapter/http/social-care.http.adapter";

const PORT = Bun.env.PORT || 3000;
const app = new OpenAPIHono();

app.use("*", secureHeaders());
app.use("*", csrf());
app.use("*", logger());

// --- Documentação OpenAPI/Swagger ---
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Conecta Social API",
    version: "1.0.0",
    description: "Sistema de Gestão de Assistência Social - Core API",
  },
});

app.get("/docs", swaggerUI({ url: "/doc" }));

// --- Injeção de Dependências ---
// ... (restante do código de injeção mantido)
const sql = createBunSqlAdapter({
  hostname: Bun.env.SC_DB_HOST || "localhost",
  port: Number(Bun.env.SC_DB_PORT) || 5433,
  username: Bun.env.SC_DB_USER,
  password: Bun.env.SC_DB_PASSWORD,
  database: Bun.env.SC_DB_NAME,
});

const eventBus = createBunEventBus(); 
const persistenceAdapter = makePatientPersistenceAdapter(sql);

const useCases = {
  registerPatient: makeRegisterNewPatientUseCase({ repository: persistenceAdapter, eventBus }),
  addFamilyMember: makeAddFamilyMemberUseCase({ repository: persistenceAdapter, eventBus }),
  removeFamilyMember: makeRemoveFamilyMemberUseCase({ repository: persistenceAdapter, eventBus }),
  registerAppointment: makeRegisterAppointmentUseCase({ repository: persistenceAdapter, eventBus }),
  createReferral: makeCreateReferralUseCase({ repository: persistenceAdapter, eventBus }),
  reportRightsViolation: makeReportRightsViolationUseCase({ repository: persistenceAdapter, eventBus }),
  updateHousingCondition: makeUpdateHousingConditionUseCase({ repository: persistenceAdapter, eventBus }),
  updateSocioEconomicSituation: makeUpdateSocioEconomicSituationUseCase({ repository: persistenceAdapter, eventBus }),
};

const socialCareRoutes = makeSocialCareHttpAdapter(useCases);
app.route("/social-care", socialCareRoutes);

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date() }));

console.log(`🚀 API rodando: http://localhost:${PORT}`);
console.log(`📖 Documentação: http://localhost:${PORT}/docs`);

export default {
  port: PORT,
  fetch: app.fetch,
};
