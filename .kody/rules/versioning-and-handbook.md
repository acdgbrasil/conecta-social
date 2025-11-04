---
title: "Versionamento e Handbook"
scope: "pull_request"
path: ["**/*"]
severity_min: "high"
buckets: ["process", "release-management"]
enabled: true
uuid: "7d6b05ce-5634-4f8b-98c1-64df29a5b116"
---

## Instructions
Toda mudança de comportamento ou contrato público deve seguir o processo descrito em `handbook/process/versioning.md`.
- Verifique se `package.json` (root e pacotes afetados) recebeu incremento `MAJOR.MINOR.FEATURE.PATCH`.
- Confirme updates relevantes em `handbook/` (principles, process, quality ou reports). PRs sem documentação correspondente devem ser bloqueados.
- Retrocompatibilidade: se recurso foi alterado ou deprecado, deve existir entrada em `handbook/process/retrocompatibilidade.md`.
- Se a mudança for apenas interna/infra, o autor deve justificar ausência de bump/documentação na descrição do PR.

## Examples

### Bad example
```
Alterado comportamento de `Patient.reportRightsViolation` sem atualizar versão ou handbook.
```

### Good example
```
PR inclui incremento para 2.0.3.0 no package.json e adiciona seção em handbook/process/retrocompatibilidade.md descrevendo o novo evento.
```
