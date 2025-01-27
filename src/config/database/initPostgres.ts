import dotenv from 'dotenv';
import logger from '../logger';

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  logger.info('Cargando variables de entorno desde .env.dev.local...');
  dotenv.config({ path: '.env.dev.local' });
} else if (env === 'production.local') {
  logger.info('Cargando variables de entorno desde .env.prod.local...');
  dotenv.config({ path: '.env.prod.local' });
} else if (env === 'production.remote') {
  logger.info('Cargando variables de entorno desde .env.prod.remote...');
  dotenv.config({ path: '.env.prod.remote' });
} else {
  logger.warn(
    `El entorno ${env} no está definido. Cargando las variables de entorno por defecto...`
  );
  dotenv.config();
}

import { exec } from 'child_process';
import sequelize from './sequelize';
import initSeed from '../../seeders/init.seed';
import usersSeed from '../../seeders/usuarios.seed';
import producersSeed from '../../seeders/productoras.seed';

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

const runSeeders = async () => {  
  try {
    logger.info('Ejecutando seeders...');
    await initSeed();
    await usersSeed();
    await producersSeed();
  } catch (error) {
    logger.error('Error al ejecutar los seeders:', error);
    throw error;
  }
};

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión exitosa a la base de datos');

    if (env === 'development') {
      await sequelize.sync();
      logger.info('Modelos sincronizados con la base de datos');
      await runSeeders();
      logger.info('Todos los seed fueron ejecutados correctamente.');
    } else if (env === 'production') {
      const tablesExist = await checkIfTablesExist();
      if (!tablesExist) {
        logger.info('Ejecutando migración inicial en producción...');
        await runSpecificMigration('20241109000000-dummy.js');
      } else {
        logger.info('Migraciones ya aplicadas. No se requieren nuevas migraciones.');
      }
    }

  } catch (err) {
    logger.error('Error al inicializar la base de datos:', err);
    return;
    
  } finally {
    await sequelize.close();
    logger.info('Conexión cerrada correctamente en la inicialización de Postgres.');
    return;
  }
};

initDatabase();
