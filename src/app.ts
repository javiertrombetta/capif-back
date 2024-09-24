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
import { errors as celebrateErrors } from 'celebrate';

const app = express();
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(
  cors({
    // origin: 'http://tu-dominio-frontend.com',
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

app.use('/api', router);

app.use(errorHandler);

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión exitosa a la base de datos');

    // await sequelize.sync({ alter: true });
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

  const gracefulShutdown = () => {
    logger.info('Apagado del servidor en curso...');
    server.close(() => {
      sequelize.close().then(() => {
        logger.info('Conexiones cerradas correctamente');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

(async () => {
  try {
    await connectToDatabase();
    startServer();
  } catch (_error) {
    logger.error(`Fallo crítico: No se pudo conectar a la base de datos. Detalles: ${_error}`);
  }
})();

app.use(celebrateErrors());

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack || 'Error sin stack');
  res.status(500).send({ error: 'Algo salió mal, por favor intente de nuevo más tarde.' });
});

app.use((req: Request, res: Response) => {
  res.status(404).send({ error: 'Recurso no encontrado' });
});

console.log('Variables de entorno cargadas:');
console.log({
  PORT: process.env.PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  TZ: process.env.TZ,
  FRONTEND_URL: process.env.FRONTEND_URL,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
});

export default app;
