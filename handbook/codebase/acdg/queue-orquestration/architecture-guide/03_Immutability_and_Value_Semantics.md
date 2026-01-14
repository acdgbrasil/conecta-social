Aqui está o documento consolidado **`03_Immutability_and_Value_Semantics.md`**.

Este guia é crucial para evitar falsos positivos em Code Reviews, explicando tecnicamente por que a "mutabilidade local" das Structs é, na verdade, uma forma de imutabilidade funcional.

-----

# 💎 03\_Immutability\_and\_Value\_Semantics.md

> **Propósito:** Explicar o modelo de gerenciamento de memória e estado do Swift (Value Semantics). Diferencia o uso de `struct` + `mutating` da programação orientada a objetos clássica (Reference Types).
> **Instrução para IA:** Não sinalize o uso de `mutating` em Structs como erro ou "code smell". Garanta que o estado compartilhado seja gerenciado via cópia (Value Semantics), e não por referência. O uso de Classes para Entidades de Domínio é proibido.

-----

## 1\. O Conceito de Value Semantics (A Lei)

No Swift, `structs` (o padrão deste projeto) são **Value Types**. Isso significa que os dados são copiados, não compartilhados por referência.

  * **Cenário:** Você tem uma variável `orderA`. Você cria `var orderB = orderA`.
  * **Ação:** Você altera a prioridade de `orderB`.
  * **Resultado:** `orderA` permanece **intacta**. Elas são universos isolados na memória.

Isso elimina uma categoria inteira de bugs críticos em sistemas distribuídos: **Race Conditions em Estado Compartilhado**. Nenhuma parte do sistema pode alterar o estado de outra "sem querer".

-----

## 2\. O Papel do `mutating` (Não é um Bug)

Em linguagens puramente funcionais, para mudar um valor, você retorna um novo objeto. No Swift, a palavra-chave `mutating` é apenas **açúcar sintático** para essa mesma operação, mas otimizada pelo compilador.

### Comparação Técnica

**Jeito Purista (Funcional):**

```swift
func enqueue(_ item: Item) -> Fila {
    var novosItems = self.items
    novosItems.append(item)
    return Fila(items: novosItems) // Retorna nova cópia
}
```

**Jeito Swift (Mutating):**

```swift
// Funcionalmente idêntico ao acima, mas mais legível e performático
mutating func enqueue(_ item: Item) {
    self.items.append(item) // O compilador substitui 'self' por uma nova cópia
}
```

> **Nota para Code Review:** Ver uma função `mutating` em uma `struct` é **correto** e esperado. Errado seria tentar mudar uma propriedade dentro de uma `class` (o que causaria efeitos colaterais imprevisíveis).

-----

## 3\. Arquitetura de Estado (Onde a mudança ocorre?)

Se as entidades são imutáveis (cópias), como o sistema evolui? A arquitetura define um fluxo estrito onde a "mutabilidade real" existe apenas na **Persistência (Banco de Dados)**.

### O Ciclo "Load-Compute-Save"

1.  **Load (Leitura):** O Application carrega um **Snapshot** (cópia) imutável do estado via Repositório.
      * *Ex:* `var queue = try repo.get("ID-123")`
2.  **Compute (Cálculo):** O Application chama métodos do Core. A `struct` sofre mutações locais na memória (Stack), sem afetar o banco ou outras threads.
      * *Ex:* `queue.enqueue(order)`
3.  **Save (Persistência):** O Application salva o **novo estado** no Repositório, substituindo a versão anterior atomicamente.
      * *Ex:* `try repo.save(queue)`

-----

## 4\. Comparativo: OOP vs POP

| Característica | Class (OOP Clássico) | Struct (Nosso Padrão POP) |
| :--- | :--- | :--- |
| **Tipo de Memória** | **Heap** (Lento, gera Garbage/ARC traffic) | **Stack** (Instantâneo, Zero Allocation) |
| **Passagem** | Por Referência (Ponteiro) | Por Valor (Cópia) |
| **Segurança** | Perigoso (Shared Mutable State) | Seguro (Isolamento total) |
| **Multithreading** | Exige Locks/Mutex complexos | Thread-safe por padrão (cada thread tem sua cópia) |

-----

## 5\. Veredito de Segurança

A especificação segue o princípio de **Imutabilidade de Referência**:

1.  Não usamos `classes` para Entidades de Domínio.
2.  Não temos "Shared Mutable State" (variáveis globais ou Singletons que guardam dados).
3.  Cada transação opera no seu próprio universo isolado de dados.

Pode confiar no `mutating`. A integridade dos dados está protegida pela própria arquitetura da linguagem.