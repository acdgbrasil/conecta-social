# Problemas para resolver na camada de Mapper (Ports & Adapters)

## Resolvidos (2026-02-06)
1. Domain dependia de DTO de Application (violacao de dependencias)
   - A pasta `src/modules/social-care/domain/inputs` foi removida.
   - Os contratos de entrada passaram para Commands em `src/modules/social-care/application/ports/commands/**`.
2. Use case recebia DTO "de transporte"
   - Commands de housing/socio agora recebem Value Objects de domínio.
   - O mapping DTO -> domínio foi deslocado para a camada de interface (adapter inbound).
3. Mappers estavam em Application, mas faziam papel de Adapter
   - `social-assessment.mapper.ts` foi movido para `src/modules/social-care/interface/adapter/mappers`.
4. DTOs de interface desacoplados dos enums internos do domínio
   - `interface/dto/social-assessment.dto.ts` usa enums de transporte próprios.
   - Conversão para enums do domínio ocorre no mapper inbound.

## Pendentes / Parciais
1. Mapper de persistencia esta "embutido" no repositorio
   - `src/modules/social-care/interface/repositories/postgres-patient.repository.ts` reconstrói o dominio inline.
   - Isso mistura persistencia + mapping + regra de dominio e fica dificil de reutilizar.

2. Erros de mapping na persistencia sao silenciosos
   - No repository, varias criacoes falham e o item e simplesmente ignorado.
   - Isso mascara corrupcao de dados e da estado inconsistente sem erro claro.

3. Falta de mapper de saida (Response Mapper)
   - Use cases retornam `Result<boolean, DomainError>`.
   - Nao ha camada que traduza `DomainError` para HTTP/gRPC.
