import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

export type ApplicationErrorKind =
  | "UseCaseNotImplemented"
  | "RepositoryNotAvailable"
  | "PersonIdAlreadyExists"
  | "FailToCastDignosisList"
  | "FailToCastPersonId"
  | "PersistenceMappingFailure"

export const ApplicationError = makeDomainErrorFactory<ApplicationErrorKind>({
  bc: "SOCIAL",
  module: "social-care/application",
  codePrefix: "APP",
  catalog: {
    UseCaseNotImplemented: {
      code: "APP-001",
      http: 500,
      category: ErrorTaxonomy.InfrastructureDependencyFailure,
      template: () => "O caso de uso não foi implementado.",
    },
    RepositoryNotAvailable: {
      code: "APP-002",
      http: 503,
      category: ErrorTaxonomy.InfrastructureDependencyFailure,
      template: () => "O repositório não está disponível no momento.",
    },
    PersonIdAlreadyExists: {
      code: "APP-003",
      http: 409,
      category: ErrorTaxonomy.Conflict,
      template: () => "O PersonId já existe.",
    },
    FailToCastDignosisList: {
      code: "APP-004",
      http: 400,
      category: ErrorTaxonomy.DataConsistencyIncident,
      template: () => "Falha ao converter a lista de diagnósticos.",
    },
    FailToCastPersonId: {
      code: "APP-005",
      http: 400,
      category: ErrorTaxonomy.DataConsistencyIncident,
      template: () => "Falha ao converter o PersonId.",
    },
    PersistenceMappingFailure: {
      code: "APP-006",
      http: 500,
      category: ErrorTaxonomy.DataConsistencyIncident,
      template: (ctx) =>
        `Falha ao mapear dados persistidos do paciente. (${ctx.issueCount ?? "?"} erro(s))`,
    },
    
  },
});

export const AppError = shortcuts(ApplicationError, {
  UseCaseNotImplemented: [] as const,
  RepositoryNotAvailable: [] as const,
  PersonIdAlreadyExists: [] as const,
  FailToCastDignosisList: [] as const,
  FailToCastPersonId: [] as const,
  PersistenceMappingFailure: ["patientId", "issues", "issueCount"] as const,
});
