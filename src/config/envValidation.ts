import Joi from 'joi';

// Detectar si npm run init está corriendo
const isInitScript = process.env.npm_lifecycle_event === 'postgres:init';

const envSchema = Joi.object({
  // Base de datos (opcional en npm run init)
  DB_USER: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
  DB_PASSWORD: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
  DB_NAME: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
  DB_HOST: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
  DB_PORT: Joi.number().default(25060),
  DB_SSL: Joi.boolean().truthy('true').falsy('false').default(true),

  // Aplicación
  NODE_ENV: Joi.string().valid('development', 'production.local', 'production.remote').required(),
  PORT: Joi.number().default(8080),
  GLOBAL_PREFIX: Joi.string().default('api/v1'),
  JWT_SECRET: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
  JWT_EXPIRATION: Joi.string().default('1h'),
  COOKIE_MAX_AGE: Joi.number().default(3600000),
  EMAIL_TOKEN_EXPIRATION: Joi.string().default('1d'),
  RESET_TOKEN_EXPIRATION: Joi.string().default('1h'),
  MAX_LOGIN_ATTEMPTS: Joi.number().default(5),
  UPLOAD_DIR: Joi.string().default('./uploads'),
  CAPIF_EMAIL_RECEIVER: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),

  // Redis
  REDIS_HOST: Joi.string().default('redis'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_NAME: Joi.string().default('redis'),

  // Timezone
  TZ: Joi.string().default('America/Argentina/Buenos_Aires'),

  // Transport
  FRONTEND_URL: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),

  // Gmail
  SMTP_HOST: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  SMTP_USER: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
  SMTP_PASS: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
  EMAIL_FROM: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
  CLAVE_MAIL: Joi.string().when('$isInitScript', { is: true, then: Joi.optional(), otherwise: Joi.required() }),

  // FTP (Opcional)
  FTP_HOST: Joi.string().allow(''),
  FTP_USER: Joi.string().allow(''),
  FTP_PASSWORD: Joi.string().allow(''),
  FTP_PORT: Joi.string().allow(''),
}).unknown();

// Validar process.env con el contexto
const { error, value: validatedEnv } = envSchema.validate(process.env, { abortEarly: false, context: { isInitScript } });

if (error) {
  console.error('Error en las variables de entorno:', error.details.map(err => err.message).join(', '));
  process.exit(1);
}

export default validatedEnv;