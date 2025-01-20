import cron from 'node-cron';
import { actualizarDominioPublicoGlobal } from '../utils/checkModels';
import Fonograma from '../models/Fonograma';
import logger from './logger';

// is_dominio_publico
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Ejecutando actualización de dominio público...');
    await actualizarDominioPublicoGlobal(Fonograma);
    logger.info('Actualización de dominio público completada.');
  } catch (error) {
    logger.error('Error al actualizar dominio público:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
});
