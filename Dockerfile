FROM --platform=$BUILDPLATFORM node:23.7-alpine3.21 AS build-deps
WORKDIR /app

COPY .sequelizerc ./
COPY package*.json ./

RUN apk add --no-cache postgresql-client

RUN npm install --frozen-lockfile && npm cache clean --force

FROM build-deps AS builder

COPY src ./src
COPY tsconfig.json ./
# COPY entrypoint.sh /usr/src/app/entrypoint.sh

RUN npm run build && ls -R ./dist

FROM --platform=$BUILDPLATFORM node:23.7-alpine3.21 AS production
WORKDIR /app

# COPY --from=builder /usr/src/app/entrypoint.sh /usr/src/app/entrypoint.sh
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.sequelizerc ./

# RUN chmod +x /usr/src/app/entrypoint.sh

RUN sed -i '/"prepare": "husky install",/d' package.json

RUN npm install --omit=dev --frozen-lockfile && npm cache clean --force

RUN addgroup -S appgroup && adduser --disabled-password -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# 🔹 Exponer el puerto dinámicamente para que funcione en local y Digital Ocean
EXPOSE ${PORT}

# 🔹 Usar una variable de entorno para que funcione en ambos entornos
CMD ["sh", "-c", "node dist/app.js --port ${PORT}"]