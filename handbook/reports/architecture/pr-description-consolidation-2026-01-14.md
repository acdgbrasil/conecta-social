# PR Description: Projeto Estabilizado e Alinhamento Poliglota

## 🚀 Resumo
Este Pull Request consolida os esforços de estabilização do monorepo, corrigindo achados críticos de auditoria, configurando a infraestrutura de contratos Protobuf e harmonizando o Shared Kernel entre TypeScript e Swift.

## 🔑 Mudanças Principais

### 🛡️ Segurança e Integridade (Audit Fixes)
- **Correção Crítica**: Adicionado `await` na publicação de eventos no `RegisterNewPatientUseCase`, eliminando o risco de perda de eventos.
- **Persistência**: Refatoração do `PatientSQLiteRepository` para suportar injeção de dependência e inicialização de tabelas em memória, garantindo estabilidade nos testes.
- **Configuração**: Remoção do `bun.lock` do `.gitignore` e correção de sintaxe JSON no `launch.json`.

### 🏗️ Arquitetura e Infraestrutura
- **Protobuf**: Configuração do `buf.gen.yaml` e geração automatizada de tipos para TS e Swift.
- **Cross-Lang Alignment**: Implementação do `DomainErrorFactory` em Swift (`packages/acdg`), garantindo que erros de domínio (IDs, Timezones e códigos) sejam idênticos nos dois contextos.

### 🧹 Qualidade e Documentação
- **Lint/Format**: Aplicação em massa do Biome (`--write`) em todo o projeto TS.
- **Handbook**: Migração da documentação técnica do ACDG e atualização do Catálogo de Integrações.
- **Status**: Criação do relatório de status pós-auditoria e plano de finalização para a camada de aplicação do Social Care.

## ✅ Verificação
- [x] **Testes**: 222 passados (100% Green).
- [x] **Lint**: Executado e validado via Biome.
- [x] **Documentação**: Handbook atualizado e links verificados.

---
*Gerado via Gemini CLI Agent*
