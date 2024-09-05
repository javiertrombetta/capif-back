import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('database_name', 'username', 'password', {
  host: 'localhost',
  dialect: 'mssql',
  port: 1433,
  logging: false,
});

export default sequelize;
