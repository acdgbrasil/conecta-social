# ==========================================
# Stage 1: Builder (Compilação)
# ==========================================
FROM swift:6.0-jammy as builder

WORKDIR /app

# Copia o projeto inteiro (incluindo subpastas)
COPY queue-orquestration/ .

# Resolve dependências (Cache Layer)
RUN swift package resolve

# Compila em modo Release
RUN swift build -c release --static-swift-stdlib

# ==========================================
# Stage 2: Runtime (Execução Leve)
# ==========================================
FROM ubuntu:jammy-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# O binário gerado pelo Swift PM fica em .build/release/ [NomeDoExecutavel]
COPY --from=builder /app/.build/release/QueueServiceRunner /app/service

EXPOSE 50051

RUN useradd -m -u 1000 appuser
USER appuser

ENTRYPOINT ["/app/service"]
