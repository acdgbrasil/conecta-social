# 03 — Domain Modeling & Testing Strategy

## Táticas de Domínio
- **DDD Estrutural**: cada contexto possui entidades, agregados, value objects e catálogos de erros (`packages/conecta-raros/social-care/domain/entities`, `.../value-objects`, `.../errors`).
- **Factories de erro** (`@conecta/domain-error`) garantem mensagens rastreáveis e códigos fixos.
- **Shared Kernel** (`packages/shared/*`) contém construções puras reutilizáveis (Result, Option, UUID, Fn, etc.).
- **Protocol-Oriented onde há side effects**: dependências externas ficam atrás de protocolos (interfaces) hospedados em `packages/shared/protocols/*` e adaptadores default em `packages/shared/adapters/*` (ex.: `Clock`, `IdProvider`, `Notifier`, `EventBus`). Entidades/VOs continuam no modelo atual; protocolos entram nos pontos de integração para facilitar testes e injeção.
- **Command/Result**: para protocolos, preferir funções `execute(input): Result<Output, DomainError>` ao invés de classes stateful; mantém alinhado ao padrão de erro e ao estilo funcional que já usamos.
- **Política**: toda regra nasce como teste RED que referencia diretamente o documento de domínio responsável.

## Arquitetura de Testes
```
packages/<contexto>/tests/
├─ README.md          → contrato do contexto (escopos, filtros Bun, convenções)
└─ unit/
   ├─ value-objects/
   ├─ entities/
   ├─ aggregates/
   ├─ policies/
   └─ regression/ (quando aplicável)
```

- Tests importam via alias (`@conecta/social-care`, `@conecta/queue-core`).
- Bun é o runner padrão (`bun test packages/<contexto>/tests`).
- README explica filtros (`--filter`) e filosofia (documentação viva, regressões historizadas).

## Fluxo RED → GREEN
1. **Ler domínio** (ex.: `handbook/ domain_questions/queue_domain.md`).
2. **Criar teste RED** descrevendo comportamento alvo e mencionando a fonte (`// Contexto: ...`).
3. **Gerar API mínima** (mesmo que stub) para liberar o alias no `tsconfig`.
4. **Implementar regra até o teste ficar GREEN**.
5. **Atualizar handbook** se a regra evoluir.

### Exemplos no repo
- `packages/conecta-raros/social-care/domain/tests/unit/entities/patient.aggregate.spec.ts` documenta invariantes do agregado Patient.
- `packages/queue_manager/tests/...` recém-criados mostram como iniciar um contexto apenas com testes RED.

## Diretrizes para novos contextos
- Replique `tests/README.md` com instruções específicas.
- Prefira `test.todo` para cenários conhecidos mas ainda não descritos.
- Para regressões, use `tests/regression` com histórico do incidente/PR.
- Cobertura deve ser orientada a regras (não a linhas). Documente invariantes com comentários claros.

> Adotar este ciclo garante que o monorepo multi linguagem permaneça coeso, com o domínio guiando a implementação.
