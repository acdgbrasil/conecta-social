# Biome

> Ferramenta unificada de linting e formatação para o ecossistema JS/TS.

## Visão Geral
Adotamos o [Biome](https://biomejs.dev/) como substituto de alta performance para ESLint e Prettier. Ele é escrito em Rust e oferece:
- Linting
- Formatação
- Organização de imports

## Configuração
A configuração central vive em `biome.json` na raiz do monorepo.
- **Indentação**: 2 espaços (para consistência com o padrão moderno).
- **Regras**: `recommended` ativado por padrão.
- **Integração VCS**: Respeita `.gitignore`.

## Scripts
No `package.json` raiz:
- `bun run lint`: Executa verificações (linting + formatação check).
- `bun run lint:fix`: Aplica correções automáticas e formatação.

## Integração com VSCode
O arquivo `.vscode/settings.json` já está configurado para usar o Biome como formatador padrão para arquivos `.js`, `.ts`, `.jsx`, `.tsx` e `.json`.
Certifique-se de ter a extensão [Biome for VS Code](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) instalada.

## Como usar
### Verificar problemas
```bash
bun run lint
```

### Corrigir problemas automaticamente
```bash
bun run lint:fix
```

### CI/CD
O script `lint` deve ser executado no pipeline de CI para garantir a qualidade do código.
