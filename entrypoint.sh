#!/bin/sh

echo "Ejecutando migraciones..."
node dist/config/database/initPostgres.js

echo "Precargando datos en Redis..."
node dist/database/initRedis.js

echo "Iniciando la aplicación..."
exec node dist/app.js