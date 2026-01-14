# ==========================================
# Stage 1: Base (Instalação)
# ==========================================
FROM oven/bun:1-alpine as base
WORKDIR /app

# Copia arquivos de configuração de pacote
COPY package.json bun.lock ./

# Instala dependências de produção
RUN bun install --frozen-lockfile --production

# ==========================================
# Stage 2: Release
# ==========================================
FROM oven/bun:1-alpine as release
WORKDIR /app

# Copia dependências instaladas
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Copia o código fonte
COPY . .

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER bun

CMD ["bun", "run", "start"]
