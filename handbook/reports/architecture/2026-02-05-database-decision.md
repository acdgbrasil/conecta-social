# Decisão de Arquitetura: Persistência de Dados (Social Care)

**Data:** 05 de Fevereiro de 2026
**Status:** ✅ Decidido
**Contexto:** Definição da tecnologia e estratégia de banco de dados para o módulo Social Care.

---

## 1. Decisão Técnica
A tecnologia escolhida para o banco de dados operacional (OLTP) do módulo Social Care é o **PostgreSQL**.

### Justificativa
1.  **Fonte da Verdade e Integridade**: O Social Care é o sistema de registro (System of Record) do prontuário social. A robustez ACID do PostgreSQL garante que as regras de negócio complexas e invariantes do domínio sejam preservadas sem corrupção de dados.
2.  **Modelo Híbrido (Relacional + JSONB)**: O domínio possui Agregados ricos com Value Objects complexos (Moradia, Situação Socioeconômica). O PostgreSQL permite armazenar esses objetos como `JSONB`, facilitando o mapeamento do Agregado sem a complexidade de múltiplos Joins, mantendo a performance de indexação.
3.  **Escalabilidade de Histórico**: Como o paciente pode ter um número ilimitado de atendimentos ao longo da vida, a estrutura relacional permite separar a tabela de `appointments` da raiz do paciente, evitando o problema de "Documentos Gigantes" (unbounded collections) que ocorreria em bancos puramente NoSQL.
4.  **Ecosystem Bun**: O uso de `bun:sql` (ou drivers nativos compatíveis) oferece performance de ponta e tipagem estrita no ambiente Bun.

---

## 2. Estratégia de Integração com BI (Analysis & Research)

A integração não será síncrona para consultas pesadas. O banco operacional será focado em **Escrita e Validação**.

- **Job Noturno (Batch)**: Um processo agendado (Cron/Job) extrairá os dados do PostgreSQL diariamente.
- **Anonimização**: Durante a extração, os dados sensíveis (LGPD) serão anonimizados ou omitidos.
- **Destino**: Os dados serão transferidos para o banco de dados do BI (`Analysis & Research`), que é otimizado para consultas analíticas (OLAP).

---

## 3. Esboço do Esquema (Schema Proposal)

| Tabela | Estratégia | Descrição |
| :--- | :--- | :--- |
| `patients` | Híbrido | Raiz do agregado. `id`, `person_id` e colunas `JSONB` para Moradia e Econômico. |
| `family_members` | Relacional | Membros da família vinculados ao `patient_id`. |
| `diagnoses` | Relacional | Lista de diagnósticos (CIDs) iniciais e evolutivos. |
| `appointments` | Append-Only | Histórico de atendimentos. Separado para suportar crescimento indefinido. |
| `referrals` | Relacional | Encaminhamentos externos e status. |

---

## 4. Próximos Passos
1. Implementar `PostgresPatientRepository` seguindo o `PatientRepositoryProtocol`.
2. Definir o esquema de migração inicial (Migration scripts).
3. Configurar container de banco de dados para ambiente de desenvolvimento.
