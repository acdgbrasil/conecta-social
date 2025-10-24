import type { DomainError } from "@conecta/domain-error/DomainError";
import { pipe } from "@conecta/fn/fundaments";
import type { Result } from "@conecta/result";
import { err, ok } from "@conecta/result";
import { ICDError } from "../err/ICDCode.error";

export type ICDCode = string & { readonly brand: unique symbol };

export class ICDCodeClass {
  private static readonly ICD_EITHER_RE = /^[A-TV-Z]\d{2}(?:\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$/i;
  private static readonly ICD_DOTTED_RE = /^[A-TV-Z]\d{2}\.[A-Z0-9]{1,4}$/i;
  private static readonly ICD_PATTERN_WITH_OPTIONAL_DOT = "^[A-TV-Z]\\d{2}(?:\\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$";
  private static readonly ICD_PATTERN_WITH_DOT = "^[A-TV-Z]\\d{2}\\.[A-Z0-9]{1,4}$";

  /** Normaliza entradas removendo espaços e forçando caixa alta. */
  private static sanitize(input: string): string {
    return input.trim().toUpperCase();
  }

  /** Garante que o código possua ponto entre o prefixo e o sufixo. */
  private static ensureDot(input: string): string {
    return input.replace(/^([A-TV-Z]\d{2})([A-Z0-9]{1,4})$/, "$1.$2");
  }

  /** Remove o ponto para fins de comparação/armazenamento. */
  private static stripDot(input: string): string {
    return input.replace(".", "");
  }

  private static validateByRegex(opts?: { requiredDot?: boolean }) {
    return (value: string) =>
      (opts?.requiredDot ? this.ICD_DOTTED_RE : this.ICD_EITHER_RE).test(value);
  }

  public static inferredPattern(requireDot: boolean): string {
    return requireDot ? this.ICD_PATTERN_WITH_DOT : this.ICD_PATTERN_WITH_OPTIONAL_DOT;
  }

  /** Verifica se uma string já atende ao formato aceito de CID. */
  public static is(value: string): value is ICDCode {
    return this.ICD_EITHER_RE.test(value);
  }

  /** Remove sinalização de formatação para usar o código como chave normalizada. */
  public static toNormalized(value: ICDCode): string {
    return this.stripDot(value);
  }

  /** Ajusta apresentação humana ao inserir ponto e caixa alta. */
  public static toDisplay(value: string): string {
    return this.ensureDot(this.sanitize(value));
  }

  /**
   * Cria um código CID validado a partir de uma string bruta.
   *
   * @example
   * ```ts
   * const result = ICDCodeClass.createFromString("A00");
   * if (isErr(result)) {
   *   const telemetry = ICDError.toTelemetry(result.error);
   *   logger.error(result.error.message, telemetry);
   * }
   * ```
   */
  public static createFromString(
    stringCode: string,
    opts: { readonly requireDot?: boolean; readonly autoDot?: boolean; readonly fieldName?: string } = {},
  ): Result<ICDCode, DomainError> {
    const { requireDot = false, autoDot = true, fieldName = "icdCode" } = opts;

    try {
      const sanitized = this.sanitize(stringCode);

      if (!sanitized.length) return err(ICDError.EmptyCidCode(fieldName));

      const candidate = pipe(sanitized, (value) => (autoDot ? this.ensureDot(value) : value));

      if (!this.validateByRegex({ requiredDot: requireDot })(candidate))
        return err(
          ICDError.InvalidCidNumber(stringCode, candidate, { requireDot, autoDot }),
        );

      return ok(candidate as ICDCode);
    } catch (cause) {
      return err(
        ICDError.InvalidCidNumber(
          stringCode,
          this.sanitize(stringCode),
          { requireDot, autoDot },
          cause,
        ),
      );
    }
  }
}
