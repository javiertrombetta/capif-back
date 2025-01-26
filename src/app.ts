import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  console.log('Cargando variables de entorno desde .env.dev.local...');
  dotenv.config({ path: '.env.dev.local' });
} else if (env === 'production.local') {
  console.log('Cargando variables de entorno desde .env.prod.local...');
  dotenv.config({ path: '.env.prod.local' });
} else if (env === 'production.remote') {
  console.log('Cargando variables de entorno desde .env.prod.remote...');
  dotenv.config({ path: '.env.prod.remote' });
} else {
  console.log(
    `El entorno ${env} no está definido. Cargando las variables de entorno por defecto...`
  );
  dotenv.config();
}
import * as Cron from './config/cron';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler';
import router from './routes';
import sequelize from './config/database/sequelize';
import logger from './config/logger';
import { setupSwagger } from './config/swagger';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const globalPrefix = process.env.GLOBAL_PREFIX || 'api/v1';

// Definir y verificar UPLOAD_DIR
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Directorio creado en ${UPLOAD_DIR}`);
} else {
  console.log(`Directorio existente en ${UPLOAD_DIR}`);
}

app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
);
app.use(express.json());
app.use(limiter);

const isProduction = process.env.NODE_ENV === 'production';
const skipSuccessLogs = (req: Request, res: Response) => res.statusCode < 400;

app.use(
  morgan(isProduction ? 'tiny' : 'combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
    skip: skipSuccessLogs,
  })
);

// if (env === 'development') {
//   setupSwagger(app); // Swagger solo disponible en entorno de desarrollo
// }

setupSwagger(app);

app.use(`/${globalPrefix}`, router);

app.use(errorHandler);

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión exitosa a la base de datos');

    await sequelize.sync();
    logger.info('Modelos sincronizados con la base de datos');
  } catch (err) {
    logger.error('Error de conexión o sincronización con la base de datos:', err);
    throw new Error('Error de conexión con la base de datos');
  }
};

const startServer = () => {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    logger.info(`Servidor corriendo en el puerto ${port}`);
  });

  const gracefulShutdown = async () => {
    logger.info('Apagado del servidor en curso...');
    Cron.stopCronTasks();

    // Cierra el servidor y espera a que todas las solicitudes se completen
    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info('Servidor cerrado.');
        resolve();
      });
    });

    // Cierra Sequelize y otros recursos
    try {
      await sequelize.close();
      logger.info('Conexiones cerradas correctamente');
      return;
    } catch (error) {
      logger.error('Error cerrando conexiones:', error);
      return;
    }
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
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

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack || 'Error sin stack');
  res.status(500).send({ error: 'Algo salió mal, por favor intente de nuevo más tarde.' });
});

app.use((req: Request, res: Response) => {
  res.status(404).send({ error: 'Recurso no encontrado' });
});

export default app;