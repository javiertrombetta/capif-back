import { Sequelize } from "sequelize";
import cls from "cls-hooked";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import logger from "../logger";

// Crear y registrar el namespace de CLS
const namespace = cls.createNamespace("sequelize-transaction");
Sequelize.useCLS(namespace);

const env = process.env.NODE_ENV;

// Registrar información del entorno detectado
logger.info(`[SEQUELIZE] Entorno detectado: ${env}`);

// Cargar variables de entorno según el entorno
if (env === "development") {
  logger.info("[SEQUELIZE] Cargando variables de entorno desde .env.dev.local...");
  dotenv.config({ path: ".env.dev.local" });
} else if (env === "production.local") {
  logger.info("[SEQUELIZE] Cargando variables de entorno desde .env.prod.local...");
  dotenv.config({ path: ".env.prod.local" });
} else if (env === "production.remote") {
  logger.info("[SEQUELIZE] Utilizando variables de entorno de la nube (Digital Ocean)");
} else {
  logger.error(`[SEQUELIZE] Error: El entorno ${env} no está definido. Abortando.`);
  process.exit(1);
}

// Verificar que las variables críticas estén definidas
const requiredEnvVars = ["DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT"];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`[SEQUELIZE] Error: Faltan las siguientes variables de entorno: ${missingVars.join(", ")}`);
  process.exit(1);
}

// Instancia de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      timezone: process.env.TZ,
      useUTC: false,
      ssl: env === "production.remote" ? { require: true, rejectUnauthorized: false } : false,
    },
    timezone: process.env.TZ,
  }
);

// Hooks para generar UUIDs antes de crear registros
sequelize.addHook("beforeCreate", (instance: any) => {
  if (!instance.id) {
    instance.id = uuidv4();
  }
});

sequelize.addHook("beforeBulkCreate", (instances: any[]) => {
  instances.forEach((instance) => {
    if (!instance.id) {
      instance.id = uuidv4();
    }
  });
});

export default sequelize;
export { namespace };