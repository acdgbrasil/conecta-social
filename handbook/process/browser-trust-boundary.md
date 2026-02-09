# Decisão Arquitetural — Fronteira de Confiança Browser x Servidor

## Contexto
No domínio Social Care teremos interface web com leituras e formulários. Foi avaliado se o frontend poderia consumir diretamente a camada `application` sem fronteira HTTP.

## Decisão
1. O browser é um ambiente **não confiável**.
2. Toda regra autoritativa (autorização, validação final, persistência e auditoria) fica no servidor.
3. O browser se comunica por HTTP com o BFF/API.
4. Dentro do servidor, o BFF pode chamar os use-cases diretamente (sem HTTP interno entre camadas).

## Implicações
- A camada de UI (browser) não executa decisões finais de negócio.
- Regras críticas continuam centralizadas e auditáveis no backend.
- Mantemos separação explícita de boundary: cliente não confiável vs servidor confiável.

## Diretriz de implementação
- Formulários no frontend podem ter validação de UX, mas a validação definitiva ocorre no servidor.
- Endpoints REST recebem comandos, validam entrada e delegam para os use-cases de `application`.
- Persistência e emissão de eventos permanecem no backend.
