#!/bin/sh

echo "Ejecutando migraciones..."
node dist/config/database/init.js

echo "Iniciando la aplicación..."
exec node dist/app.js