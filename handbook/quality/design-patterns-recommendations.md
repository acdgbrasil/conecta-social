# Estratégia de Redução de Verbosidade: Domínio Funcional e Design Patterns

_Este documento detalha a transição do domínio Social Care de um modelo baseado em classes (OO) para um modelo funcional (FP) utilizando o padrão de **Namespaces/Módulos**, visando eliminar o boilerplate e alinhar o código às bibliotecas `@conecta/*`._

---

## 1. O Pivô: Domínio Funcional (Namespaces + Tipos)

Para evitar o máximo de verbosidade, a recomendação central é abandonar a estrutura de `class` em favor de **Tipos Puros + Objetos de Módulo (Namespaces)**. Esta transição simplifica drasticamente a implementação dos padrões clássicos do GoF.

### Por que transicionar?
1.  **Fim do `copyWith` Manual:** O uso do *Spread Operator* (`...`) nativo do JavaScript substitui centenas de linhas de métodos de cópia manuais.
2.  **Serialização Nativa:** Objetos funcionais são JSONs puros (POJOs). Mappers de persistência tornam-se quase triviais.
3.  **DX (Developer Experience):** Elimina-se a gestão do `this`, `private constructor` e getters repetitivos.
4.  **Alinhamento:** O projeto já usa `Result`, `Option` e `ImutableList`, que são cidadãos de primeira classe no mundo funcional.

---

## 2. Padrões de Projeto no Contexto Funcional

Baseado no guia de padrões funcionais (`@handbook/tooling/design-patterns/fn-pattern.md`), muitos padrões clássicos tornam-se redundantes ou extremamente simplificados:

### 2.1. Prototype (Imutabilidade Nativa)
Em um mundo imutável, o padrão Prototype é o comportamento padrão. Toda modificação gera uma nova cópia.
- **Referência:** "Prototype is not needed in immutable world. Every time you modify object, you get a fresh new immutable copy" (fn-pattern.md, Ep. 8).
- **Implementação:** `{ ...patient, name: 'Novo' }`.

### 2.2. Factory Method (Módulo Static Factory)
Mantemos a segurança da criação centralizada através de um objeto que age como Namespace.
- **Padrão:** `export const Patient = { create: (...) => Result }`.
- **Referência:** Substitui a cerimônia do "Construtor Virtual" por funções puras que garantem invariantes.

### 2.3. Template Method (Composição e Funções de Ordem Superior)
Em vez de herança de classes abstratas, usamos a composição de funções.
- **Referência:** "Redefined behaviour by using functions instead of subclassing" (fn-pattern.md, Ep. 5).
- **Aplicação:** Usar o `pipe` de `@conecta/shared/fn-pattern` para encadear transformações e validações de forma linear.

### 2.4. Command (Data-Intentions)
O Command torna-se uma simples estrutura de dados (POJO) que descreve uma intenção, tratada por funções executoras.
- **Referência:** "Command is just a function [or data describing it]" (fn-pattern.md, Ep. 1).
- **Integração:** Facilita o Outbox Pattern ao salvar apenas o JSON do comando.

### 2.5. Strategy (Funções como Argumentos)
O padrão Strategy "colapsa" em passar funções como argumentos para outras funções.
- **Referência:** "Strategy is just a function passed to another function" (fn-pattern.md, Ep. 2).

---

## 3. Utilitários Fundamentais (@conecta/shared/fn-pattern)

A transição deve se apoiar fortemente nos utilitários já documentados em `@handbook/codebase/shared/fn-pattern/documentation.md`:

1.  **`pipe`:** Para evitar aninhamento de chamadas e tornar o código legível ("Unix pipeline style").
    ```ts
    const normalized = pipe(input, trim, toUpper);
    ```
2.  **`ImutableListFactory`:** Essencial para gerenciar coleções dentro das Entidades/Agregados sem expor arrays mutáveis, garantindo que `Patient.familyMembers` nunca seja alterado externamente.

---

## 4. Exemplo Prático: Antes vs. Depois

### Antes (Baseado em Classes - Atual)
```typescript
export class Diagnosis {
  private constructor(readonly id: ICDCode, readonly date: Timestamp, readonly description: string) {
    Object.freeze(this);
  }
  static create(props: DiagnosisProps, now: Timestamp): Result<Diagnosis, DomainError> {
    return ok(new Diagnosis(props.id, props.date, props.description.trim()));
  }
  copyWith(props: Partial<DiagnosisProps>, now: Timestamp): Result<Diagnosis, DomainError> {
    return Diagnosis.create({ id: props.id ?? this.id, ... }, now);
  }
}
```

### Depois (Funcional com Namespace - Recomendado)
```typescript
export type Diagnosis = {
  readonly id: ICDCode;
  readonly date: Timestamp;
  readonly description: string;
};

export const Diagnosis = {
  create: (props: Diagnosis, now: Timestamp): Result<Diagnosis, DomainError> => 
    ok({ ...props, description: props.description.trim() }),
  
  // Strategy/Template via Pipe
  validate: (d: Diagnosis) => pipe(d, checkICD, checkDate)
};
```

---

## 5. Plano de Ação para Transição

1.  **Mapear e Converter VOs:** Transformar classes em tipos `readonly` + módulos constantes.
2.  **Substituir Herança por Composição:** Eliminar classes abstratas pesadas em favor de funções utilitárias compartilhadas.
3.  **Adotar o Pipe:** Refatorar lógicas de validação complexas no Agregado `Patient` usando `pipe` para reduzir o aninhamento de `if/else`.
4.  **Imutabilidade por Padrão:** Remover todos os métodos mutáveis e garantir que toda operação no domínio retorne um novo objeto (com `Result`).

---

## 6. Parecer Técnico: TypeScript Specialist

Baseado no `TypeScript Handbook` (v. `handbook/tooling/typescript/**`), esta migração é **tecnicamente recomendada**, observando-se os seguintes pontos críticos para manter a segurança de tipos:

### 6.1. Evitar `namespace` (Legado)
O termo "Namespace" deve ser interpretado estritamente como **Module Objects** (Objetos POJO exportados). O uso da palavra-chave `namespace` é desencorajado.
> "While not deprecated... we recommend you use [ES Modules] to align with JavaScript's direction." (`Modules.md`)

### 6.2. Segurança via Branded Types
Para compensar a perda do `private constructor`, a biblioteca `@conecta/fn` deve implementar **Branded Types** (tipos nominais simulados) usando Intersection Types. Isso impede a criação acidental de objetos de domínio fora das Factories.
> "An intersection type... produces a new type that has all the members of [both]." (`Object Types.md`)

**Sugestão de Melhoria em `@conecta/fn`:**
```typescript
// Adicionar em @conecta/shared/fn-pattern
export type Branded<T, Brand extends string> = T & { readonly __brand: Brand };

// Uso no Domínio (Exemplo)
export type Diagnosis = Branded<{
  readonly id: ICDCode;
  readonly date: Timestamp;
  // ...
}, "Diagnosis">;
```

### 6.3. Imutabilidade Profunda
O modificador `readonly` do TypeScript é raso. Para objetos complexos, a imutabilidade das referências aninhadas (como listas) deve ser garantida pelas estruturas de dados (ex: `ImutableList`).
> "Using the readonly modifier... just means the property itself can't be re-written to." (`Object Types.md`)

---

## 7. Mantendo a DX (Developer Experience) no Modelo Funcional

É possível manter a fluidez das classes usando padrões de design específicos do TypeScript:

### 7.1. O Padrão de Dualidade (Type + Const Namespace)
Ao exportar um `type` e uma `const` com o mesmo nome, o IDE fornece autocomplete para os métodos ao digitar o nome do tipo seguido de ponto (ex: `Diagnosis.`).

### 7.2. Funções "Data-Last" + `pipe`
Padronizar funções de transformação onde o dado principal é o último argumento. Isso transforma o `pipe` no equivalente funcional da "dot notation" (`obj.a().b()`).

### 7.3. Comparativo de DX

| Recurso | Classes (OO) | Funcional (Namespace + Pipe) |
| :--- | :--- | :--- |
| **Autocomplete** | `obj.method()` | `Namespace.method(obj)` ou `pipe(obj, method)` |
| **Encadeamento** | `obj.a().b()` | `pipe(obj, a, b)` (Mais legível e testável) |
| **Discovery** | Precisa da instância | Global (via Auto-import do IDE) |
| **Serialização** | Difícil (Mappers) | Nativa (JSON POJO) |

---

## 8. Proposta de Evolução para `@conecta/fn`

Para elevar a DX e a segurança ao nível sênior, a biblioteca deve ser expandida com:
1.  **`Branded<T, Tag>`**: Para garantir a integridade dos tipos de domínio.
2.  **`DeepReadonly<T>`**: Para garantir imutabilidade recursiva em pipelines complexos.
3.  **`curry`**: Para converter funções `data-first` em `data-last` automaticamente para uso no `pipe`.
