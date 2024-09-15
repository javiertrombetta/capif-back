import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import logger from '../config/logger';

dotenv.config();

const schemaFilePath = path.resolve(__dirname, '../../src/database/schema.sql');

let schema = '';
try {
  schema = fs.readFileSync(schemaFilePath, 'utf-8');
} catch (err) {
  logger.error(`Error al leer el archivo de esquema en ${schemaFilePath}:`, err);
  process.exit(1);
}

const dbConfig = {
  database: process.env.DB_NAME || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
};

const initDatabase = async () => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    logger.info('Conexión exitosa a la base de datos');

    const res = await client.query('SELECT to_regclass(\'public.rol\');');

    if (!res.rows[0].to_regclass) {
      logger.info('Base de datos no encontrada, inicializando...');
      await client.query(schema);
      logger.info('Base de datos inicializada correctamente');
    } else {
      logger.info('Base de datos ya existe, no se requiere inicialización');
    }
  } catch (err) {
    logger.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
};

initDatabase();
