# CAPIF APIRest

CAPIF APIRest es el backend del sistema de gestión de trámites de CAPIF, desarrollado en Node.js con Express y utilizando TypeScript. Soporta ejecución en entornos de desarrollo (development) y producción local (production.local) utilizando Docker y PostgreSQL.

## Requisitos previos

Antes de ejecutar el proyecto, hay que tener instalado:

- Node.js (versión recomendada: v18+)
- Docker y Docker Compose
- PostgreSQL (si se ejecuta sin Docker)
- Git (para clonar el repositorio)

## Instalación

Instalar las dependencias del proyecto:

```sh
npm install
```

## Configuración de Entorno

El sistema usa variables de entorno para configurar la base de datos y otros servicios. Existen dos archivos .env para cada entorno:

- Entorno de desarrollo: .env.dev.local
- Entorno de producción local: .env.prod.local

IMPORTANTE: Los archivos .env tienen que estar en la raiz del proyecto.

```env
# ==========================
# PostgreSQL Configuration
# ==========================
DB_USER=                      # Nombre de usuario de la base de datos PostgreSQL
DB_PASSWORD=                  # Contraseña del usuario de la base de datos
DB_NAME=                      # Nombre de la base de datos utilizada por la aplicación
DB_HOST=                      # Host donde se encuentra la base de datos (ejemplo: localhost o una IP remota)
DB_PORT=                      # Puerto donde escucha PostgreSQL (por defecto 5432)
DB_SSL=                       # Si la conexión a la base de datos debe ser segura (true para producción, false para local)

# ==========================
# Application Configuration
# ==========================
NODE_ENV=development             # Define el entorno de ejecución (development, production.local)
GLOBAL_PREFIX=api/v1             # Prefijo global para las rutas de la API
JWT_SECRET=                      # Clave secreta para la firma de tokens JWT (debe ser segura)
JWT_EXPIRATION=7200              # Tiempo de expiración del token JWT en segundos (ejemplo: 3600, 7200)
COOKIE_MAX_AGE=7200000           # Tiempo máximo de vida de la cookie de sesión (en milisegundos)
SESSION_EXPIRATION_TIME=1800000  # Tiempo de expiración de sesiones de usuario (en milisegundos)
PORT=                            # Puerto en el que se ejecutará la API
EMAIL_TOKEN_EXPIRATION=7200      # Expiración del token de verificación de email en segundos (ejemplo: 3600, 7200)
RESET_TOKEN_EXPIRATION=7200      # Expiración del token para restablecimiento de contraseña en segudos (ejemplo: 3600, 7200)
MAX_LOGIN_ATTEMPTS=5             # Número máximo de intentos de inicio de sesión antes de bloquear la cuenta
UPLOAD_DIR=./uploads             # Directorio donde se almacenarán archivos subidos
USER_DEPURAR_DAYS=30             # Días antes de marcar usuarios inactivos como en proceso de depuración
USER_DESHABILITAR_DAYS=30        # Días antes de deshabilitar usuarios inactivos
USER_CLEANUP_DAYS=30             # Días antes de eliminar definitivamente un usuario deshabilitado
CAPIF_EMAIL_RECEIVER=            # Correo electrónico que recibe notificaciones administrativas
ADMIN_PRINCIPAL_EMAIL=           # Correo electrónico del administrador principal
ADMIN_PRINCIPAL_PASSWORD=        # Contraseña del administrador principal

# ==========================
# Timezone Configuration
# ==========================
TZ=America/Argentina/Buenos_Aires  # Zona horaria en la que opera la aplicación

# ==========================
# Frontend URL
# ==========================
FRONTEND_URL=                   # URL del frontend al que se conecta la API (ejemplo: http://localhost)

# ==========================
# Email (SMTP) Configuration
# ==========================
SMTP_HOST=                       # Host del servidor de correo saliente (Ejemplo: smtp.gmail.com)
SMTP_PORT=                       # Puerto de conexión SMTP (587 para TLS, 465 para SSL)
SMTP_SECURE=                     # Si se debe usar conexión segura (true para SSL, false para TLS)
SMTP_USER=                       # Usuario del servicio de correo (Ejemplo: correo@gmail.com)
SMTP_PASS=                       # Contraseña del servicio de correo o clave de aplicación
EMAIL_FROM=                      # Nombre y correo del remitente (Ejemplo: CAPIF <noreply@capif.com>)

# ==========================
# FTP Configuration
# ==========================
FTP_HOST=                        # Dirección del servidor FTP
FTP_USER=                        # Usuario de acceso FTP
FTP_PASSWORD=                    # Contraseña del usuario FTP
FTP_PORT=                        # Puerto del servidor FTP (21 por defecto)

# ==========================
# reCAPTCHA v3 Configuration
# ==========================
RECAPTCHA_SECRET_KEY=            # Clave secreta de Google reCAPTCHA v3 para validación de usuarios
```


## Uso con Docker 
### Ejecutar en Desarrollo (development)
Para levantar el entorno de desarrollo con Docker Compose, ejecutar:

```sh
npm run init
```

Luego, para iniciar el proyecto:

```sh
npm run dev
```

### Ejecutar en Producción (production.local)
Para levantar el entorno de producción con Docker Compose, ejecuntar:

```sh
npm run prod
```

Para inicializar la base de datos, ingresar a la consola del contenedor Docker de la aplicación y ejecutar:

```sh
npm run postgres:init
```

## API Documentada con Swagger (en entorno de desarrollo)

El backend incluye documentación interactiva con Swagger.

Para acceder a la documentación, inicia el servidor y abre en tu navegador:

```bash
http://localhost:3000/docs
```