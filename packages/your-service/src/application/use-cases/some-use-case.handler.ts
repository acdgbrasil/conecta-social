// --- ARQUIVO ESQUELETO ---
// Orquestra a execução de um caso de uso.
// Ele não contém regras de negócio, apenas coordena.

import { YourAggregate } from '../../domain/aggregates/your-aggregate.aggregate';
import type { IYourAggregateRepository } from '../../domain/ports/your-aggregate.repository.port';

// TODO: Defina um tipo para o comando de entrada, se necessário.
export type SomeUseCaseCommand = {
  readonly someData: string;
};

export class SomeUseCaseHandler {
  // Recebe as dependências (portas) via injeção no construtor.
  constructor(private readonly aRepository: IYourAggregateRepository) {}

  public async execute(command: SomeUseCaseCommand): Promise<void> {
    // 1. Buscar um agregado (se for uma atualização)
    // 2. Usar uma factory do agregado para criar uma nova instância
    const aggregate = YourAggregate.create();

    // 3. Chamar métodos de negócio no agregado
    const updatedAggregate = aggregate.someBusinessAction();

    // 4. Usar a porta do repositório para salvar o novo estado
    await this.aRepository.save(updatedAggregate);
  }
}
