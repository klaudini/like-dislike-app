# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia código fuente
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Compila TypeScript
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Instala solo dependencias de producción
RUN npm ci --only=production

# Copia código compilado desde builder
COPY --from=builder /app/dist ./dist

# puerto expuesto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start:prod"]
