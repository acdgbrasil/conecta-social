# ==========================================
# Multi-stage Dockerfile for conecta-raros
# ==========================================
# NOTE: This Dockerfile must be built from the MONOREPO ROOT context.
# Usage: docker build -f packages/conecta-raros/Dockerfile .

ARG BUN_VERSION=1.2.0

# ==========================================
# Stage 1: Base (Dependency & Setup)
# ==========================================
FROM oven/bun:${BUN_VERSION}-alpine as base
WORKDIR /app

# Copy root configuration files for workspace resolution
COPY package.json bun.lock bunfig.toml ./

# Copy packages directory to satisfy workspace dependencies (e.g. packages/shared)
COPY packages ./packages

# Install dependencies (including devDependencies for build/test stages)
RUN bun install --frozen-lockfile

# ==========================================
# Stage 2: Development (DEV)
# ==========================================
FROM base as development
ENV NODE_ENV=development
EXPOSE 3000

# Enable hot reloading for development
CMD ["bun", "--hot", "packages/conecta-raros/social-care/index.ts"]

# ==========================================
# Stage 3: Test & QA (CI/CD)
# ==========================================
FROM base as test
ENV NODE_ENV=test

# Run linting (assumes "lint" script exists in root package.json)
RUN bun run lint

# Run tests specifically for this package
RUN bun test packages/conecta-raros

# ==========================================
# Stage 4: Production Builder (Pruning)
# ==========================================
FROM base as builder
ENV NODE_ENV=production

# Re-install only production dependencies
# (Bun install --production removes devDeps)
RUN bun install --frozen-lockfile --production

# ==========================================
# Stage 5: Production (PROD)
# ==========================================
FROM oven/bun:${BUN_VERSION}-alpine as production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy minimal runtime files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/bunfig.toml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

EXPOSE 3000
USER bun

# Start the service
CMD ["bun", "packages/conecta-raros/social-care/index.ts"]
