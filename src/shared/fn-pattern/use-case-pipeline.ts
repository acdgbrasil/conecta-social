import { Result } from "@conecta/result";
import { runPipeline } from "./pipeline";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { DomainEvent } from "@conecta/ports";

type UseCasePort<Input, Output> = {
  execute(input: Input): Promise<Output>;
};

/**
 * Configuração estruturada para construir um Use Case.
 * 
 * @template Cmd - O comando de entrada (DTO).
 * @template Context - O contexto de domínio validado (output do parse).
 * @template Aggregate - O agregado principal que será modificado.
 * @template Response - O valor de retorno do caso de uso (ex: boolean, id criado).
 */
export type UseCaseConfig<Cmd, Context, Aggregate, Response, E = DomainError> = {
  /**
   * Passo 1: Validação e Parsing (Puro).
   * Transforma o comando bruto em objetos de valor e contexto tipado.
   */
  parse: (cmd: Cmd) => Result<Context, E>;

  /**
   * Passo 2: Lógica de Negócio (Async / Generator).
   * Onde a mágica acontece: Carrega, modifica e retorna o agregado atualizado.
   * Pode usar `yield` para operações que retornam Result (short-circuit automático).
   */
  handle: (ctx: Context) => AsyncGenerator<any, Result<{ aggregate: Aggregate; result: Response }, E>, any>;

  /**
   * Dependência de persistência (Opcional).
   * Se fornecido, o pipeline salvará o agregado automaticamente após o sucesso do handle.
   */
  repository?: {
    save: (aggregate: Aggregate) => Promise<Result<void, E>>;
  };

  /**
   * Dependência de mensageria (Opcional).
   * Se fornecido junto com `pullEvents`, publicará eventos automaticamente após salvar.
   */
  eventBus?: {
    publish: (
      events: readonly DomainEvent[],
    ) => Promise<Result<void, unknown>>;
  };

  /**
   * Função para extrair e limpar eventos do agregado.
   * Necessária se `eventBus` for fornecido.
   */
  pullEvents?: (
    aggregate: Aggregate,
  ) => { events: readonly DomainEvent[]; aggregate: Aggregate };
};

export const UseCasePipeline = {
  /**
   * Constrói um Handler de Use Case padronizado e robusto.
   * Aplica o padrão Railway Oriented Programming (ROP) em etapas definidas.
   */
  build: <Cmd, Context, Aggregate, Response, E = DomainError>(
    config: UseCaseConfig<Cmd, Context, Aggregate, Response, E>
  ): UseCasePort<Cmd, Result<Response, E>> => ({
    execute: async (command: Cmd): Promise<Result<Response, E>> => {
      return runPipeline(async function* () {
        // 1. Parsing
        const context = yield config.parse(command);

        // 2. Handle (Lógica Core)
        // Aqui executamos o generator fornecido pelo usuário dentro do nosso contexto de pipeline
        const { aggregate, result } = yield await runPipeline(() => config.handle(context));

        let aggregateToSave = aggregate;
        let eventsToPublish: readonly DomainEvent[] = [];

        // 3. Extração de eventos antes de salvar para não persistir estado "sujo".
        if (config.pullEvents) {
          const pulled = config.pullEvents(aggregate);
          aggregateToSave = pulled.aggregate;
          eventsToPublish = pulled.events;
        }

        // 4. Persistência (Automática se configurada)
        if (config.repository) {
          yield config.repository.save(aggregateToSave);
        }

        // 5. Publicação de Eventos (falhas não invalidam operação principal).
        if (config.eventBus && eventsToPublish.length > 0) {
          try {
            const publishResult = await config.eventBus.publish(eventsToPublish);
            if (Result.isErr(publishResult)) {
              console.error(
                "[UseCasePipeline] Falha ao publicar eventos de domínio:",
                publishResult.error,
              );
            }
          } catch (error) {
            console.error(
              "[UseCasePipeline] Exceção ao publicar eventos de domínio:",
              error,
            );
          }
        }

        return Result.ok(result);
      });
    },
  }),
};
