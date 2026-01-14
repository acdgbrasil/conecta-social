# ⚖️ 04 — Regras de Governança e Autenticação (People Context)

> *Este documento consolida as políticas de segurança, privacidade e operação técnica que regem a identidade e o acesso no Sistema ACDG. Ele serve como o guia de conformidade para implementações de segurança e auditoria.*

---

## 1. Princípio do Menor Privilégio e RBAC

O acesso aos módulos do Sistema ACDG é estritamente baseado em papéis (`Roles`). A existência de um registro no People Context não garante acesso automático a nenhum dado sensível.

* **Segregação de Contextos**: Profissionais do setor Jurídico não possuem visibilidade sobre dados das Terapias, e vice-versa, protegendo a privacidade do paciente por padrão.
* **Papéis Aditivos**: O sistema deve permitir que um usuário exerça múltiplos papéis simultaneamente (ex: um usuário pode logar como Administrador e Advogado), acumulando as permissões de ambos.
* **Níveis de Acesso**: O login único (SSO) habilita apenas as funcionalidades e visões autorizadas para os papéis ativos na conta do usuário.

---

## 2. Unicidade de Identidade e Autenticação Centralizada (SSO)

Para garantir a integridade dos dados e a experiência do usuário, a ACDG adota uma estratégia de login único.

* **Golden Record**: O CPF é a chave de unicidade. Nenhuma pessoa pode ser criada se o CPF já constar na base do People Context.
* **Credencial Única**: O par login/senha gerenciado pelo People Context é o único válido para todas as aplicações (Filas, Social Care, Jurídico, Financeiro, etc.).
* **Bloqueio em Cascata**: Uma conta suspensa ou bloqueada no People Context perde o acesso instantaneamente em todos os módulos integrados da ACDG.

---

## 3. Governança Federada de Dados (Workflow de Autorização)

O acesso a dados entre departamentos não é livre; ele é mediado por um contrato de confiança temporário entre profissionais (`personId` para `personId`).

* **Autoridade Primária**: O profissional responsável pelo acompanhamento do paciente (ex: Assistente Social no Social Care ou Terapeuta nas Terapias) é o autorizador padrão para pedidos de acesso aos dados daquele paciente.
* **Hierarquia de Contingência**: Caso o responsável esteja ausente ou impedido, a autoridade de autorização é delegada ao Coordenador do Setor ou ao Administrador Geral da ACDG para evitar o bloqueio de processos críticos.
* **Justificativa e Temporalidade**: Toda solicitação exige uma justificativa textual e tem validade máxima de **7 dias**, definida por quem autoriza.
* **Vedação de Cópia**: O sistema deve desencorajar e auditar a extração de dados, emitindo avisos de que informações copiadas podem se tornar obsoletas e induzir a erros de decisão.

---

## 4. Validação de Presença e Ponto Eletrônico (ESP32 + QRCode)

A validação de presença física utiliza o People Context como autoridade de identidade em tempo real.

* **Chaves Rotativas**: Dispositivos ESP32 espalhados pela unidade geram QRCodes com chaves dinâmicas que mudam a cada 5 segundos.
* **Fluxo de Leitura**: O usuário deve utilizar o App (WebApp ou Nativo) logado com suas credenciais ACDG para ler o código.
* **Consistência de Identidade**: O backend valida o `personId` do portador do celular contra a chave do QRCode, garantindo que o registro de presença (ponto ou entrada) seja pessoal e intransferível.

---

## 5. Privacidade e o "Direito ao Esquecimento" (LGPD)

Em conformidade com a LGPD e a ética assistencial, o processo de anonimização é diferenciado pelo tipo de vínculo.

* **Visitantes**: Possuem fluxo de exclusão simplificado, dado o caráter pontual da interação.
* **Pacientes e Profissionais**: O pedido de anonimização dispara uma notificação obrigatória para a **Triagem Social**.
* **Investigação Social**: A assistente social deve entrar em contato com o solicitante para entender o motivo e avaliar se a exclusão impacta obrigações legais (guarda de prontuário) ou a continuidade de cuidados terapêuticos essenciais.

---

## 6. Tabela de Invariantes de Governança

| Regra | Descrição | Origem |
| --- | --- | --- |
| **Auditoria Total** | Todo evento de login, troca de papel ou autorização de dados deve ser registrado para auditoria. | Regra R10 |
| **Teto de Acesso** | Nenhuma autorização de acesso a dados entre departamentos pode exceder 7 dias. | Governança ACDG |
| **Obrigatoriedade de CPF** | O registro de qualquer pessoa (exceto casos excepcionais de vulnerabilidade na triagem) exige CPF para evitar duplicidade. | Core Identity |
| **Soberania do Autorizador** | Somente o responsável pelo dado ou sua hierarquia imediata pode autorizar a visualização por terceiros. | Privacy by Design |

---