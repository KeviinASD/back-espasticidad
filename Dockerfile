# Etapa 1: Build
FROM node:20-alpine AS builder

# Instalar dependencias necesarias para bcrypt y otras bibliotecas nativas
RUN apk add --no-cache python3 make g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar dependencias de desarrollo para el build
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

# Instalar dependencias necesarias para bcrypt en runtime
RUN apk add --no-cache libstdc++

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias de producción desde builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar el código compilado
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copiar package.json para referencia
COPY --chown=nestjs:nodejs package*.json ./

# Cambiar al usuario no-root
USER nestjs

# Exponer el puerto
EXPOSE 3030

# Variables de entorno por defecto (se sobrescriben en Easypanel)
ENV NODE_ENV=production
ENV PORT=3030

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]
