import { Result } from "@conecta/result";

/**
 * Motor de execução para Pipelines Funcionais baseados em Generators.
 * Permite escrever fluxos que parecem imperativos (sem aninhamento de ifs)
 * mas mantêm a semântica de Railway Oriented Programming (ROP).
 * 
 * Se qualquer passo (yield) retornar um Result.err, o pipeline é interrompido
 * imediatamente e o erro é retornado.
 */
export async function runPipeline<T, E>(
  generatorFactory: () => AsyncGenerator<unknown, Result<T, E>, any>
): Promise<Result<T, E>> {
  const generator = generatorFactory();
  
  try {
    let nextValue: any;
    while (true) {
      const { value, done } = await generator.next(nextValue);
      
      if (done) {
        return value as Result<T, E>;
      }

      // Se o valor yielded for um Result e for erro, interrompe imediatamente (Short-circuit)
      if (typeof value === "object" && value !== null && "kind" in value) {
        if (value.kind === "err") {
          return value as Result<any, E>;
        }
        if (value.kind === "ok") {
          nextValue = value.value;
          continue;
        }
      }

      // Se for um valor puro ou Promise, aguarda e passa adiante
      nextValue = await value;
    }
  } catch (error) {
    // Erros não tratados (exceções) são propagados
    throw error;
  }
}
