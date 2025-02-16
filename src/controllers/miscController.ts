import { Request, Response, NextFunction } from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import logger from '../config/logger';

import { ProductoraDocumentoTipo, FonogramaTerritorio, UsuarioRol, UsuarioVista } from '../models';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { UsuarioResponse } from '../interfaces/UsuarioResponse';
import { getAuthenticatedUser } from '../services/authService';
import { createTerritorioService, deleteTerritorioService, updateStatusService } from '../services/miscService';

export const getTiposDeDocumentos = async (req: Request, res: Response) => {
    try {
        logger.info('Obteniendo todos los tipos de documentos disponibles en la base de datos.');

        const tiposDeDocumentos = await ProductoraDocumentoTipo.findAll({
            attributes: ['id_documento_tipo', 'nombre_documento'],
            order: [['nombre_documento', 'ASC']],
        });

        res.status(200).json({
            message: 'Tipos de documentos obtenidos con éxito',
            data: tiposDeDocumentos,
        });

    } catch (error) {
        logger.error('Error al obtener los tipos de documentos:', error);
        res.status(500).json({
            message: 'Error al obtener los tipos de documentos',
            error: error instanceof Error ? error.message : 'Error desconocido',
        });
    }
};

export const getTerritorios = async (req: Request, res: Response) => {
    try {
        logger.info('Obteniendo todos los territorios disponibles en la base de datos.');

        const territorios = await FonogramaTerritorio.findAll({
            attributes: ['id_territorio', 'nombre_pais', 'codigo_iso', 'is_habilitado'],
            order: [['nombre_pais', 'ASC']],
        });

        res.status(200).json({
            message: 'Territorios obtenidos con éxito',
            data: territorios,
        });

    } catch (error) {
        logger.error('Error al obtener los territorios:', error);
        res.status(500).json({
            message: 'Error al obtener los territorios',
            error: error instanceof Error ? error.message : 'Error desconocido',
        });
    }
};

export const getVistaPorRol = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Verifica el usuario autenticado
        const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);    

        if (!authUser.rol) {
            return res.status(403).json({ message: 'No se pudo determinar el rol del usuario autenticado.' });
        }

        logger.info(`Obteniendo vistas para el rol: ${authUser.rol.nombre_rol}`);

        let rolesPermitidos: string[] = [];

        switch (authUser.rol.nombre_rol) {
            case 'admin_principal':
                // Puede ver todas las vistas
                rolesPermitidos = ['admin_principal', 'admin_secundario', 'productor_principal', 'productor_secundario'];
                break;
            case 'admin_secundario':
                // Puede ver las vistas de admin_secundario, productor_principal y productor_secundario
                rolesPermitidos = ['admin_secundario', 'productor_principal', 'productor_secundario'];
                break;
            case 'productor_principal':
                // Puede ver las vistas de productor_principal y productor_secundario
                rolesPermitidos = ['productor_principal', 'productor_secundario'];
                break;
            case 'productor_secundario':
                // Solo puede ver las vistas de productor_secundario
                rolesPermitidos = ['productor_secundario'];
                break;
            default:
                return res.status(403).json({ message: 'Rol no autorizado.' });
        }

        // Obtener los IDs de los roles permitidos
        const roles = await UsuarioRol.findAll({
            where: { nombre_rol: rolesPermitidos },
            attributes: ['id_rol'],
        });

        const rolesIds = roles.map((rol) => rol.id_rol);

        // Obtener las vistas de los roles permitidos
        const vistas = await UsuarioVista.findAll({
            where: { rol_id: rolesIds },
            attributes: ['id_vista', 'rol_id', 'nombre_vista_superior', 'nombre_vista'],
            order: [['nombre_vista_superior', 'ASC'], ['nombre_vista', 'ASC']],
        });

        res.status(200).json({
            message: 'Vistas obtenidas con éxito',
            data: vistas,
        });

    } catch (error) {
        logger.error('Error al obtener las vistas por rol:', error);
        res.status(500).json({
            message: 'Error al obtener las vistas por rol',
            error: error instanceof Error ? error.message : 'Error desconocido',
        });
    }
};

export const resetDatabase = async (req: Request, res: Response) => {
    try {
        const env = process.env.NODE_ENV;
        let command = '';

        if (env === 'development') {
            logger.info('[RESET DATABASE] Ejecutando `npm run init` en entorno de desarrollo...');
            command = 'npm run init';
        } else if (env === 'production.remote') {
            logger.info('[RESET DATABASE] Ejecutando `npm run postgres:init` en entorno remoto...');
            command = 'npm run postgres:init';
        } else {
            logger.warn(`[RESET DATABASE] Intento de ejecución no autorizado en entorno: ${env}`);
            return res.status(403).json({ message: 'Acceso denegado. Solo puede ejecutarse en development o production.remote.' });
        }

        logger.info('[RESET DATABASE] Iniciando proceso de reinicio...');

        // Responder inmediatamente para evitar timeout en la API
        res.status(202).json({ message: 'Proceso de reinicio iniciado en segundo plano.' });

        // Ejecutar el comando en un proceso separado
        const proceso = spawn(command, { shell: true });

        proceso.stdout.on('data', (data) => {
            logger.info(`[RESET DATABASE] STDOUT: ${data.toString()}`);
        });

        proceso.stderr.on('data', (data) => {
            const output = data.toString();
            if (!/npm notice|npm WARN/.test(output)) {
                logger.error(`[RESET DATABASE] STDERR: ${output}`);
            }
        });

        proceso.on('error', (error) => {
            logger.error(`[RESET DATABASE] Error al ejecutar ${command}: ${error.message}`);
        });

        proceso.on('close', (code) => {
            if (code === 0) {
                logger.info(`[RESET DATABASE] Proceso completado exitosamente en entorno ${env}.`);
            } else {
                logger.error(`[RESET DATABASE] Error en el proceso, código de salida: ${code}`);
            }
        });

    } catch (error) {
        logger.error('[RESET DATABASE] Error inesperado:', error);
        res.status(500).json({
            message: 'Error inesperado al reiniciar la base de datos.',
            error: error instanceof Error ? error.message : 'Error desconocido',
        });
    }
};

export const getLogs = (req: Request, res: Response) => {
  const { level, date, startTime, endTime, search, lines = 100, order = 'desc' } = req.query;

  // 📌 Obtener la fecha en la zona horaria de Argentina (UTC-3)
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
    .format(new Date()); // Formato YYYY-MM-DD

  const logDate = date ? date.toString() : localDate;
  const logPath = path.join(__dirname, `../../logs/combined-${logDate}.log`);

  // 📌 Verificar si el archivo existe antes de leerlo
  if (!fs.existsSync(logPath)) {
    return res.status(404).json({ message: `No se encontraron logs para la fecha ${logDate}` });
  }

  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer los logs', error: err.message });
    }

    let logs = data.split('\n').filter(line => line.trim() !== '');

    logs = logs.map(log => {
      try {
        const logObject = JSON.parse(log);
        return `[${logObject.level.toUpperCase()}] ${logObject.timestamp} - ${logObject.message}`;
      } catch (e) {
        return log;
      }
    });

    logs = logs.filter(log => {
      const lowerLog = log.toLowerCase();

      // Extraer la hora del log (asumiendo formato `YYYY-MM-DD HH:mm:ss`)
      const logTimeMatch = log.match(/\d{4}-\d{2}-\d{2} (\d{2}:\d{2}:\d{2})/);
      const logTime = logTimeMatch ? logTimeMatch[1] : null;

      return (
        (!level || log.includes(`[${level.toString().toUpperCase()}]`)) &&
        (!search || lowerLog.includes(search.toString().toLowerCase())) &&
        (!logTime || (!startTime || logTime >= startTime.toString())) &&
        (!logTime || (!endTime || logTime <= endTime.toString()))
      );
    });

    // 📌 Ordenar los logs según el parámetro `order`
    if (order.toString().toLowerCase() === 'asc') {
      logs = logs.reverse(); // Poner los logs en orden ascendente
    }

    // 📌 Limitar el número de líneas
    logs = logs.slice(-Number(lines));

    res.setHeader('Content-Type', 'text/plain');
    res.send(logs.join('\n'));
  });
};

export const updateStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_territorio } = req.params;
    const { is_habilitado } = req.body;

    const updatedTerritorio = await updateStatusService(id_territorio, is_habilitado);

    logger.info(
      `${req.method} ${req.originalUrl} - Estado actualizado exitosamente en FonogramaTerritorio: ${id_territorio}`
    );

    res.status(200).json({ message: "Estado actualizado exitosamente.", data: updatedTerritorio });
  } catch (err) {
    next(err);
  }
};

export const createTerritorio = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nombre_pais, codigo_iso, is_habilitado } = req.body;

    const newTerritorio = await createTerritorioService({
      nombre_pais,
      codigo_iso,
      is_habilitado,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Nuevo territorio agregado exitosamente: ${newTerritorio.id_territorio}`
    );

    res.status(201).json({
      message: "Territorio agregado exitosamente.",
      data: newTerritorio,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTerritorio = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_territorio } = req.params;

    await deleteTerritorioService(id_territorio);

    logger.info(
      `${req.method} ${req.originalUrl} - Territorio eliminado exitosamente: ${id_territorio}`
    );

    res.status(200).json({
      message: "Territorio eliminado exitosamente.",
    });
  } catch (err) {
    next(err);
  }
};