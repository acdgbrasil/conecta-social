# 📘 1. Introdução — Sistema Conecta Raros (Social Care)

**Documento**: `social_care_introduction.md`
**Versão**: 0.1
**Domínio**: Prontuário Social e Linha de Cuidado
**Focado em**: Assistentes Sociais, Gestores, Pesquisadores e Equipe Multidisciplinar

---

## 1. Por que precisamos do Conecta Raros (Social Care)?

O atendimento a pessoas com doenças raras vai muito além da questão clínica/médica. Envolve uma complexa rede de vulnerabilidades sociais, direitos, benefícios e suporte familiar.

Na prática:
- O histórico social do paciente costuma ficar fragmentado em anotações de papel ou campos de texto livre em sistemas hospitalares.
- É difícil rastrear a **evolução socioeconômica** de uma família ao longo dos anos.
- Encaminhamentos para a rede (CRAS, CREAS, Saúde) e relatos de violação de direitos precisam ser **auditáveis e estruturados**.
- Não basta saber o diagnóstico médico (CID); é preciso entender a **condição de moradia**, a **rede de apoio** e a **estrutura familiar**.

O **Sistema Conecta Raros (Módulo Social Care)** nasce para resolver isso:
Criar um **Prontuário Social Longitudinal**, centrado na pessoa e em sua família, garantindo que toda intervenção social, diagnóstico e mudança de contexto fiquem registrados de forma estruturada e imutável.

---

## 2. O que o sistema faz, em uma frase?

> Gerencia o ciclo de vida do prontuário social do paciente raro, centralizando diagnósticos, composição familiar, vulnerabilidades e intervenções em um **modelo rico e auditável**, servindo como fonte única de verdade para a assistência social e pesquisa.

---

## 3. Quem são os “clientes” desse sistema?

### 3.1 Assistente Social
- Realiza entrevistas e atualiza o contexto de vida (`HousingCondition`, `SocioEconomicSituation`).
- Registra atendimentos (`SocialCareAppointment`) e planos de ação.
- Emite encaminhamentos (`Referral`) e relata violações de direitos (`RightsViolationReport`).

### 3.2 Pesquisadores / BI
- Consomem dados anonimizados para entender:
  - Prevalência de CIDs por região.
  - Correlação entre vulnerabilidade social e adesão ao tratamento.
  - Impacto dos benefícios sociais na qualidade de vida.

### 3.3 Gestão da Unidade
- Acompanha o volume de atendimentos sociais.
- Monitora casos críticos (violações de direitos, negligência).

### 3.4 Outros Sistemas (ex: ACDG / Filas)
- Consomem informações do `Patient` para decidir elegibilidade (Triagem) e prioridade de atendimento.

---

## 4. Como funciona o domínio na prática?

### 4.1 O Paciente e a Família (Agregado Raiz)
Tudo gira em torno do **Agregado `Patient`**. Diferente de um cadastro simples, ele "protege" toda a consistência dos dados sociais:
- Um paciente **não existe sem diagnóstico** (CID) e identificação (`PersonId`).
- A família (`FamilyMember`) é parte integrante do paciente. Não se trata o indivíduo isolado.
- Regras rígidas, como **"apenas um cuidador principal"**, são garantidas pelo sistema.

### 4.2 Avaliação Multidimensional
O sistema estrutura a avaliação social em Value Objects ricos, substituindo formulários de texto soltos:
- **Diagnósticos**: CIDs validados e datados.
- **Condição de Moradia**: Tipo de posse, saneamento, acessibilidade.
- **Situação Socioeconômica**: Renda, benefícios (`Bolsa Família`, `BPC`), consistência financeira.
- **Rede de Apoio**: Vínculos com vizinhos, família e equipamentos sociais.
- **Saúde Social**: Dependências funcionais e mobilidade.

### 4.3 Intervenções e Histórico
Cada interação gera registros imutáveis (Append-Only):
- **Atendimentos**: Resumo e plano de ação.
- **Encaminhamentos**: Para onde o paciente foi enviado (Saúde, Jurídico, Educação).
- **Violações de Direitos**: Relatos formais de negligência ou violência, com datas de incidente e relato controladas.

---

## 5. O que está dentro do MVP?

### 5.1 Incluído (Social Care Context)
- Cadastro e identificação única (`PersonId` via UUID v7).
- Gestão de Diagnósticos (CIDs).
- Mapeamento Familiar e Cuidador Principal.
- Avaliações Sociais completas (Moradia, Econômica, Saúde, Apoio).
- Registro de Atendimentos (`SocialCareAppointment`).
- Encaminhamentos (`Referral`) e Violações (`RightsViolationReport`).
- Eventos de Domínio (`PatientCreated`, `FamilyMemberAdded`).

### 5.2 Integrações e Futuro
- Integração com **Analysis & Research** (BI) via eventos.
- Integração com **Format Conversions** para gerar PDFs de relatórios sociais.
- Módulos específicos de **Terapias** e **Jurídico** (sistemas satélites).
