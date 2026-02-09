import { Result } from "@conecta/result";
import { runPipeline } from "./pipeline";
import type { DomainError } from "@conecta/domain-error";
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
export type UseCaseConfig<Cmd, Context, Aggregate, Response> = {
  /**
   * Passo 1: Validação e Parsing (Puro).
   * Transforma o comando bruto em objetos de valor e contexto tipado.
   */
  parse: (cmd: Cmd) => Result<Context, DomainError>;

  /**
   * Passo 2: Lógica de Negócio (Async / Generator).
   * Onde a mágica acontece: Carrega, modifica e retorna o agregado atualizado.
   * Pode usar `yield` para operações que retornam Result (short-circuit automático).
   */
  handle: (ctx: Context) => AsyncGenerator<any, Result<{ aggregate: Aggregate; result: Response }, DomainError>, any>;

  /**
   * Dependência de persistência (Opcional).
   * Se fornecido, o pipeline salvará o agregado automaticamente após o sucesso do handle.
   */
  repository?: {
    save: (aggregate: Aggregate) => Promise<Result<void, DomainError>>;
  };

  /**
   * Dependência de mensageria (Opcional).
   * Se fornecido junto com `pullEvents`, publicará eventos automaticamente após salvar.
   */
  eventBus?: {
    publish: (events: readonly DomainEvent[]) => void;
  };

  /**
   * Função para extrair e limpar eventos do agregado.
   * Necessária se `eventBus` for fornecido.
   */
  pullEvents?: (aggregate: Aggregate) => { events: readonly DomainEvent[] };
};

export const UseCasePipeline = {
  /**
   * Constrói um Handler de Use Case padronizado e robusto.
   * Aplica o padrão Railway Oriented Programming (ROP) em etapas definidas.
   */
  build: <Cmd, Context, Aggregate, Response>(
    config: UseCaseConfig<Cmd, Context, Aggregate, Response>
  ): UseCasePort<Cmd, Result<Response, DomainError>> => ({
    execute: async (command: Cmd): Promise<Result<Response, DomainError>> => {
      return runPipeline(async function* () {
        // 1. Parsing
        const context = yield config.parse(command);

        // 2. Handle (Lógica Core)
        // Aqui executamos o generator fornecido pelo usuário dentro do nosso contexto de pipeline
        const { aggregate, result } = yield await runPipeline(() => config.handle(context));

        // 3. Persistência (Automática se configurada)
        if (config.repository) {
          yield config.repository.save(aggregate);
        }

        // 4. Publicação de Eventos (Automática se configurada)
        if (config.eventBus && config.pullEvents) {
          const { events } = config.pullEvents(aggregate);
          if (events.length > 0) {
            config.eventBus.publish(events);
          }
        }

        return Result.ok(result);
      });
    },
  }),
};
