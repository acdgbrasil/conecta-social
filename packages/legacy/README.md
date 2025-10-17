# Legado
Este diretório contém **o código que funciona hoje** e permanece estável.
- O lint **não** roda aqui.
- Use o alias `@legacy/*` apenas em camadas de migração quando inevitável.
- Novos módulos/serviços ficam fora de `legacy/` seguindo DDD (domain/application/infra/presenter + bin).
