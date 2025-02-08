import dotenv from 'dotenv';
import logger from '../logger';
import { exec } from 'child_process';
import util from 'util';
import sequelize from './sequelize';
import initSeed from '../../seeders/init.seed';
import usersSeed from '../../seeders/usuarios.seed';
import producersSeed from '../../seeders/productoras.seed';

// Promisificar exec para ejecutar comandos de CLI
const execPromise = util.promisify(exec);

// 🔹 Cargar variables de entorno según el entorno
(() => {
  const env = process.env.NODE_ENV || 'development';
  const envFile =
    env === 'production.local'
      ? '.env.prod.local'
      : env === 'production.remote'
      ? '.env.prod.remote'
      : '.env.dev.local';

  logger.info(`Cargando variables de entorno desde ${envFile}...`);
  dotenv.config({ path: envFile });
})();

// 🔹 Verificar si hay migraciones aplicadas
const checkIfTablesExist = async (): Promise<boolean> => {
  try {
    const { stdout } = await execPromise('npx sequelize-cli db:migrate:status', { env: process.env });
    return stdout.includes('up');
  } catch (error: any) {
    logger.error(`Error verificando el estado de migraciones: ${error.message}`);
    return false;
  }
};

// 🔹 Ejecutar una migración específica si es necesario
const runSpecificMigration = async (migrationFile: string): Promise<void> => {
  try {
    const { stdout, stderr } = await execPromise(`npx sequelize-cli db:migrate --to ${migrationFile}`, { env: process.env });
    if (stderr) throw new Error(stderr);
    logger.info(`Migración específica ejecutada exitosamente: ${stdout}`);
  } catch (error: any) {
    logger.error(`Error ejecutando la migración específica: ${error.message}`);
    throw error;
  }
};

// 🔹 Ejecutar los seeders
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

// 🔹 Inicializar la base de datos
const initDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión exitosa a la base de datos.');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      logger.info('🔄 Modelos sincronizados con la base de datos.');
      await runSeeders();
    } else if (process.env.NODE_ENV?.startsWith('production')) {
      const tablesExist = await checkIfTablesExist();
      if (!tablesExist) {
        logger.info(`🚀 Ejecutando migración inicial en ${process.env.NODE_ENV}...`);
        await runSpecificMigration('20241109000000-dummy.js');
      } else {
        logger.info(`✅ Migraciones ya aplicadas en ${process.env.NODE_ENV}. No se requieren nuevas migraciones.`);
      }
    }
  } catch (error) {
    logger.error('Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    try {
      await sequelize.close();
      logger.info('🔌 Conexión cerrada correctamente en la inicialización de Postgres.');
      process.exit(0);
    } catch (error) {
      logger.error('Error al cerrar la conexión:', error);
    }
  }
};

// 🔹 Asegurar que solo se ejecuta cuando es llamado directamente
if (require.main === module) {
  (async () => {
    try {
      logger.info('Iniciando inicialización manual de la base de datos...');
      await initDatabase();
      logger.info('Base de datos inicializada correctamente.');
    } catch (error) {
      logger.error('Error crítico durante la inicialización:', error);
      process.exit(1);
    }
  })();
}