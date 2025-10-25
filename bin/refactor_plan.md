# Plano de Refatoração do Domínio

Este documento descreve as alterações necessárias para alinhar a camada de domínio com os princípios de pureza do Domain-Driven Design (DDD), garantindo que ela seja livre de efeitos colaterais, imutável e totalmente testável.

## Arquivos a serem modificados

### 1. `packages/social/social-care/value-objects/Diagnosis.valueObject.ts`

#### Smells Detectados

- **`[IMPUREZA]`** **Linha 12 e 13**: O método `create` utiliza `new Date()` para obter a data/hora atual. Isso torna o método impuro, dependente do relógio do sistema e difícil de testar de forma determinística. O domínio não deve ter conhecimento do "agora".
- **`[PRIMITIVE OBSESSION]`** **Linha 10**: O parâmetro `date` é do tipo `Date` do JavaScript. Tipos nativos de data são mutáveis e podem carregar inconsistências. O ideal é usar um Value Object `Timestamp` ou similar.
- **`[PRIMITIVE OBSESSION]`** **Linha 10**: O parâmetro `id` é do tipo `string`. Embora seja validado internamente, a assinatura do método não deixa explícito que se espera um `ICDCode`.

#### Plano de Ação

1.  **Remova a chamada a `new Date()`**:
    -   **Onde**: Linha 13, na chamada `err(DE.DateInFuture(date, now))`.
    -   **O que fazer**: Modifique a assinatura do método `create` para receber a data atual como um parâmetro. A responsabilidade de obter o "agora" deve ser da camada de aplicação (Use Case).

    **Alteração sugerida:**

    ```typescript
    // De:
    static create(id:string,date:Date, description:string): Result<Diagnosis,DomainError>  {
        // ...
        const now = new Date();
        if (date.getTime() > now.getTime()) return err(DE.DateInFuture(date, now));
        // ...
    }

    // Para:
    static create(id:string, date:Date, description:string, now: Date): Result<Diagnosis,DomainError>  {
        // ...
        if (date.getTime() > now.getTime()) return err(DE.DateInFuture(date, now));
        // ...
    }
    ```

2.  **Refatore para usar Value Objects na assinatura**:
    -   **Onde**: Linha 10, na assinatura do método `create`.
    -   **O que fazer**: Altere os tipos dos parâmetros para usarem os Value Objects correspondentes. Isso torna as invariantes do domínio mais explícitas.

    **Alteração sugerida:**

    ```typescript
    import { ICDCode } from "./icdCode.valueObject"; // Supondo a exportação do tipo
    import { Timestamp } from "./Timestamp.valueObject"; // VO a ser criado

    // De:
    static create(id:string,date:Date, description:string): Result<Diagnosis,DomainError>

    // Para:
    static create(id: ICDCode, date: Timestamp, description: string, now: Timestamp): Result<Diagnosis, DomainError>
    ```
    *Observação: Isso exigirá a criação de um VO `Timestamp` e a adaptação no `ICDCodeClass` para exportar o tipo `ICDCode`.*

### 2. `packages/social/social-care/err/Diagnosis.error.ts`

#### Smells Detectados

- **`[IMPUREZA]`** **Linha 21**: A função `template` dentro do catálogo de erros também usa `new Date(...)` para formatar a data na mensagem de erro. A formatação e a criação de datas são efeitos colaterais que devem ser evitados no domínio. A mensagem de erro deve receber a string já formatada.

#### Plano de Ação

1.  **Remova `new Date()` da mensagem de erro**:
    -   **Onde**: Linha 21.
    -   **O que fazer**: Simplifique o template para receber as datas já como strings no formato ISO. A camada de aplicação ou infraestrutura será responsável por essa formatação antes de passar os dados para o erro.

    **Alteração sugerida:**

    ```typescript
    // De:
    template: ({ date, now }) =>
      `Data do diagnóstico (${new Date(date as any).toISOString()}) não pode estar no futuro (agora: ${new Date(now as any).toISOString()}).`,

    // Para:
    template: ({ date, now }) =>
      `Data do diagnóstico (${date}) não pode estar no futuro (agora: ${now}).`,
    ```
    *Observação: A chamada ao `DE.DateInFuture` no `Diagnosis.valueObject.ts` precisará ser ajustada para passar as datas como strings ISO: `date.toISOString()`.*

### 3. `packages/social/social-care/value-objects/socialBenefits.valueObjects.ts`

#### Smells Detectados

- **`[PRIMITIVE OBSESSION]`** **Linha 9**: O `beneficiaryId` é uma `string`. Pelo padrão da regex `RE_V7`, parece ser um UUID v7. Usar `string` em vez de um VO `Uuid` oculta a intenção e a validação.

#### Plano de Ação

1.  **Introduza um Value Object `UUID`**:
    -   **Onde**: Linha 9, na assinatura do método `create`.
    -   **O que fazer**: Crie um Value Object `Uuid` (ou use um existente da biblioteca `uuid-pattern` do projeto) que encapsule a validação do formato do UUID. Altere a assinatura do método `create` para receber `beneficiaryId: Uuid`.

    **Alteração sugerida:**

    ```typescript
    import { Uuid } from "@conecta/uuid/uuid"; // Exemplo de import

    // De:
    static create(benefitName: string, amount: number, beneficiaryId:string): Result<SocialBenefit, DomainError> {
        // ...
        if (RE_V7.test(beneficiaryId) === false) return err(BE.BeneficiaryIdInvalid({ beneficiaryId }));
        return ok(Object.freeze(new SocialBenefit(benefitName, amount, beneficiaryId)));
    }

    // Para:
    static create(benefitName: string, amount: number, beneficiaryId: Uuid): Result<SocialBenefit, DomainError> {
        if(!benefitName || benefitName.trim().length === 0) return err(BE.BenefitNameEmpty());
        if(amount <= 0) return err(BE.AmountInvalid({ amount }));
        // A validação do UUID já foi feita na criação do VO.
        return ok(Object.freeze(new SocialBenefit(benefitName, amount, beneficiaryId.toString())));
    }
    ```

## Resumo do Checklist de Pureza

-   **[FALHOU]** Nenhum uso de `new Date()`: Encontrado em `Diagnosis.valueObject.ts` e `Diagnosis.error.ts`.
-   **[FALHOU]** Primitives over VO: Encontrado `string` para ID em `socialBenefits.valueObjects.ts` e `Date` em `Diagnosis.valueObject.ts`.
-   **[OK]** Nenhum `import` de libs externas no domínio.
-   **[OK]** Nenhum `throw` em regras de negócio.
-   **[OK]** Entidades/VOs imutáveis.
