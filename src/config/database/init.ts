import { exec } from 'child_process';
import sequelize from './sequelize';
import logger from '../logger';

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  console.log('Cargando variables de entorno con dotenv en modo desarrollo...');
  const dotenv = require('dotenv');
  dotenv.config();
}

const runSpecificMigration = (migrationFile: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    exec(
      `npx sequelize-cli db:migrate --to ${migrationFile}`,
      { env: process.env },
      (error, stdout, stderr) => {
        if (error) {
          logger.error(
            `Error ejecutando la migración específica: ${error.message}\nStack: ${error.stack}\nStderr: ${stderr}`
          );
          return reject(
            new Error(`Error ejecutando la migración específica: ${stderr || error.message}`)
          );
        }
        if (stderr) {
          logger.warn(`Advertencia durante la ejecución de la migración: ${stderr}`);
          return reject(new Error(`Advertencia durante la migración: ${stderr}`));
        }
        logger.info(`Migración específica ejecutada exitosamente: ${stdout}`);
        resolve();
      }
    );
  });
};

const checkIfTablesExist = (): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    exec('npx sequelize-cli db:migrate:status', { env: process.env }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Error verificando el estado de migraciones: ${stderr || error.message}`);
        return reject(
          new Error(`Error verificando el estado de migraciones: ${stderr || error.message}`)
        );
      }
      if (stdout.includes('up')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión exitosa a la base de datos');

    const tablesExist = await checkIfTablesExist();
    if (!tablesExist) {
      logger.info('No se encontraron migraciones, ejecutando migración para crear tablas...');
      try {
        await runSpecificMigration('20240918120000-create-tables.js');
        logger.info('Migración de creación de tablas ejecutada correctamente.');
        process.exit(0);
      } catch (error) {
        logger.error('Error ejecutando la migración de creación de tablas:', error);
        process.exit(1);
      }
    } else {
      logger.info('Las tablas ya existen. No es necesario ejecutar migraciones.');
      process.exit(0);
    }
  } catch (err) {
    logger.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

initDatabase();
