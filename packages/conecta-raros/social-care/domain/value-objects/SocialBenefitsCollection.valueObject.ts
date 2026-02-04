import type { DomainError } from "@conecta/domain-error";
import { ImutableListFactory } from "@conecta/fn";
import { err, ok, type Result } from "@conecta/result";
import { SBC } from "packages/conecta-raros/social-care/domain/errors/SocialBenefitsCollection.error";
import type { SocialBenefit } from "./SocialBenefit.valueObject";

/**
 * Representa uma coleção de benefícios sociais como um Value Object imutável.
 *
 * Encapsula as regras de negócio relacionadas ao conjunto de benefícios,
 * como cálculos de totais e a garantia de imutabilidade.
 */
export class SocialBenefitsCollection {
  private readonly items: readonly SocialBenefit[];

  private constructor(items: SocialBenefit[]) {
    this.items = Object.freeze(items);
    Object.freeze(this);
  }

  /**
   * Cria uma instância de SocialBenefitsCollection a partir de um array de SocialBenefit.
   *
   * @param benefits O array de benefícios.
   * @returns Um `Result` contendo a nova coleção.
   */
  public static create(
    benefits: SocialBenefit[],
  ): Result<SocialBenefitsCollection, DomainError> {

    if (benefits === null || benefits === undefined) return err(SBC.BenefitsArrayNullOrUndefined());
    
    if (benefits.length === 0) return ok(new SocialBenefitsCollection([]));
    const seenNames = new Set<string>();
    
    for (const benefit of benefits) {
      if (seenNames.has(benefit.benefitName)) {
        return err(SBC.DuplicateBenefitNotAllowed(benefit.benefitName));
      }
      seenNames.add(benefit.benefitName);
    }

    return ok(new SocialBenefitsCollection([...benefits]));
  }

  /**
   * Cria uma cópia da coleção, opcionalmente com uma nova lista de benefícios.
   * @param props Um objeto contendo a nova lista `items`.
   * @returns Um `Result` com a nova instância de `SocialBenefitsCollection`.
   */
  public copyWith(
    props: Partial<{ items: SocialBenefit[] }>,
  ): Result<SocialBenefitsCollection, DomainError> {
    return SocialBenefitsCollection.create(props.items ?? [...this.items]);
  }

  /** Retorna todos os benefícios como um array imutável. */
  public getAll(): readonly SocialBenefit[] {
    return this.items;
  }

  /** Verifica se a coleção está vazia. */
  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  /** Retorna o número de benefícios na coleção. */
  public count(): number {
    return this.items.length;
  }

  /** Calcula o valor total de todos os benefícios na coleção. */
  public getTotalAmount(): number {
    return this.items.reduce((total, benefit) => total + benefit.amount, 0);
  }
}
