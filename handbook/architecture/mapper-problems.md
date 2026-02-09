# Problemas para resolver na camada de Mapper (Ports & Adapters)

## Resolvidos (2026-02-06)
1. Domain dependia de DTO de Application (violacao de dependencias)
   - A pasta `src/modules/social-care/domain/inputs` foi removida.
   - Os contratos de entrada passaram para Commands em `src/modules/social-care/application/ports/commands/**`.
2. Use case recebia DTO "de transporte"
   - Commands de housing/socio agora recebem Value Objects de domínio.
   - O mapping DTO -> domínio foi deslocado para a camada de interface (adapter inbound).
3. Mappers estavam em Application, mas faziam papel de Adapter
   - A conversão DTO -> domínio foi consolidada na camada de adapter inbound (`src/modules/social-care/interface/adapter/commands/**`).
4. DTOs de interface desacoplados dos enums internos do domínio
   - `interface/dto/social-assessment.dto.ts` usa enums de transporte próprios.
   - Conversão para enums do domínio ocorre no mapper inbound.

## Pendentes / Parciais
1. Definir adapter principal de persistencia para `PatientRepositoryPort`
   - A porta de repositório está ativa no domínio, mas a implementação concreta principal ainda não está consolidada na árvore atual de `src/modules/social-care/interface/`.

2. Falta de mapper de saida (Response Mapper)
   - Use cases retornam `Result<boolean, DomainError>`.
   - Ainda não há camada consolidada para traduzir `DomainError` para contratos de transporte (HTTP/gRPC).
