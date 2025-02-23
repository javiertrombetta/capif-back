# Fase 1: Dependencias y Build
FROM --platform=$BUILDPLATFORM node:23.7.0-alpine3.21 AS build-deps
WORKDIR /app

COPY .sequelizerc ./
COPY package*.json ./

RUN apk add --no-cache postgresql-client
RUN npm install -g npm@latest && npm cache clean --force
RUN npm install --frozen-lockfile && npm cache clean --force

FROM build-deps AS builder

COPY src ./src
COPY tsconfig.json ./

RUN npm run build && ls -R ./dist

# Fase 2: Configuración de Producción
FROM --platform=$BUILDPLATFORM node:23.7.0-alpine3.21 AS production
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.sequelizerc ./

RUN sed -i '/"prepare": "husky install",/d' package.json
RUN npm install --omit=dev --frozen-lockfile && npm cache clean --force

# Agregar un usuario seguro para ejecutar la aplicación
RUN addgroup -S appgroup && adduser --disabled-password -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Exponer el puerto dinámicamente para que funcione en local y Digital Ocean
EXPOSE ${PORT}

# Agregar HEALTHCHECK solo en production.local
ARG NODE_ENV
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 \
    CMD if [ "$NODE_ENV" = "production.local" ]; then curl -f http://localhost:${PORT}/health || exit 1; else exit 0; fi

# Usar una variable de entorno para que funcione en ambos entornos
CMD ["sh", "-c", "node dist/app.js --port ${PORT}"]