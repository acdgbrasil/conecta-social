
import { DomainError } from "@conecta/domain-error";
import { FMIE } from "../err/FamilyMemberId.error";
import { err, ok, Result } from "@conecta/result";
import { Uuid } from "../../../shared/uuid-pattern/uuid";

/**
 * Representa o identificador único de um membro da família.
 *
 * Este Value Object garante que qualquer ID usado para um FamilyMember
 * seja um UUID v7 válido, protegendo as invariantes da entidade.
 */
export class FamilyMemberId {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  /**
   * Cria uma instância de FamilyMemberId a partir de uma string.
   *
   * A criação só é bem-sucedida se a string fornecida for um UUID v7 válido.
   *
   * @param value A string a ser validada.
   * @returns Um `Result` contendo a instância de `FamilyMemberId` ou um `DomainError`.
   */
  public static create(value: string): Result<FamilyMemberId, DomainError> {
    if (!Uuid.isV7(value)) {
      return err(FMIE.InvalidFormat(value));
    }
    return ok(new FamilyMemberId(value));
  }

  /**
   * Cria uma cópia do ID, opcionalmente com um novo valor.
   * @param props Um objeto contendo o novo `value`.
   * @returns Um `Result` com a nova instância de `FamilyMemberId` ou um erro de validação.
   */
  public copyWith(props: Partial<{ value: string }>): Result<FamilyMemberId, DomainError> {
    return FamilyMemberId.create(props.value ?? this.value);
  }

  /**
   * Retorna a representação em string do ID.
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Compara este ID com outro para verificar a igualdade.
   * @param other O outro FamilyMemberId.
   * @returns `true` se os valores forem iguais, `false` caso contrário.
   */
  public equals(other: FamilyMemberId): boolean {
    return this.value === other.value;
  }
}
