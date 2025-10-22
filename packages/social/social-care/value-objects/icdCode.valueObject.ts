import type { DomainError } from "@conecta/domain-error/DomainError";
import { pipe } from "@conecta/fn/fundaments";
import type { Result } from "@conecta/result";
import { err, ok } from "@conecta/result";
import { ICDError } from "../err/ICDCode.error";

export type ICDCode = string & { readonly brand: unique symbol };

const ICD_EITHER_RE = /^[A-TV-Z]\d{2}(?:\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$/i;
const ICD_DOTTED_RE = /^[A-TV-Z]\d{2}\.[A-Z0-9]{1,4}$/i;
const ICD_PATTERN_WITH_OPTIONAL_DOT = "^[A-TV-Z]\\d{2}(?:\\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$";
const ICD_PATTERN_WITH_DOT = "^[A-TV-Z]\\d{2}\\.[A-Z0-9]{1,4}$";

/** Normaliza entradas removendo espaços e forçando caixa alta. */
const sanitize = (input: string) => input.trim().toUpperCase();
/** Garante que o código possua ponto entre o prefixo e o sufixo. */
const ensureDot = (input: string) => input.replace(/^([A-TV-Z]\d{2})([A-Z0-9]{1,4})$/, "$1.$2");
/** Remove o ponto para fins de comparação/armazenamento. */
const stripDot = (input: string) => input.replace(".", "");

const validateByRegex =
  (opts?: { requiredDot?: boolean }) =>
  (value: string) =>
    (opts?.requiredDot ? ICD_DOTTED_RE : ICD_EITHER_RE).test(value);

const inferredPattern = (requireDot: boolean) =>
  requireDot ? ICD_PATTERN_WITH_DOT : ICD_PATTERN_WITH_OPTIONAL_DOT;

/** Verifica se uma string já atende ao formato aceito de CID. */
const is = (value: string): value is ICDCode => ICD_EITHER_RE.test(value);

/** Remove sinalização de formatação para usar o código como chave normalizada. */
const toNormalized = (value: ICDCode) => stripDot(value);

/** Ajusta apresentação humana ao inserir ponto e caixa alta. */
const toDisplay = (value: string) => ensureDot(sanitize(value));

type CreateOptions = {
  readonly requireDot?: boolean;
  readonly autoDot?: boolean;
  readonly fieldName?: string;
};

/**
 * Cria um código CID validado a partir de uma string bruta.
 *
 * @example
 * ```ts
 * const result = ICDCode.createFromString("A00");
 * if (isErr(result)) {
 *   const telemetry = ICDError.toTelemetry(result.error);
 *   logger.error(result.error.message, telemetry);
 * }
 * ```
 */
const createFromString = (
  stringCode: string,
  opts: CreateOptions = {},
): Result<ICDCode, DomainError> => {
  const { requireDot = false, autoDot = true, fieldName = "icdCode" } = opts;

  try {
    const sanitized = sanitize(stringCode);

    if (!sanitized.length) return err(ICDError.EmptyCidCode(fieldName));

    const candidate = pipe(sanitized,(value) => (autoDot ? ensureDot(value) : value));

    if (!validateByRegex({ requiredDot:requireDot })(candidate)) return err( ICDError.InvalidCidNumber(stringCode, candidate, { requireDot, autoDot }));

    return ok(candidate as ICDCode);
  } catch (cause) {
    return err( ICDError.InvalidCidNumber(stringCode,sanitize(stringCode),{ requireDot, autoDot },cause,),);
  }
}; 

/**
 * Value object responsável por validar, normalizar e formatar códigos CID.
 * TODO: mover regex para um repositório compartilhado quando outros módulos precisarem.
 */
export const ICDCode = {
  is,
  toNormalized,
  toDisplay,
  createFromString,
  pattern: inferredPattern,
};
