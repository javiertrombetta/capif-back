import dotenv from 'dotenv';
import logger from './config/logger';
import { startFakeFtpServer, stopFakeFtpServer } from "./utils/fakeFtp";

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  logger.info('Cargando variables de entorno desde .env.dev.local...');
  dotenv.config({ path: '.env.dev.local' });
  startFakeFtpServer();

} else if (env === 'production.local') {
  logger.info('Cargando variables de entorno desde .env.prod.local...');
  dotenv.config({ path: '.env.prod.local' });

} else if (env === 'production.remote') {
  logger.info('Usando variables de entorno de DigitalOcean (sin cargar .env).');

} else {
  logger.warn(`El entorno ${env} no está definido. Cargando las variables de entorno por defecto...`);
  dotenv.config();
}

import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import * as fs from 'fs';
import * as path from 'path';
import * as Cron from './config/cron';

import sequelize from './config/database/sequelize';
import { setupSwagger } from './config/swagger';

import { errorHandler } from './middlewares/errorHandler';
import { transactionMiddleware } from "./middlewares/transaction";


import router from './routes';

const app = express();
const globalPrefix = process.env.GLOBAL_PREFIX || 'api/v1';

// Verificar que UPLOAD_DIR esté definido
if (!process.env.UPLOAD_DIR) {
  throw new Error("La variable de entorno UPLOAD_DIR no está definida. Por favor configúrala antes de iniciar el servidor.");
}

// Definir variables de entorno a usarse en la aplicación
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR );

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  logger.info(`Directorio creado en ${UPLOAD_DIR}`);
}

// Crear subdirectorios específicos
const subdirectories = ['documents', 'audio'];
subdirectories.forEach((subdir) => {
  const subdirPath = path.join(UPLOAD_DIR, subdir);
  if (!fs.existsSync(subdirPath)) {
    fs.mkdirSync(subdirPath, { recursive: true });
    logger.info(`Subdirectorio creado en ${subdirPath}`);
  }
});

app.use(cookieParser());
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip || 'unknown',
});

app.use(helmet());

// CORS

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3001',
//     credentials: true,
//   })
// );

// app.use(
//   cors({
//     origin: env === 'development' ? true : 'https://tu-dominio.com', // CAMBIARLO PARA PRODUCCIÓN
//     credentials: true,
//   })
// );

const allowedOrigins = env === 'development' ? true : [process.env.FRONTEND_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins === true || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS no permitido'));
      }
    },
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) {
//         return callback(null, true); //Permitir requests sin origen
//       }
//       callback(null, true); //Permitir cualquier origen dinámicamente
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Permitir todos los métodos HTTP
//     allowedHeaders: ["Content-Type", "Authorization"], //Permitir estos headers
//     credentials: true, //Permitir cookies y autenticación con credenciales
//   })
// );

app.use(express.json());
app.use(limiter);

const isProduction = process.env.NODE_ENV?.startsWith('production');
const skipSuccessLogs = (req: Request, res: Response) => res.statusCode < 400;

app.use(
  morgan(isProduction ? 'tiny' : 'combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
    skip: skipSuccessLogs,
  })
);

app.use(transactionMiddleware);

if (env === 'development') {
  setupSwagger(app);
}

// setupSwagger(app);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use(`/${globalPrefix}`, router);

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión exitosa a la base de datos');
  } catch (err) {
    logger.error('Error de conexión o sincronización con la base de datos:', err);
    throw new Error('Error de conexión con la base de datos');
  }
};

const startServer = () => {
  const port = process.env.PORT || 8080;
  const server = app.listen(port, () => {
    logger.info(`Servidor corriendo en el puerto ${port}`);
  });

  let isShuttingDown = false;

  const gracefulShutdown = async () => {
    if (isShuttingDown) {
      logger.warn("El servidor ya está en proceso de apagado.");
      return;
    }

    isShuttingDown = true;

    logger.info("Apagado del servidor en curso...");
    Cron.stopCronTasks();

    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info("Servidor cerrado.");
        resolve();
      });
    });

    try {
      await sequelize.close();
      logger.info("Conexiones a postgres cerradas correctamente.");

      if (process.env.NODE_ENV === "development") {
        await stopFakeFtpServer();
      }
    } catch (error) {
      logger.error("Error cerrando conexiones:", error);
    } finally {
      process.exit(0);
    }
  };

  //Manejo de señales para apagar correctamente el servidor
  process.once("SIGINT", gracefulShutdown);
  process.once("SIGTERM", gracefulShutdown);
};

(async () => {
  try {
    await connectToDatabase();
    Cron.startCronTasks();
    startServer();
  } catch (_error) {
    logger.error(`Fallo crítico: No se pudo conectar a la base de datos. Detalles: ${_error}`);
  }
})();

app.use(errorHandler);

// app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
//   logger.error(err.stack || 'Error sin stack');
//   res.status(500).send({ error: 'Algo salió mal, por favor intente de nuevo más tarde.' });
// });

// app.use((req: Request, res: Response) => {
//   res.status(404).send({ error: 'Recurso no encontrado' });
// });

export default app;