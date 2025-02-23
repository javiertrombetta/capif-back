import dotenv from 'dotenv';
import logger from '../logger';

const env = process.env.NODE_ENV;

// Registrar información del entorno detectado
logger.info(`[INIT POSTGRES] Entorno detectado: ${env}`);

// Cargar variables de entorno según el entorno
if (env === 'development') {
  logger.info('[INIT POSTGRES] Cargando variables de entorno desde .env.dev.local...');
  dotenv.config({ path: '.env.dev.local' });

} else if (env === 'production.local') {
  logger.info('[INIT POSTGRES] Cargando variables de entorno desde .env.prod.local...');
  dotenv.config({ path: '.env.prod.local' });

} else if (env === 'production.remote') {
  logger.info('[INIT POSTGRES] Utilizando variables de entorno de la nube (Digital Ocean)');

} else {
  logger.error(`[INIT POSTGRES] ERROR: El entorno ${env} no está definido. Abortando.`);
  process.exit(1);
}

// Función para verificar que las variables críticas existen
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'ADMIN_PRINCIPAL_EMAIL',
  'ADMIN_PRINCIPAL_PASSWORD',
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  logger.error(`[INIT POSTGRES] ERROR: Las siguientes variables de entorno son requeridas pero no están definidas: ${missingVars.join(', ')}`);
  process.exit(1); 
}

// import { exec } from 'child_process';
// import util from 'util';
import sequelize from './sequelize';
import initSeed from '../../seeders/init.seed';
import usersSeed from '../../seeders/usuarios.seed';
import producersSeed from '../../seeders/productoras.seed';
import repertoiresSeed from '../../seeders/fonogramas.seed';
import conflictsSeed from '../../seeders/conflictos.seed';

// const execPromise = util.promisify(exec);

// const runSpecificMigration = async (migrationFile: string): Promise<void> => {
//   try {
//     const { stdout, stderr } = await execPromise(`npx sequelize-cli db:migrate --to ${migrationFile}`, { env: process.env });
//     if (stderr) throw new Error(stderr);
//     logger.info(`Migración específica ejecutada exitosamente: ${stdout}`);

//   } catch (error:any) {
//     logger.error(`Error ejecutando la migración específica: ${error.message}`);
//     throw error;
//   }
// };

// const checkIfTablesExist = async (): Promise<boolean> => {
//   try {
//     const { stdout } = await execPromise('npx sequelize-cli db:migrate:status', { env: process.env });
//     return stdout.includes('up');

//   } catch (error:any) {
//     logger.error(`Error verificando el estado de migraciones: ${error.message}`);
//     throw error;
//   }
// };

const runSeeders = async (): Promise<void> => {
  try {
    logger.info('[INIT POSTGRES] Ejecutando seeders...');
    await initSeed();
    await usersSeed();
    await producersSeed();
    await repertoiresSeed();
    await conflictsSeed();
    logger.info('[INIT POSTGRES] Seeders ejecutados exitosamente.');

  } catch (error) {
    logger.error('[INIT POSTGRES] Error al ejecutar los seeders:', error);
    throw error;
  }
};

const resetDatabase = async (): Promise<void> => {
  try {
    logger.info('[INIT POSTGRES] Eliminando todas las tablas de la base de datos...');
   
    await sequelize.query(`
      DO $$ 
      DECLARE 
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `);

    logger.info('[INIT POSTGRES] Tablas eliminadas correctamente.');

    logger.info('[INIT POSTGRES] Sincronizando modelos nuevamente...');
    await sequelize.sync();

    logger.info('[INIT POSTGRES] Modelos sincronizados correctamente.');
    await runSeeders();

  } catch (error) {
    logger.error('[INIT POSTGRES] Error al reiniciar la base de datos:', error);
    throw error;
  }
};

const initDatabase = async (): Promise<void> => {
  try {

    logger.info('[INIT POSTGRES] Verificando conexión con la base de datos...');
    await sequelize.authenticate();
    logger.info('[INIT POSTGRES] Conexión a la base de datos establecida correctamente.');

    if (env === 'development' || env === 'production.local' || env === 'production.remote') {      
      await resetDatabase();
    } 
    // else {
    //   const tablesExist = await checkIfTablesExist();
    //   if (!tablesExist) {
    //     logger.info('[INIT POSTGRES] Ejecutando migración inicial en producción...');
    //     await runSpecificMigration('20241109000000-dummy.js');

    //   } else {
    //     logger.info('[INIT POSTGRES] Migraciones ya aplicadas. No se requieren nuevas migraciones.');
    //   }
    // }
  } catch (error) {
    logger.error('[INIT POSTGRES] Error al inicializar la base de datos:', error);
    throw error;

  } finally {
    try {
      await sequelize.close();
      logger.info('[INIT POSTGRES] Conexión cerrada correctamente en la inicialización de Postgres.');
      process.exit(0);

    } catch (error) {
      logger.error('[INIT POSTGRES] Error al cerrar la conexión:', error);
    }
  }
};

(async () => {
  try {
    await initDatabase();

  } catch (error) {
    logger.error('[INIT POSTGRES] Error crítico durante la inicialización:', error);
    process.exit(1);
  }
})();