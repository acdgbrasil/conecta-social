import {
	createBunEventBus,
	makeAuthMiddleware,
	systemClock,
} from "@conecta/adapters";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
// ... (outros imports mantidos)
import pkg from "../package.json";
// --- People Context Imports ---
import { makeLogtoAuthPort } from "./infrastructure/auth/logto/auth.client";
import { makeLogtoManagementClient } from "./infrastructure/auth/logto/management.client";
import { createBunSqlAdapter } from "./infrastructure/runtime/bun/sql.adapter";
import { makeRegisterPersonFromLogtoUseCase } from "./modules/people-context/application/use-cases/register-person-from-logto.use-case";
import { logtoWebhookController } from "./modules/people-context/interface/adapter/http/webhooks/logto.webhook";
import { makePostgresPersonRepository } from "./modules/people-context/interface/adapter/persistence/person.persistence.adapter";
import { makeAddFamilyMemberUseCase } from "./modules/social-care/application/use-cases/add-family-member.use-case";
import { makeCreateReferralUseCase } from "./modules/social-care/application/use-cases/create-referral.use-case";
import { makeRegisterAppointmentUseCase } from "./modules/social-care/application/use-cases/register-appointment.use-case";
import { makeRegisterNewPatientUseCase } from "./modules/social-care/application/use-cases/register-patient.use-case";
import { makeRemoveFamilyMemberUseCase } from "./modules/social-care/application/use-cases/remove-family-member.use-case";
import { makeReportRightsViolationUseCase } from "./modules/social-care/application/use-cases/report-rights-violation.use-case";
import { makeUpdateHousingConditionUseCase } from "./modules/social-care/application/use-cases/update-housing-condition.use-case";
import { makeUpdateSocioEconomicSituationUseCase } from "./modules/social-care/application/use-cases/update-socioeconomic-situation.use-case";
import { makeSocialCareHttpAdapter } from "./modules/social-care/interface/adapter/http/social-care.http.adapter";
import { makePatientPersistenceAdapter } from "./modules/social-care/interface/adapter/persistence/patient.persistence.adapter";

const PORT = (() => {
	const port = Bun.env.PORT ? Number(Bun.env.PORT) : 3000;
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error(
			`❌ PORT inválida: "${Bun.env.PORT}". Deve ser número entre 1-65535.`,
		);
	}
	return port;
})();
const app = new OpenAPIHono();
const socialCareScopePolicies = [
	{
		path: "/social-care/patients",
		scopes: ["social-care:patients:create"],
	},
	{
		path: "/social-care/patients/:id/family-members",
		scopes: ["social-care:family-members:manage"],
	},
	{
		path: "/social-care/patients/:id/family-members/:memberId",
		scopes: ["social-care:family-members:manage"],
	},
	{
		path: "/social-care/patients/:id/appointments",
		scopes: ["social-care:appointments:create"],
	},
	{
		path: "/social-care/patients/:id/referrals",
		scopes: ["social-care:referrals:create"],
	},
	{
		path: "/social-care/patients/:id/rights-violations",
		scopes: ["social-care:rights-violations:create"],
	},
	{
		path: "/social-care/patients/:id/housing-condition",
		scopes: ["social-care:socioeconomic:update"],
	},
	{
		path: "/social-care/patients/:id/socioeconomic-situation",
		scopes: ["social-care:socioeconomic:update"],
	},
] as const;

app.use("*", secureHeaders());
app.use(
	"*",
	csrf({
		origin: Bun.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
	}),
);
app.use("*", logger());

// --- Documentação OpenAPI/Swagger ---
app.doc("/doc", {
	openapi: "3.0.0",
	info: {
		title: "Conecta Social API",
		version: pkg.version,
		description: "Sistema de Gestão de Assistência Social - Core API",
	},
});

app.get("/docs", swaggerUI({ url: "/doc" }));

// --- Injeção de Dependências ---
// Validação de credenciais obrigatórias
if (!Bun.env.SC_DB_USER || !Bun.env.SC_DB_PASSWORD || !Bun.env.SC_DB_NAME) {
	throw new Error(
		`❌ Credenciais do banco obrigatórias: SC_DB_USER, SC_DB_PASSWORD, SC_DB_NAME`,
	);
}

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

// --- People Context & Logto Integration ---
const logtoManagement = makeLogtoManagementClient({
	endpoint: Bun.env.LOGTO_ENDPOINT || "http://localhost:3001",
	appId: Bun.env.LOGTO_M2M_APP_ID || "",
	appSecret: Bun.env.LOGTO_M2M_APP_SECRET || "",
});
const authPort = makeLogtoAuthPort({
	endpoint: Bun.env.LOGTO_ENDPOINT || "http://localhost:3001",
});

const personRepository = makePostgresPersonRepository(sql);
const registerPersonUseCase = makeRegisterPersonFromLogtoUseCase({
	repository: personRepository,
	logtoManagement,
});

// --- Use Cases Social Care ---
const useCases = {
	registerPatient: makeRegisterNewPatientUseCase({
		repository: persistenceAdapter,
		eventBus,
	}),
	addFamilyMember: makeAddFamilyMemberUseCase({
		repository: persistenceAdapter,
		eventBus,
	}),
	removeFamilyMember: makeRemoveFamilyMemberUseCase({
		repository: persistenceAdapter,
		eventBus,
	}),
	registerAppointment: makeRegisterAppointmentUseCase({
		repository: persistenceAdapter,
		eventBus,
		clock: systemClock,
	}),
	createReferral: makeCreateReferralUseCase({
		repository: persistenceAdapter,
		eventBus,
		clock: systemClock,
	}),
	reportRightsViolation: makeReportRightsViolationUseCase({
		repository: persistenceAdapter,
		eventBus,
		clock: systemClock,
	}),
	updateHousingCondition: makeUpdateHousingConditionUseCase({
		repository: persistenceAdapter,
		eventBus,
	}),
	updateSocioEconomicSituation: makeUpdateSocioEconomicSituationUseCase({
		repository: persistenceAdapter,
		eventBus,
	}),
};

const socialCareRoutes = makeSocialCareHttpAdapter(useCases);
app.use("/social-care/*", makeAuthMiddleware(authPort));
for (const policy of socialCareScopePolicies) {
	app.use(
		policy.path,
		makeAuthMiddleware(authPort, { requiredScopes: policy.scopes }),
	);
}
app.route("/social-care", socialCareRoutes);

// --- People / Auth Webhooks ---
app.post("/webhooks/logto", logtoWebhookController(registerPersonUseCase));

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date() }));

console.log(`🚀 API rodando: http://localhost:${PORT}`);
console.log(`📖 Documentação: http://localhost:${PORT}/docs`);

export default {
	port: PORT,
	fetch: app.fetch,
};
