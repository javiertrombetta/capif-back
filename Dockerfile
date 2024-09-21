# Etapa de instalación de dependencias (Build Stage)
FROM --platform=$BUILDPLATFORM node:20.17.0-alpine3.20 AS build-deps
WORKDIR /app

# Copiar los archivos necesarios para instalar dependencias
COPY .sequelizerc ./
COPY package*.json ./

RUN apk add --no-cache postgresql-client

# Instalar las dependencias y limpiar caché de npm
RUN npm install --frozen-lockfile && npm cache clean --force

# Etapa de construcción del proyecto (Build Stage)
FROM build-deps AS builder

# Copiar el código fuente y el archivo de configuración de TypeScript
COPY src ./src
COPY tsconfig.json ./
COPY entrypoint.sh /usr/src/app/entrypoint.sh

# Ejecutar la construcción del proyecto (esto incluye compilar `init.ts`)
RUN npm run build && ls -R ./dist

# Etapa de producción (Production Stage)
FROM --platform=$BUILDPLATFORM node:20.17.0-alpine3.20 AS production
WORKDIR /app

# Copiar las dependencias de producción y los archivos necesarios
COPY --from=builder /usr/src/app/entrypoint.sh /usr/src/app/entrypoint.sh
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.sequelizerc ./

# Aplicar permisos de ejecución al entrypoint.sh en la etapa de producción
RUN chmod +x /usr/src/app/entrypoint.sh

# Instalar solo las dependencias de producción y limpiar caché de npm
RUN npm install --omit=dev --frozen-lockfile && npm cache clean --force

# Crear un usuario sin privilegios para ejecutar la aplicación
RUN addgroup -S appgroup && adduser --disabled-password -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Exponer el puerto de la aplicación
EXPOSE 3000

# Usar el entrypoint que ejecutará las migraciones y luego iniciará la aplicación
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]