# [TASK-001] Expandir PatientRepositoryProtocol com findById

**Status:** [x] Concluído
**Prioridade:** Alta (Bloqueante)
**Labels:** `infrastructure`, `social-care`

## Descrição
O repositório atual de `Patient` (`PatientRepositoryProtocol`) possui apenas métodos para salvar (`save`) e verificar existência (`existsByPersonId`). Para implementar fluxos de edição (como adicionar familiares, registrar visitas), precisamos recuperar o agregado completo.

## Contrato Proposto
```typescript
findById(id: Uuid): Promise<Result<Patient, DomainError>>
// E/OU
findByPersonId(personId: PersonId): Promise<Result<Patient, DomainError>>
```

## Critérios de Aceite
- [ ] Protocolo `PatientRepositoryProtocol` atualizado com método de leitura.
- [ ] Implementação `SQLitePatientRepository` (Mock) atualizada com `SELECT` funcional (mapeamento de tabela para Agregado).
- [ ] Teste de unidade no repositório validando o `find` (garantindo que o objeto recuperado é igual ao salvo).

## Contexto
Isso é um pré-requisito bloqueante para todos os outros casos de uso de edição.
