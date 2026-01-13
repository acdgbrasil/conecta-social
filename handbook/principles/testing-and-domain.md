# Princípios: DDD + EDD com TDD/BDD

## 1. DDD + Event-Driven Design (EDD) no domínio
- **Aggregates como boundary**: cada agregado (`Patient`, `Referral`, etc.) continua sendo porta de entrada única para mutações. Eventos de domínio emergem desses métodos (`PatientCreated`, `ReferralAdded`), mesmo que hoje estejam apenas conceituais.
- **Eventos como contrato**: ao implementar novas features, definir eventos de domínio e mantê-los retrocompatíveis. Se um evento precisar mudar estrutura, publicar nova versão (`ReferralUpdatedV2`) e manter a anterior durante a janela de convivência.
- **Contextos isolados**: novos módulos devem seguir `packages/<context>/<subcontext>` e nunca importar internamente de outro contexto sem passar pelos barrels públicos (`index.ts`).

## 2. TDD como motor
1. Escrever o teste que capture o comportamento desejado (falhando primeiro).
2. Implementar o mínimo código para passar.
3. Refatorar garantindo legibilidade/padronização.
4. Registrar no handbook (reports ou quality) decisões/ajustes relevantes.

## 3. BDD como documentação viva
- Usar descrições de teste orientadas a comportamento (`describe("Paciente :: registrar encaminhamento", ...)`).
- Para fluxos críticos, considerar Gherkin leve nos comentários ou helpers (`given/when/then`) dentro da suite.
- Toda correção de bug gera um teste de regressão explícito em `tests/regression`.

## 4. Layout e execução (Bun)
- Estrutura atual: `packages/shared/tests/{unit,regression}` para o shared kernel e `packages/conecta-raros/social-care/domain/tests/{unit,regression}` para o core domain.
- Cada pasta segue o padrão `*.spec.ts` nomeado pelo comportamento; regressões permanecem em `tests/regression` até que o bug seja resolvido.
- Use `bun test packages/shared/tests` ou `bun test packages/conecta-raros/social-care/domain/tests` para rodadas completas; `--filter "<pacote|arquivo>"` agiliza ciclos menores.
- Mantenha o `README.md` de cada pasta de testes como fonte rápida de comandos e convenções.

## 5. Testes = Documentação
- Nomes de testes devem explicar regra de negócio (“deve rejeitar encaminhamento para membro desconhecido”).
- Evitar mocks excessivos no domínio puro; preferir objetos reais ou builders declarativos.
- Quando um teste representar uma decisão arquitetural (ex.: manter timestamp imutável), adicionar nota curta em `reports/refactor` ou `quality/`.

## 6. Checklist para novas features
- [ ] Teste vermelho escrito (TDD).
- [ ] Eventos de domínio mapeados com nota de retrocompatibilidade.
- [ ] Implementação passando nos testes.
- [ ] Atualização da matriz de retrocompatibilidade se aplicável.
- [ ] Registro no relatório de refatoração ou diário.
