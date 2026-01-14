# 📘 Introdução — People Context (Sistema ACDG)

**Documento**: `people_context_introduction.md`

**Versão**: 0.1

**Domínio**: Gestão de Identidade, Autenticação e Governança de Dados

**Focado em**: Desenvolvedores, Gestores de TI, DPO (Proteção de Dados) e Administradores

---

## 1. Por que a ACDG precisa de um People Context?

A ACDG interage diariamente com centenas de seres humanos em diferentes capacidades: pacientes, familiares, visitantes, profissionais de saúde, advogados e gestores. Sem um contexto centralizado de identidade, a instituição enfrentaria riscos críticos:

* **Fragmentação e Duplicidade**: Uma mesma pessoa cadastrada como "Visitante" hoje e "Paciente" amanhã geraria dois registros órfãos, dificultando a rastreabilidade histórica.
* **Vazamento de Dados (Privacidade)**: Sem uma barreira clara, um profissional do Jurídico poderia acessar dados sensíveis de Terapias sem uma justificativa legal ou clínica.
* **Fadiga de Credenciais**: Funcionários e pacientes precisando de múltiplos logins e senhas para diferentes módulos (Filas, Prontuário, Jurídico).
* **Falta de Auditoria de Acesso**: Dificuldade em responder "quem acessou o prontuário de fulano, quando e por quê?".

O **People Context** nasce para ser a "Âncora de Identidade" (Golden Record) da ACDG, garantindo que cada ser humano seja único no sistema e que o acesso à informação seja estritamente mediado por papéis e autorizações temporárias.

---

## 2. O que o sistema faz, em uma frase?

> Centraliza a identidade única de cada indivíduo (SSO), gerencia seus múltiplos papéis (RBAC) e atua como o mediador de confiança para solicitações de acesso a dados entre departamentos.

---

## 3. Quem são os “clientes” desse sistema?

### 3.1 Visitante (Registro Inicial)

* Pessoa que entra na unidade para uma interação pontual (entrega, informação, visita rápida).
* O sistema captura dados básicos (Nome/CPF) para fins de auditoria de segurança e presença física no prédio.
* **Nota**: Estimulamos o registro simplificado para garantir que todos que cruzam a porta sejam rastreáveis.

### 3.2 Paciente (Usuário de Serviços)

* Pessoa que possui um **Plano de Atendimentos** ativo.
* Utiliza a identidade única para acessar o portal do paciente, visualizar sua posição na fila e seus registros clínicos básicos.

### 3.3 Profissional (Especialista/Assistencial)

* Médicos, terapeutas, assistentes sociais e advogados.
* Usam o login único para acessar as ferramentas de sua especialidade.
* Atuam como **Autorizadores**: são eles quem decidem se permitem que outro profissional veja dados de seus pacientes.

### 3.4 Administrador da Unidade

* Possui o papel de gestão global.
* Pode gerenciar permissões, promover papéis (ex: tornar um Visitante em Funcionário) e intervir em fluxos de autorização em caso de ausência dos responsáveis.

---

## 4. Pilares da Governança e Identidade

### 4.1 Identidade Única (personId)

Tudo gira em torno do `personId`. Não importa se a pessoa mudou de e-mail ou de cargo; o `personId` é imutável e conecta todos os "clusters" de dados (Financeiro, Clínico, Jurídico) de forma segura.

### 4.2 Single Sign-On (SSO) e Níveis de Acesso

O sistema implementa um login único para todas as aplicações da ACDG. O acesso é segmentado: o profissional do Jurídico não enxerga o módulo de Terapias a menos que tenha o papel específico ou uma autorização temporária.

### 4.3 Solicitação de Acesso entre Pares (Data Broker)

Quando um profissional (ex: Advogado) precisa de um dado de outro contexto (ex: Terapia), o sistema orquestra:

1. **Solicitação**: Envio de justificativa obrigatória e prazo pretendido.
2. **Autorização**: O responsável pelo dado (ou o coordenador do setor) concede acesso por no máximo 7 dias.
3. **Aviso de Segurança**: O sistema alerta que o dado é temporário e não deve ser copiado para evitar o uso de informações desatualizadas.

---

## 5. Integração com Acesso Físico (ESP32 + QRCode)

Diferente de sistemas comuns, a validação de presença na ACDG utiliza o People Context como fonte de verdade:

* **Dispositivos**: O ESP32 gera chaves rotativas a cada 5 segundos em telas de QRCode espalhadas pela unidade.
* **Validação**: O usuário (logado via App ou WebApp) lê o código. O sistema cruza o `personId` autenticado com a chave do dispositivo para registrar entrada, saída ou ponto eletrônico.

---

## 6. O que está dentro do People Context (MVP)?

* **Cadastro Golden Record**: Nome civil, social, CPF (chave de unicidade) e data de nascimento.
* **Motor de RBAC**: Suporte a múltiplos papéis simultâneos (ex: uma pessoa ser ADM e Advogado ao mesmo tempo).
* **Módulo de Autenticação**: Login/senha único e gestão de tokens de sessão.
* **Workflow de Autorização**: Sistema de pedidos `personId` para `personId` com expiração automática.
* **Fluxo de LGPD**: Processo de anonimização mediado pela Assistência Social para garantir a continuidade do cuidado.

---

## 7. O que está fora do escopo imediato?

* **Logs de Presença Física**: O People Context valida quem é a pessoa, mas o registro histórico de "entradas e saídas" fica no contexto de `Access/Building Control`.
* **Relações de Parentesco**: A árvore genealógica e responsáveis legais são geridos pelo `Social Care Context` (Conecta Social).
* **Dados Clínicos/Prontuários**: O People Context não guarda diagnósticos, apenas gerencia quem pode vê-los.

---

## 8. Em resumo, o que o gestor precisa guardar?

* **Não há duplicidade**: O CPF é a chave; se a pessoa já existe, o sistema apenas adiciona novos "papéis" ao mesmo `personId`.
* **Privacidade por Design**: Nenhum departamento acessa dados de outro "por padrão". Tudo requer justificativa e autorização do responsável.
* **Controle de Ausência**: Se o profissional responsável pelo dado estiver indisponível, a autoridade de autorização sobe para o Coordenador ou Administrador.
* **Identidade é o Login**: O usuário loga uma vez e o sistema "habilita" as portas dos módulos que ele tem direito de entrar.

## 9. Integrações
Consulte o [Catálogo de Integrações](../../integration-catalog.md) para detalhes sobre ACLs e eventos.
