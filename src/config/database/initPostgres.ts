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

import { exec } from 'child_process';
import sequelize from './sequelize';
import initSeed from '../../seeders/init.seed';
import logger from '../logger';

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
    console.log('Ejecutando seeders...');
    await initSeed();
    logger.info('Seeders ejecutados con éxito.');
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
      console.log('Tablas sincronizadas en desarrollo.');
      await runSeeders();
      console.log('Seed ejecutado correctamente.');      
    } else if (env === 'production') {
      const tablesExist = await checkIfTablesExist();
      if (!tablesExist) {
        console.log('Ejecutando migración inicial en producción...');
        await runSpecificMigration('20241109000000-dummy.js');
      } else {
        console.log('Migraciones ya aplicadas. No se requieren nuevas migraciones.');
      }
    }
  } catch (err) {
    logger.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
    logger.info('Conexión cerrada en la inicialización de Postgres.');
    process.exit(0);
  }
};

initDatabase();
