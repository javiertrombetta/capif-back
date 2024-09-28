import { Request, Response, NextFunction } from 'express';

import { ISRC, Fonograma } from '../models';
import logger from '../config/logger';

import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError } from '../services/customErrors';
import { generateISRCReportFile, generateOtherReport } from '../services/reportesService';

export const getISRCReportes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('GET /reportes/isrc - Request received to fetch all ISRC reports');

    const isrcReports = await ISRC.findAll({ include: Fonograma });

    if (!isrcReports.length) {
      logger.warn('No se encontraron reportes ISRC');
      throw new NotFoundError(MESSAGES.ERROR.REPORTE.NOT_FOUND);
    }

    res.status(200).json(isrcReports);
  } catch (error) {
    logger.error(
      `GET /reportes/isrc - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getISRCReporteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`GET /reportes/isrc/${id} - Request received to fetch ISRC report ID: ${id}`);

    const isrcReport = await ISRC.findByPk(id, { include: Fonograma });

    if (!isrcReport) {
      logger.warn(`ISRC report con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.REPORTE.NOT_FOUND);
    }

    res.status(200).json(isrcReport);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /reportes/isrc/${id} - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const generateISRCReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tipo, fechaInicio, fechaFin } = req.body;
    logger.info('POST /reportes/isrc - Request received to generate ISRC report');

    const isrcReports = await ISRC.findAll({
      where: {
        tipo,
        createdAt: {
          $between: [new Date(fechaInicio), new Date(fechaFin)],
        },
      },
      include: Fonograma,
    });

    if (!isrcReports.length) {
      logger.warn('No se encontraron reportes de ISRC dentro del rango de fechas');
      throw new NotFoundError(MESSAGES.ERROR.REPORTE.NOT_FOUND);
    }

    const generatedReport = await generateISRCReportFile(isrcReports);

    logger.info(`POST /reportes/isrc - ISRC report generated successfully`);
    res.status(201).json({ message: MESSAGES.SUCCESS.REPORTE.ISRC_GENERATED, generatedReport });
  } catch (error) {
    logger.error(
      `POST /reportes/isrc - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const downloadISRCReporte = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(
      `GET /reportes/isrc/${id}/descargar - Request received to download ISRC report ID: ${id}`
    );

    const isrcReport = await ISRC.findByPk(id, { include: Fonograma });

    if (!isrcReport) {
      logger.warn(`ISRC report con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.REPORTE.NOT_FOUND);
    }

    const reportFile = await generateISRCReportFile([isrcReport]);

    res.setHeader('Content-Disposition', `attachment; filename=ISRC_Report_${id}.csv`);
    res.status(200).sendFile(reportFile);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /reportes/isrc/${id}/descargar - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const generateOtherReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tipoReporte, parametros } = req.body;
    logger.info(
      `POST /reportes/${tipoReporte} - Request received to generate ${tipoReporte} report`
    );

    const reporteGenerado = await generateOtherReport(tipoReporte, parametros);

    if (!reporteGenerado) {
      logger.warn(`No se pudo generar el reporte de tipo ${tipoReporte}`);
      throw new InternalServerError(MESSAGES.ERROR.REPORTE.GENERATION_FAILED);
    }

    logger.info(
      `POST /reportes/${tipoReporte} - Reporte de tipo ${tipoReporte} generado con éxito`
    );
    res.status(201).json({ message: MESSAGES.SUCCESS.REPORTE.GENERATED, reporteGenerado });
  } catch (error) {
    const { tipoReporte } = req.body;
    logger.error(
      `POST /reportes/${tipoReporte} - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
