import { uuidV7Provider } from "@conecta/adapters";
import type { DomainError } from "@conecta/domain-error";
import type { IdProviderProtocol } from "@conecta/protocols";
import { err, ok, type Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";
import { FMIE } from "../errors/FamilyMemberId.error";

/**
 * Representa o identificador único de um membro da família.
 *
 * É um Value Object imutável que garante:
 * - uso exclusivo de UUID v7
 * - normalização do valor (lowercase)
 * - validação centralizada
 */
export class FamilyMemberId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * Cria uma nova instância.
   *
   * - Se nenhum valor for fornecido, um UUID v7 novo é gerado.
   * - Se um valor for fornecido, ele é validado como UUID v7.
   *
   * @param value UUID v7 ou undefined.
   * @returns Result contendo a instância válida ou um erro de domínio.
   */
  static create(
    value?: string,
    idProvider: IdProviderProtocol = uuidV7Provider,
  ): Result<FamilyMemberId, DomainError> {
    if (value === undefined) {
      const fresh = idProvider.generate();
      const uuid = Uuid.create(fresh);
      if (uuid.isErr) return err(FMIE.InvalidFormat(fresh));
      return ok(new FamilyMemberId(uuid.unwrap().toString()));
    }

    const normalized = value.toLowerCase();

    if (!Uuid.isV7(normalized)) {
      return err(FMIE.InvalidFormat(normalized));
    }

    return ok(new FamilyMemberId(normalized));
  }

  /**
   * Retorna uma nova instância com o valor atualizado.
   *
   * Se nenhum `value` for informado, retorna a própria instância.
   *
   * @param props Objeto contendo o novo valor opcional.
   */
  copyWith(
    props: Partial<{ value: string }>,
  ): Result<FamilyMemberId, DomainError> {
    if (props.value === undefined) {
      return ok(this);
    }

    return FamilyMemberId.create(props.value);
  }

  /**
   * Retorna o valor interno como string.
   */
  toString(): string {
    return this._value;
  }

  /**
   * Compara dois IDs pelo valor interno.
   *
   * @param other Outra instância de FamilyMemberId.
   */
  equals(other: FamilyMemberId): boolean {
    return this._value === other._value;
  }

  /**
   * Acesso somente-leitura ao valor interno.
   */
  get value(): string {
    return this._value;
  }
}
