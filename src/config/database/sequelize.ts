import { Sequelize } from "sequelize";
import namespace from "./transactionContext";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Cargar variables de entorno según el entorno
const env = process.env.NODE_ENV || "development";

if (env === "development") {
  dotenv.config({ path: ".env.dev.local" });
} else if (env === "production.local") {
  dotenv.config({ path: ".env.prod.local" });
} else if (env === "production.remote") {
  console.log("Usando variables de entorno de DigitalOcean (sin cargar .env)");
} else {
  dotenv.config(); // Si no hay un entorno definido, carga el .env por defecto
}

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

// Log para verificar qué configuración está cargando
console.log(`Sequelize inicializado en entorno: ${env}`);

export default sequelize;