# Code Review — Eventos de Domínio (05/01/2026)

## Contexto
Implementação do suporte a Eventos de Domínio no agregado `Patient` para permitir reatividade e desacoplamento na arquitetura.

## Mudanças Analisadas
- `packages/social/social-care/entities/Patient.entity.ts`
- `packages/social/social-care/events/*.ts`

## Achados e Resoluções

| Id | Tipo | Severidade | Descrição | Status |
|---|---|---|---|---|
| **CR-01** | Convention | Low | Nomes de arquivos de evento em PascalCase (`PatientCreated.event.ts`). | ✅ Resolvido (renomeado para `kebab-case`). |
| **CR-02** | Arch | Medium | Imports profundos (`from "@conecta/shared/..."`). | ✅ Resolvido (ajustado para aliases `@conecta/protocols`). |
| **CR-03** | Code Smell | Low | Construtor do UseCase privado. | ✅ Identificado (deve ser `public` para injeção de dependência). |
| **CR-04** | Test | Medium | Teste verificava `typeof method` como `object` incorretamente. | ✅ Corrigido para `function`. |

## Observações
- A implementação do `pullDomainEvents` e o acúmulo de eventos no `copyWith` do `Patient` ficaram robustos e imutáveis.
- O versionamento (`version + 1`) foi corretamente aplicado nas mutações.

## Próximos Passos
- Implementar a camada de aplicação consumindo esses eventos através do `EventBus`.
