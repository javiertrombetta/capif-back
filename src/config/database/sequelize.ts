import { Sequelize } from "sequelize";
import namespace from "./transactionContext";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Cargar variables de entorno según el entorno
const env = process.env.NODE_ENV || "development";
const envFile =
  env === "production.local"
    ? ".env.prod.local"
    : env === "production.remote"
    ? ".env.prod.remote"
    : ".env.dev.local";

dotenv.config({ path: envFile });

// Aplicar contexto de transacciones antes de instanciar sequelize
Sequelize.useCLS(namespace);

// Configurar conexión a PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    dialect: "postgres",
    dialectOptions: {
      ssl: process.env.DB_SSL === "true" ? { require: true, rejectUnauthorized: false } : undefined,
    },
    logging: false,
  }
);

// Hooks para asignar UUIDs a los modelos automáticamente
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

// Log para verificar que se cargó el archivo correcto
console.log(`🚀 Sequelize cargado con configuración de: ${envFile}`);

export default sequelize;