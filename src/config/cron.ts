import cron from 'node-cron';
import { actualizarDominioPublicoGlobal } from '../services/checkModels';
import Fonograma from '../models/Fonograma';

// is_dominio_publico
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Ejecutando actualización de dominio público...');
    await actualizarDominioPublicoGlobal(Fonograma);
    console.log('Actualización de dominio público completada.');
  } catch (error) {
    console.error('Error al actualizar dominio público:', error);
  }
});
