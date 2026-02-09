# TASK-023 - Modernização das Libs de Padrões Funcionais (TypeScript Moderno)

**Status:** ✅ Done

## Objetivo
Refatorar as bibliotecas core (`@conecta/result`, `@conecta/option`, `@conecta/fn`) para eliminar o "boilerplate" excessivo, reduzir o uso de memória (objetos com métodos injetados) e adotar padrões modernos de TypeScript (Type Guards, Namespaces, Inferência Estrita e Tree Shaking).

## Contexto
Atualmente, nossas libs funcionais sofrem de:
1. **Verbosidade:** O uso excessivo de métodos de instância (`.unwrap()`, `.map()`) exige a criação de objetos complexos (`withMethods`) a cada operação, o que é custoso para o Garbage Collector.
2. **Falta de Helpers de Coleção:** Não temos utilitários nativos para lidar com arrays de Result/Option (`Result.all`, `sequence`), forçando loops manuais (`for` + `if isErr`) nos Use Cases.
3. **Inconsistência:** O `Result` já começou a ser migrado (TASK anterior), mas o `Option` e o `ImutableList` ainda usam o padrão antigo de closures/objetos.

## Plano de Execução

### 1. `@conecta/result` (Refinamento)
O `Result.ts` já foi simplificado, mas precisamos garantir que ele esteja completo e documentado.

- [ ] **Consolidar Namespace:** Garantir que todas as funções puras (`map`, `flatMap`, `match`) estejam disponíveis tanto como exportações isoladas (tree-shaking) quanto dentro do namespace `Result` (ergonomia).
- [ ] **Adicionar `safe`:** Um wrapper `try-catch` que retorna `Result`, útil para chamadas de bibliotecas de terceiros que lançam exceções.
- [ ] **Remover Legado:** Se possível, remover exportações de funções que não deveriam ser públicas se o Namespace cobrir tudo (decisão de design: manter compatibilidade ou quebrar para limpar?). *Recomendação: Manter exports isolados para permitir `import { map } from...`*.

### 2. `@conecta/option` (Refatoração Completa)
O `Option.ts` atual cria objetos com métodos (`unwrap`, `map`) a cada chamada de `Some`.

- [ ] **Migrar para Discriminated Unions Puras:**
  ```typescript
  type Some<T> = { readonly kind: 'some'; readonly value: T };
  type None = { readonly kind: 'none' };
  type Option<T> = Some<T> | None;
  ```
- [ ] **Type Guards Extensivos (Redução de Ifs):**
  Implementar um arsenal de Type Guards e predicados para evitar verificações manuais e `unwrap` inseguros.
  - `Option.isSome(opt): opt is Some<T>`
  - `Option.isNone(opt): opt is None`
  - `Option.contains(opt, value): boolean`
  - `Option.exists(opt, predicate): boolean` (Verifica se existe E satisfaz a condição)
- [ ] **API Fluente (Pipeable) e Redução de Boilerplate:**
  Estimular o uso de `Option` para controle de fluxo, evitando `if (val == null)`.
  - `Option.fromNullable(val)` (Substitui `unSafe`)
  - `Option.map`, `Option.flatMap` (Encadeamento seguro)
  - `Option.filter(opt, predicate)` (Transforma Some em None se falhar no teste)
  - `Option.orElse(opt, fallbackFn)` (Recuperação preguiçosa)
  - `Option.match(opt, { some: ..., none: ... })` (Pattern Matching exaustivo)
  - `Option.all` (Transforma `Option<T>[]` em `Option<T[]>`)
  - **Objetivo:** Permitir códigos como:
    ```typescript
    // Antes
    if (user && user.address && user.address.zip) { ... }
    
    // Depois
    pipe(
      Option.fromNullable(user),
      Option.flatMap(u => u.address),
      Option.map(a => a.zip),
      Option.match({ some: z => process(z), none: () => handleError() })
    )
    ```
- [ ] **Remover `GuardCause`:** As funções `guardLet` e `ifLet` são idiossincrasias que podem ser substituídas por `match` ou verificações simples `if (Option.isSome(opt))`. Avaliar remoção para simplificar a API.

### 3. `@conecta/fn` (ImutableList Moderno)
A `ImutableList` atual é uma fábrica de closures. Cada lista cria 10+ funções na memória.

- [ ] **Migrar para Arrays Readonly com Helpers:**
  Em vez de encapsular o array em um objeto opaco, usar o tipo nativo `readonly T[]` e fornecer funções puras.
  ```typescript
  // src/shared/fn-pattern/list.ts
  export const List = {
    empty: <T>() => [] as readonly T[],
    add: <T>(list: readonly T[], el: T) => [...list, el],
    remove: <T>(list: readonly T[], el: T) => list.filter(x => x !== el),
    hasDuplicates: <T>(list: readonly T[]) => new Set(list).size !== list.length,
    // ...
  };
  ```
- [ ] **Eliminar `fn-types.ts`:** Se usarmos `readonly T[]`, não precisamos de interfaces complexas.
- [ ] **Manter `stableStringify`:** Útil para comparação de objetos, mover para `utils` ou manter dentro do módulo de lista se for o único uso.

## Guia de Migração (Breaking Changes)

Como essas mudanças quebram contratos, a migração deve ser feita em etapas ou com scripts de codemod (buscar e substituir).

### Exemplo de Migração (Option)

**Antes:**
```typescript
const opt = Some(10);
const val = opt.unwrapOr(0);
```

**Depois:**
```typescript
const opt = Option.some(10);
const val = Option.unwrapOr(opt, 0);
// OU (Pipeable - Futuro)
// const val = pipe(opt, Option.unwrapOr(0));
```

## Benefícios Esperados
1. **Performance:** Menor pressão no GC (menos alocações de objetos/funções).
2. **Ergonomia:** `Result.all` e `Option.all` limpam loops de validação.
3. **Debug:** Objetos `plain` (`{ kind: 'ok', value: ... }`) são mais fáceis de inspecionar no console do que Proxies ou Closures.
4. **Alinhamento:** Todo o projeto falará a mesma língua "funcional moderna" do TypeScript.

## Próximos Passos
1. Aprovar este plano.
2. Criar branch `refactor/modern-fp-libs`.
3. Executar refatoração módulo a módulo (começando por `Result` que já está adiantado).
4. Rodar testes de regressão (`bun test`) obsessivamente a cada mudança.
