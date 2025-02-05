# Usa a imagem oficial do Node.js
FROM node:18

# Define o diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json primeiro para otimizar o cache
COPY package.json package-lock.json ./

# Copia a pasta do Prisma (caso esteja usando)
COPY prisma ./prisma/

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação
COPY . .


# Expõe a porta definida no .env
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "run", "docker_init"]
