import cron, { ScheduledTask } from 'node-cron';
import { Op } from 'sequelize';
import sequelize from '../config/database/sequelize';
import fs from 'fs';
import logger from './logger';

import AuditoriaCambio from '../models/AuditoriaCambio';
import AuditoriaRepertorio from '../models/AuditoriaRepertorio';
import AuditoriaSesion from '../models/AuditoriaSesion';
import Cashflow from '../models/Cashflow';
import CashflowMaestro from '../models/CashflowMaestro';
import CashflowLiquidacion from '../models/CashflowLiquidacion';
import CashflowPago from '../models/CashflowPago';
import CashflowRechazo from '../models/CashflowRechazo';
import CashflowTraspaso from '../models/CashflowTraspaso';
import Conflicto from '../models/Conflicto';
import ConflictoParte from '../models/ConflictoParte';
import Fonograma from '../models/Fonograma';
import FonogramaArchivo from '../models/FonogramaArchivo';
import FonogramaEnvio from '../models/FonogramaEnvio';
import FonogramaMaestro from '../models/FonogramaMaestro';
import FonogramaParticipacion from '../models/FonogramaParticipacion';
import FonogramaTerritorioMaestro from '../models/FonogramaTerritorioMaestro';
import Productora from '../models/Productora';
import Usuario from '../models/Usuario';
import UsuarioMaestro from '../models/UsuarioMaestro';
import UsuarioRol from '../models/UsuarioRol';
import UsuarioVistaMaestro from '../models/UsuarioVistaMaestro';

import { actualizarDominioPublicoGlobal } from '../utils/checkModels';
import { registrarAuditoria } from '../services/auditService';



// Almacena todas las tareas cron y su estado
const tasks: { name: string; task: ScheduledTask; active: boolean }[] = [];

// TAREA: Actualización de dominio público
const domainUpdateTask = cron.schedule('0 0 * * *', async () => {

  try {
    logger.info('Ejecutando actualización de dominio público...');
    await actualizarDominioPublicoGlobal(Fonograma, AuditoriaCambio);
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

// TAREA: Actualización de conflictos a VENCIDO si se excedió la fecha_vencimiento
const updateExpiredConflictsTask = cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Ejecutando actualización de conflictos vencidos...');

    // Buscar conflictos que NO sean VENCIDO, CERRADO o PENDIENTE CAPIF
    const conflictosVencidos = await Conflicto.findAll({
      where: {
        estado_conflicto: {
          [Op.notIn]: ['VENCIDO', 'CERRADO', 'PENDIENTE CAPIF'],
        },
        fecha_fin_conflicto: null,
      },
    });

    let conflictosActualizados = 0;

    for (const conflicto of conflictosVencidos) {
      if (conflicto.isVencido()) {
        await conflicto.update({ estado_conflicto: 'VENCIDO' });

        await registrarAuditoria({
          usuario_originario_id: null,
          usuario_destino_id: null,
          modelo: "Conflicto",
          tipo_auditoria: "SISTEMA",
          detalle: `El conflicto con ID ${conflicto.id_conflicto} ha sido actualizado a VENCIDO.`,          
        });

        conflictosActualizados++;
      }
    }

    if (conflictosActualizados === 0) {
      logger.info('No se encontraron conflictos vencidos para actualizar.');
    } else {
      logger.info(`Se actualizaron ${conflictosActualizados} conflictos a VENCIDO.`);
    }
  } catch (error) {
    logger.error('Error al actualizar conflictos vencidos:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
});

// Agregar la tarea al arreglo con su estado
tasks.push({ name: 'updateExpiredConflictsTask', task: updateExpiredConflictsTask, active: true });

// TAREA: Eliminación de usuarios deshabilitados después de X días
const userCleanupTask = cron.schedule('0 0 * * *', async () => {
  const depurarDays = parseInt(process.env.USER_DEPURAR_DAYS || '30', 10);
  const deshabilitarDays = parseInt(process.env.USER_DESHABILITAR_DAYS || '30', 10);
  const cleanupDays = parseInt(process.env.USER_CLEANUP_DAYS || '30', 10);

  const depurarThreshold = new Date();
  depurarThreshold.setDate(depurarThreshold.getDate() - depurarDays);

  const deshabilitarThreshold = new Date();
  deshabilitarThreshold.setDate(deshabilitarThreshold.getDate() - deshabilitarDays);

  const cleanupThreshold = new Date();
  cleanupThreshold.setDate(cleanupThreshold.getDate() - cleanupDays);

  try {
    logger.info(`Ejecutando actualización de estado y limpieza de usuarios...`);

    // PASAR A DEPURAR: Usuarios que NO están en HABILITADO, DESHABILITADO o DEPURAR después de USER_DEPURAR_DAYS
    const usuariosParaDepurar = await Usuario.findAll({
      where: {
        tipo_registro: { [Op.notIn]: ['HABILITADO', 'DESHABILITADO', 'DEPURAR'] },
        fecha_ultimo_cambio_registro: { [Op.lt]: depurarThreshold },
      },
    });

    for (const usuario of usuariosParaDepurar) {
      await usuario.update({ tipo_registro: 'DEPURAR' });
      await registrarAuditoria({
        usuario_originario_id: null,
        usuario_destino_id: usuario.id_usuario,
        modelo: "Usuario",
        tipo_auditoria: "SISTEMA",
        detalle: `El usuario ${usuario.email} fue pasado a DEPURAR.`,        
      });
      logger.info(`Usuario ${usuario.email} cambiado a DEPURAR.`);
    }

    // PASAR A DESHABILITADO: Usuarios que llevan USER_DESHABILITAR_DAYS en DEPURAR
    const usuariosParaDeshabilitar = await Usuario.findAll({
      where: {
        tipo_registro: 'DEPURAR',
        fecha_ultimo_cambio_registro: { [Op.lt]: deshabilitarThreshold },
      },
    });

    for (const usuario of usuariosParaDeshabilitar) {
      await usuario.update({ tipo_registro: 'DESHABILITADO' });
      await registrarAuditoria({
        usuario_originario_id: null,
        usuario_destino_id: usuario.id_usuario,
        modelo: "Usuario",
        tipo_auditoria: "SISTEMA",
        detalle: `El usuario ${usuario.email} fue pasado a DESHABILITADO.`,        
      });
      logger.info(`Usuario ${usuario.email} cambiado a DESHABILITADO.`);
    }

    // ELIMINAR USUARIOS DESHABILITADOS DESPUÉS DE USER_CLEANUP_DAYS
    const usuariosParaEliminar = await Usuario.findAll({
      where: {
        tipo_registro: 'DESHABILITADO',
        fecha_ultimo_cambio_registro: { [Op.lt]: cleanupThreshold },
      },
    });

    if (usuariosParaEliminar.length === 0) {
      logger.info('No se encontraron usuarios deshabilitados para eliminar.');
      return;
    }

    for (const usuario of usuariosParaEliminar) {
      // Obtener el rol del usuario
      const usuarioRol = await UsuarioRol.findByPk(usuario.rol_id);
      
      if (usuarioRol?.nombre_rol === 'productor_principal') {
        // Obtener la relación con UsuarioMaestro y Productora
        const usuarioMaestro = await UsuarioMaestro.findOne({ where: { usuario_id: usuario.id_usuario } });
        const productoraId = usuarioMaestro ? usuarioMaestro.productora_id : null;

        if (!productoraId) {
          logger.warn(`El usuario deshabilitado ${usuario.email} no tiene una productora vinculada.`);
          continue;
        }

        // Eliminar referencias de la productora
        await eliminarReferenciasProductora(productoraId);
      }

      // Eliminar registros de auditoría antes de eliminar el usuario
      await AuditoriaCambio.destroy({ where: { usuario_originario_id: usuario.id_usuario } });
      await AuditoriaCambio.destroy({ where: { usuario_destino_id: usuario.id_usuario } });
      await AuditoriaRepertorio.destroy({ where: { usuario_registrante_id: usuario.id_usuario } });
      await AuditoriaSesion.destroy({ where: { usuario_registrante_id: usuario.id_usuario } });

      // Eliminar relaciones y usuario
      await UsuarioVistaMaestro.destroy({ where: { usuario_id: usuario.id_usuario } });
      await UsuarioMaestro.destroy({ where: { usuario_id: usuario.id_usuario } });
      await usuario.destroy();

      // Registrar en la auditoría la eliminación del usuario
      await registrarAuditoria({
        usuario_originario_id: null,
        usuario_destino_id: usuario.id_usuario,
        modelo: "Usuario",
        tipo_auditoria: "SISTEMA",
        detalle: `Se eliminó el usuario ${usuario.email} y todas sus referencias.`,        
      });

      logger.info(`Usuario eliminado: ${usuario.email}`);
    }

    logger.info('Limpieza de usuarios deshabilitados completada.');

  } catch (error) {
    logger.error('Error en la limpieza de usuarios deshabilitados:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
});

// Función para eliminar referencias de una productora en todas las tablas relacionadas
async function eliminarReferenciasProductora(productoraId: string) {
  const transaction = await sequelize.transaction();

  try {
    // Verificar si la productora existe antes de intentar eliminar
    const productoraExiste = await Productora.findByPk(productoraId);
    if (!productoraExiste) {
      await transaction.rollback();
      return;
    }

    // Eliminar todos los registros relacionados con Fonograma antes de eliminar la productora
    const fonogramas = await Fonograma.findAll({ where: { productora_id: productoraId }, transaction });

    for (const fonograma of fonogramas) {
      const fonogramaId = fonograma.id_fonograma;

      // Eliminar archivos físicos del fonograma antes de eliminar los registros en BD
      const archivos = await FonogramaArchivo.findAll({ where: { fonograma_id: fonogramaId }, transaction });
      for (const archivo of archivos) {
        const rutaArchivo = archivo.ruta_archivo_audio;
        if (fs.existsSync(rutaArchivo)) {
          fs.unlinkSync(rutaArchivo);
        }
      }

      // Eliminar registros en el orden correcto
      await FonogramaArchivo.destroy({ where: { fonograma_id: fonogramaId }, transaction });
      await FonogramaEnvio.destroy({ where: { fonograma_id: fonogramaId }, transaction });
      await FonogramaMaestro.destroy({ where: { fonograma_id: fonogramaId }, transaction });
      await FonogramaTerritorioMaestro.destroy({ where: { fonograma_id: fonogramaId }, transaction });

      // Obtener y eliminar todas las participaciones del fonograma
      const participaciones = await FonogramaParticipacion.findAll({ where: { fonograma_id: fonogramaId }, transaction });

      for (const participacion of participaciones) {
        await ConflictoParte.destroy({ where: { participacion_id: participacion.id_participacion }, transaction });
      }

      // Eliminar las participaciones y el fonograma
      await FonogramaParticipacion.destroy({ where: { fonograma_id: fonogramaId }, transaction });
      await Fonograma.destroy({ where: { id_fonograma: fonogramaId }, transaction });
    }

    // Eliminar todos los registros relacionados con ConflictoParte y Conflicto
    const participaciones = await FonogramaParticipacion.findAll({ where: { productora_id: productoraId }, transaction });
    for (const participacion of participaciones) {
      await ConflictoParte.destroy({ where: { participacion_id: participacion.id_participacion }, transaction });
    }

    await Conflicto.destroy({ where: { productora_id: productoraId }, transaction });

    // Eliminar todos los registros relacionados con Cashflow antes de eliminar la productora
    const cashflows = await Cashflow.findAll({ where: { productora_id: productoraId }, transaction });

    for (const cashflow of cashflows) {
      const cashflowId = cashflow.id_cashflow;

      // Obtener todas las transacciones en CashflowMaestro relacionadas con este Cashflow
      const transacciones = await CashflowMaestro.findAll({ where: { cashflow_id: cashflowId }, transaction });

      for (const transaccion of transacciones) {
        // Eliminar registros en el orden correcto
        await CashflowLiquidacion.destroy({ where: { cashflow_maestro_id: transaccion.id_transaccion }, transaction });
        await CashflowPago.destroy({ where: { cashflow_maestro_id: transaccion.id_transaccion }, transaction });
        await CashflowRechazo.destroy({ where: { cashflow_maestro_id: transaccion.id_transaccion }, transaction });
        await CashflowTraspaso.destroy({ where: { cashflow_maestro_id: transaccion.id_transaccion }, transaction });
      }

      // Eliminar las transacciones en CashflowMaestro
      await CashflowMaestro.destroy({ where: { cashflow_id: cashflowId }, transaction });

      // Finalmente, eliminar el Cashflow
      await Cashflow.destroy({ where: { id_cashflow: cashflowId }, transaction });
    }

    // Ahora eliminar el resto de las referencias de la productora en otras tablas
    const tablasRelacionadas = [
      'ProductoraDocumento',
      'ProductoraISRC',
      'ProductoraMensaje',
      'ProductoraPremio',
    ];

    for (const tabla of tablasRelacionadas) {
      try {
        await sequelize.query(
          `DELETE FROM ${tabla} WHERE productora_id = :productoraId`,
          { replacements: { productoraId }, transaction }
        );
      } catch (error) {
        logger.warn(`No se pudo eliminar referencias en ${tabla} para productora ID: ${productoraId}`);
      }
    }

    // Finalmente, eliminar la Productora
    await Productora.destroy({ where: { id_productora: productoraId }, transaction });

    await transaction.commit();
    logger.info(`Referencias eliminadas para productora ID: ${productoraId}`);

  } catch (error) {
    await transaction.rollback();
    logger.error(`Error eliminando referencias de la productora ID: ${productoraId}`, {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

// Agregar la tarea al arreglo con su estado
tasks.push({ name: 'userCleanupTask', task: userCleanupTask, active: true });

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