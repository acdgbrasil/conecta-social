import { Result } from "@conecta/result";
import type { DomainEvent, EventBusPort, EventHandler } from "@conecta/ports";

/**
 * BunEventBus - Implementação usando EventTarget nativo.
 * 
 * O Bun otimiza o EventTarget (Web Standard) para ser extremamente rápido
 * em mensageria in-process, agindo como um mecanismo nativo de Pub/Sub
 * sem dependências externas.
 */
export class BunEventBus implements EventBusPort {
  private readonly bus: EventTarget;

  constructor() {
    this.bus = new EventTarget();
  }

  /**
   * Publica um ou mais eventos de domínio.
   * Utiliza CustomEvent para transportar o payload pelo barramento nativo.
   */
  async publish(event: DomainEvent | DomainEvent[]): Promise<Result<void, any>> {
    const events = Array.isArray(event) ? event : [event];

    for (const e of events) {
      const customEvent = new CustomEvent(e.name, {
        detail: e,
      });
      // O dispatchEvent é síncrono por spec, mas os handlers podem ser async.
      this.bus.dispatchEvent(customEvent);
    }

    return Result.ok(undefined);
  }

  /**
   * Subscreve um handler a um nome específico de evento.
   */
  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>,
  ): void {
    const wrapper = async (nativeEvent: Event) => {
      const domainEvent = (nativeEvent as CustomEvent).detail as T;
      try {
        await handler.handle(domainEvent);
      } catch (error) {
        console.error(
          `[BunEventBus] Erro ao processar evento ${eventName}:`,
          error,
        );
      }
    };

    this.bus.addEventListener(eventName, wrapper as any);
  }
}

/**
 * Factory para criar instâncias do BunEventBus.
 */
export const createBunEventBus = () => new BunEventBus();
