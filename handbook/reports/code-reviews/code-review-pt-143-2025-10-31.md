# Code Review — PT-143 (31/10/2025)

## Visão geral
- PR analisa ajustes no agregado `Patient` e VOs associados ao contexto Social Care.
- Revisão focada em invariantes de domínio, imutabilidade e configuração de toolchain (Bun + Kody).
- 14 achados de severidade alta/critical que bloqueiam merge até correção.

## Achados principais
- **[CR-01][bug][high]** `FamilyMemberId.copyWith` lança `TypeError` com `null/undefined`, quebrando o contrato de `Result`.
- **[CR-02][bug][critical]** `SocialBenefit.copyWith` chama `.unwrap()` sobre `Result.err`, causando crash em produção.
- **[CR-03][bug][critical]** `SocialBenefitsCollection.create` explode com `TypeError` quando `benefits` é `null/undefined`.
- **[CR-04][bug][high]** `CommunitySupportNetwork.create` aceita `familyConflicts` só com espaços, violando a integridade do VO.
- **[CR-05][bug][high]** Constante `ELETRICITY_ACCESS` usa valores de água; dados inconsistentes em toda a UI/relatórios.
- **[CR-06][bug][critical]** `Timestamp` não faz cópia defensiva de `Date`, destruindo imutabilidade do VO.
- **[CR-07][bug][high]** Teste de `personId` duplicado verifica erro errado (`FamilyMemberAlreadyExists`).
- **[CR-08][bug][medium]** Mesma suite fixa códigos (`"PAT-003"`, `"PAT-004"`) em vez de usar fábricas `P.*`, fragilizando testes.
- **[CR-09][bug][medium]** Bloco comentado do “Bug 5” referencia `BE` sem import; ao descomentar o teste falha com `ReferenceError`.
- **[CR-10][process][high]** Regras “Never introduce node_modules” e “bloqueie diffs que gerem node_modules” contradizem uso do Bun.
- **[CR-11][process][medium]** Regras do Copilot duplicam conteúdo dos arquivos `.kody/rules/*.md`, risco de divergência.
- **[CR-12][tooling][critical]** Workflow de review roda `bunx` sem instalar o Bun (`ubuntu-latest` não traz o runtime).
- **[CR-13][tooling][critical]** Config do Kody filtra `high/critical`, mas `severityLimits` define zero sugestões → silencia a ferramenta.
- **[CR-14][process][high]** Guia define versão `MAJOR.MINOR.FEATURE.PATCH`; SemVer (x.y.z) é o padrão exigido pelo ecossistema Bun/Node.

## Detalhes dos achados

### CR-01 — `FamilyMemberId.copyWith` quebra contrato de `Result`
- **Arquivo**: `packages/social/social-care/value-objects/FamilyMemberId.valueObject.ts:35`
- **Problema**: `props` é obrigatório e o método acessa `props.value` diretamente; `copyWith(null)` ou `copyWith(undefined)` lança `TypeError` em vez de retornar `Result.err`.
- **Impacto**: Invocações defensivas (`copyWith(undefined)`) usadas por refatorações de VO derrubam a aplicação.
- **Correção sugerida**:
  ```ts
  public copyWith(props?: Partial<{ value: string }>): Result<FamilyMemberId, DomainError> {
    const valueToCreate = props?.value ?? this.value;
    return FamilyMemberId.create(valueToCreate);
  }
  ```

### CR-02 — `SocialBenefit.copyWith` propaga `unwrap()` sobre erro
- **Arquivo**: `packages/social/social-care/value-objects/SocialBenefit.valueObject.ts:16`
- **Problema**: `FamilyMemberId.create(this.beneficiaryId)` pode retornar `Result.err`; o código chama `.unwrap()` mesmo quando é erro, lançando exceção não tratada.
- **Impacto**: `Patient.copyWith` ou atualizações de benefícios explodem caso o ID interno esteja inválido.
- **Correção sugerida**:
  ```ts
  const beneficiaryIdResult = FamilyMemberId.create(this.beneficiaryId);
  if (beneficiaryIdResult.isErr()) {
    return err(BE.BeneficiaryIdInvalid({ beneficiaryId: this.beneficiaryId }));
  }
  return SocialBenefit.create({
    benefitName: props.benefitName ?? this.benefitName,
    amount: props.amount ?? this.amount,
    beneficiaryId: beneficiaryIdResult.unwrap(),
  });
  ```

### CR-03 — `SocialBenefitsCollection.create(null)` lança `TypeError`
- **Arquivo**: `packages/social/social-care/value-objects/SocialBenefitsCollection.valueObject.ts:23`
- **Problema**: Usa `[...benefits]` sem validar entrada; se `benefits` é `null/undefined`, o operador spread falha.
- **Impacto**: Regressões ao reconstruir `SocioEconomicSituation` quando `receivesSocialBenefit=false`.
- **Correção**:
  ```ts
  if (!Array.isArray(benefits)) {
    return err(new DomainError({ message: "A lista de benefícios não pode ser nula ou indefinida.", context: { input: benefits } }));
  }
  return ok(new SocialBenefitsCollection([...benefits]));
  ```

### CR-04 — `CommunitySupportNetwork.create` aceita `familyConflicts` inválido
- **Arquivo**: `packages/social/social-care/value-objects/communitySupportNetwort.valueObject.ts:26`
- **Problema**: Valor `"   "` passa sem limpeza; VO deveria rejeitar whitespace-only e normalizar string.
- **Impacto**: Persistimos dados inconsistentes, quebrando invariantes documentadas em `handbook/principles/patient-aggregate.md`.
- **Correção**: aplicar `trim()` com verificação de comprimento, retornando `Result.err` via `CSN.FamilyConflictsWhitespace()`. Exemplo conforme snippet compartilhado no review.

### CR-05 — Constante `ELETRICITY_ACCESS` traz opções de água
- **Arquivo**: `packages/social/social-care/value-objects/props/housingCondition.props.ts:3`
- **Problema**: Valores `WELL_SPRING`, `RAINWATER_HARVESTING`, `WATER_TRUCK` pertencem a acesso à água, não energia elétrica.
- **Impacto**: UI exibirá opções absurdas; relatórios de eletricidade ficam inválidos.
- **Correção**:
  ```ts
  export const ELETRICITY_ACCESS = {
    METERED_CONNECTION: "METERED_CONNECTION",
    IRREGULAR_CONNECTION: "IRREGULAR_CONNECTION",
    NO_CONNECTION: "NO_CONNECTION",
  } as const;
  ```

### CR-06 — `Timestamp` não faz cópias defensivas de `Date`
- **Arquivo**: `packages/social/social-care/value-objects/timestamp.valueObject.ts:5`
- **Problemas**:
  - Construtor armazena referência direta do `Date` recebido.
  - `Timestamp.create` retorna `new Timestamp(dateValue.toISOString())`, misturando tipos (`Date` vs `string`).
  - Métodos `getFullYear`/`toISOString` dependem de `copyWith` por não manter `Date` internamente.
- **Impacto**: Estado interno corrompido se o `Date` original for modificado; VO deixa de ser imutável e quebra testes de regressão.
- **Correção**:
  ```ts
  readonly value: Date;

  private constructor(value: Date) {
    this.value = new Date(value.getTime());
    Object.freeze(this);
  }

  static create(props: TimestampProps): Result<Timestamp, DomainError> {
    if (!(props.value instanceof Date) || Number.isNaN(props.value.getTime())) {
      return err(TE.InvalidDate({ value: props.value }));
    }
    return ok(new Timestamp(props.value));
  }
  ```
  Ajustar getters para acessar `this.value` diretamente, sem `copyWith`.

### CR-07 — Teste de `personId` duplicado verifica erro incorreto
- **Arquivo**: `packages/social/social-care/tests/unit/entities/patient.aggregate.spec.ts:142`
- **Problema**: Cenário descreve duplicação de `personId`, mas a asserção espera `P.FamilyMemberAlreadyExists`. Correto é algo como `P.PersonIdAlreadyExistsInFamily`.
- **Impacto**: Teste não falha se implementação retornar erro errado; regra P-004 fica sem cobertura real.
- **Ação**: Ajustar expectativa para `P.PersonIdAlreadyExistsInFamily({ personId: personId.toString() }).code` (confirmar fábrica existente).

### CR-08 — Literais de código de erro em `Patient.entity.test.ts`
- **Arquivo**: `packages/social/social-care/tests/unit/entities/patient.aggregate.spec.ts:351`
- **Problema**: Usa `"PAT-003"` / `"PAT-004"` inline; restante da suíte usa fábricas `P.*`. Inconsistência gera fragilidade quando códigos mudarem.
- **Correção**:
  ```ts
  expect(result.unwrapErr().code).toBe(P.referralTargetNotInAggregate({ id: strangerId.toString() }).code);
  expect(result.unwrapErr().code).toBe(P.violationReportTargetNotInAggregate({ id: strangerId.toString() }).code);
  ```

### CR-09 — Bloco comentado do “Bug 5” falha ao ser habilitado
- **Arquivo**: `packages/social/social-care/tests/unit/entities/patient.aggregate.spec.ts` (bloco comentado após a simulação do Bug 5)
- **Problema**: Teste orientativo chama `BE.BeneficiaryIdInvalid` sem importar `BE`, causando `ReferenceError` quando descomentado.
- **Correção**: Adicionar `import { BE } from "@conecta/social-care";` (ou caminho equivalente) ao topo do arquivo e ajustar o valor inválido para `"invalid-uuid-string"` conforme cenário.

### CR-10 — Regra “Nunca introduza node_modules” inviabiliza uso do Bun
- **Arquivo**: `.github/copilot-instructions.md:11`
- **Problema**: Bun gera `node_modules` por padrão; regra proíbe instalá-lo, inviabilizando inclusão/atualização de dependências.
- **Sugestão**: Reescrever para “Não versionar `node_modules`” e apontar para `.gitignore`.

### CR-11 — Duplicação de regras entre Copilot e `.kody/rules`
- **Arquivos**: `.github/copilot-instructions.md:7-20` vs `.kody/rules/*.md`
- **Problema**: Mesmas diretrizes escritas em dois lugares; risco de divergência futura.
- **Sugestão**: Transformar seção “Golden rules” do Copilot em referência direta ao handbook/Kody (“consulte `.kody/rules/…`”), evitando duplicação literal.

### CR-12 — Workflow usa `bunx` sem instalar Bun
- **Arquivo**: `.github/workflows/kodus-review.yml:25`
- **Problema**: `ubuntu-latest` não inclui Bun; passo `bunx kodus-cli ...` falha com `command not found`.
- **Correção**: Incluir etapa anterior `uses: oven-sh/setup-bun@v1` configurando a versão antes de executar `bunx`.

### CR-13 — Configuração do Kody silencia sugestões de severidade alta
- **Arquivo**: `.kody/kodus-config.yml:33`
- **Problema**: `severityLevelFilter: high` permite apenas high/critical, porém `severityLimits.high` e `.critical` estão setadas para `0`. Resultado: nenhuma sugestão é exibida.
- **Correção**: Ajustar limites (ex.: `high: 9`, `critical: 9`) ou reduzir o filtro para incluir níveis permitidos.

### CR-14 — Guia de versionamento adota formato incompatível com SemVer
- **Arquivo**: `handbook/process/versioning.md:13`
- **Problema**: Exige `MAJOR.MINOR.FEATURE.PATCH` (ex.: `2.0.3.0`). Ferramentas `bun version`, `npm version` e resoluções `^2.0.3` não aceitam quatro dígitos.
- **Impacto**: Pipelines e gerenciamento de dependência falham, bloqueando releases.
- **Correção**: Alinhar para SemVer (`MAJOR.MINOR.PATCH`) e atualizar exemplos/processos correlatos.

## Follow-ups
- Corrigir os pontos acima antes do merge e reexecutar suites (`bun test`) para garantir cobertura de regressão.
- Atualizar handbook/processo após ajustes (ex.: revisão do guia de versionamento) para refletir nova fonte de verdade.
- Após corrigir workflow e Kody, validar execução em branch de teste garantindo que sugestões apareçam e `bunx` rode no CI.
