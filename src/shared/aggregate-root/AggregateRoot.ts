import type { DomainEvent } from "@conecta/ports";
import type { Uuid } from "@conecta/uuid";

/**
 * @deprecated Use o padrão funcional `Aggregate<State>` e `Aggregate.*` helpers.
 * Esta classe será removida após a migração completa do domínio Social Care.
 */
export abstract class AggregateRoot<Props> {
  protected constructor(
    public readonly id: Uuid,
    protected readonly props: Props,
    public readonly version: number = 0,
    private readonly _domainEvents: DomainEvent[] = [],
  ) {}
  
  protected addEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this.clearDomainEvents();
    return events;
  }

  // Helper para clonar eventos ao gerar nova versão
  protected get nextEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }
}
