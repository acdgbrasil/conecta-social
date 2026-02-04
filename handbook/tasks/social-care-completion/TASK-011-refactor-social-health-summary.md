# [TASK-011] Refatorar SocialHealthSummary (Over-Engineering)

**Status:** [x] Concluído
**Prioridade:** Baixa (Melhoria Futura / Dívida Técnica)
**Labels:** `refactor`, `social-care`, `domain`, `technical-debt`

## Descrição
O Value Object `SocialHealthSummary` está funcional e coberto por testes, mas sua implementação foi identificada como excessivamente complexa ("Over-Engineering") para o problema que resolve (armazenar listas de strings).

Esta tarefa visa simplificar a implementação interna sem alterar o contrato externo.

## Veredito Técnico
**Status:** 🟡 Funcional, mas com "Over-Engineering".

### Problemas e Melhorias Identificadas

#### 1. Lógica "Espaguete" no `copyWith` (Prioridade Alta)
Atualmente, o método tenta fazer o trabalho de:
- Desembrulhar `Option` (`unSafe`).
- Normalizar arrays.
- Verificar strings vazias.
- Recriar `ImutableList`.
Tudo isso dentro de variáveis ternárias complexas.

**A Melhoria:** O `copyWith` deve ser "burro". Ele só deve mesclar as propriedades (`...spread`) e chamar o `SocialHealthSummary.create()`. A validação e normalização devem ficar **exclusivamente** no `create`.

#### 2. Uso Pesado de `ImutableList` para Strings Simples (Prioridade Média)
O uso de `ImutableListFactory` para uma lista simples de strings (`functionalDependencies`) adiciona sobrecarga de performance e sintaxe desnecessária.

**A Melhoria:** Substituir por Arrays nativos congelados (`readonly string[]`) combinados com um `Set` no método `create` para garantir unicidade. Isso é mais performático (O(1) vs O(N)) e legível.

#### 3. Validação de "Dependências Vazias"
O tratamento atual no `copyWith` tenta corrigir strings vazias "silenciosamente".

**A Melhoria:** Centralizar a limpeza (`trim` e `filter`) no `create`. Se o usuário passar `[" ", "Banho"]`, o sistema deve limpar para `["Banho"]` automaticamente ou rejeitar tudo, sem tentar adivinhar a intenção no meio do caminho.

---

## 📌 Receita de Refatoração (Prompt para o Futuro)

Quando esta tarefa for priorizada, seguir este roteiro:

**Objetivo:** Remover a complexidade ciclotímica do método `copyWith` e otimizar a manipulação de listas.

**Ações:**
1. Alterar `functionalDependencies` interna para usar `Set<string>` (ou lógica equivalente) para deduplicação instantânea no `create`.
2. Reescrever `copyWith` para usar apenas `...spread` das props e chamar `SocialHealthSummary.create()`.
3. Remover a dependência de `unSafe` e `Option` dentro da classe, lidando com `undefined` diretamente nas props opcionais.
4. **Meta:** Reduzir o arquivo de ~70 linhas para ~40 linhas, mantendo os mesmos testes passando.

---

## Critérios de Aceite
- [x] Refatorar o método `copyWith` removendo lógica de negócio.
- [x] Substituir `ImutableList` por arrays nativos (`readonly string[]`) para as dependências funcionais.
- [x] Centralizar validação e sanitização (trim/filter) no método `create`.
- [x] Garantir que todos os testes existentes em `packages/conecta-raros/social-care/tests/unit/value-objects/socialHealthSummary.valueObject.spec.ts` continuem passando (Refactor sem regressão).