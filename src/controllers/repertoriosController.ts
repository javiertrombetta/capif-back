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
import archiver from "archiver";
import Client from "ftp";
import { parse } from "json2csv";
import csv from 'csv-parser';

import { Op } from 'sequelize';
import { FonogramaEnvio, FonogramaMaestro, FonogramaTerritorio, Productora, sequelize } from "../models";
import { registrarAuditoria } from "../services/auditService";
import { handleGeneralError } from "../services/errorService";
import { Readable } from "stream";

export const validateISRC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isrc } = req.body;

    if (!isrc || typeof isrc !== "string") {
      return res.status(400).json({ error: "El ISRC debe ser proporcionado y debe ser una cadena de texto." });
    }

    // Validar que el ISRC tenga exactamente 12 caracteres
    if (isrc.length !== 12) {
      return res.status(400).json({ error: "El ISRC debe tener exactamente 12 caracteres." });
    }

    // Validar que los dos primeros caracteres sean 'AR'
    if (!isrc.startsWith("AR")) {
      return res.status(400).json({ error: "El ISRC debe comenzar con 'AR'." });
    }

    // Extraer partes del ISRC
    const codigoProductora = isrc.substring(2, 5); // 3ro al 5to dígito
    const anioISRC = isrc.substring(5, 7); // 6to y 7mo dígito
    const codigoDesignacion = isrc.substring(7); // Últimos 5 dígitos

    // Validar que el código de la productora exista en la base de datos
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const productoraISRC = await ProductoraISRC.findOne({
      where: {
        codigo_productora: codigoProductora,
        tipo: "AUDIO",
      },
    });

    if (!productoraISRC) {
      return res.status(400).json({ error: "El código de productora no es válido o no existe como tipo AUDIO." });
    }

    // Validar que los dígitos del año sean los del año actual
    if (anioISRC !== currentYear) {
      return res.status(400).json({
        error: `El año en el ISRC no coincide con el año actual (${currentYear}).`,
      });
    }

    // Validar que el ISRC no exista ya en la tabla de fonogramas
    const fonogramaExistente = await Fonograma.findOne({
      where: { isrc },
    });

    if (fonogramaExistente) {
      return res.status(200).json({
        isrc,
        available: false,
        message: "El ISRC ya está en uso.",
      });
    }

    // Si todo es válido, el ISRC está disponible
    return res.status(200).json({
      isrc,
      available: true,
      message: "El ISRC está disponible.",
    });
  } catch (err) {
    next(err);
  }
};

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
            detalle: `Se registró el alta del fonograma ID: '${fonograma.id_fonograma}'`,
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

                    // Verificar si el fonograma ya existe
                    const existingFonograma = await Fonograma.findOne({ where: { isrc } });

                    if (existingFonograma) {
                        errores.push(`El fonograma con ISRC '${isrc}' ya existe en la base de datos.`);
                        return;
                    }

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
                        const registrarArchivo = await FonogramaArchivo.create({
                            fonograma_id: fonograma.id_fonograma,
                            ruta_archivo_audio: archivo_audio_path,
                        });                       

                        // Asignar el ID del envío a la propiedad correcta en el fonograma
                        fonograma.archivo_audio_id = registrarArchivo.id_archivo;
                        await fonograma.save();

                        await registrarAuditoria({
                            usuario_originario_id: authUser.id_usuario,
                            usuario_destino_id: null,
                            modelo: "FonogramaArchivo",
                            tipo_auditoria: "ALTA",
                            detalle: `Se registró el archivo de audio en '${archivo_audio_path}' para el fonograma con ISRC '${isrc}'`,
                        });
                    }

                    // Verificar si ya existe un Fonograma en estado "PENDIENTE DE ENVIO" sin cargarlo
                    const existingEnvio = await FonogramaEnvio.findOne({
                        where: {
                            fonograma_id: fonograma.id_fonograma,
                            tipo_estado: "PENDIENTE DE ENVIO",
                        },
                    });

                    if (!existingEnvio) {
                        const registrarEnvio = await FonogramaEnvio.create({
                            fonograma_id: fonograma.id_fonograma,
                            tipo_estado: "PENDIENTE DE ENVIO",
                            fecha_envio_inicial: null,
                            fecha_envio_ultimo: null,
                        });
                        // Asignar el ID del envío a la propiedad correcta en el fonograma
                        fonograma.envio_vericast_id = registrarEnvio.id_envio_vericast;
                        await fonograma.save();

                        await registrarAuditoria({
                            usuario_originario_id: authUser.id_usuario,
                            usuario_destino_id: null,
                            modelo: "FonogramaEnvio",
                            tipo_auditoria: "ALTA",
                            detalle: `Se creó un envío en estado PENDIENTE DE ENVIO para el fonograma con ISRC '${isrc}'`,
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

export const getFonogramaById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Buscar el fonograma por ID
    const fonograma = await Fonograma.findOne({
      where: { id_fonograma: id },
      include: [
        {
          model: FonogramaArchivo,
          as: "archivos",
          attributes: ["id_fonograma_archivo", "ruta_archivo_audio"],
        },
        {
          model: FonogramaParticipacion,
          as: "participaciones",
          attributes: [
            "id_fonograma_participacion",
            "productora_id",
            "porcentaje_participacion",
            "fecha_participacion_inicio",
            "fecha_participacion_hasta",
          ],
        },
        {
          model: FonogramaTerritorioMaestro,
          as: "territorios",
          attributes: ["id_territorio_maestro", "territorio_id", "is_activo"],
        },
      ],
      attributes: [
        "id_fonograma",
        "titulo",
        "isrc",
        "artista",
        "album",
        "duracion",
        "anio_lanzamiento",
        "sello_discografico",
        "is_dominio_publico",
        "estado_fonograma",
      ],
    });

    // Verificar si el fonograma existe
    if (!fonograma) {
      return res.status(404).json({ error: "El fonograma no existe" });
    }

    // Devolver el fonograma encontrado
    res.status(200).json({
      message: "Fonograma encontrado",
      data: fonograma,
    });
  } catch (err) {
    next(err);
  }
};

export const updateFonograma = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      artista,
      album,
      duracion,
      anio_lanzamiento,
      sello_discografico,
      estado_fonograma
    } = req.body;

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el fonograma en la base de datos
    const fonograma = await Fonograma.findOne({ where: { id_fonograma: id } });

    if (!fonograma) {
      return res.status(404).json({ error: "El fonograma no existe." });
    }

    // Actualizar los datos del fonograma
    await fonograma.update({
      titulo,
      artista,
      album,
      duracion,
      anio_lanzamiento,
      sello_discografico,
      estado_fonograma,
    });

    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "Fonograma",
        tipo_auditoria: "CAMBIO",
        detalle: `Se modificaron los datos del fonograma ID: '${fonograma.id_fonograma}'`,
    });

    // Registrar la actualización en FonogramaMaestro
    await FonogramaMaestro.create({
      fonograma_id: id,
      operacion: "DATOS",
      fecha_operacion: new Date(),
    });

    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaMaestro",
        tipo_auditoria: "CAMBIO",
        detalle: `Se registró el cambio de los datos del fonograma ID: '${fonograma.id_fonograma}'`,
    });

    // Verificar si ya existe un FonogramaEnvio en estado "PENDIENTE DE ENVIO"
    const existingEnvio = await FonogramaEnvio.findOne({
      where: {
          fonograma_id: fonograma.id_fonograma,
          tipo_estado: "PENDIENTE DE ENVIO",
      },
    });

    if (!existingEnvio) {
        const registrarEnvio = await FonogramaEnvio.create({
            fonograma_id: fonograma.id_fonograma,
            tipo_estado: "PENDIENTE DE ENVIO",
            fecha_envio_inicial: null,
            fecha_envio_ultimo: null,
        });

        // Asignar el ID del envío a la propiedad correcta en el fonograma
        fonograma.envio_vericast_id = registrarEnvio.id_envio_vericast;
        await fonograma.save();

        await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "FonogramaEnvio",
            tipo_auditoria: "ALTA",
            detalle: `Se creó un envío en estado PENDIENTE DE ENVIO para el fonograma con ISRC '${fonograma.isrc}'`,
        });
    }

    res.status(200).json({
      message: "Fonograma actualizado exitosamente.",
      data: fonograma,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteFonograma = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Buscar el fonograma
    const fonograma = await Fonograma.findOne({ where: { id_fonograma: id } });

    if (!fonograma) {
      return res.status(404).json({ error: "El fonograma no existe." });
    }

    try {
      // Eliminar asociaciones relacionadas
      await FonogramaArchivo.destroy({
        where: { fonograma_id: id }, 
      });

      await FonogramaEnvio.destroy({
        where: { fonograma_id: id },
      });

      await FonogramaMaestro.destroy({
        where: { fonograma_id: id },
      });

      await FonogramaParticipacion.destroy({
        where: { fonograma_id: id },
      });

      await FonogramaTerritorioMaestro.destroy({
        where: { fonograma_id: id },
      });

      // Eliminar el fonograma
      await fonograma.destroy();

      res.status(200).json({
        message: `El fonograma con ID '${id}' y sus asociaciones han sido eliminados exitosamente.`,
      });
    } catch (err) {  
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

export const listFonogramas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;

    // Construir el filtro de búsqueda
    const whereClause: any = {};

    if (search && typeof search === "string") {
      whereClause[Op.or] = [
        { titulo: { [Op.like]: `%${search}%` } },
        { isrc: { [Op.like]: `%${search}%` } },
      ];
    }

    // Consultar los fonogramas con el filtro
    const fonogramas = await Fonograma.findAll({
      where: whereClause,
      attributes: [
        "id_fonograma",
        "titulo",
        "isrc",
        "artista",
        "album",
        "anio_lanzamiento",
        "estado_fonograma",
      ],
      order: [["titulo", "ASC"]], // Ordenar alfabéticamente por título
    });

    // Devolver la lista de fonogramas
    res.status(200).json({
      data: fonogramas,
      total: fonogramas.length,
    });
  } catch (err) {
    next(err);
  }
};

export const addArchivoToFonograma = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el fonograma en la base de datos
    const fonograma = await Fonograma.findOne({ where: { id_fonograma: id } });

    if (!fonograma) {
      return res.status(404).json({ error: "El fonograma no existe." });
    }

    // Verificar si se subió un archivo
    if (!req.file) {
      return res.status(400).json({ error: "Debe proporcionar un archivo de audio." });
    }

    // Obtener extensión del archivo
    const ext = path.extname(req.file.originalname).toLowerCase();
    const newFileName = `${fonograma.isrc}${ext}`;
    const newPath = path.join(req.file.destination, newFileName);

    // Renombrar el archivo para que tenga el ISRC del fonograma como nombre
    fs.renameSync(req.file.path, newPath);

    // Verificar si ya existe un archivo de audio asociado al fonograma
    const archivoExistente = await FonogramaArchivo.findOne({ where: { fonograma_id: id } });

    if (archivoExistente) {
      // Eliminar el archivo anterior si existe
      if (fs.existsSync(archivoExistente.ruta_archivo_audio)) {
        fs.unlinkSync(archivoExistente.ruta_archivo_audio);
      }

      // Actualizar la ruta del nuevo archivo
      await archivoExistente.update({ ruta_archivo_audio: newPath });

      // Registrar el cambio en FonogramaMaestro
      await FonogramaMaestro.create({
        fonograma_id: id,
        operacion: "ARCHIVO",
        fecha_operacion: new Date(),
      });

      // Registrar auditoría en FonogramaMaestro
      await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaMaestro",
        tipo_auditoria: "ARCHIVO",
        detalle: `Se registró el cambio de archivo en el fonograma ID: '${fonograma.id_fonograma}'`,
      });

      // Registrar auditoría para el cambio del archivo
      await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaArchivo",
        tipo_auditoria: "CAMBIO",
        detalle: `Se actualizó el archivo de audio para el fonograma con ISRC: '${fonograma.isrc}'`,
      });
    } else {
      // Crear un nuevo registro de archivo
      const registrarArchivo = await FonogramaArchivo.create({
        fonograma_id: id,
        ruta_archivo_audio: newPath,
      });

      // Asignar el ID del envío a la propiedad correcta en el fonograma
      fonograma.archivo_audio_id = registrarArchivo.id_archivo;
      await fonograma.save();

      // Registrar auditoría para el alta del archivo
      await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaArchivo",
        tipo_auditoria: "ALTA",
        detalle: `Se registró el archivo de audio para el fonograma con ISRC: '${fonograma.isrc}'`,
      });

      // Registrar la creación en FonogramaMaestro
      await FonogramaMaestro.create({
        fonograma_id: id,
        operacion: "ARCHIVO",
        fecha_operacion: new Date(),
      });      
    }

    // Verificar si ya existe un FonogramaEnvio en estado "PENDIENTE DE ENVIO"
    const existingEnvio = await FonogramaEnvio.findOne({
      where: {
          fonograma_id: fonograma.id_fonograma,
          tipo_estado: "PENDIENTE DE ENVIO",
      },
    });

    if (!existingEnvio) {
        const registrarEnvio = await FonogramaEnvio.create({
            fonograma_id: fonograma.id_fonograma,
            tipo_estado: "PENDIENTE DE ENVIO",
            fecha_envio_inicial: null,
            fecha_envio_ultimo: null,
        });

        // Asignar el ID del envío a la propiedad correcta en el fonograma
        fonograma.envio_vericast_id = registrarEnvio.id_envio_vericast;
        await fonograma.save();

        await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "FonogramaEnvio",
            tipo_auditoria: "ALTA",
            detalle: `Se creó un envío en estado PENDIENTE DE ENVIO para el fonograma con ISRC '${fonograma.isrc}'`,
        });
    }

    res.status(200).json({
      message: `Archivo de audio ${archivoExistente ? "actualizado" : "cargado"} correctamente.`,
      ruta_archivo: newPath,
    });
  } catch (err) {
    next(err);
  }
};

export const getArchivoByFonograma = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findOne({ where: { id_fonograma: id } });

    if (!fonograma) {
      return res.status(404).json({ error: "El fonograma no existe." });
    }

    // Buscar el archivo asociado al fonograma
    const archivo = await FonogramaArchivo.findOne({
      where: { fonograma_id: id },
      attributes: ["ruta_archivo_audio"],
    });

    if (!archivo) {
      return res.status(404).json({ error: "El archivo de audio no está asociado a este fonograma." });
    }

    // Verificar si el archivo existe físicamente
    const rutaArchivo = archivo.ruta_archivo_audio;

    if (!fs.existsSync(rutaArchivo)) {
      return res.status(404).json({ error: "El archivo de audio no existe en el sistema." });
    }

    // Enviar el archivo como respuesta
    return res.sendFile(path.resolve(rutaArchivo));
  } catch (err) {
    next(err);
  }
};

export const enviarFonograma = async (req: Request, res: Response, next: NextFunction) => {

  try {

    // Cargar configuración FTP desde .env
    const FTP_CONFIG = {
      host: process.env.FTP_HOST || "",
      user: process.env.FTP_USER || "",
      password: process.env.FTP_PASSWORD || "",
      port: Number(process.env.FTP_PORT) || 21,
    };
    
    const { fonograma_ids } = req.body;
    if (!Array.isArray(fonograma_ids) || fonograma_ids.length === 0) {
      return res.status(400).json({ error: "Debe proporcionar un array de IDs de fonogramas." });
    }

    // Verificar el usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);

    const fonogramas = await Fonograma.findAll({
      where: { id_fonograma: fonograma_ids },
      include: [{ model: FonogramaArchivo, as: "archivoDelFonograma" }],
    });

    if (fonogramas.length !== fonograma_ids.length) {
      return res.status(404).json({ error: "Uno o más fonogramas no existen." });
    }

    // Verificar que los fonogramas están en estado "PENDIENTE DE ENVIO"
    const enviosPendientes = await FonogramaEnvio.findAll({
      where: { fonograma_id: fonograma_ids, tipo_estado: "PENDIENTE DE ENVIO" },
    });

    if (enviosPendientes.length !== fonograma_ids.length) {
      return res.status(400).json({ error: "Uno o más fonogramas no están en estado PENDIENTE DE ENVIO." });
    }

    // Procesar cada fonograma
    for (const fonograma of fonogramas) {
      const archivoAudio = fonograma.archivoDelFonograma?.ruta_archivo_audio ?? "";
      const isrc = fonograma.isrc;
      const zipPath = path.join("/tmp", `${isrc}.zip`);
      const metadataPath = path.join("/tmp", "metadata.xls");
      const resourcesDir = path.join("/tmp/resources");

      // Crear el directorio resources si no existe
      if (!fs.existsSync(resourcesDir)) {
        fs.mkdirSync(resourcesDir, { recursive: true });
      }

      // Verificar si el archivo de audio existe
      let audioExists = false;
      if (archivoAudio && fs.existsSync(archivoAudio)) {
        audioExists = true;
        fs.copyFileSync(archivoAudio, path.join(resourcesDir, path.basename(archivoAudio)));
      }

      // Crear metadata.xls
      const metadata = [
        {
          URL: audioExists ? `resources/${path.basename(archivoAudio)}` : "",
          "track title": fonograma.titulo,
          "track artist": fonograma.artista,
          "album title": fonograma.album ?? "",
          "album artist": fonograma.artista,
          "album upc": "",
          label: fonograma.sello_discografico,
          ISRC: fonograma.isrc,
          language: "ES",
          "country producer": "Argentina",
          "release year": fonograma.anio_lanzamiento,
          version: "",
          "composer(s)": "",
          ISWC: "",
          "publisher(s)": "",
          "performer(s)": fonograma.artista,
          "track internal ID": fonograma.id_fonograma,
          "work internal ID": "",
        },
      ];
      const metadataCsv = parse(metadata, { delimiter: "\t" });
      fs.writeFileSync(metadataPath, metadataCsv);

      // Crear archivo ZIP
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.pipe(output);
      archive.file(metadataPath, { name: "metadata.xls" });

      if (audioExists) {
        archive.file(path.join(resourcesDir, path.basename(archivoAudio)), {
          name: `resources/${path.basename(archivoAudio)}`,
        });
      }

      await archive.finalize();

      // Subir archivo ZIP al FTP
      const client = new Client();
      client.on("ready", () => {
        client.put(zipPath, `/uploads/${isrc}.zip`, (err) => {
          if (err) {
            console.error(`Error al subir el archivo ${zipPath}:`, err);
          } else {
            console.log(`Archivo ${zipPath} subido correctamente.`);
          }
          client.end();
        });
      });

      client.connect(FTP_CONFIG);

      // Marcar el fonograma como ENVIADO CON AUDIO o ENVIADO SIN AUDIO
      const tipoEstado = audioExists ? "ENVIADO CON AUDIO" : "ENVIADO SIN AUDIO";
      await FonogramaEnvio.update(
        { tipo_estado: tipoEstado, fecha_envio_ultimo: new Date() },
        { where: { fonograma_id: fonograma.id_fonograma } }
      );

      await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaEnvio",
        tipo_auditoria: "CAMBIO",
        detalle: `El fonograma con ISRC '${isrc}' fue enviado con estado '${tipoEstado}'.`,
      });

      // Actualizar registros en FonogramaMaestro
      await FonogramaMaestro.update(
        { isProcesado: true },
        {
          where: {
            fonograma_id: fonograma.id_fonograma,
            isProcesado: false,
          },
        }
      );

      await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaMaestro",
        tipo_auditoria: "CAMBIO",
        detalle: `Se marcaron como procesadas todas las operaciones pendientes para el fonograma con ISRC '${isrc}'.`,
      });

      // Eliminar archivos temporales
      try {
        fs.unlinkSync(zipPath);
        fs.unlinkSync(metadataPath);
        if (audioExists) {
          fs.unlinkSync(path.join(resourcesDir, path.basename(archivoAudio)));
        }
      } catch (err) {
        console.warn("Error al eliminar archivos temporales:", err);
      }
    }

    res.status(200).json({ message: "Fonogramas enviados correctamente." });
  } catch (err) {
    next(err);
  }
};

export const getNovedadesFonograma = async (req: Request, res: Response, next: NextFunction) => {

  // Definir los valores permitidos para operación
  const OPERACIONES_VALIDAS = ["ALTA", "DATOS", "ARCHIVO", "TERRITORIO", "PARTICIPACION", "BAJA"] as const;
  
  try {
    // Obtener los parámetros de la query
    let { operacion, isProcesado } = req.query;

    // Si no se especifica isProcesado, por defecto es false
    let isProcesadoFilter = false;
    if (typeof isProcesado === "string") {
      isProcesadoFilter = isProcesado.toLowerCase() === "true";
    }

    // Manejar filtro de operación: si se pasa en la query, verificar que exista en OPERACIONES_VALIDAS
    let operacionFilter;
    if (operacion) {
      const operacionArray = Array.isArray(operacion)
        ? operacion.map(op => op.toString())
        : [operacion.toString()];

      // Filtrar operaciones que sean válidas según la constante OPERACIONES_VALIDAS
      const operacionesValidas = operacionArray.filter((op): op is typeof OPERACIONES_VALIDAS[number] =>
        OPERACIONES_VALIDAS.includes(op as typeof OPERACIONES_VALIDAS[number])
      );

      if (operacionesValidas.length === 0) {
        return res.status(400).json({ error: "Las operaciones proporcionadas no son válidas." });
      }

      operacionFilter = { [Op.in]: operacionesValidas };
    }

    // Obtener registros filtrados por operacion e isProcesado
    const novedades = await FonogramaMaestro.findAll({
      where: {
        ...(operacionFilter ? { operacion: operacionFilter } : {}),
        isProcesado: isProcesadoFilter,
      },
      include: [
        {
          model: Fonograma,
          as: "fonogramaDelMaestroDeFonograma",
          attributes: ["id_fonograma", "titulo", "isrc", "artista", "album"],
        },
      ],
      attributes: ["id_fonograma_maestro", "fonograma_id", "operacion", "fecha_operacion", "isProcesado"],
      order: [["fecha_operacion", "DESC"]],
    });

    // Verificar si hay novedades
    if (novedades.length === 0) {
      return res.status(200).json({ message: "No hay novedades pendientes de procesamiento." });
    }

    res.status(200).json({
      message: "Novedades encontradas.",
      data: novedades,
    });
  } catch (err) {
    next(err);
  }
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