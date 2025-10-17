// --- ARQUIVO ESQUELETO ---
// Este arquivo serve como um guia para a criação de um agregado de domínio.
// Substitua 'YourAggregate' pelo nome real do seu agregado.

export type YourAggregateProps = {
  readonly id: string;
  // TODO: Adicione aqui as propriedades do seu agregado. Ex:
  // readonly name: string;
  // readonly status: 'pending' | 'completed';
};

export class YourAggregate {
  public readonly id: string;
  // TODO: Declare as propriedades públicas aqui.

  private constructor(props: YourAggregateProps) {
    this.id = props.id;
    // TODO: Atribua as outras propriedades.
  }

  public static create(/* TODO: Receba um comando ou DTO com dados iniciais */): YourAggregate {
    // TODO: Implemente a lógica de validação e criação do agregado.
    // Lembre-se: o 'create' é uma factory estática que garante a consistência do objeto.
    console.log('Criando um agregado válido...');

    return new YourAggregate({ id: crypto.randomUUID() /* ...outras props */ });
  }

  public someBusinessAction(/* parâmetros */): YourAggregate {
    // TODO: Implemente uma regra de negócio que altera o estado.
    // IMPORTANTE: Este método DEVE retornar uma NOVA instância do agregado.
    // Ex: return new YourAggregate({ ...this, status: 'completed' });

    console.log('Executando uma ação e retornando um novo estado...');
    return new YourAggregate({ ...this });
  }
}
