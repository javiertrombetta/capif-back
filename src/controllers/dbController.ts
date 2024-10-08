import { Request, Response, NextFunction } from 'express';
import { Model, ModelStatic } from 'sequelize';
import * as models from '../models';
import { GenericModel } from '../interfaces/Model';
import logger from '../config/logger';
import { NotFoundError, BadRequestError, InternalServerError } from '../services/customErrors';
import * as MESSAGES from '../services/messages';

class DBController {
  private static isSequelizeModel(model: any): model is ModelStatic<Model> {
    return model && model.prototype instanceof Model;
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { tipo } = req.params;
      logger.info(`${req.method} ${req.originalUrl} - Creación de ${tipo}`);

      const model: any = models[tipo as keyof typeof models];
      if (!model || !DBController.isSequelizeModel(model)) {
        throw new BadRequestError(MESSAGES.ERROR.GENERAL.MODEL_NOT_FOUND);
      }

      const newRecord: GenericModel = await model.create(req.body);
      logger.info(`${req.method} ${req.originalUrl} - ${tipo} creado exitosamente`);

      res.status(201).json(newRecord);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error: ${(error as Error).message}`);
      next(new InternalServerError((error as Error).message));
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { tipo } = req.params;
      logger.info(`${req.method} ${req.originalUrl} - Obtener todos los registros de ${tipo}`);

      const model: any = models[tipo as keyof typeof models];
      if (!model || !DBController.isSequelizeModel(model)) {
        throw new BadRequestError(MESSAGES.ERROR.GENERAL.MODEL_NOT_FOUND);
      }

      const records: GenericModel[] = await model.findAll();
      logger.info(`${req.method} ${req.originalUrl} - Se obtuvieron ${records.length} registros`);

      res.status(200).json(records);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error: ${(error as Error).message}`);
      next(new InternalServerError((error as Error).message));
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { tipo, id } = req.params;
      logger.info(`${req.method} ${req.originalUrl} - Obtener ${tipo} con ID: ${id}`);

      const model: any = models[tipo as keyof typeof models];
      if (!model || !DBController.isSequelizeModel(model)) {
        throw new BadRequestError(MESSAGES.ERROR.GENERAL.MODEL_NOT_FOUND);
      }

      const record: GenericModel | null = await model.findByPk(id);
      if (!record) {
        throw new NotFoundError(MESSAGES.ERROR.GENERAL.RECORD_NOT_FOUND);
      }

      logger.info(`${req.method} ${req.originalUrl} - Registro encontrado: ID ${id}`);
      res.status(200).json(record);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error: ${(error as Error).message}`);
      next(new InternalServerError((error as Error).message));
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { tipo, id } = req.params;
      logger.info(`${req.method} ${req.originalUrl} - Actualizar ${tipo} con ID: ${id}`);

      const model: any = models[tipo as keyof typeof models];
      if (!model || !DBController.isSequelizeModel(model)) {
        throw new BadRequestError(MESSAGES.ERROR.GENERAL.MODEL_NOT_FOUND);
      }

      const record: GenericModel | null = await model.findByPk(id);
      if (!record) {
        throw new NotFoundError(MESSAGES.ERROR.GENERAL.RECORD_NOT_FOUND);
      }

      const updatedRecord: GenericModel = await (record as any).update(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Registro actualizado exitosamente`);
      res.status(200).json(updatedRecord);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error: ${(error as Error).message}`);
      next(new InternalServerError((error as Error).message));
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { tipo, id } = req.params;
      logger.info(`${req.method} ${req.originalUrl} - Eliminar ${tipo} con ID: ${id}`);

      const model: any = models[tipo as keyof typeof models];
      if (!model || !DBController.isSequelizeModel(model)) {
        throw new BadRequestError(MESSAGES.ERROR.GENERAL.MODEL_NOT_FOUND);
      }

      const record: GenericModel | null = await model.findByPk(id);
      if (!record) {
        throw new NotFoundError(MESSAGES.ERROR.GENERAL.RECORD_NOT_FOUND);
      }

      await (record as any).destroy();
      logger.info(`${req.method} ${req.originalUrl} - Registro eliminado exitosamente`);
      res.status(204).json();
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error: ${(error as Error).message}`);
      next(new InternalServerError((error as Error).message));
    }
  }
}

export default DBController;
