import cron, { ScheduledTask } from 'node-cron';
import { actualizarDominioPublicoGlobal } from '../utils/checkModels';
import Fonograma from '../models/Fonograma';
import logger from './logger';

// Almacena todas las tareas cron y su estado
const tasks: { name: string; task: ScheduledTask; active: boolean }[] = [];

// Tarea: Actualización de dominio público
const domainUpdateTask = cron.schedule('0 0 * * *', async () => {
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

// Agregar la tarea al arreglo con su estado
tasks.push({ name: 'domainUpdateTask', task: domainUpdateTask, active: true });

// Función para iniciar todas las tareas cron
export const startCronTasks = () => {
  tasks.forEach((entry) => {
    if (!entry.active) {
      entry.task.start();
      entry.active = true;
      logger.info(`Tarea cron ${entry.name} iniciada.`);
    }
  });
  logger.info('Tareas CRON programadas correctamente.');
};

// Función para detener todas las tareas cron
export const stopCronTasks = () => {
  tasks.forEach((entry) => {
    if (entry.active) {
      entry.task.stop();
      entry.active = false;
      logger.info(`Tarea CRON detenida: ${entry.name}.`);
    }
  });
  logger.info('Todas las tareas CRON fueron detenidas.');
};