import type { DomainError } from "@conecta/domain-error";
import { pipe } from "@conecta/fn";
import type { Result } from "@conecta/result";
import { err, ok } from "@conecta/result";
import { ICDError } from "../errors/ICDCode.error";

export class ICDCode {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  // --- MÉTODOS ESTÁTICOS PUROS (Helpers) ---

  /** Normaliza: remove espaços e uppercase. */
  private static sanitize(input: string): string {
    return input.trim().toUpperCase();
  }

  /** Garante o ponto na 3ª casa (Ex: A001 -> A00.1). */
  private static ensureDot(input: string): string {
    return input.replace(/^([A-TV-Z]\d{2})([A-Z0-9]{1,4})$/, "$1.$2");
  }

  /** Remove o ponto (Ex: A00.1 -> A001). Agora é ESTÁTICO. */
  private static stripDot(input: string): string {
    return input.replace(".", "");
  }

  // --- VALIDAÇÃO ---

  // Regex "Either": Aceita COM ou SEM ponto (para validação frouxa inicial)
  // Inline no método 'is' para segurança máxima em testes.
  
  // Regex "Dotted": Exige ponto (para validação estrita)
  private static readonly ICD_DOTTED_RE = /^[A-TV-Z]\d{2}\.[A-Z0-9]{1,4}$/i;

  private static validateByRegex(opts?: { requiredDot?: boolean }) {
    return (value: string) => {
      if (opts?.requiredDot) {
        return ICDCode.ICD_DOTTED_RE.test(value);
      }
      // Regex completa inline para evitar erro de inicialização estática
      return /^[A-TV-Z]\d{2}(?:\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$/i.test(value);
    };
  }

  // --- MÉTODOS PÚBLICOS ESTÁTICOS ---

  public static inferredPattern(requireDot: boolean): string {
    return requireDot
      ? "^[A-TV-Z]\\d{2}\\.[A-Z0-9]{1,4}$"
      : "^[A-TV-Z]\\d{2}(?:\\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$";
  }

  /** Verifica se string é CID válido (estático puro). */
  static is(value: string): boolean {
    // CORREÇÃO: Regex literal inline para garantir que sempre exista
    return /^[A-TV-Z]\d{2}(?:\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$/i.test(value);
  }

  public static toNormalized(value: ICDCode): string {
    // CORREÇÃO: Usa o helper estático. Funciona mesmo se 'value' for um mock.
    return ICDCode.stripDot(value.value);
  }

  public static toDisplay(value: string): string {
    return ICDCode.ensureDot(ICDCode.sanitize(value));
  }

  /** Factory Method Otimizado */
  static create(
    stringCode: string,
    opts: {
      readonly requireDot?: boolean;
      readonly autoDot?: boolean;
      readonly fieldName?: string;
    } = {},
  ): Result<ICDCode, DomainError> {
    const { requireDot = false, autoDot = true, fieldName = "icdCode" } = opts;

    // 1. Sanitize (Sem instanciar nada)
    const sanitized = ICDCode.sanitize(stringCode);

    if (!sanitized.length) return err(ICDError.EmptyCidCode(fieldName));

    // 2. Formatação (Pipe funcional)
    const candidate = pipe(sanitized, (value) =>
      autoDot ? ICDCode.ensureDot(value) : value,
    );

    // 3. Validação
    if (!ICDCode.validateByRegex({ requiredDot: requireDot })(candidate)) {
      return err(
        ICDError.InvalidCidNumber(stringCode, candidate, {
          requireDot,
          autoDot,
        }),
      );
    }

    // 4. Instanciação Única (Sucesso)
    return ok(new ICDCode(candidate));
  }
}