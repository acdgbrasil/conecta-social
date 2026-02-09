import type { DomainEvent } from "@conecta/ports";
import type { Uuid } from "@conecta/uuid";
import type { DeepReadonly } from "@conecta/fn";

/**
 * Estrutura base de dados para um Agregado Funcional.
 * O estado (State) é blindado com DeepReadonly para evitar mutações acidentais em arrays/objetos aninhados.
 */
export type Aggregate<State> = {
  readonly id: Uuid;
  readonly props: DeepReadonly<State>;
  readonly version: number;
  readonly events: readonly DomainEvent[];
};

/**
 * Funções puras para manipulação de agregados.
 */
export const Aggregate = {
  /**
   * Cria um novo agregado a partir do estado inicial.
   */
  of: <State>(id: Uuid, props: State, version = 0): Aggregate<State> => ({
    id,
    props: props as DeepReadonly<State>, // Cast seguro pois garantimos imutabilidade daqui pra frente
    version,
    events: [],
  }),

  /**
   * Atualiza o estado do agregado de forma imutável (funcional copyWith).
   *
   * @example
   * ```ts
   * const updatedPatient = Aggregate.update(patient, {
   *   name: "Novo Nome"
   * });
   * ```
   *
   * @param agg O agregado atual.
   * @param changes Um objeto parcial com as propriedades a serem atualizadas OU uma função de atualização.
   */
  update: <State>(
    agg: Aggregate<State>,
    changes: Partial<State> | ((current: DeepReadonly<State>) => Partial<State>),
  ): Aggregate<State> => {
    const newProps = typeof changes === "function" ? changes(agg.props) : changes;

    return {
      ...agg,
      props: {
        ...agg.props,
        ...newProps,
      } as DeepReadonly<State>,
    };
  },

  /**
   * Adiciona um evento de domínio à lista de eventos pendentes.
   * Retorna uma NOVA instância do agregado.
   */
  addEvent: <State>(agg: Aggregate<State>, event: DomainEvent): Aggregate<State> => ({
    ...agg,
    events: [...agg.events, event],
  }),

  /**
   * Limpa os eventos de domínio (usado após a persistência/publicação).
   * Retorna uma NOVA instância.
   */
  clearEvents: <State>(agg: Aggregate<State>): Aggregate<State> => ({
    ...agg,
    events: [],
  }),
};