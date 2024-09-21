import { Sequelize } from 'sequelize';
import logger from '../logger';

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  console.log('Cargando variables de entorno con dotenv en modo desarrollo...');
  require('dotenv').config({ path: '.env.dev.local' });
}

console.log('ENVIROMENT | NODE_ENV:', process.env.NODE_ENV);
console.log('ENVIROMENT | DB_HOST:', process.env.DB_HOST);
console.log('ENVIROMENT | DB_USER:', process.env.DB_USER);
console.log('ENVIROMENT | DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('ENVIROMENT | DB_PORT:', process.env.DB_PORT);

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

export default sequelize;
