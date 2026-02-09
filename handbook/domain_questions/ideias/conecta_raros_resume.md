### 1.2 Sistema Conecta Raros

Separado do ACDG, temos o **Sistema Conecta Raros**, que é outro sistema, com objetivos próprios.

Ele é composto por:

- **Conecta Social**  
  - Core domain social (Social Care Context, `Patient`, `Referral`, `RightsViolationReport`, etc.).  
  - Mantém o prontuário social completo.

- **Analysis & Research / BI**  
  - Contexto focado em analytics, pesquisa e relatórios.  
  - Consome eventos (inclusive do Conecta Social e, potencialmente, do ACDG) para gerar insights.

- **Format Conversions and Downloads of Forms Types**  
  - Camada/ferramenta para conversão de formatos, geração/baixa de formulários, PDFs, etc.  
  - Usada quando precisamos entregar relatórios ou documentos em formatos específicos.