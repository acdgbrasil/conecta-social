# Plano para deixar a suíte verde

## 1. Estado atual dos testes
- Comando executado: `bun test`
- Panorama: 77 testes totais, 69 passaram e 8 falharam.
- Grupos afetados:
  - `SocialHealthSummary.valueObject` (2 falhas de criação).
  - `Patient.entity` — seções 4 a 6 (5 falhas ligadas às operações do agregado).
  - Suite de regressão `regration.entity.test` (1 falha garantindo cópia defensiva em `Timestamp`).

> Referência rápida: o relatório detalhado está em `bun-test.xml`, gerado no diretório raiz após a execução.

## 2. Diagnóstico das falhas

### 2.1 SocialHealthSummary (2 falhas)
- **Sintoma**: os testes `deve criar com sucesso...` e `deve criar resumo com dependências únicas...` disparam `TypeError: props.functionalDependencies.getUnique is not a function`.
- **Causa provável**: a fábrica `ImutableListFactory` expõe `setUnique()` (`packages/shared/fn-pattern/imutable-list.ts:6`), mas a classe (`packages/social/social-care/value-objects/socialHealthSummary.valueObject.ts:30`) tenta usar um método inexistente (`getUnique`). Com isso, qualquer chamada ao `create` quebra antes mesmo de validar os dados.
- **Ações sugeridas**:
  1. Trocar a deduplicação para `props.functionalDependencies.setUnique().getAll()`, garantindo que o resultado continue um array congelado.
  2. Ajustar `copyWith` para reutilizar a mesma lógica de normalização.
  3. Reexecutar apenas essa suíte (`bun test packages/social/social-care/tests/unit/value-objects/socialHealthSummary.valueObject.spec.ts`) antes da rodada completa.

### 2.2 Patient Aggregate (5 falhas)
- **Sintoma**: os testes da seção "4. Proteção da Fronteira do Agregado" e seguintes falham porque os métodos esperados (`createReferral`, `reportRightsViolation`, `updateHousingCondition`, `registerAppointment`) não existem ou ainda retornam resultados errados no agregado (`packages/social/social-care/entities/Patient.entity.ts`, fim do arquivo).
- **Efeito**: invariantes essenciais não estão sendo aplicadas (restringir encaminhamentos/violações ao agregado, manter imutabilidade ao atualizar VOs e lista de atendimentos).
- **Ações sugeridas**:
  1. Implementar `createReferral` garantindo:
     - Validação do membro referenciado (`Uuid` presente no paciente ou na família).
     - Retorno `Result.ok` com nova instância (`ImutableList.add`) quando válido.
     - Retorno `Result.err(P.FamilyMemberNotFound(...))` quando inválido, respeitando códigos `PAT-003`/`PAT-004` esperados pelo teste.
  2. Implementar `reportRightsViolation` com a mesma lógica de verificação de fronteira.
  3. Para `updateHousingCondition`, receber um `HousingCondition` e produzir novo agregado (`copyWith`) sem mutar o atual.
  4. Para `registerAppointment`, aplicar o padrão append-only:
     - Converter a lista atual com `ImutableListFactory.castTolist`.
     - `add` o novo `SocialCareAppointment`.
     - Retornar instância fresca, preservando a ordem (os testes validam `getAll()[0]`/`[1]`).
  5. Revisar `../reports/refactor/07-patient-aggregate-and-regression.md` para alinhar-se às regras descritas no registro de refatoração.

### 2.3 Timestamp Regression (1 falha)
- **Sintoma**: o teste `[CR-1]` confirma que `Timestamp.create` (`packages/social/social-care/value-objects/timestamp.valueObject.ts:10`) mantém a referência do `Date` original, permitindo mutações externas.
- **Ação**:
  1. Criar uma cópia defensiva com `new Date(props.value.getTime())` no `create` (e no `copyWith`).
  2. Garantir que `toDate()` continue devolvendo uma cópia (`new Date(...)`) para consistência.
  3. Reexecutar a suíte `bun test packages/social/social-care/tests/regression/patient.aggregate.regression.spec.ts` (ou equivalente dedicado ao Timestamp) antes da rodada completa.

## 3. Roteiro sugerido (do menor para o maior impacto)
1. **Corrigir `Timestamp`** e validar rapidamente o teste `[CR-1]`. Impacto isolado e fácil de verificar.
2. **Normalizar `SocialHealthSummary`** trocando `getUnique` por `setUnique`. Isso destrava dois testes e evita TypeError em produção.
3. **Desenhar os contratos faltantes no agregado `Patient`**:
   - Mapear dependências (por exemplo, `Referral.create`, `RightsViolationReport.create`) para saber o payload exato.
   - Implementar métodos faltantes, sempre retornando novos objetos (`copyWith`) e usando o catálogo de erros `P.*`.
   - Adicionar testes de unidade adicionais se necessário (ex.: tentar registrar atendimento duplicado).
4. **Rodar `bun test` completo** para confirmar que não surgiram regressões.
5. **Registrar aprendizados**: se possível, anotar em `../reports/refactor` as decisões tomadas, mantendo a documentação viva alinhada.

## 4. Checklist de validação antes do commit
- [ ] `bun test` sem falhas.
- [ ] Verificar se arquivos temporários (`bun-test.xml`, `coverage/*`) não são commitados sem necessidade.
- [ ] Atualizar documentação/códigos relacionados se novas regras de domínio forem introduzidas.
- [ ] Executar linters (`bun run lint` ou equivalente) caso façam parte do pipeline.

## 5. Observações finais
- O relatório `bun-test.xml` pode ser importado em qualquer leitor JUnit para detalhar tempos e falhas; mantenha-o durante a correção e remova quando não precisar mais.
- Os testes de regressão `[CR-4]` e `[CR-5 & CR-6]` ainda estão “marcando a presença do bug” (esperando `toThrow`). Após as correções dessas histórias, lembre-se de inverter asserções conforme os comentários no arquivo de teste.
- Reexecutar apenas blocos específicos (`bun test caminho/do/arquivo.test.ts`) agiliza o ciclo de feedback enquanto cada correção é aplicada.
