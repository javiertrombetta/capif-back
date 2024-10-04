import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { ConflictoWithRelations } from '../interfaces/ConflictoWithRelations';

import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError } from '../services/customErrors';

import {
  Conflicto,
  Fonograma,
  Estado,
  ComentarioConflicto,
  Involucrados,
  DecisionInvolucrados,
  Repertorio,
  TitularFonograma,
  TipoConflicto,
} from '../models';

export const createConflicto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para crear un nuevo conflicto`
    );

    const { id_fonograma, tipo_conflicto, descripcion } = req.body;
    const userId = (req.user as JwtPayload)?.id;    

    const fonograma = await Fonograma.findByPk(id_fonograma);

    if (!fonograma) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Fonograma con ID ${id_fonograma} no encontrado`
      );
      throw new NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    const tipo = await TipoConflicto.findOne({ where: { descripcion: tipo_conflicto } });
    if (!tipo) {
      logger.warn(`Tipo de conflicto no válido: ${tipo_conflicto}`);
      return res.status(400).json({ message: MESSAGES.ERROR.CONFLICTO.INVALID_TYPE });
    }
    
    const repertorio = await Repertorio.findByPk(fonograma.id_repertorio);
    if (!repertorio || repertorio.id_usuario !== userId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario con ID ${userId} no tiene derechos sobre el fonograma con ID ${id_fonograma}`
      );
      return res.status(403).json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
    }

    const nuevoConflicto = await Conflicto.create({
      id_fonograma,
      tipo_conflicto: tipo_conflicto,
      descripcion,
      estado_id: (await Estado.findOne({ where: { descripcion: 'pendiente' } }))?.id_estado,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Conflicto creado exitosamente con ID: ${nuevoConflicto.id_conflicto}`
    );
    res.status(201).json({ message: MESSAGES.SUCCESS.CONFLICTO.CONFLICTO_CREATED, nuevoConflicto });
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error creando conflicto: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getConflictoById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    
    const { id } = req.params;
    const userId = (req.user as JwtPayload)?.id;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener los detalles del conflicto con ID: ${id}`
    );

    const conflicto = await Conflicto.findByPk(id, {
      include: [
        {
          model: Fonograma,
          as: 'Fonograma',
          attributes: ['titulo', 'artista'],
          include: [{ model: TitularFonograma, attributes: ['id_titular'] }],
        },
        { model: Estado, attributes: ['descripcion'] },
        { model: TipoConflicto, attributes: ['descripcion'] },
        { model: ComentarioConflicto, as: 'ComentarioConflicto', attributes: ['comentario', 'fecha'] },
        {
          model: Involucrados,
          as: 'Involucrados',
          attributes: ['id_titular'],
          include: [{ model: DecisionInvolucrados, attributes: ['decision', 'fecha_decision'] }],
        },
      ],
    }) as ConflictoWithRelations | null;

    if (!conflicto) {
      logger.warn(`${req.method} ${req.originalUrl} - Conflicto con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
    }
   
    const isOwnerOrInvolved =
      conflicto.Fonograma?.TitularFonogramas?.some((titular: TitularFonograma) => titular.id_titular === userId) || 
      conflicto.Involucrados?.some((involucrado) => involucrado.id_titular === userId);
   
    if (!isOwnerOrInvolved) {
      logger.info(
        `${req.method} ${req.originalUrl} - Usuario con ID ${userId} no está autorizado para ver comentarios o decisiones`
      );
      conflicto.ComentarioConflicto = [];
      conflicto.Involucrados.forEach((involucrado) => {
        involucrado.DecisionInvolucrados = [];
      });
    }

    logger.info(`${req.method} ${req.originalUrl} - Conflicto con ID ${id} encontrado y procesado`);
    res.status(200).json(conflicto);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error obteniendo conflicto con ID ${id}: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getConflictosByEstado = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { estado } = req.params;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener conflictos en el estado: ${estado}`
    );


    const estadoConflicto = await Estado.findOne({ where: { descripcion: estado } });
    if (!estadoConflicto) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Estado de conflicto no encontrado: ${estado}`
      );
      throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
    }

    const conflictos = await Conflicto.findAll({ where: { estado_id: estadoConflicto.id_estado } });
    if (!conflictos.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontraron conflictos en estado: ${estado}`
      );
      return res.status(404).json({ message: MESSAGES.ERROR.CONFLICTO.NOT_FOUND });
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Se encontraron ${conflictos.length} conflictos en estado: ${estado}`
    );
    return res.status(200).json(conflictos);
  } catch (error) {
    const { estado } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error obteniendo conflictos en estado ${estado}: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getConflictosByUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = (req.user as JwtPayload)?.id;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener los conflictos del usuario con ID: ${userId}`
    );

    if (!userId) {
      return next(new NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const conflictos = await Conflicto.findAll({ where: { id_usuario: userId } });
    if (!conflictos.length) {
      logger.warn(`No se encontraron conflictos para el usuario con ID: ${userId}`);
      return res.status(404).json({ message: MESSAGES.ERROR.CONFLICTO.NOT_FOUND });
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Se encontraron ${conflictos.length} conflictos para el usuario con ID: ${userId}`
    );
    return res.status(200).json(conflictos);
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error obteniendo conflictos del usuario: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const resolveConflicto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolucion } = req.body;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para resolver el conflicto con ID: ${id}`
    );

    const conflicto = await Conflicto.findByPk(id);
    if (!conflicto) {
      logger.warn(`${req.method} ${req.originalUrl} - Conflicto con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
    }

    const estadoResuelto = await Estado.findOne({ where: { descripcion: 'resuelto' } });
    if (!estadoResuelto) {
      logger.warn(`${req.method} ${req.originalUrl} - Estado "resuelto" no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
    }

    conflicto.estado_id = estadoResuelto.id_estado;
    await conflicto.save();
   
    const nuevoComentario = await ComentarioConflicto.create({
      id_conflicto: conflicto.id_conflicto,
      comentario: resolucion,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Conflicto con ID ${id} resuelto y comentario de resolución agregado`
    );
    res.status(200).json({
      message: MESSAGES.SUCCESS.CONFLICTO.CONFLICTO_RESOLVED,
      conflicto,
      comentario: nuevoComentario,
    });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error resolviendo el conflicto con ID ${id}: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
   );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const addComentarioConflicto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;
    
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para agregar un comentario al conflicto con ID: ${id}`
    );

    const conflicto = await Conflicto.findByPk(id);
    if (!conflicto) {
      logger.warn(`${req.method} ${req.originalUrl} - Conflicto con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
    }
    
    const nuevoComentario = await ComentarioConflicto.create({
      id_conflicto: id,
      comentario,
    });

    logger.info(`${req.method} ${req.originalUrl} - Comentario agregado al conflicto con ID ${id}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.CONFLICTO.COMENTARIO_ADDED, nuevoComentario });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error agregando comentario al conflicto con ID ${id}: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const addDecisionInvolucrado = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_involucrado } = req.params;
    const { decision, fecha_decision } = req.body;    

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para agregar una decisión para el involucrado con ID: ${id_involucrado}`
    );

    const involucrado = await Involucrados.findByPk(id_involucrado);
    if (!involucrado) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Involucrado con ID ${id_involucrado} no encontrado`
      );
      throw new NotFoundError(MESSAGES.ERROR.INVOLUCRADO.NOT_FOUND);
    }

    const nuevaDecision = await DecisionInvolucrados.create({
      id_involucrado,
      decision,
      fecha_decision,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Decisión agregada para el involucrado con ID ${id_involucrado}`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.CONFLICTO.DECISION_ADDED, nuevaDecision });
  } catch (error) {
    const { id_involucrado } = req.params;
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error agregando decisión para el involucrado con ID ${id_involucrado}: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deleteConflicto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para eliminar el conflicto con ID: ${id}`
    );

    const conflicto = await Conflicto.findByPk(id, {
      include: [
        { model: ComentarioConflicto },
        { model: Involucrados, include: [DecisionInvolucrados] },
      ],
    });

    if (!conflicto) {
      logger.warn(`${req.method} ${req.originalUrl} - Conflicto con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
    }

    await ComentarioConflicto.destroy({ where: { id_conflicto: id } });
   
    const involucrados = await Involucrados.findAll({ where: { id_conflicto: id } });
    for (const involucrado of involucrados) {
      await DecisionInvolucrados.destroy({ where: { id_involucrado: involucrado.id_involucrado } });
    }
 
    await Involucrados.destroy({ where: { id_conflicto: id } });

    await conflicto.destroy();

    logger.info(`${req.method} ${req.originalUrl} - Conflicto con ID ${id} eliminado exitosamente`);
    res.status(200).json({ message: MESSAGES.SUCCESS.CONFLICTO.CONFLICTO_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error eliminando conflicto con ID ${id}: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
