import { SQL } from "bun";
import type { SqlPort, SqlTransaction } from "@conecta/ports";

export class BunSqlAdapter implements SqlPort {
  private readonly sql: any;

  constructor(config: any) {
    this.sql = new SQL(config);
  }

  // Permite uso como tag: sql`SELECT...`
  async [Symbol.toPrimitive]?(hint: string) {
    return this.sql;
  }

  // Implementação manual da chamada de função para suportar template strings
  public async query(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    return await this.sql(strings, ...values);
  }

  // Para funcionar como sql`...`, o objeto em si deve ser uma função ou ter um método padrão.
  // Em JS, é difícil fazer uma classe que é também uma função sem hacks.
  // Vamos usar uma abordagem de Proxy ou apenas exportar uma função.
}

/**
 * Cria uma instância do adaptador SQL para Bun que funciona como uma Tag Function.
 */
export function createBunSqlAdapter(config: any): SqlPort {
  const sql = new SQL(config);

  const adapter = (async (strings: TemplateStringsArray, ...values: any[]) => {
    return await sql(strings, ...values);
  }) as SqlPort;

  adapter.begin = async <T>(fn: (tx: SqlTransaction) => Promise<T>): Promise<T> => {
    return await sql.begin(async (tx: any) => {
      const txAdapter = (async (s: TemplateStringsArray, ...v: any[]) => {
        return await tx(s, ...v);
      }) as SqlTransaction;
      return await fn(txAdapter);
    });
  };

  adapter.close = async () => {
    await sql.close();
  };

  return adapter;
}