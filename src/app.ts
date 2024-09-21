import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import router from './routes';
import sequelize from './config/database/sequelize';
import logger from './config/logger';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(cors());
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

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión exitosa a la base de datos');

    await sequelize.sync({ alter: true });
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

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack || 'Error sin stack');
  res.status(500).send({ error: 'Algo salió mal, por favor intente de nuevo más tarde.' });
});

app.use((req: Request, res: Response) => {
  res.status(404).send({ error: 'Recurso no encontrado' });
});

export default app;
