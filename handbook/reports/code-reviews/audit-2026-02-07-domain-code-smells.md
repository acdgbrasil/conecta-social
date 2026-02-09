# Relatório de Code Smells e Oportunidades — Social Care Domain

Este documento detalha inconsistências e excessos identificados após a migração para o modelo funcional, servindo de guia para o refinamento técnico do domínio.

---

## 1. Agregado Patient (God File)
- **Smell:** O arquivo `Patient.entity.ts` está concentrando comportamentos de múltiplos sub-domínios (Família, Encaminhamentos, Atendimentos, Violações).
- **Problema:** Manutenibilidade e legibilidade prejudicadas por um arquivo que tende a crescer indefinidamente.
- **Oportunidade:** Utilizar "Extension Functions" em arquivos separados. 
  - Ex: `Patient.family.ts` contém apenas as funções de gestão de familiares. 
  - Todas as funções continuam sob o namespace `Patient`, mas o código físico é modularizado.

## 2. Eventos de Domínio (Repetição de Lógica)
- **Smell:** Todas as fábricas de eventos (`PatientCreatedEvent`, `FamilyMemberAddedEvent`, etc.) repetem a lógica de criação de UUID e `Result.unwrap`.
- **Problema:** Boilerplate excessivo e fragilidade. Mudanças na estrutura base do evento exigem alterações em múltiplos arquivos.
- **Oportunidade:** Criar um helper interno `domain/events/factory.ts` que centraliza a construção da estrutura base do `DomainEvent`.

## 3. Serviços de Domínio (Fragmentação Desnecessária)
- **Smell:** Existem funções em `domain/services/` que são usadas exclusivamente pelo agregado `Patient`.
- **Problema:** No modelo funcional, não há necessidade de separar "métodos" em pastas de serviços se eles operam estritamente sobre os dados do agregado.
- **Oportunidade:** Mesclar a lógica dos serviços (`belongsToBoundary`, `ensureFamilyMemberNotExists`) nos arquivos especializados do Agregado (item 1), eliminando a pasta `services/`.

## 4. Repositórios (Vazamento de Detalhes de Implementação)
- **Smell:** O `PatientRepositoryPort` expõe o método `addFamilyMember`.
- **Problema:** Violação do conceito de Aggregate Boundary. O domínio deve interagir com o repositório enviando o Agregado completo via `save`. Se o repositório decidir fazer um update parcial por performance, isso é um detalhe de infraestrutura.
- **Oportunidade:** Remover `addFamilyMember` do contrato do repositório.

## 5. Value Objects (Sobre-fragmentação)
- **Smell:** Muitos VOs simples possuem arquivos de `props` separados em uma subpasta.
- **Problema:** Dificulta a navegação e o entendimento rápido do VO.
- **Oportunidade:** Co-locar a definição de `Props` e o `Namespace` no mesmo arquivo do VO, exceto para estruturas muito grandes e compartilhadas.

---

## Plano de Ação Sugerido
1. **Refinar Estrutura de Arquivos:** Quebrar `Patient.entity.ts` em módulos comportamentais (Família, Saúde, Social).
2. **Centralizar Fábrica de Eventos:** Reduzir boilerplate nos eventos de domínio.
3. **Limpeza de Portas:** Ajustar o contrato do repositório para ser centrado no Agregado.
4. **Consolidação de VOs:** Trazer `props` para dentro dos arquivos principais.
