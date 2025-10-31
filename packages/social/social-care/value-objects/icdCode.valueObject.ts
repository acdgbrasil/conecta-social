import type { DomainError } from "@conecta/domain-error";
import { pipe } from "@conecta/fn";
import type { Result } from "@conecta/result";
import { err, ok } from "@conecta/result";
import { ICDError } from "../err/ICDCode.error";

export class ICDCode {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }
  private readonly ICD_EITHER_RE = /^[A-TV-Z]\d{2}(?:\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$/i; // This regex is for validation, not for the type
  private readonly ICD_DOTTED_RE = /^[A-TV-Z]\d{2}\.[A-Z0-9]{1,4}$/i;
  private readonly ICD_PATTERN_WITH_OPTIONAL_DOT = "^[A-TV-Z]\\d{2}(?:\\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$";
  private readonly ICD_PATTERN_WITH_DOT = "^[A-TV-Z]\\d{2}\\.[A-Z0-9]{1,4}$";
 
  /** Normaliza entradas removendo espaços e forçando caixa alta. */
  private sanitize(input: string): string {
    return input.trim().toUpperCase();
  }
 
  /** Garante que o código possua ponto entre o prefixo e o sufixo. */
  private ensureDot(input: string): string {
    return input.replace(/^([A-TV-Z]\d{2})([A-Z0-9]{1,4})$/, "$1.$2");
  }
 
  /** Remove o ponto para fins de comparação/armazenamento. */
  private stripDot(input: string): string {
    return input.replace(".", "");
  }
 
  private validateByRegex(opts?: { requiredDot?: boolean }) {
    return (value: string) =>
      (opts?.requiredDot ? this.ICD_DOTTED_RE : this.ICD_EITHER_RE).test(value);
  }
 
  public inferredPattern(requireDot: boolean): string {
    return requireDot ? this.ICD_PATTERN_WITH_DOT : this.ICD_PATTERN_WITH_OPTIONAL_DOT;
  }
 
  /** Verifica se uma string já atende ao formato aceito de CID. */
  static is(value: string): boolean {
    return /^[A-TV-Z]\d{2}(?:\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$/i.test(value);
  }

  /** Remove sinalização de formatação para usar o código como chave normalizada. */
  public static toNormalized(value: ICDCode): string {
    return value.stripDot(value.value);
  }
  
  /** Ajusta apresentação humana ao inserir ponto e caixa alta. */
  public static toDisplay(value: string): string {
    return new ICDCode(value).ensureDot(new ICDCode(value).sanitize(value));
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
  static create(
    stringCode: string,
    opts: { readonly requireDot?: boolean; readonly autoDot?: boolean; readonly fieldName?: string } = {},
  ): Result<ICDCode, DomainError> {
    const { requireDot = false, autoDot = true, fieldName = "icdCode" } = opts;
    
    try {
      const icdCodeInstance = new ICDCode(stringCode);
      
      const sanitized = icdCodeInstance.sanitize(stringCode);
      
      if (!sanitized.length) return err(ICDError.EmptyCidCode(fieldName));
      
      const candidate = pipe(sanitized, (value) => (autoDot ? icdCodeInstance.ensureDot(value) : value));

      if (!icdCodeInstance.validateByRegex({ requiredDot: requireDot })(candidate))
        return err(
          ICDError.InvalidCidNumber(stringCode, candidate, { requireDot, autoDot }),
        );

      return ok(new ICDCode(candidate));
    } catch (cause) {
      return err(
        ICDError.InvalidCidNumber(
          stringCode,
          new ICDCode(stringCode).sanitize(stringCode),
          { requireDot, autoDot },
          cause,
        ),
      );
    }
  }
}
