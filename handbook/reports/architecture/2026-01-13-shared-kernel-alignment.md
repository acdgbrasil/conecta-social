# Relatório de Alinhamento: Shared Kernel (TS vs Swift)

**Data:** 13/01/2026
**Contexto:** Análise de compatibilidade semântica entre `@packages/shared` (TypeScript/Bun) e `Sources/Shared` (Swift/ACDG) para garantir a integridade do MonoRepo Poliglota.

---

## 1. Identificadores (UUID v7)

O padrão de identidade é crítico para sistemas distribuídos. Ambos os lados devem gerar IDs colidíveis e ordenáveis por tempo.

| Característica | TypeScript (`uuid.ts`) | Swift (`UUID.swift`) | Status |
| :--- | :--- | :--- | :--- |
| **Versão** | v7 (Time-ordered) | v7 (Time-ordered) | ✅ Compatível |
| **Timestamp** | Unix Milliseconds (48 bits) | Unix Milliseconds (48 bits) | ✅ Compatível |
| **Monotonicidade** | **Sim** (Usa contador `seq`) | **Não** (Usa Random puro) | ⚠️ **Divergente** |
| **Bit Layout** | RFC 9562 Compliant | RFC 9562 Compliant | ✅ Compatível |

### 🔍 Análise
A implementação TypeScript (`packages/shared/uuid-pattern/uuid.ts`) implementa um contador de sequência (`nextSeq`) para garantir que IDs gerados no *mesmo milissegundo* continuem ordenados.
A implementação Swift (`Sources/Shared/UUID/UUID.swift`) preenche os bits após o timestamp com valores aleatórios (`UInt8.random`).

**Impacto:**
Em cenários de altíssima carga no Raspberry Pi (Swift), múltiplos eventos gerados no mesmo milissegundo não terão ordem garantida entre si, apenas ordem aleatória. Para o ACDG (filas humanas), isso é aceitável, pois a escala humana (segundos) é muito maior que milissegundos.

**Recomendação:**
Manter como está. A complexidade de manter estado global de sequência no Swift (com Thread Safety) não compensa o benefício para o caso de uso do ACDG.

---

## 2. Padrão Result (Error Handling)

O controle de fluxo deve evitar `try/catch` para regras de negócio e usar Retornos Explícitos.

| Característica | TypeScript (`Result.ts`) | Swift (Nativo) | Status |
| :--- | :--- | :--- | :--- |
| **Tipo** | `Result<T, E>` (Custom Monad) | `Result<Success, Failure>` (Enum) | ✅ Compatível |
| **Métodos** | `map`, `flatMap`, `unwrap` | `map`, `flatMap`, `get()` | ✅ Compatível |
| **Erro** | Genérico (pode ser qualquer coisa) | Deve conformar a `Error` | ✅ Compatível |

### 🔍 Análise
No Swift, não precisamos reimplementar a classe `Result` pois a linguagem já oferece isso nativamente desde o Swift 5. O desafio é a disciplina de uso.

**Ação Necessária no Swift:**
O código Swift atual define `IdentifierError` e `DomainError`, mas não vi o uso explícito de `Result` nos retornos dos métodos de `SpecialtyQueue` (estava implícito como `mutating func`).
Para alinhar com o TS, os métodos do Core Swift devem assinar:
```swift
// Em vez de throws
func enqueue(...) throws
// Devem ser (para alinhar com o padrão funcional do projeto)
func enqueue(...) -> Result<Void, DomainError>
```
*Nota: O Swift 6 `Typed Throws` (`throws(DomainError)`) é semanticamente equivalente e mais idiomático que `Result` para retornos síncronos. Podemos aceitar `throws(DomainError)` no Swift como equivalente ao `Result<T, E>` do TS.*

---

## 3. Tipos Fortes (TaggedIDs)

Evitar "Primitive Obsession" (usar strings soltas para IDs).

| Característica | TypeScript (`FamilyMemberId`, etc.) | Swift (`TaggedID<Tag>`) | Status |
| :--- | :--- | :--- | :--- |
| **Implementação** | Classes Wrapper (`value` prop) | Generic Struct (`TaggedID<T>`) | ⚠️ **Diferente (Swift é melhor)** |
| **Validação** | No método `create()` | Na inicialização via `Policy` | ✅ Compatível |

### 🔍 Análise
A implementação Swift (`Sources/Shared/TaggedID`) é superior e mais genérica. Ela usa "Phantom Types" (`PatientTag`, `VisitTag`) para criar tipos distintos sem overhead de memória.
A implementação TS cria classes físicas para cada ID.

**Recomendação:**
Não mudar o TS agora (seria refatoração pesada), mas reconhecer que o Swift está mais otimizado. Ambas garantem a segurança de tipo necessária.

---

## 4. Domain Errors (Catálogo)

Padronização de códigos de erro para o Frontend/API consumir.

| Característica | TypeScript (`DomainErrorFactory`) | Swift (`DomainError` Protocol) | Status |
| :--- | :--- | :--- | :--- |
| **Estrutura** | Rica (Catálogo, Template, Redact) | Simples (Code, Title) | ❌ **Divergente** |
| **Códigos** | `PREFIX-000` | String livre | ⚠️ **Risco** |

### 🔍 Análise
O ecossistema TS tem um sistema robusto de `makeDomainErrorFactory`. O Swift tem apenas um protocolo simples.
Isso vai gerar inconsistência nos logs e nas respostas da API (gRPC). Se o Swift retornar um erro, ele precisa ter o mesmo formato (`code`, `category`, `context`) que o TS.

**Recomendação Crítica:**
Copiar a lógica do `ErrorTaxonomy` e `DomainErrorFactory` do TS para o Swift.
O Swift deve ser capaz de emitir erros como:
```swift
return .failure(PatientErrors.notFound(id: "123"))
// Output gRPC: { "code": "PAT-006", "message": "Paciente não encontrado..." }
```

---

## ✅ Conclusão e Próximos Passos

Você tem um alinhamento conceitual forte (DDD, IDs Fortes, Separação de Camadas). As divergências são de implementação detalhada.

1.  **Aprovado:** Implementações de UUID e TaggedID.
2.  **Atenção:** Uso de `Typed Throws` no Swift vs `Result` no TS é aceitável, desde que documentado.
3.  **Ação Imediata:** Portar o `DomainErrorFactory` e o catálogo de erros (`ErrorTaxonomy`) para o Swift para garantir que os dois sistemas "falem a mesma língua" nos erros.

**Este relatório foi salvo em:** `handbook/reports/architecture/2026-01-13-shared-kernel-alignment.md`
