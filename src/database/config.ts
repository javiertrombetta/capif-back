import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../config/logger';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || '',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    logging: (msg) => logger.info(msg),
  }
);

sequelize
  .authenticate()
  .then(() => logger.info('Conectado a la base de datos'))
  .catch((err) => logger.error('Error de conexión a la base de datos:', err));

export default sequelize;