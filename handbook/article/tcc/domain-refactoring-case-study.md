# 📔 Estudo de Caso: Refatoração do Domínio (OOP para FP)

Este documento detalha a transformação do núcleo do domínio (`Core Domain`) do projeto Conecta Social, comparando a modelagem tradicional baseada em Classes (OOP) com a modelagem baseada em Tipos e Funções Puras (FP).

---

## 🏗️ 1. O Cenário Inicial: OOP com Estado Mutável
No modelo inicial, as entidades eram classes que encapsulavam dados e comportamentos. Embora seguissem DDD, sofriam com a complexidade de gerenciar estado interno mutável.

### Exemplo: `Patient` (Antes)
```typescript
export class Patient extends AggregateRoot<PatientProps> {
  private constructor(props: PatientProps, id?: Uuid) {
    super(props, id);
  }

  // Método que muta o estado interno
  public createReferral(draft: ReferralDraft): Result<void, DomainError> {
    // Validação
    if (!this.belongsToBoundary(draft.referredId)) {
      return Result.err(P.TargetOutsideBoundary());
    }

    // Criação da entidade filha
    const referral = Referral.create(draft);
    if (referral.isErr) return Result.err(referral.error);

    // Mutação direta da lista (Side Effect)
    this.props.referrals.push(referral.value);

    // Adição de evento (Side Effect na lista de eventos)
    this.addDomainEvent(new ReferralCreatedEvent({ ... }));

    return Result.ok();
  }
}
```

**Problemas Identificados:**
1.  **Imutabilidade Falsa:** Mesmo com `readonly`, métodos internos podiam alterar arrays (`.push`) sem criar novas referências, dificultando rastreamento de mudanças.
2.  **Acoplamento com Infra:** A classe base `AggregateRoot` trazia dependências implícitas.
3.  **Testabilidade:** Para testar um estado final, era necessário instanciar a classe e chamar métodos sequencialmente.

---

## 🚀 2. O Estado da Arte: Agregado Funcional Imutável
No novo modelo, separamos **Dados** (Types) de **Comportamento** (Namespaces). O estado é 100% imutável.

### Exemplo: `Patient` (Depois)

**1. Definição do Tipo (Dados Puros):**
```typescript
// Apenas dados. DeepReadonly garante imutabilidade em tempo de compilação.
export type Patient = Aggregate<{
  readonly personId: PersonId;
  readonly referrals: ImutableList<Referral>;
  // ...
}>;
```

**2. Comportamento (Funções Puras):**
```typescript
export const Patient = {
  // Recebe estado atual -> Retorna NOVO estado (sempre)
  createReferral(
    patient: Patient, 
    draft: ReferralDraft, 
    deps: Deps
  ): Result<Patient, DomainError> {
    
    // Validação Pura
    if (!belongsToBoundary(patient, draft.referredId)) {
      return Result.err(P.TargetOutsideBoundary());
    }

    const referralRes = Referral.create(draft);
    if (Result.isErr(referralRes)) return referralRes;

    // Retorna uma CÓPIA do agregado com o novo referral e o novo evento
    // Nenhuma mutação ocorre no objeto 'patient' original.
    return Result.ok(
      Aggregate.update(patient, {
        referrals: List.add(patient.props.referrals, referralRes.value)
      }).addEvent(ReferralCreatedEvent({ ... }))
    );
  }
} as const;
```

---

## 🎯 3. Patterns Aplicados

1.  **Anemic Domain Model (Revisitado):** Ao contrário do anti-pattern, aqui separamos dados de comportamento propositalmente. Os dados são "burros" (Types), mas o comportamento é rico e encapsulado em Módulos/Namespaces semânticos (`Patient.createReferral`).
2.  **Imutabilidade Estrutural:** O uso de `ImutableList` e `DeepReadonly` impede qualquer mutação acidental. Toda alteração de estado obriga a criação de uma nova versão do Agregado.
3.  **Type-First Design:** O compilador é nosso maior aliado. Não é possível chamar um método que altera estado sem receber o novo estado de volta.
4.  **Eventos como Transição:** Os eventos não são mais "efeitos colaterais" escondidos na classe base. Eles são declarados explicitamente na transição de estado (`addEvent`).

---

## 📊 4. Análise de Ganhos

| Métrica | Antes (OOP) | Depois (FP) | Impacto |
| :--- | :--- | :--- | :--- |
| **Previsibilidade** | Média (Estado mutável) | Máxima (Funções Puras) | Debugging trivial (input -> output) |
| **Serialização** | Complexa (Classes) | Trivial (JSON Puro) | Facilita cache, logs e persistência |
| **Testabilidade** | Setup complexo | Setup simples (Factory) | Testes focados apenas na transição |
| **Boilerplate** | Alto (`class`, `extends`, `this`) | Baixo (`type`, `const`) | Código focado na regra de negócio |
| **Concorrência** | Perigosa (Mutação) | Segura (Imutabilidade) | Pronto para ambientes multi-thread |

---

## 🧠 5. Conclusão para o Artigo
A migração para o Domínio Funcional no Conecta Social demonstrou que a **Riqueza do Domínio** não depende de Classes. Pelo contrário, ao adotar funções puras e tipos imutáveis, tornamos as regras de negócio mais explícitas, auditáveis e seguras. O Agregado deixou de ser um "Container de Estado Mutável" para se tornar uma "Máquina de Estados Finita e Determinística".
