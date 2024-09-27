import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError } from '../services/customErrors';
import {
  Conflicto,
  Fonograma,
  Estado,
  ComentarioConflicto,
  Involucrados,
  DecisionInvolucrados,
} from '../models';
import { JwtPayload } from 'jsonwebtoken';

export const createConflicto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_fonograma, tipo_conflicto, descripcion } = req.body;
    logger.info('POST /conflictos - Request received to create conflicto');

    const fonograma = await Fonograma.findByPk(id_fonograma);
    if (!fonograma) {
      logger.warn(`Fonograma con ID ${id_fonograma} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    const nuevoConflicto = await Conflicto.create({
      id_fonograma,
      tipo_conflicto,
      descripcion,
      estado_id: (await Estado.findOne({ where: { descripcion: 'pendiente' } }))?.id_estado,
    });

    logger.info(`Conflicto creado exitosamente con ID: ${nuevoConflicto.id_conflicto}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.CONFLICTO_CREATED, nuevoConflicto });
  } catch (error) {
    logger.error(
      `POST /conflictos - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    logger.info(`GET /conflictos/${id} - Request received to fetch conflicto`);

    const conflicto = await Conflicto.findByPk(id, {
      include: [
        { model: Fonograma, attributes: ['titulo', 'artista'] },
        { model: Estado, attributes: ['descripcion'] },
        { model: ComentarioConflicto, attributes: ['comentario', 'fecha'] },
        {
          model: Involucrados,
          attributes: ['id_titular'],
          include: [{ model: DecisionInvolucrados }],
        },
      ],
    });
    if (!conflicto) {
      logger.warn(`Conflicto con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
    }

    logger.info(`Conflicto con ID ${id} encontrado`);
    res.status(200).json(conflicto);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /conflictos/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    logger.info(`GET /conflictos/${estado} - Request received to fetch conflictos`);

    const estadoConflicto = await Estado.findOne({ where: { descripcion: estado } });
    if (!estadoConflicto) {
      logger.warn(`Estado de conflicto no encontrado: ${estado}`);
      throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
    }

    const conflictos = await Conflicto.findAll({ where: { estado_id: estadoConflicto.id_estado } });
    if (!conflictos.length) {
      logger.warn(`No se encontraron conflictos en estado: ${estado}`);
      return res.status(404).json({ message: MESSAGES.ERROR.CONFLICTO.NOT_FOUND });
    }

    logger.info(`Se encontraron ${conflictos.length} conflictos en estado: ${estado}`);
    return res.status(200).json(conflictos);
  } catch (error) {
    const { estado } = req.params;
    logger.error(
      `GET /conflictos/${estado} - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
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
    if (!userId) {
      return next(new NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    logger.info(
      `GET /conflictos - Request received to fetch conflictos for user with ID: ${userId}`
    );

    const conflictos = await Conflicto.findAll({ where: { id_usuario: userId } });
    if (!conflictos.length) {
      logger.warn(`No se encontraron conflictos para el usuario con ID: ${userId}`);
      return res.status(404).json({ message: MESSAGES.ERROR.CONFLICTO.NOT_FOUND });
    }

    logger.info(`Se encontraron ${conflictos.length} conflictos para el usuario con ID: ${userId}`);
    return res.status(200).json(conflictos);
  } catch (error) {
    logger.error(
      `GET /conflictos - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    logger.info(`PUT /conflictos/${id} - Request received to resolve conflicto`);

    const conflicto = await Conflicto.findByPk(id);
    if (!conflicto) {
      logger.warn(`Conflicto con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
    }

    const estadoResuelto = await Estado.findOne({ where: { descripcion: 'resuelto' } });
    if (!estadoResuelto) {
      logger.warn('Estado "resuelto" no encontrado');
      throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
    }

    conflicto.estado_id = estadoResuelto.id_estado;
    await conflicto.save();
   
    const nuevoComentario = await ComentarioConflicto.create({
      id_conflicto: conflicto.id_conflicto,
      comentario: resolucion,
    });

    logger.info(`Conflicto con ID ${id} resuelto y comentario de resolución agregado`);
    res.status(200).json({
      message: MESSAGES.SUCCESS.CONFLICTO_RESOLVED,
      conflicto,
      comentario: nuevoComentario,
    });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /conflictos/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    logger.info(`POST /conflictos/${id}/comentario - Request received to add comentario`);

    const conflicto = await Conflicto.findByPk(id);
    if (!conflicto) {
      logger.warn(`Conflicto con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
    }
    
    const nuevoComentario = await ComentarioConflicto.create({
      id_conflicto: id,
      comentario,
    });

    logger.info(`Comentario agregado al conflicto con ID ${id}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.COMENTARIO_ADDED, nuevoComentario });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `POST /conflictos/${id}/comentario - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
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
    logger.info(`POST /involucrados/${id_involucrado}/decision - Request received to add decision`);

    const involucrado = await Involucrados.findByPk(id_involucrado);
    if (!involucrado) {
      logger.warn(`Involucrado con ID ${id_involucrado} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.INVOLUCRADO.NOT_FOUND);
    }

    const nuevaDecision = await DecisionInvolucrados.create({
      id_involucrado,
      decision,
      fecha_decision,
    });

    logger.info(`Decisión agregada para el involucrado con ID ${id_involucrado}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.DECISION_ADDED, nuevaDecision });
  } catch (error) {
    const { id_involucrado } = req.params;
    logger.error(
      `POST /involucrados/${id_involucrado}/decision - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
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
    logger.info(`DELETE /conflictos/${id} - Request received to delete conflicto`);

    const conflicto = await Conflicto.findByPk(id, {
      include: [
        { model: ComentarioConflicto },
        { model: Involucrados, include: [DecisionInvolucrados] },
      ],
    });

    if (!conflicto) {
      logger.warn(`Conflicto con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
    }

    await ComentarioConflicto.destroy({ where: { id_conflicto: id } });
   
    const involucrados = await Involucrados.findAll({ where: { id_conflicto: id } });
    for (const involucrado of involucrados) {
      await DecisionInvolucrados.destroy({ where: { id_involucrado: involucrado.id_involucrado } });
    }
 
    await Involucrados.destroy({ where: { id_conflicto: id } });

    await conflicto.destroy();

    logger.info(`Conflicto con ID ${id} eliminado exitosamente`);
    res.status(200).json({ message: MESSAGES.SUCCESS.CONFLICTO_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /conflictos/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
