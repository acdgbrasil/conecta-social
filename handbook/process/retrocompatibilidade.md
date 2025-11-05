# Retrocompatibilidade — Matriz de Features

| Feature/Contrato | Status | Introduzido em | Alternativa | Plano de migração | Data alvo de remoção |
| ---------------- | ------ | -------------- | ----------- | ----------------- | -------------------- |
| _preencher_      | Ativo  | -              | -           | -                 | -                    |

## Regras de uso
- Toda nova funcionalidade publicada deve ser registrada na tabela.
- Ao criar uma alternativa, adicionar uma segunda linha com status `Deprecated (soft)` e link para a documentação de migração.
- Remoções só são autorizadas após o status permanecer como `Deprecated (soft)` por pelo menos duas versões `MINOR` consecutivas.
- Referenciar sempre o PR e os testes de regressão que garantem convivência.
