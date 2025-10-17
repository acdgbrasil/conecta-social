/**
 * Service Locator simples para registrar e recuperar dependências em memória.
 * Baseado no padrão Singleton para garantir uma única instância em toda a aplicação.
 */
export class Injector {
  // Instância estática privada para o Singleton.
  private static readonly _instance = new Injector();

  // O construtor é privado para evitar instanciação externa.
  private constructor() {
    // Previne a criação de novas instâncias se já existir uma.
    if (Injector._instance) {
      throw new Error(
        'Instantiation failed: Use Injector.instance instead of new.',
      );
    }
  }

  /**
   * Retorna a instância única do Injector.
   */
  public static get instance(): Injector {
    return Injector._instance;
  }

  // Mapa para armazenar os serviços registrados usando uma chave string.
  private readonly _services = new Map<string, any>();

  /**
   * Registra uma instância de serviço com uma chave única.
   * @param key A chave (string) para identificar o serviço.
   * @param service A instância do serviço a ser registrada.
   */
  public register<T>(key: string, service: T): void {
    if (this._services.has(key)) {
      console.warn(
        `Warning: Service with key '${key}' is already registered. It will be overwritten.`,
      );
    }
    this._services.set(key, service);
  }

  /**
   * Recupera uma instância de serviço registrada pela sua chave.
   * @param key A chave (string) do serviço a ser recuperado.
   * @returns A instância do serviço.
   * @throws Lança um erro se o serviço não for encontrado.
   */
  public getInstanceOf<T>(key: string): T {
    const service = this._services.get(key);
    if (service !== undefined) {
      return service as T;
    }
    throw new Error(`Service with key '${key}' not found.`);
  }
}

/**
 * Exporta uma instância singleton do Injector para fácil acesso em toda a aplicação.
 * Exemplo de uso:
 * import { injector } from './injector';
 * injector.register('MyService', new MyService());
 * const myService = injector.getInstanceOf<MyService>('MyService');
 */
export const injector = Injector.instance;
