---
title: "Tests as Documentation"
scope: "pull_request"
path: ["packages/**"]
severity_min: "high"
buckets: ["testing", "quality"]
enabled: true
uuid: "3f5010d0-2f9e-4704-9b4c-8ad77b8c8403"
---

## Instructions
Confirme que mudanças de comportamento vêm acompanhadas de testes claros conforme `handbook/principles/testing-and-domain.md`.
- Novos fluxos de domínio → specs em `packages/<context>/tests/unit/{entities,value-objects}` com nomes descritivos (`*.spec.ts`).
- Correções de bug → cenários vermelhos em `packages/<context>/tests/regression` comprovando a falha original.
- Testes devem usar imports via `@conecta/<alias>` e evitar mocks desnecessários.
- Não aceite remoção/alteração de testes sem justificativa explícita e atualização do handbook/quality quando aplicável.

## Examples

### Bad example
```
PR adiciona método `Patient.registerAppointment` mas não cria nenhum arquivo em `tests/unit/entities/`.
```

### Good example
```
Arquivo `packages/social/social-care/tests/unit/entities/patient.aggregate.spec.ts` ganha nova suíte "6. Gerenciamento de Atendimentos".
```
