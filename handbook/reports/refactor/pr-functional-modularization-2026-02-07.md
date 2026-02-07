# PR Description: Migração Funcional Completa e Modularização do Domínio Social Care

## 🚀 Resumo
Este Pull Request representa a maior evolução arquitetural do módulo `Social Care` desde sua concepção. Migramos de um modelo híbrido para um **Paradigma Funcional Estrito** em TypeScript, garantindo pureza de domínio, imutabilidade zero-overhead e uma estrutura modular altamente escalável.

## 🔑 Mudanças Principais

### 🧩 Modularização do Agregado Patient
- **Extinção do God File**: O arquivo `Patient.entity.ts` foi decomposto em módulos especializados:
  - `core.ts`: Fábricas e ciclo de vida do agregado.
  - `family.ts`: Gestão de membros da família e cuidadores.
  - `activities.ts`: Encaminhamentos, Atendimentos e Violações.
  - `assessments.ts`: Avaliações socioeconômicas e habitacionais.
  - `types.ts`: Definições estritas de estado (`PatientProps`).
- **Namespace Unificado**: O acesso continua via `Patient.*`, mantendo a DX intacta enquanto o código físico é organizado.

### ⚡ Paradigma Funcional (FP)
- **Namespace Pattern**: Todas as Entidades e Value Objects agora utilizam o padrão `Type + Const Namespace`.
- **Imutabilidade**: Uso obrigatório de `DeepReadonly<T>` e `Branded<T, B>` para todos os identificadores.
- **Funções Puras**: Comportamentos do agregado não possuem mais efeitos colaterais; eles retornam novas instâncias via `copyWith`.

### 📢 Otimização de Eventos e Erros
- **Event Factory**: Criada a fábrica `makeEvent` para centralizar a criação de `DomainEvent`, eliminando centenas de linhas de boilerplate de UUID.
- **Shortcuts de Erro**: Refatoração completa dos catálogos de erro para usar `shortcuts` posicionais, alinhando com a nova especificação da biblioteca `@conecta/domain-error`.

### 🧹 Limpeza e Consolidação
- **Extinção de Services**: Lógicas de "serviços de domínio" que operavam sobre o Agregado foram movidas para dentro dele, protegendo as invariantes na raiz.
- **Value Objects**: Consolidação das propriedades (`props`) dentro dos arquivos de VO, eliminando a sobre-fragmentação de pastas.
- **Repositórios**: Simplificação do `PatientRepositoryPort` para focar apenas na persistência atômica do Agregado.

## ✅ Verificação
- [x] **Testes**: 78 passados (Suite de domínio validada).
- [x] **Arquitetura**: Zero classes no domínio; 100% funções puras.
- [x] **Mappers**: Adaptadores de persistência atualizados para o novo contrato modular.

---
*Gerado via Gemini CLI Agent - Refatoração de Elite*
