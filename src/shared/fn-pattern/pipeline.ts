import { Result } from "@conecta/result";

type ResultLike = { kind: "ok"; value: unknown } | { kind: "err"; error: unknown };

const isResultLike = (value: unknown): value is ResultLike => {
  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return false;
  }

  const candidate = value as { kind?: unknown };
  return candidate.kind === "ok" || candidate.kind === "err";
};

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

      // Primeiro, resolve qualquer Promise yielded pelo generator.
      const resolvedValue = await value;

      // Depois da resolução, aplica semântica de Result (ROP).
      if (isResultLike(resolvedValue)) {
        if (resolvedValue.kind === "err") {
          return resolvedValue as Result<any, E>;
        }
        if (resolvedValue.kind === "ok") {
          nextValue = resolvedValue.value;
          continue;
        }
      }

      nextValue = resolvedValue;
    }
  } catch (error) {
    // Erros não tratados (exceções) são propagados
    throw error;
  }
}
