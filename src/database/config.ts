import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../config/logger';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE || '',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_SERVER || 'localhost',
    dialect: 'mssql',
    port: Number(process.env.DB_PORT) || 1433,
    logging: (msg) => logger.info(msg),
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    },
  }
);

sequelize
  .authenticate()
  .then(() => logger.info('Conectado a la base de datos'))
  .catch((err) => logger.error('Error de conexión a la base de datos:', err));

export default sequelize;
