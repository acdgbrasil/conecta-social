---
title: "DDD Boundaries — Social Care"
scope: "file"
path: ["packages/social/social-care/**/*.ts"]
severity_min: "critical"
languages: ["jsts"]
buckets: ["architecture", "domain-driven-design"]
enabled: true
uuid: "c1c2baf0-7f3a-4688-9b3e-9e018ff4a4a1"
---

## Instructions
Verify que arquivos dentro de `packages/social/social-care` respeitam os limites de domínio descritos no handbook.
- Imports devem usar os aliases públicos (`@conecta/social-care`, `@conecta/result`, `@conecta/fn` etc.). Rejeite `../` que atravesse contextos ou paths profundos.
- Entidades/VOs não podem importar camadas de infra, adapters ou código externo ao contexto (ex.: `src/`, `packages/infra`, libs HTTP).
- Garantir imutabilidade: use `copyWith`, `Result`, `ImutableListFactory` em vez de mutar arrays/objetos diretamente.
- Se um arquivo expõe nova API pública, confirme atualização correspondente no `handbook/principles/` ou `handbook/process/retrocompatibilidade.md`.

## Examples

### Bad example
```typescript
import axios from "axios"; // externa no domínio
import { sendEmail } from "../../../infra/email"; // quebra boundary

export class PatientService {
  async notify(patient: Patient) {
    sendEmail(patient.email, await axios.get("..."));
  }
}
```

### Good example
```typescript
import { Result } from "@conecta/result";
import { Patient } from "@conecta/social-care";

export function assignCaregiver(patient: Patient, caregiverId: Uuid) {
  return patient.assignPrimaryCaregiver(caregiverId);
}
```
