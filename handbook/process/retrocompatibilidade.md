# Retrocompatibilidade — Matriz de Features

| Feature/Contrato | Status | Introduzido em | Alternativa | Plano de migração | Data alvo de remoção |
| ---------------- | ------ | -------------- | ----------- | ----------------- | -------------------- |
| `@conecta/shared/*` (Result, Option, DomainError, Uuid, Fn) | Ativo (estável) | v0.1.0 | - | Manter regressões em `packages/shared/tests/regression`; qualquer quebra exige release `major`. | N/A |
| `@conecta/social/social-care` (agregado `Patient` + VOs) | Ativo (beta) | v0.1.0 | Legacy `src/domain` (somente leitura) | Consolidar eventos e ACLs até v0.3.0; promover a `1.0.0` após contratos externos documentados. | Revisitar após v0.3.0 |

## Regras de uso
- Toda nova funcionalidade publicada deve ser registrada na tabela.
- Ao criar uma alternativa, adicionar uma segunda linha com status `Deprecated (soft)` e link para a documentação de migração.
- Remoções só são autorizadas após o status permanecer como `Deprecated (soft)` por pelo menos duas versões `MINOR` consecutivas.
- Referenciar sempre o PR e os testes de regressão que garantem convivência.
