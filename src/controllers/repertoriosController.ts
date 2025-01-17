import { Request, Response, NextFunction } from "express";

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import logger from "../config/logger";

import Fonograma from "../models/Fonograma";
import ProductoraISRC from "../models/ProductoraISRC";
import FonogramaArchivo from "../models/FonogramaArchivo";
import FonogramaParticipacion from "../models/FonogramaParticipacion";
import FonogramaTerritorioMaestro from "../models/FonogramaTerritorioMaestro";

export const createFonograma = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const {
          productora_id: bodyProductoraId,
          titulo,
          artista,
          album,
          duracion,
          anio_lanzamiento,
          sello_discografico,
          codigo_designacion,
          archivo_audio,
          participaciones,
          territorios
        } = req.body;

        // Priorizar `productora_id` de `req.productoraId`, si está presente.
        const productora_id = req.productoraId || bodyProductoraId;

        if (!productora_id) {
            return res.status(403).json({ error: "Acceso denegado: no se encontró el ID de la productora." });
        }

        // Validar que la productora exista y obtener su código ISRC AUDIO
        const productoraISRC = await ProductoraISRC.findOne({
            where: { productora_id, tipo: "AUDIO" },
        });
        if (!productoraISRC) {
            return res.status(400).json({ error: "La productora no tiene un código ISRC asignado para AUDIO." });
        }

        // Generar el ISRC
        const currentYear = new Date().getFullYear();
        const isrc = `AR${productoraISRC.codigo_productora}${currentYear.toString().slice(-2)}${codigo_designacion}`;
        const existingFonograma = await Fonograma.findOne({ where: { isrc } });
        if (existingFonograma) {
            return res.status(400).json({ error: "El ISRC ya existe en el sistema." });
        }

        // Calcular si es dominio público
        const is_dominio_publico = currentYear - anio_lanzamiento > 70;

        // Crear el fonograma con datos obligatorios
        const fonograma = await Fonograma.create({
            productora_id,
            isrc,
            titulo,
            artista,
            album,
            duracion,
            anio_lanzamiento,
            sello_discografico,
            is_dominio_publico,
            estado_fonograma: "ACTIVO",
        });

        // Cargar opcionalmente el archivo de audio
        if (archivo_audio) {
            await FonogramaArchivo.create({
                fonograma_id: fonograma.id_fonograma,
                ruta_archivo_audio: archivo_audio,
            });
        }

        // Registrar participaciones de productoras (opcional)
        if (participaciones && participaciones.length > 0) {
            await Promise.all(
                participaciones.map(async (participacion: any) => {
                    await FonogramaParticipacion.create({
                        fonograma_id: fonograma.id_fonograma,
                        productora_id: participacion.productora_id,
                        porcentaje_participacion: participacion.porcentaje_participacion,
                        fecha_participacion_inicio: participacion.fecha_inicio || new Date(),
                        fecha_participacion_hasta: participacion.fecha_hasta || new Date("2099-12-31"),
                    });
                })
            );
        }

        // Registrar los territorios aplicables (obligatorio)
        if (!territorios || territorios.length === 0) {
            return res.status(400).json({ error: "Se deben especificar los territorios aplicables." });
        }

        await Promise.all(
            territorios.map(async (territorio: any) => {
                await FonogramaTerritorioMaestro.create({
                    fonograma_id: fonograma.id_fonograma,
                    territorio_id: territorio.id_territorio,
                    is_activo: true,
                });
            })
        );

        logger.info(`Fonograma creado exitosamente con ID ${fonograma.id_fonograma}`);
        res.status(201).json({ message: "Fonograma creado exitosamente", data: fonograma });
    } catch (error) {
        logger.error("Error al crear fonograma:", error);
        next(error);
    }
};

export const getFonogramaById = (req: Request, res: Response) => {
  res.status(200).send({ message: `Detalle del fonograma con ID ${req.params.id}` });
};

export const updateFonograma = (req: Request, res: Response) => {
  res.status(200).send({ message: `Fonograma con ID ${req.params.id} actualizado exitosamente` });
};

export const deleteFonograma = (req: Request, res: Response) => {
  res.status(200).send({ message: `Fonograma con ID ${req.params.id} eliminado exitosamente` });
};

export const listFonogramas = (req: Request, res: Response) => {
  res.status(200).send({ message: 'Listado de fonogramas' });
};

export const addArchivoToFonograma = (req: Request, res: Response) => {
  res.status(201).send({ message: 'Archivo añadido al fonograma exitosamente' });
};

export const getArchivoByFonograma = (req: Request, res: Response) => {
  res.status(200).send({ message: `Archivo del fonograma con ID ${req.params.id}` });
};

export const enviarFonograma = (req: Request, res: Response) => {
  res.status(200).send({ message: `Fonograma con ID ${req.params.id} enviado exitosamente` });
};

export const getEnviosByFonograma = (req: Request, res: Response) => {
  res.status(200).send({ message: `Envíos del fonograma con ID ${req.params.id}` });
};

export const addParticipacionToFonograma = (req: Request, res: Response) => {
  res.status(201).send({ message: 'Participación añadida al fonograma exitosamente' });
};

export const listParticipaciones = (req: Request, res: Response) => {
  res.status(200).send({ message: `Listado de participaciones para el fonograma con ID ${req.params.id}` });
};

export const updateParticipacion = (req: Request, res: Response) => {
  res.status(200).send({ message: `Participación con ID ${req.params.participacionId} actualizada exitosamente` });
};

export const deleteParticipacion = (req: Request, res: Response) => {
  res.status(200).send({ message: `Participación con ID ${req.params.participacionId} eliminada exitosamente` });
};

export const addTerritorioToFonograma = (req: Request, res: Response) => {
  res.status(201).send({ message: 'Territorio añadido al fonograma exitosamente' });
};

export const listTerritorios = (req: Request, res: Response) => {
  res.status(200).send({ message: `Listado de territorios para el fonograma con ID ${req.params.id}` });
};

export const updateTerritorio = (req: Request, res: Response) => {
  res.status(200).send({ message: `Territorio con ID ${req.params.territorioId} actualizado exitosamente` });
};

export const deleteTerritorio = (req: Request, res: Response) => {
  res.status(200).send({ message: `Territorio con ID ${req.params.territorioId} eliminado exitosamente` });
};