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
import util from 'util';
import sequelize from './sequelize';
import initSeed from '../../seeders/init.seed';
import usersSeed from '../../seeders/usuarios.seed';
import producersSeed from '../../seeders/productoras.seed';

const execPromise = util.promisify(exec);

const runSpecificMigration = async (migrationFile: string): Promise<void> => {
  try {
    const { stdout, stderr } = await execPromise(`npx sequelize-cli db:migrate --to ${migrationFile}`, { env: process.env });
    if (stderr) throw new Error(stderr);
    logger.info(`Migración específica ejecutada exitosamente: ${stdout}`);

  } catch (error:any) {
    logger.error(`Error ejecutando la migración específica: ${error.message}`);
    throw error;
  }
};

const checkIfTablesExist = async (): Promise<boolean> => {
  try {
    const { stdout } = await execPromise('npx sequelize-cli db:migrate:status', { env: process.env });
    return stdout.includes('up');

  } catch (error:any) {
    logger.error(`Error verificando el estado de migraciones: ${error.message}`);
    throw error;
  }
};

const runSeeders = async (): Promise<void> => {
  try {
    logger.info('Ejecutando seeders...');
    await initSeed();
    await usersSeed();
    await producersSeed();
    logger.info('Seeders ejecutados exitosamente.');

  } catch (error) {
    logger.error('Error al ejecutar los seeders:', error);
    throw error;
  }
};

const initDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión exitosa a la base de datos.');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      logger.info('Modelos sincronizados con la base de datos.');
      await runSeeders();

    } else if (process.env.NODE_ENV === 'production') {
      const tablesExist = await checkIfTablesExist();
      if (!tablesExist) {
        logger.info('Ejecutando migración inicial en producción...');
        await runSpecificMigration('20241109000000-dummy.js');

      } else {
        logger.info('Migraciones ya aplicadas. No se requieren nuevas migraciones.');
      }
    }
  } catch (error) {
    logger.error('Error al inicializar la base de datos:', error);
    throw error;

  } finally {
    try {
      await sequelize.close();
      logger.info('Conexión cerrada correctamente en la inicialización de Postgres.');
      process.exit(0);

    } catch (error) {
      logger.error('Error al cerrar la conexión:', error);
    }
  }
};

(async () => {
  try {
    await initDatabase();

  } catch (error) {
    logger.error('Error crítico durante la inicialización:', error);
    process.exit(1);
  }
})();
