# CAPIF GIT Backend


## Desarrollo (Mayor control de ejecución)
- Motor de Postres: Docker
- Base de datos: proyecto local (aparece una carpeta /postgres que es el volume)
- Aplicación: proyecto local
- Logs: proyecto local

### /.env.dev.local
Variables de entorno para desarrollo

```env
# PostgreSQL
DB_USER=postgres
DB_PASSWORD=DevPass123!
DB_NAME=CAPIF_DB
DB_HOST=localhost
DB_PORT=5432

# Aplicación
NODE_ENV=development
JWT_SECRET=SistemaDeGestionDeTramites!
PORT=3000

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Timezone
TZ=America/Argentina/Buenos_Aires

# Transport
FRONTEND_URL=http://dominio.com
SMTP_USER=mail@gmail.com
SMTP_PASS=APIKEY
```
### 1) Ejecución de motor de base de datos en Docker y creación de volume local

```bash
docker compose --env-file .env.dev.local -f compose.dev.local.yml up --build -d
```

### 2) Ejecución de aplicación local

```bash
npm run dev
```

### Eliminar todo lo asociado al compose (menos el volumen)

```bash
docker compose --env-file .env.dev.local -f compose.dev.local.yml down
```


## Producción - Total (Probar el resultado final)
- Motor de Postres: Docker
- Base de datos: volume en Docker
- Aplicación: Docker
- Logs: Docker

### /.env.prod.local
Variables de entorno para desarrollo

```env
# PostgreSQL
DB_USER=postgres
DB_PASSWORD=DevPass123!
DB_NAME=CAPIF_DB
DB_HOST=postgres
DB_PORT=5432

# Aplicación
NODE_ENV=production.local
JWT_SECRET=SistemaDeGestionDeTramites!
PORT=3000
RESET_TOKEN_EXPIRATION=1h
MAX_LOGIN_ATTEMPTS=5

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Timezone
TZ=America/Argentina/Buenos_Aires

# Transport
FRONTEND_URL=http://dominio.com
SMTP_SERVICE=gmail
SMTP_FROM=Name <mail@gmail.com>
SMTP_USER=mail@gmail.com
SMTP_PASS=APIKEY
```
### Ejecución de de entorno total de producción

```bash
docker compose --env-file .env.prod.local -f compose.prod.local.yml up --build -d
```

### Eliminar todo lo asociado al compose (menos el volumen)

```bash
docker compose --env-file .env.prod.local -f compose.prod.local.yml down
```
