import { Request, Response, NextFunction } from "express";

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import logger from "../config/logger";

import Fonograma from "../models/Fonograma";
import ProductoraISRC from "../models/ProductoraISRC";
import FonogramaArchivo from "../models/FonogramaArchivo";
import FonogramaParticipacion from "../models/FonogramaParticipacion";
import FonogramaTerritorioMaestro from "../models/FonogramaTerritorioMaestro";
import { UsuarioResponse } from "../interfaces/UsuarioResponse";
import { getAuthenticatedUser } from "../services/authService";

import * as fs from "fs";
import * as path from "path";
import csv from 'csv-parser';

import { Op } from 'sequelize';
import { FonogramaMaestro, FonogramaTerritorio, Productora } from "../models";
import { registrarAuditoria } from "../services/auditService";
import { handleGeneralError } from "../services/errorService";
import { Readable } from "stream";


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
          participaciones,
          territorios: territoriosActivos
        } = req.body;

        // Priorizar `productora_id` de `req.productoraId`, si está presente.
        const productora_id = req.productoraId || bodyProductoraId;

        if (!productora_id) {
            return res.status(403).json({ error: "Acceso denegado: no se encontró el ID de la productora." });
        }

        // Verifica el usuario autenticado
        const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);       

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
            return res.status(400).json({ error: "Ya existe un repertorio declarado con el ISRC a generar." });
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

        await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "Fonograma",
            tipo_auditoria: "ALTA",
            detalle: `Se creó el fonograma con título '${titulo}' y ID '${fonograma.id_fonograma}'`,
        });

        // Renombrar el archivo de audio y registrarlo (si existe)
        if (req.file) {
            const ext = path.extname(req.file.originalname).toLowerCase();
            const newFileName = `${isrc}${ext}`;
            const newPath = path.join(req.file.destination, newFileName);

            fs.renameSync(req.file.path, newPath);

            // Registrar el archivo en la base de datos
            await FonogramaArchivo.create({
                fonograma_id: fonograma.id_fonograma,
                ruta_archivo_audio: newPath,
            });

            await registrarAuditoria({
                usuario_originario_id: authUser.id_usuario,
                usuario_destino_id: null,
                modelo: "FonogramaArchivo",
                tipo_auditoria: "ALTA",
                detalle: `Se registró el archivo de audio para el fonograma con ISRC: '${isrc}'`,
            });
        }

        // Registrar participaciones de productoras (obligatorio)
        let totalParticipationPercentage = 0;
        const overlappingPeriods: string[] = [];

        if (participaciones && participaciones.length > 0) {
            await Promise.all(
                participaciones.map(async (participacion: any) => {
                    const { cuit, porcentaje_participacion, fecha_inicio, fecha_hasta } = participacion;

                    const productora = await Productora.findOne({ where: { cuit_cuil: cuit } });

                    if (!productora) {
                        throw new Error(`No se encontró ninguna productora con el cuit: ${cuit}`);
                    }

                    await FonogramaParticipacion.create({
                        fonograma_id: fonograma.id_fonograma,
                        productora_id: productora.id_productora,
                        porcentaje_participacion,
                        fecha_participacion_inicio: fecha_inicio || new Date(),
                        fecha_participacion_hasta: fecha_hasta || new Date("2099-12-31"),
                    });

                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "FonogramaParticipacion",
                        tipo_auditoria: "ALTA",
                        detalle: `Se registró la participación de la productora con CUIT '${cuit}' para el fonograma con ISRC '${isrc}'`,
                    });

                    // Calcular el porcentaje total
                    totalParticipationPercentage += porcentaje_participacion;

                    // Verificar períodos superpuestos
                    const participacionesExistentes = await FonogramaParticipacion.findAll({
                        where: {
                            fonograma_id: fonograma.id_fonograma,
                            [Op.or]: [
                                {
                                    fecha_participacion_inicio: {
                                        [Op.between]: [fecha_inicio, fecha_hasta],
                                    },
                                },
                                {
                                    fecha_participacion_hasta: {
                                        [Op.between]: [fecha_inicio, fecha_hasta],
                                    },
                                },
                            ],
                        },
                    });

                    const porcentajeSuperpuesto = participacionesExistentes.reduce(
                        (sum, p) => sum + p.porcentaje_participacion,
                        porcentaje_participacion
                    );

                    if (porcentajeSuperpuesto > 100) {
                        overlappingPeriods.push(
                            `Entre ${fecha_inicio} y ${fecha_hasta} se supera el 100% con un total de ${porcentajeSuperpuesto}%`
                        );
                    }
                })
            );
        }

        // Actualizar el porcentaje total en el fonograma
        fonograma.porcentaje_titularidad_total = totalParticipationPercentage;
        await fonograma.save();


        // Verificar si hubo períodos superpuestos
        const message = overlappingPeriods.length > 0
            ? `Fonograma creado con éxito, pero hay períodos donde se supera el 100% de participación: ${overlappingPeriods.join(
                "; "
            )}`
            : "Fonograma creado exitosamente";


        // Registrar los territorios habilitados en FonogramaTerritorioMaestro (obligatorio)
        const territoriosHabilitados = await FonogramaTerritorio.findAll({
            where: { is_habilitado: true },
        });

        if (!territoriosHabilitados || territoriosHabilitados.length === 0) {
            throw new Error("No hay territorios habilitados disponibles.");
        }

        if (!Array.isArray(territoriosActivos) || territoriosActivos.length === 0) {
            throw new Error("Debe proporcionar al menos un territorio activo.");
        }

        await Promise.all(
            territoriosHabilitados.map(async (territorio) => {
                const isActivo = territoriosActivos.includes(territorio.codigo_iso);
                await FonogramaTerritorioMaestro.create({
                    fonograma_id: fonograma.id_fonograma,
                    territorio_id: territorio.id_territorio,
                    is_activo: isActivo,
                });

                await registrarAuditoria({
                    usuario_originario_id: authUser.id_usuario,
                    usuario_destino_id: null,
                    modelo: "FonogramaTerritorioMaestro",
                    tipo_auditoria: "ALTA",
                    detalle: `Se registró el territorio '${territorio.codigo_iso}' (${isActivo ? "Activo" : "Inactivo"}) para el fonograma con ISRC '${isrc}'`,
                });
            })
        );

        // Cargar en FonogramaMaestro
        await FonogramaMaestro.create({
            fonograma_id: fonograma.id_fonograma,
            operacion: "ALTA",
            fecha_operacion: new Date(),
        });

        await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "FonogramaMaestro",
            tipo_auditoria: "ALTA",
            detalle: `Se creó un registro en FonogramaMaestro para el fonograma con ID '${fonograma.id_fonograma}'`,
        });

        logger.info(`Fonograma creado exitosamente con ID ${fonograma.id_fonograma}`);
        res.status(201).json({ message , data: fonograma });

    } catch (err) {
        handleGeneralError(err, req, res, next, "Error al crear el repertorio");
    }
};


export const cargarRepertoriosMasivo = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "Debe proporcionar un archivo CSV." });
    }

    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    const resultados: any[] = [];
    const errores: string[] = [];
    const registrosCreados: any[] = [];
    const conflictos: string[] = [];

    try {
        // Leer y procesar el archivo CSV desde el stream del request
        await new Promise<void>((resolve, reject) => {
            const stream = Readable.from(req.file!.buffer);
            stream
                .pipe(csv())
                .on('data', (data) => resultados.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        // Procesar cada registro del CSV
        await Promise.all(
            resultados.map(async (row, index) => {
                const {
                    productora_id,
                    titulo,
                    artista,
                    album,
                    duracion,
                    anio_lanzamiento,
                    sello_discografico,
                    codigo_designacion,
                    participaciones, // JSON string: [{"cuit": "...", "porcentaje_participacion": ...}]
                    territorios, // JSON string: ["AR", "US"]
                    archivo_audio_path, // Ruta del archivo de audio (opcional)
                } = row;

                try {
                    // Convertir JSON strings a objetos/arrays
                    const parsedParticipaciones = participaciones ? JSON.parse(participaciones) : [];
                    const parsedTerritorios = territorios ? JSON.parse(territorios) : [];
                    
                    // Generar el ISRC
                    const currentYear = new Date().getFullYear();
                    const isrc = `AR${codigo_designacion}${currentYear.toString().slice(-2)}`;

                    // Crear el fonograma
                    const fonograma = await Fonograma.create({
                        productora_id,
                        isrc,
                        titulo,
                        artista,
                        album,
                        duracion,
                        anio_lanzamiento,
                        sello_discografico,
                        is_dominio_publico: currentYear - anio_lanzamiento > 70,
                        estado_fonograma: "ACTIVO",
                    });

                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "Fonograma",
                        tipo_auditoria: "ALTA",
                        detalle: `Se creó el fonograma con título '${titulo}' y ISRC '${isrc}'`,
                    });

                    // Registrar en FonogramaMaestro
                    await FonogramaMaestro.create({
                        fonograma_id: fonograma.id_fonograma,
                        operacion: "ALTA",
                        fecha_operacion: new Date(),
                    });

                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "FonogramaMaestro",
                        tipo_auditoria: "ALTA",
                        detalle: `Se creó un registro en FonogramaMaestro para el fonograma con ISRC '${isrc}'`,
                    });

                    // Registrar archivo de audio si existe
                    if (archivo_audio_path && fs.existsSync(archivo_audio_path)) {
                        await FonogramaArchivo.create({
                            fonograma_id: fonograma.id_fonograma,
                            ruta_archivo_audio: archivo_audio_path,
                        });

                        await registrarAuditoria({
                            usuario_originario_id: authUser.id_usuario,
                            usuario_destino_id: null,
                            modelo: "FonogramaArchivo",
                            tipo_auditoria: "ALTA",
                            detalle: `Se registró el archivo de audio en '${archivo_audio_path}' para el fonograma con ISRC '${isrc}'`,
                        });
                    }

                    // Registrar participaciones y calcular conflictos
                    let porcentajeTotal = 0;
                    await Promise.all(
                        parsedParticipaciones.map(async (participacion: any) => {
                            const { cuit, porcentaje_participacion, fecha_inicio, fecha_hasta } = participacion;

                            const productora = await Productora.findOne({ where: { cuit_cuil: cuit } });

                            if (!productora) {
                                throw new Error(`No se encontró ninguna productora con el CUIT '${cuit}'`);
                            }

                            // Registrar participación
                            await FonogramaParticipacion.create({
                                fonograma_id: fonograma.id_fonograma,
                                productora_id: productora.id_productora,
                                porcentaje_participacion,
                                fecha_participacion_inicio: fecha_inicio || new Date(),
                                fecha_participacion_hasta: fecha_hasta || new Date("2099-12-31"),
                            });

                            await registrarAuditoria({
                                usuario_originario_id: authUser.id_usuario,
                                usuario_destino_id: null,
                                modelo: "FonogramaParticipacion",
                                tipo_auditoria: "ALTA",
                                detalle: `Se registró la participación de la productora con CUIT '${cuit}' para el fonograma con ISRC '${isrc}'`,
                            });

                            porcentajeTotal += porcentaje_participacion;

                            // Verificar conflictos de periodos
                            const conflictosExistentes = await FonogramaParticipacion.findAll({
                                where: {
                                    fonograma_id: fonograma.id_fonograma,
                                    [Op.or]: [
                                        {
                                            fecha_participacion_inicio: {
                                                [Op.between]: [fecha_inicio, fecha_hasta],
                                            },
                                        },
                                        {
                                            fecha_participacion_hasta: {
                                                [Op.between]: [fecha_inicio, fecha_hasta],
                                            },
                                        },
                                    ],
                                },
                            });

                            const porcentajeSuperpuesto = conflictosExistentes.reduce(
                                (sum, p) => sum + p.porcentaje_participacion,
                                porcentaje_participacion
                            );

                            if (porcentajeSuperpuesto > 100) {
                                conflictos.push(
                                    `Conflicto en el fonograma con ISRC '${isrc}': El porcentaje total supera el 100% entre ${fecha_inicio} y ${fecha_hasta} (${porcentajeSuperpuesto}%)`
                                );
                            }
                        })
                    );

                    // Actualizar el porcentaje total en el fonograma
                    fonograma.porcentaje_titularidad_total = porcentajeTotal;
                    await fonograma.save();                   

                    // Registrar territorios
                    const territoriosHabilitados = await FonogramaTerritorio.findAll({
                        where: { is_habilitado: true },
                    });

                    await Promise.all(
                        territoriosHabilitados.map(async (territorio) => {
                            const isActivo = parsedTerritorios.includes(territorio.codigo_iso);
                            await FonogramaTerritorioMaestro.create({
                                fonograma_id: fonograma.id_fonograma,
                                territorio_id: territorio.id_territorio,
                                is_activo: isActivo,
                            });

                            await registrarAuditoria({
                                usuario_originario_id: authUser.id_usuario,
                                usuario_destino_id: null,
                                modelo: "FonogramaTerritorioMaestro",
                                tipo_auditoria: "ALTA",
                                detalle: `Se registró el territorio '${territorio.codigo_iso}' (${isActivo ? "Activo" : "Inactivo"}) para el fonograma con ISRC '${isrc}'`,
                            });
                        })
                    );

                    registrosCreados.push({ titulo, isrc });
                } catch (err) {
                    handleGeneralError(err, req, res, next, "Error al crear repertorios de forma masiva");
                }
            })
        );

        // Responder con resultados
        res.status(201).json({ message: "Carga masiva completada", registrosCreados, conflictos, errores });
    } catch (err) {
        next(err);
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