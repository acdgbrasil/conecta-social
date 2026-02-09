import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

export type CommandErrorKind = "InvalidCommandInput";

export const CommandError = makeDomainErrorFactory<CommandErrorKind>({
  bc: "SOCIAL",
  module: "social-care/application",
  codePrefix: "CMD",
  catalog: {
    InvalidCommandInput: {
      code: "CMD-001",
      http: 400,
      category: ErrorTaxonomy.ExternalContractMismatch,
      template: (ctx) => `Entrada de comando inválida: ${ctx.details}`,
    },
  },
});

export const CmdError = shortcuts(CommandError, {
  InvalidCommandInput: ["details"] as const,
});
