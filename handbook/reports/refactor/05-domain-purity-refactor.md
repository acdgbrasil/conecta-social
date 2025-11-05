# Pós-refatoração — Pureza do Domínio e Abstrações

Este documento detalha as mudanças arquiteturais significativas realizadas após a análise do registro `04`, com foco em alcançar um domínio puro, agnóstico e mais expressivo, seguindo rigorosamente os princípios do Domain-Driven Design (DDD).

## Commits analisados
- Sessão de refatoração interativa focada em pureza de domínio, abstração de dependências e padronização da API dos Value Objects.

## Diferenças principais em relação ao registro 04

- **1. Abstração Completa de Dependências Externas (Pureza do Domínio)**:
  - **Agnosticismo de Tempo**: O `Diagnosis.valueObject.ts` foi refatorado para não depender mais de `new Date()`. Ele agora recebe um `Timestamp` (um novo VO) em seus métodos, tornando o domínio completamente independente do relógio do sistema.

- **2. Enriquecimento e Expressividade do Modelo de Domínio**:
  - **Value Object de Coleção**: Foi criado o `SocialBenefitsCollection` para encapsular a lógica de uma lista de benefícios, eliminando a "Obsessão Primitiva" (`SocialBenefit[]`) do `SocioEconomicSituation`. Isso centraliza regras de negócio (como `isEmpty()`, `getTotalAmount()`) e torna o domínio mais explícito.
  - **Value Object Específico**: Foi criado o `FamilyMemberId` para garantir que apenas UUIDs no formato v7 possam ser usados como identificadores de membros da família, utilizando o sistema de tipos para reforçar as regras de negócio.

- **3. Padronização e Melhoria da API dos Value Objects (Developer Experience)**:
  - **Implementação do Padrão `copyWith`**: Todos os VOs agora possuem um método `copyWith`, que permite a criação de novas instâncias com valores modificados de forma segura e imutável, sempre reaplicando as validações.
  - **Uso de `props` nos Métodos `create`**: Todos os métodos `create` foram padronizados para aceitar um único objeto de propriedades (ex: `create(props: DiagnosisProps)`), tornando a API mais legível e menos propensa a erros de ordem de parâmetros.
  - **Externalização das Propriedades**: Foi criada a pasta `value-objects/props` para armazenar as definições de tipo de cada VO. Isso limpa os arquivos dos VOs e permite que essas "formas" de dados sejam facilmente reutilizadas em DTOs, testes e outras camadas.

- **4. Refatoração do Pacote de UUID**:
  - O pacote `@conecta/uuid` foi completamente reescrito. A API, que antes era um conjunto de funções exportadas, foi encapsulada em uma classe `Uuid` coesa e elegante.
  - Toda a lógica de validação (`isV7`), geração (`generateV7`) e inspeção (`getVersion`) agora está centralizada como métodos estáticos e de instância na classe `Uuid`, tornando seu uso mais intuitivo e alinhado com o paradigma de Value Object.

## Observações e pontos de atenção
- O domínio `social-care` atingiu um alto nível de pureza, sendo agora completamente agnóstico à forma como dados externos (como a hora atual e IDs) são gerados.
- A padronização dos VOs (com `props` e `copyWith`) cria um padrão arquitetural consistente que deve ser seguido para futuros VOs, melhorando a manutenibilidade.
- A separação das definições de `props` facilita a criação de DTOs na camada de aplicação, que podem reutilizar esses tipos para definir os contratos de entrada e saída.
- A refatoração do pacote `Uuid` serve como um modelo para outros pacotes `shared`, mostrando como uma API orientada a objetos pode melhorar a clareza e a usabilidade.
