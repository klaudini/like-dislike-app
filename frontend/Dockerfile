# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# URL del API
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

# Copia package files
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia código fuente
COPY . .

# Build de producción
RUN npm run build

# Servidor Nginx
FROM nginx:alpine

# Copia configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build desde builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expone puerto
EXPOSE 80

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]
