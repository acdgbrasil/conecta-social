# [TASK-025] Desacoplar DTOs da Interface dos Enums de Domínio

**Status:** ✅ Done
**Prioridade:** 🟡 Média
**Labels:** `arch`, `interface`, `dto`
**Origem:** `handbook/architecture/mapper-problems.md`

## Descrição
Os DTOs de entrada em `interface/dto` importam enums internos do domínio. Isso vaza o modelo interno para o contrato externo. Precisamos definir enums/strings próprios na interface e mapear para o domínio no adapter inbound.

## Tarefas
- [x] Criar enums/constantes de transporte na camada `interface` (ex.: `interface/dto/enums/*`).
- [x] Atualizar `interface/dto/social-assessment.dto.ts` para usar os enums do adapter (não do domínio).
- [x] Atualizar mappers/adapters para converter os valores de transporte para os enums do domínio.
- [x] Ajustar schemas Zod para validar os novos enums de transporte.
- [x] Atualizar testes unitários relacionados.

## Critérios de Aceite
- [x] Nenhum DTO de interface importa enums/props do domínio.
- [x] Conversão de enums é feita somente na camada de adapter/mappers.
