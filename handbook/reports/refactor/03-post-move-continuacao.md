# Pós-movimentação — continuação

## Commits analisados
- `2e931d1` · `[1.5]` criação dos value objects de CID e estrutura inicial de erros de domínio.
- `64bc6c2` · `[emergencia]` primeira consolidação das bibliotecas compartilhadas e limpeza do esqueleto `your-service`.
- `fa5d110` · `[1.5]` ajustes finos nos value objects recém-criados (`HousingCondition`, `ICDCode`, `SocialHealthSummary`).

## Diferenças principais em relação ao registro 02
- **Biblioteca de erros compartilhados**: novo pacote `packages/shared/erros-pattern` com contratos (`DomainError`), fábrica (`DomainError.factory.ts`), composição (`DomainError.composition.ts`) e atalhos para telemetria/HTTP. Exportado como `@conecta/domain-error`.
- **Padrões funcionais e utilitários**: reestruturação do `fn-pattern` (pipe, listas imutáveis) e criação dos pacotes `@conecta/result`, `@conecta/option` e `@conecta/uuid`, todos com `package.json` próprio e exports preparados para uso cross-package.
- **Social care domain**:
  - `Diagnosis` agora depende de `ICDCode.createFromString` e emite erros com o catálogo `Diagnosis.error.ts`.
  - Value objects novos: `icdCode`, `housingCondition`, `socialHealthSummary`, todos retornando `Result<*, DomainError>`.
  - Catálogos de erro específicos (`ICDCode.error.ts`, `SocialHealthSummary.error.ts`) utilizando a fábrica compartilhada.
- **Workspace**: o esqueleto `packages/your-service` foi removido (código, lint, tsconfig), deixando apenas os pacotes efetivamente usados.
- **Dependências**: `bun.lock` e o root `package.json` foram atualizados para refletir os novos workspaces e remoções.
- **Automação**: adicionado `.github/copilot-instructions.md` com orientações para ferramentas assistivas.

## Observações e pontos de atenção
- As funções `ok/err` do novo `Result` dependem de `DomainErrorFactory`; validar se o pacote está publicado/built antes de consumo externo.
- `Diagnosis.create` e `HousingCondition.create` já retornam `Result`, mas ainda retornam `ok/err` diretamente sem short-circuit (`return err(...)`), revisar fluxo antes de usar em produção.
- `HousingCondition` usa enums internos com valores hardcoded e devolve instância congelada com valores default `0/false`; complementar com validações de entrada quando houver integração.
- `SocialHealthSummary.create` espera `ImutableList` do pacote `fn-pattern`; é necessário garantir que os chamadores convertam arrays para esse tipo.
- Os novos pacotes `@conecta/*` ainda não possuem build/tsconfig isolado; avaliar necessidade de scripts (`build`, `lint`) dedicados e ajuste no pipeline quando `bun install` puder ser executado fora do sandbox.

