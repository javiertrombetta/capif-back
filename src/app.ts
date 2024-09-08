import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes';
import sequelize from './database/config';
import logger from './config/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api', router);

sequelize
  .authenticate()
  .then(() => {
    logger.info('Conectado a la base de datos');
  })
  .catch((err) => {
    logger.error('Error de conexión a la base de datos:', err);
  });

export default app;
