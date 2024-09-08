import * as fs from 'fs';
import * as path from 'path';
import * as sql from 'mssql';
import * as dotenv from 'dotenv';
import logger from '../config/logger';

dotenv.config();

const schemaFilePath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaFilePath, 'utf-8');

const dbConfig = {
  user: process.env.DB_USER || 'default_user',
  password: process.env.DB_PASSWORD || 'default_password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'default_db',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const initDatabase = async () => {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    logger.info('Conexión exitosa a la base de datos');

    await pool.request().query(schema);
    logger.info('Base de datos inicializada correctamente');
  } catch (err) {
    logger.error('Error al inicializar la base de datos:', err);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

initDatabase();