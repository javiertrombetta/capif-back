import { Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';

const sequelize = new Sequelize(
  process.env.DB_NAME || '',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    logging: false,
  }
);

sequelize.addHook('beforeCreate', (instance: any) => {
  if (!instance.id) {
    instance.id = uuidv4();
  }
});

sequelize.addHook('beforeBulkCreate', (instances: any[]) => {
  instances.forEach((instance) => {
    if (!instance.id) {
      instance.id = uuidv4();
    }
  });
});

export default sequelize;
