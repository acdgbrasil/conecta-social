// --- ARQUIVO ESQUELETO ---
// Define a interface (contrato) para o repositório do seu agregado.
// A camada de infraestrutura implementará esta porta.

import type { YourAggregate } from '../aggregates/your-aggregate.aggregate';

export interface IYourAggregateRepository {
  // TODO: Defina os métodos necessários para persistência.
  findById(id: string): Promise<YourAggregate | null>;
  save(aggregate: YourAggregate): Promise<void>;
}
