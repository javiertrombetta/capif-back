import { Op } from "sequelize";
import { Readable } from "stream";
import { parse } from "json2csv";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import Client from "ftp";

import { UsuarioResponse } from "../interfaces/UsuarioResponse";

import { Conflicto, ConflictoParte, Fonograma, FonogramaArchivo, FonogramaEnvio, FonogramaMaestro, FonogramaParticipacion, FonogramaTerritorio, FonogramaTerritorioMaestro, Productora, ProductoraISRC } from "../models";

import { getAuthenticatedUser, getTargetUser } from "./authService";
import { registrarAuditoria } from "./auditService";

import * as MESSAGES from "../utils/messages";
import * as Err from "../utils/customErrors";
import { sendEmailWithErrorHandling } from "./emailService";
import { createProductoraMessage } from "./productoraService";
import { crearConflicto } from "./conflictosService";


export const validateISRC = async (isrc: string) => {

  if (!isrc || typeof isrc !== "string") {
    throw new Err. BadRequestError(MESSAGES.ERROR.ISRC.ISRC_REQUIRED);
  }

  if (isrc.length !== 12) {
    return { valid: false, message: MESSAGES.ERROR.ISRC.ISRC_LENGTH };
  }

  if (!isrc.startsWith("AR")) {
    throw new Err.BadRequestError(MESSAGES.ERROR.ISRC.ISRC_PREFIX);
  }

  const codigoProductora = isrc.substring(2, 5);
  const anioISRC = isrc.substring(5, 7);
  const currentYear = new Date().getFullYear().toString().slice(-2);

  const productoraISRC = await ProductoraISRC.findOne({
    where: { codigo_productora: codigoProductora, tipo: "AUDIO" },
  });

  if (!productoraISRC) {
    throw new Err.NotFoundError(MESSAGES.ERROR.ISRC.ISRC_PRODUCTORA_INVALID);
  }

  if (anioISRC !== currentYear) {
    throw new Err.BadRequestError(
      MESSAGES.ERROR.ISRC.ISRC_YEAR_MISMATCH.replace("{year}", currentYear)
    );
  }

  const fonogramaExistente = await Fonograma.findOne({ where: { isrc } });

  if (fonogramaExistente) {
    throw new Err.ConflictError(MESSAGES.ERROR.ISRC.ISRC_IN_USE);
  }

  return { available: true, message: MESSAGES.SUCCESS.ISRC.ISRC_AVAILABLE };
};

export const createFonograma = async (req: any) => {
  
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
    if (!productora_id) throw new Err.ForbiddenError("Acceso denegado: no se encontró el ID de la productora.");

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Validar existencia de la productora y obtener su código ISRC
    const productoraISRC = await ProductoraISRC.findOne({ where: { productora_id, tipo: "AUDIO" } });
    if (!productoraISRC) throw new Err.NotFoundError("La productora no tiene un código ISRC asignado para AUDIO.");

    // Generar el ISRC
    const currentYear = new Date().getFullYear();
    const isrc = `AR${productoraISRC.codigo_productora}${currentYear.toString().slice(-2)}${codigo_designacion}`;

    const existingFonograma = await Fonograma.findOne({ where: { isrc } });
    if (existingFonograma) throw new Err.ConflictError("Ya existe un repertorio declarado con el ISRC a generar.");

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

    // Validar y registrar participaciones
    if (!participaciones || participaciones.length === 0) {
      throw new Err.BadRequestError("No se incluyeron participaciones en la creación del fonograma.");
    }

    // Registrar participaciones de productoras (obligatorio)
    const overlappingPeriods: string[] = [];
    for (const participacion of participaciones) {
        const { cuit, porcentaje_participacion, fecha_inicio, fecha_hasta } = participacion;

        // Verificar si la productora del usuario que registra es parte de los participantes
        const productora = await Productora.findOne({ where: { cuit_cuil: cuit } });
        if (!productora) throw new Err.NotFoundError(`No se encontró ninguna productora con el CUIT: ${cuit}`);

        // Validar si la productora ya está registrada como participante en el mismo período para este fonograma
        const participacionExistente = await FonogramaParticipacion.findOne({
            where: {
                fonograma_id: fonograma.id_fonograma,
                productora_id: productora.id_productora,
                [Op.or]: [
                    { fecha_participacion_inicio: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                    { fecha_participacion_hasta: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                ],
            },
        });

        if (participacionExistente) {
          throw new Err.ConflictError(
            `La productora con CUIT '${cuit}' ya tiene una participación registrada en este fonograma para el período entre ${fecha_inicio} y ${fecha_hasta}.`
          );
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

        // Verificar períodos superpuestos con la participación creada
        const participacionesExistentes = await FonogramaParticipacion.findAll({
            where: {
                fonograma_id: fonograma.id_fonograma,
                [Op.or]: [
                    { fecha_participacion_inicio: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                    { fecha_participacion_hasta: { [Op.between]: [fecha_inicio, fecha_hasta] } },
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

            // Llamar automáticamente a crearConflicto cuando se detecte exceso de participación
            await crearConflicto(req, isrc, fecha_inicio, fecha_hasta);
        }
    }

    // Registrar los territorios habilitados en FonogramaTerritorioMaestro (obligatorio)
    // Validar territorios activos
    const territoriosHabilitados = await FonogramaTerritorio.findAll({ where: { is_habilitado: true } });

    if (!territoriosHabilitados.length) throw new Err.NotFoundError("No hay territorios habilitados disponibles.");
    if (!Array.isArray(territoriosActivos) || !territoriosActivos.length) {
      throw new Err.BadRequestError("Debe proporcionar al menos un territorio activo.");
    }

    for (const territorio of territoriosHabilitados) {
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
    }        

    // Cargar en FonogramaMaestro
    await FonogramaMaestro.create({ fonograma_id: fonograma.id_fonograma, operacion: "ALTA", fecha_operacion: new Date() });  

    const registrarEnvio = await FonogramaEnvio.create({
        fonograma_id: fonograma.id_fonograma,
        tipo_estado: 'PENDIENTE DE ENVIO',
        tipo_contenido: 'DATOS',
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
        detalle: `Se registró el envío del fonograma con ID: '${fonograma.id_fonograma}' en estado 'PENDIENTE DE ENVIO' y contenido 'DATOS'.`,
    });

    return {
        fonograma,
        message: overlappingPeriods.length > 0
            ? `Fonograma creado con éxito, pero hay períodos donde se supera el 100% de participación: ${overlappingPeriods.join("; ")}`
            : "Fonograma creado exitosamente",
    };
};

export const cargarRepertoriosMasivo = async (req: any) => {
    
    if (!req.file || !req.file.buffer) throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.NO_CSV_FOUND);

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    const resultados: any[] = [];
    const errores: string[] = [];
    const registrosCreados: any[] = [];
    const conflictos: string[] = [];

    
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
            try {
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

                const registrarEnvio = await FonogramaEnvio.create({
                    fonograma_id: fonograma.id_fonograma,
                    tipo_estado: 'PENDIENTE DE ENVIO',
                    tipo_contenido: 'DATOS',
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
                    detalle: `Se registró el envío del fonograma con ID: '${fonograma.id_fonograma}' en estado 'PENDIENTE DE ENVIO' y contenido 'DATOS'.`,
                });

                // Registrar participaciones y calcular conflictos
                for (const participacion of parsedParticipaciones) {
                    const { cuit, porcentaje_participacion, fecha_inicio, fecha_hasta } = participacion;

                    const productora = await Productora.findOne({ where: { cuit_cuil: cuit } });
                    if (!productora) throw new Err.NotFoundError(`No se encontró ninguna productora con el CUIT '${cuit}'`);

                    // Validar si la productora ya está registrada en el mismo período para este fonograma
                    const participacionExistente = await FonogramaParticipacion.findOne({
                        where: {
                            fonograma_id: fonograma.id_fonograma,
                            productora_id: productora.id_productora,
                            [Op.or]: [
                                { fecha_participacion_inicio: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                                { fecha_participacion_hasta: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                            ],
                        },
                    });

                    if (participacionExistente) {
                      conflictos.push(
                          `Conflicto en el fonograma con ISRC '${isrc}': Ya existe una participación de ${productora.id_productora} entre ${fecha_inicio} y ${fecha_hasta}.`
                      );
                    }
                    else {
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

                        // Verificar conflictos de periodos
                        const conflictosExistentes = await FonogramaParticipacion.findAll({
                            where: {
                                fonograma_id: fonograma.id_fonograma,
                                [Op.or]: [
                                    { fecha_participacion_inicio: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                                    { fecha_participacion_hasta: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                                ],
                            },
                        });
                        const porcentajeSuperpuesto = conflictosExistentes.reduce(
                            (sum, p) => sum + p.porcentaje_participacion,
                            Number(porcentaje_participacion)
                        );

                        if (porcentajeSuperpuesto > 100) {
                            conflictos.push(
                                `Conflicto en el fonograma con ISRC '${isrc}': El porcentaje total supera el 100% entre ${fecha_inicio} y ${fecha_hasta} (${porcentajeSuperpuesto}%)`
                            );

                            // Llamar automáticamente a crearConflicto cuando se detecte exceso de participación
                            await crearConflicto(req, isrc, fecha_inicio, fecha_hasta);
                        }
                    }
                }                

                // Registrar territorios
                const territoriosHabilitados = await FonogramaTerritorio.findAll({ where: { is_habilitado: true } });

                for (const territorio of territoriosHabilitados) {
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
                }
                registrosCreados.push({ titulo, isrc });
            } catch (err: any) {
                errores.push(`Error en fila ${index + 1}: ${err.message}`);
            }
        })
    );

    // Responder con resultados
    return {
        message: "Carga masiva completada",
        registrosCreados,
        conflictos,
        errores,
    };
};

export const getFonogramaById = async (id: string) => {
  // Buscar el fonograma por ID
  const fonograma = await Fonograma.findOne({
    where: { id_fonograma: id },
    include: [
      {
        model: FonogramaArchivo,
        as: "archivoDelFonograma",
        attributes: ["id_archivo", "ruta_archivo_audio"],
      },
      {
        model: FonogramaParticipacion,
        as: "participantesDelFonograma",
        attributes: [
          "id_participacion",
          "productora_id",
          "porcentaje_participacion",
          "fecha_participacion_inicio",
          "fecha_participacion_hasta",
        ],
      },
      {
        model: FonogramaTerritorioMaestro,
        as: "vinculosDelFonograma",
        attributes: ["id_territorio_maestro", "territorio_id", "is_activo"],
        include: [
          {
            model: FonogramaTerritorio,
            as: "territorioDelVinculo",
            attributes: ["id_territorio", "nombre_pais", "codigo_iso", "is_habilitado"],
            where: { is_habilitado: true }, // Solo territorios habilitados
          },
        ],
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
    throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
  }

  // Devolver el fonograma encontrado
  return fonograma;
};

export const generateISRCPrefix = async (productoraId: string): Promise<string> => {
  if (!productoraId || typeof productoraId !== "string") {
    throw new Err.BadRequestError(MESSAGES.ERROR.PRODUCTORA.ID_REQUIRED);
  }

  const productoraISRC = await ProductoraISRC.findOne({
    where: { productora_id: productoraId, tipo: "AUDIO" },
  });

  if (!productoraISRC) {
    throw new Err.NotFoundError(MESSAGES.ERROR.ISRC.ISRC_PRODUCTORA_INVALID);
  }

  const currentYear = new Date().getFullYear().toString().slice(-2);
  return `AR${productoraISRC.codigo_productora}${currentYear}`;
};

export const updateFonograma = async (id: string, req: any) => {
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
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
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

    // Verificar si ya existe un Fonograma en estado "PENDIENTE DE ENVIO" sin cargarlo
    const existingEnvio = await FonogramaEnvio.findOne({
        where: {
            fonograma_id: fonograma.id_fonograma,
            tipo_estado: "PENDIENTE DE ENVIO",
        },
    });

    if (!existingEnvio) {
        // Crear un nuevo registro en FonogramaEnvio si no existe
        const registrarEnvio = await FonogramaEnvio.create({
            fonograma_id: fonograma.id_fonograma,
            tipo_estado: "PENDIENTE DE ENVIO",
            tipo_contenido: "DATOS",
            fecha_envio_inicial: null,
            fecha_envio_ultimo: null,
        });

        // Asignar el ID del envío al fonograma y guardarlo
        fonograma.envio_vericast_id = registrarEnvio.id_envio_vericast;
        await fonograma.save();

        await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "FonogramaEnvio",
            tipo_auditoria: "ALTA",
            detalle: `Se registró el envío del fonograma con ID: '${fonograma.id_fonograma}' en estado 'PENDIENTE DE ENVIO' y contenido 'DATOS'.`,
        });
    }

    return fonograma;  
};

export const deleteFonograma = async (id: string, req: any) => {
    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el fonograma
    const fonograma = await Fonograma.findOne({ where: { id_fonograma: id } });

    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    try {
        // Obtener conflictos asociados al fonograma
        const conflictos = await Conflicto.findAll({ where: { fonograma_id: id } });

        if (conflictos.length > 0) {
            // Obtener IDs de los conflictos para eliminar sus partes
            const conflictoIds = conflictos.map(conflicto => conflicto.id_conflicto);

            // Eliminar partes de conflictos asociadas
            await ConflictoParte.destroy({ where: { conflicto_id: conflictoIds } });

            // Eliminar conflictos
            await Conflicto.destroy({ where: { fonograma_id: id } });
        }

        // Eliminar asociaciones relacionadas con el fonograma
        await Promise.all([
            FonogramaArchivo.destroy({ where: { fonograma_id: id } }),
            FonogramaEnvio.destroy({ where: { fonograma_id: id } }),
            FonogramaMaestro.destroy({ where: { fonograma_id: id } }),
            FonogramaParticipacion.destroy({ where: { fonograma_id: id } }),
            FonogramaTerritorioMaestro.destroy({ where: { fonograma_id: id } }),
        ]);

        // Eliminar el fonograma
        await fonograma.destroy();

        // Registrar auditoría
        await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "Fonograma",
            tipo_auditoria: "BAJA",
            detalle: `El fonograma con ID '${id}', sus conflictos y todas sus asociaciones han sido eliminados.`,
        });

        return {
            message: `El fonograma con ID '${id}', sus conflictos y asociaciones han sido eliminados exitosamente.`,
        };
    } catch (err: any) {
        throw new Error(`Error al eliminar el fonograma con ID '${id}': ${err.message}`);
    }
};

export const listFonogramas = async (queryParams: any) => {
  // Construcción del filtro de búsqueda dinámico
  const whereClause: any = {};

  if (queryParams.isrc) whereClause.isrc = { [Op.iLike]: `%${queryParams.isrc}%` };
  if (queryParams.titulo) whereClause.titulo = { [Op.iLike]: `%${queryParams.titulo}%` };
  if (queryParams.artista) whereClause.artista = { [Op.iLike]: `%${queryParams.artista}%` };
  if (queryParams.album) whereClause.album = { [Op.iLike]: `%${queryParams.album}%` };
  if (queryParams.anio_lanzamiento) whereClause.anio_lanzamiento = queryParams.anio_lanzamiento;
  
  // Filtro parcial para `sello_discografico` (puede contener varios nombres separados por comas)
  if (queryParams.sello_discografico) {
    whereClause.sello_discografico = { [Op.iLike]: `%${queryParams.sello_discografico}%` };
  }

  // Paginación
  const page = queryParams.page ? parseInt(queryParams.page, 10) : 1;
  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;
  const offset = (page - 1) * limit;

  // Obtener datos paginados
  const { count, rows: fonogramas } = await Fonograma.findAndCountAll({
    where: whereClause,
    attributes: [
      "id_fonograma",
      "titulo",
      "isrc",
      "artista",
      "album",
      "anio_lanzamiento",
      "estado_fonograma",
      "sello_discografico",
    ],
    include: [
      {
        model: Productora,
        as: "productoraDelFonograma",
        attributes: ["nombre_productora"],
        where: queryParams.nombre_productora
          ? { nombre_productora: { [Op.iLike]: `%${queryParams.nombre_productora}%` } }
          : undefined,
      },
    ],
    order: [["titulo", "ASC"]],
    limit,
    offset,
  });

  // Formatear la respuesta incluyendo nombre_productora
  const formattedFonogramas = fonogramas.map((fonograma) => ({
    id_fonograma: fonograma.id_fonograma,
    titulo: fonograma.titulo,
    isrc: fonograma.isrc,
    artista: fonograma.artista,
    album: fonograma.album,
    anio_lanzamiento: fonograma.anio_lanzamiento,
    estado_fonograma: fonograma.estado_fonograma,
    sello_discografico: fonograma.sello_discografico,
    nombre_productora: fonograma.productoraDelFonograma?.nombre_productora || "Desconocido",
  }));

  return {
    message: "Fonogramas obtenidos exitosamente.",
    total: count,
    page,
    limit,
    data: formattedFonogramas,
  };
};

export const addArchivoToFonograma = async (id: string, req: any) => {

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el fonograma en la base de datos
    const fonograma = await Fonograma.findOne({ where: { id_fonograma: id } });

    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Verificar si se subió un archivo
    if (!req.file) {
        throw new Err.NotFoundError(MESSAGES.ERROR.ARCHIVO.NOT_FOUND);
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

      // Registrar auditoría para el cambio del archivo
      await registrarAuditoria({
          usuario_originario_id: authUser.id_usuario,
          usuario_destino_id: null,
          modelo: "FonogramaArchivo",
          tipo_auditoria: "CAMBIO",
          detalle: `Se actualizó el archivo de audio para el fonograma con ISRC: '${fonograma.isrc}'`,
      });

      // Registrar el cambio en FonogramaMaestro
      await FonogramaMaestro.create({
          fonograma_id: id,
          operacion: "ARCHIVO",
          fecha_operacion: new Date(),
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

    // Verificar si ya existe un Fonograma en estado "PENDIENTE DE ENVIO" sin cargarlo
    const existingEnvio = await FonogramaEnvio.findOne({
        where: {
            fonograma_id: fonograma.id_fonograma,
            tipo_estado: "PENDIENTE DE ENVIO",
        },
    });

    if (!existingEnvio) {
        // Crear un nuevo registro en FonogramaEnvio si no existe
        const registrarEnvio = await FonogramaEnvio.create({
            fonograma_id: fonograma.id_fonograma,
            tipo_estado: "PENDIENTE DE ENVIO",
            tipo_contenido: "COMPLETO",
            fecha_envio_inicial: null,
            fecha_envio_ultimo: null,
        });

        // Asignar el ID del envío al fonograma y guardarlo
        fonograma.envio_vericast_id = registrarEnvio.id_envio_vericast;
        await fonograma.save();

        await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "FonogramaEnvio",
            tipo_auditoria: "ALTA",
            detalle: `Se registró el envío del fonograma con ID: '${fonograma.id_fonograma}' en estado 'PENDIENTE DE ENVIO' y contenido 'COMPLETO'.`,
        });
    } else if (existingEnvio && existingEnvio.tipo_contenido !== "COMPLETO"){
        // Si ya existe un envío en estado "PENDIENTE DE ENVIO" y distinto a "COMPLETO", actualizarlo
        existingEnvio.tipo_contenido = "COMPLETO";
        await existingEnvio.save();

        await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "FonogramaEnvio",
            tipo_auditoria: "CAMBIO",
            detalle: `Se actualizó el envío del fonograma con ID: '${fonograma.id_fonograma}' en estado 'PENDIENTE DE ENVIO' y contenido 'COMPLETO'.`,
        });
    }

    return {
        message: `Archivo de audio ${archivoExistente ? "actualizado" : "cargado"} correctamente.`,
        ruta_archivo: newPath,
    }; 
};

export const getArchivoByFonograma = async (id: string) => {

    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findOne({ where: { id_fonograma: id } });

    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }   

    // Buscar el archivo asociado al fonograma
    const archivoRegistro = await FonogramaArchivo.findOne({
      where: { fonograma_id: id },
      attributes: ["ruta_archivo_audio"],
    });

    // Verificar si se subió un archivo
    if (!archivoRegistro) {
        throw new Err.NotFoundError(MESSAGES.ERROR.ARCHIVO.NOT_FOUND_DB);
    }

    // Verificar si el archivo existe físicamente
    const rutaArchivo = archivoRegistro.ruta_archivo_audio;

    if (!fs.existsSync(rutaArchivo)) {
        throw new Err.NotFoundError(MESSAGES.ERROR.ARCHIVO.NOT_FOUND_FILE);
    }

    // Enviar el archivo como respuesta
    return path.resolve(rutaArchivo);
};

// EnviarFonograma: Función para subir el archivo al FTP
const subirArchivoFTP = (zipPath: string, isrc: string, codigoEnvio: string, FTP_CONFIG: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const client = new Client();
    client.on("ready", () => {
      const ftpFileName = `${isrc}_${codigoEnvio}.zip`;
      client.put(zipPath, `/uploads/${ftpFileName}`, (err: any) => {
        if (err) {
          reject(new Error(`Error al subir el archivo ${zipPath}: ${err.message}`));
        } else {
          console.log(`Archivo ${zipPath} subido correctamente como ${ftpFileName}.`);

          // Eliminar el archivo ZIP después de subirlo
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
            console.log(`Archivo ZIP eliminado: ${zipPath}`);
          }

          resolve();
        }
        client.end();
      });
    });
    client.connect(FTP_CONFIG);
  });
};

export const enviarFonograma = async (req: any) => {

    // Cargar configuración FTP desde .env
    const FTP_CONFIG = {
      host: process.env.FTP_HOST || "",
      user: process.env.FTP_USER || "",
      password: process.env.FTP_PASSWORD || "",
      port: Number(process.env.FTP_PORT) || 21,
    };
    
    const { fonograma_ids } = req.body;
    if (!Array.isArray(fonograma_ids) || fonograma_ids.length === 0) {
        throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.FONOGRAMAS_NOT_PROVIDED);
    }

    // Verificar el usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);

    const fonogramas = await Fonograma.findAll({
        where: { id_fonograma: fonograma_ids },
        include: [{ model: FonogramaArchivo, as: "archivoDelFonograma" }],
    });

    if (fonogramas.length !== fonograma_ids.length) {
       throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND_MULTIPLE);
    }

    // Verificar que los fonogramas están en estado "PENDIENTE DE ENVIO"
    const enviosPendientes = await FonogramaEnvio.findAll({
      where: { fonograma_id: fonograma_ids, tipo_estado: "PENDIENTE DE ENVIO" },
    });

    if (enviosPendientes.length !== fonograma_ids.length) {
        throw new Err.BadRequestError(MESSAGES.ERROR.FONOGRAMA.NOT_SEND_PENDING);
    }

    const observaciones: string[] = [];

    // Procesar cada fonograma
    for (const fonograma of fonogramas) {
        const envio = enviosPendientes.find(e => e.fonograma_id === fonograma.id_fonograma);
        if (!envio) continue; // Si por alguna razón no se encuentra el fonograma, ignorar

        const isrc = fonograma.isrc;
        const codigoEnvio = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
        const zipPath = path.join("/tmp", `${isrc}_${codigoEnvio}.zip`);
        const metadataPath = path.join("/tmp", "metadata.xls");
        const resourcesDir = path.join("/tmp/resources");

        // Crear el directorio resources si no existe
        if (!fs.existsSync(resourcesDir)) {
           fs.mkdirSync(resourcesDir, { recursive: true });
        }

        // Verificar si el archivo de audio existe
        const archivoAudio = fonograma.archivoDelFonograma?.ruta_archivo_audio ?? "";
        let audioExists = false;
        if (archivoAudio && fs.existsSync(archivoAudio)) {
            audioExists = true;
            fs.copyFileSync(archivoAudio, path.join(resourcesDir, path.basename(archivoAudio)));
        }

        // Si el fonograma es COMPLETO pero no tiene archivo de audio, se omite el envío
        if (envio.tipo_contenido === "COMPLETO" && !audioExists) {
            observaciones.push(`El fonograma con ISRC '${isrc}' se marcó como contenido completo pero no existe un archivo de audio asociado. No se realizó el envío.`);
            continue; // Saltar al siguiente fonograma sin procesar el actual
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

        // Agregar archivo de audio si aplica
        if (envio.tipo_contenido === "COMPLETO" && audioExists) {
            archive.file(path.join(resourcesDir, path.basename(archivoAudio)), {
                name: `resources/${path.basename(archivoAudio)}`,
            });
        } else {
            observaciones.push(`El fonograma con ISRC '${isrc}' se envió sin audio porque está marcado como contenido de datos.`);
        }

        await archive.finalize();

        // Subir archivo ZIP al FTP con el formato correcto
        await subirArchivoFTP(zipPath, isrc, codigoEnvio, FTP_CONFIG);

        // Marcar el fonograma como ENVIADO CON AUDIO o ENVIADO SIN AUDIO
        const tipoEstado = (envio.tipo_contenido === "COMPLETO" && audioExists) ? "ENVIADO CON AUDIO" : "ENVIADO SIN AUDIO";
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
    }

    return { message: "Fonogramas enviados correctamente.", observaciones };
};

export const cambiarEstadoEnvioFonograma = async (fonogramaId: string, sendId: string, nuevoEstado: typeof FonogramaEnvio.prototype.tipo_estado, comentario: string | undefined, req: any) => {

  // Verificar el usuario autenticado
  const { user: authUser } = await getAuthenticatedUser(req);

  const validStates = ['RECHAZADO POR VERICAST', 'ERROR EN EL ENVIO'];

  if (!validStates.includes(nuevoEstado)) throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ENVIO_STATE_INVALID);

  // Buscar el envío relacionado al fonograma
  const envio = await FonogramaEnvio.findOne({
    where: { id_envio_vericast: sendId, fonograma_id: fonogramaId },
    include: [{ model: Fonograma, as: 'fonogramaDelEnvio', attributes: ['productora_id', 'titulo'] }],
  });

  if (!envio) throw new Err.NotFoundError(MESSAGES.ERROR.ENVIO.NOT_FOUND);
  if (!envio.fonogramaDelEnvio) throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);

  const oldState = envio.tipo_estado;

  if (nuevoEstado === 'RECHAZADO POR VERICAST') {
    const { productora_id: productoraId } = envio.fonogramaDelEnvio;
    if (!productoraId) throw new Err.NotFoundError(MESSAGES.ERROR.PRODUCTORA.NOT_FOUND);

    // Obtener el productor principal asociado a la productora del fonograma
    const { user: targetUser } = await getTargetUser({ productoraId, nombre_rol: 'productor_principal' }, req);

    // Mensaje de respuesta para enviar por email al productor principal
    const rejectionComment = comentario || `El envío del archivo de audio del repertorio '${envio.fonogramaDelEnvio.titulo}' fue rechazado por Vericast.`;

    // Crear mensaje asociado al rechazo
    await createProductoraMessage({
      usuarioId: authUser.id_usuario,
      productoraId,
      tipoMensaje: "RECHAZO_VERICAST",
      mensaje: rejectionComment,
    });

    await sendEmailWithErrorHandling(
    {
        to: targetUser.email,
        subject: 'Rechazo del envío del archivo de audio',
        html: MESSAGES.EMAIL_BODY.SENDFILE_REJECTION_NOTIFICATION(targetUser.nombre!, rejectionComment),
        successLog: `Correo enviado a ${targetUser.email} notificando rechazo del envío.`,
        errorLog: `Error al enviar correo a ${targetUser.email} durante la notificación de rechazo.`,
    },
    req,
    undefined,
    undefined
    );

    // Cambiar el estado del envío a "PENDIENTE DE ENVIO"
    nuevoEstado = 'PENDIENTE DE ENVIO';
  }

  envio.tipo_estado = nuevoEstado;
  envio.fecha_envio_ultimo = new Date();
  await envio.save();

  await registrarAuditoria({
    usuario_originario_id: authUser.id_usuario,
    usuario_destino_id: null,
    modelo: 'FonogramaEnvio',
    tipo_auditoria: 'CAMBIO',
    detalle: `El estado del envío con ID '${sendId}' cambió de '${oldState}' a '${nuevoEstado}'.`,
  });

  return {
    message: `Estado del envío actualizado a '${nuevoEstado}'.`,
    data: envio,
  };
};

export const getNovedadesFonograma = async (query: any) => {
    // Definir los valores permitidos para operación
    const OPERACIONES_VALIDAS = ["ALTA", "DATOS", "ARCHIVO", "TERRITORIO", "PARTICIPACION", "BAJA"] as const;

    // Obtener los parámetros de la query
    let { operacion, fonogramaId, fecha_desde, fecha_hasta, page = 1, limit = 50 } = query;

    // Manejo de filtros
    let whereCondition: any = {};

    // Filtrar por operación si se pasa en la query
    if (operacion) {
        const operacionArray = Array.isArray(operacion)
            ? operacion.map(op => op.toString())
            : [operacion.toString()];

        // Filtrar operaciones que sean válidas según la constante OPERACIONES_VALIDAS
        const operacionesValidas = operacionArray.filter((op): op is typeof OPERACIONES_VALIDAS[number] =>
            OPERACIONES_VALIDAS.includes(op as typeof OPERACIONES_VALIDAS[number])
        );

        if (operacionesValidas.length === 0) {
            throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.OPERATIONS_INVALID);
        }

        whereCondition.operacion = { [Op.in]: operacionesValidas };
    }

    // Agregar filtro por fonograma si se proporciona
    if (fonogramaId) {
        whereCondition.fonograma_id = fonogramaId;
    }

    // Filtrar por fecha de operación si se proporcionan `fecha_desde` y/o `fecha_hasta`
    if (fecha_desde || fecha_hasta) {
        whereCondition.fecha_operacion = {};
        if (fecha_desde) {
            whereCondition.fecha_operacion[Op.gte] = new Date(fecha_desde);
        }
        if (fecha_hasta) {
            whereCondition.fecha_operacion[Op.lte] = new Date(fecha_hasta);
        }
    }

    // Convertir `page` y `limit` a enteros y calcular `offset`
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const offset = (page - 1) * limit;

    // Obtener registros filtrados con paginación
    const { count, rows: novedades } = await FonogramaMaestro.findAndCountAll({
        where: whereCondition,
        include: [
            {
                model: Fonograma,
                as: "fonogramaDelMaestroDeFonograma",
                attributes: ["id_fonograma", "titulo", "isrc"],
            },
        ],
        attributes: ["id_fonograma_maestro", "fonograma_id", "operacion", "fecha_operacion"],
        order: [["fecha_operacion", "DESC"]],
        limit,
        offset,
    });

    // Verificar si hay novedades
    if (count === 0) {
        return { message: "No hay novedades pendientes de procesamiento." };
    }

    return {
        message: "Novedades encontradas.",
        total: count,
        page,
        limit,
        data: novedades,
    };
};

export const getEnviosByFonograma = async (fonogramaId: string) => {
    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findByPk(fonogramaId);
    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Obtener los envíos asociados al fonograma
    const envios = await FonogramaEnvio.findAll({
        where: { fonograma_id: fonogramaId },
        attributes: [
            "id_envio_vericast",
            "tipo_estado",
            "fecha_envio_inicial",
            "fecha_envio_ultimo",
            "createdAt",
            "updatedAt",
        ],
        order: [["fecha_envio_ultimo", "DESC"]],
    });

    if (!envios.length) {
        throw new Err.NotFoundError(MESSAGES.ERROR.ENVIO.NOT_FOUND);
    }

    return {
      fonograma_id: fonogramaId,
      envios,
    };
};


export const getAllEnvios = async (filters: any) => {
    const { nombre_tema, estado_envio, fecha_desde, fecha_hasta, page = 1, limit = 50 } = filters;

    const whereCondition: any = {};
    
    if (estado_envio) {
        whereCondition.tipo_estado = estado_envio;
    }

    if (fecha_desde) {
        whereCondition.fecha_envio_inicial = { [Op.gte]: new Date(fecha_desde) };
    }
    if (fecha_hasta) {
        whereCondition.fecha_envio_ultimo = { [Op.lte]: new Date(fecha_hasta) };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows: envios, count: total } = await FonogramaEnvio.findAndCountAll({
        where: whereCondition,
        attributes: [
            "id_envio_vericast",
            "tipo_estado",
            "fecha_envio_inicial",
            "fecha_envio_ultimo",
            "createdAt",
            "updatedAt",
        ],
        include: [
            {
                model: Fonograma,
                as: "fonogramaDelEnvio",
                attributes: ["titulo"],
                where: nombre_tema ? { titulo: { [Op.iLike]: `%${nombre_tema}%` } } : undefined,
            },
        ],
        order: [["fecha_envio_ultimo", "DESC"]],
        limit: Number(limit),
        offset,
    });

    if (!envios.length) {    
        return { message: "No se encontraron envíos con los criterios dados.", data: [], total, totalPages: 0 };
    }

    return {
        message: "Envíos obtenidos exitosamente.",
        data: envios,
        total,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit),
    };
};

export const addParticipacionToFonograma = async (fonogramaId: string, req: any) => {
    const { participaciones } = req.body;

    if (!participaciones || participaciones.length === 0) {
        throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.PARTICIPACION_NOT_PROVIDED);
    }

    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findByPk(fonogramaId);
    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Obtener usuario autenticado
    const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);
    
    const overlappingPeriods: string[] = [];

    // Procesar cada participación
    for (const participacion of participaciones) {
        const { cuit, porcentaje_participacion, fecha_inicio, fecha_hasta } = participacion;

        const productora = await Productora.findOne({ where: { cuit_cuil: cuit } });
        if (!productora) {
            throw new Err.BadRequestError(`No se encontró ninguna productora con el CUIT: ${cuit}`);
        }

        // Validar si la productora ya está registrada en el mismo período para este fonograma
        const participacionExistente = await FonogramaParticipacion.findOne({
            where: {
                fonograma_id: fonogramaId,
                productora_id: productora.id_productora,
                [Op.or]: [
                    { fecha_participacion_inicio: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                    { fecha_participacion_hasta: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                ],
            },
        });

        if (participacionExistente) {
            throw new Err.BadRequestError(
              `La productora con CUIT '${cuit}' ya tiene una participación registrada en este fonograma para el período entre ${fecha_inicio} y ${fecha_hasta}.`
            );
        }

        // Crear la nueva participación
        await FonogramaParticipacion.create({
            fonograma_id: fonogramaId,
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
            detalle: `Se registró la participación de la productora con CUIT '${cuit}' para el fonograma con ID '${fonogramaId}'`,
        });

        // Cargar en FonogramaMaestro
        await FonogramaMaestro.create({ fonograma_id: fonograma.id_fonograma, operacion: "PARTICIPACION", fecha_operacion: new Date() });

        // Verificar superposición de períodos
        const participacionesExistentes = await FonogramaParticipacion.findAll({
            where: {
                fonograma_id: fonogramaId,
                [Op.or]: [
                    { fecha_participacion_inicio: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                    { fecha_participacion_hasta: { [Op.between]: [fecha_inicio, fecha_hasta] } },
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

            // Llamar automáticamente a crearConflicto cuando se detecte exceso de participación
            await crearConflicto(req, fonograma.isrc, fecha_inicio, fecha_hasta);
        }
    }    

    // Responder con mensaje de éxito o advertencias
    const message = overlappingPeriods.length > 0
        ? `Participaciones agregadas con éxito, pero hay períodos donde se supera el 100% de participación: ${overlappingPeriods.join("; ")}`
        : "Participaciones agregadas exitosamente";

    return { message, data: { fonogramaId, participaciones } };
};

export const cargarParticipacionesMasivo = async (req: any) => {
    
  if (!req.file || !req.file.buffer) {
    throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.NO_CSV_FOUND);
  }

  const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

  const participaciones: any[] = [];
  const errores: string[] = [];
  const overlappingPeriods: string[] = [];

  // Leer y procesar el archivo CSV desde el buffer
  await new Promise<void>((resolve, reject) => {
    const stream = Readable.from(req.file!.buffer);
    stream
      .pipe(csv())
      .on("data", (data) => participaciones.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  // 1. Obtener todos los fonogramas y productoras en paralelo
  const isrcList = participaciones.map((p) => p.isrc);
  const cuitList = participaciones.map((p) => p.cuit);

  const [fonogramas, productoras] = await Promise.all([
    Fonograma.findAll({ where: { isrc: isrcList } }),
    Productora.findAll({ where: { cuit_cuil: cuitList } }),
  ]);

  // Convertir a mapas para acceso rápido
  const fonogramaMap = new Map(fonogramas.map((f) => [f.isrc, f]));
  const productoraMap = new Map(productoras.map((p) => [p.cuit_cuil, p]));

  // 2. Validar existencia de fonogramas y productoras
  participaciones.forEach(({ isrc, cuit }) => {
    if (!fonogramaMap.has(isrc)) {
      errores.push(`No se encontró ningún fonograma con el ISRC: ${isrc}`);
    }
    if (!productoraMap.has(cuit)) {
      errores.push(`No se encontró ninguna productora con el CUIT: ${cuit}`);
    }
  });

  // Filtrar participaciones válidas
  const participacionesValidas = participaciones.filter(
    ({ isrc, cuit }) => fonogramaMap.has(isrc) && productoraMap.has(cuit)
  );

  // 3. Obtener participaciones existentes en paralelo
  const participacionesExistentes = await Promise.all(
    participacionesValidas.map(({ isrc, cuit, fecha_inicio, fecha_hasta }) =>
      FonogramaParticipacion.findAll({
        where: {
          fonograma_id: fonogramaMap.get(isrc)!.id_fonograma,
          productora_id: productoraMap.get(cuit)!.id_productora,
          [Op.or]: [
            { fecha_participacion_inicio: { [Op.between]: [fecha_inicio, fecha_hasta] } },
            { fecha_participacion_hasta: { [Op.between]: [fecha_inicio, fecha_hasta] } },
          ],
        },
      })
    )
  );

  // 4. Validar superposición de períodos
  for (const [index, participacion] of participacionesValidas.entries()) {
    const { isrc, cuit, fecha_inicio, fecha_hasta, porcentaje_titularidad } = participacion;
    const existing = participacionesExistentes[index];

    if (existing.length > 0) {
      errores.push(
        `La productora con CUIT '${cuit}' ya tiene una participación en el fonograma '${isrc}' para el período.`
      );
      return;
    }

    const porcentajeTotal = existing.reduce(
      (sum, p) => sum + p.porcentaje_participacion,
      Number(porcentaje_titularidad)
    );

    if (porcentajeTotal > 100) {
      overlappingPeriods.push(
        `Entre ${fecha_inicio} y ${fecha_hasta}, el porcentaje total (${porcentajeTotal}%) supera el 100%.`
      );
      // Llamar automáticamente a crearConflicto cuando se detecte exceso de participación
      await crearConflicto(req, isrc, fecha_inicio, fecha_hasta);
    }
  }

  // 5. Crear nuevas participaciones en paralelo y registrar en FonogramaMaestro
  await Promise.all(
  participacionesValidas.map(async ({ isrc, cuit, fecha_inicio, fecha_hasta, porcentaje_titularidad }) => {
    const fonograma = fonogramaMap.get(isrc);
    const productora = productoraMap.get(cuit);

    if (!fonograma || !productora) return;

    // Crear la participación
    await FonogramaParticipacion.create({
      fonograma_id: fonograma.id_fonograma,
      productora_id: productora.id_productora,
      porcentaje_participacion: porcentaje_titularidad,
      fecha_participacion_inicio: fecha_inicio || new Date(),
      fecha_participacion_hasta: fecha_hasta || new Date("2099-12-31"),
    });

    // Registrar la operación en FonogramaMaestro
    await FonogramaMaestro.create({
      fonograma_id: fonograma.id_fonograma,
      operacion: "PARTICIPACION",
      fecha_operacion: new Date(),
    });    
  })
  );

  // 6. Registrar auditoría en paralelo
  await Promise.all(
    participacionesValidas.map(({ isrc, cuit }) =>
      registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaParticipacion",
        tipo_auditoria: "ALTA",
        detalle: `Se registró la participación de la productora con CUIT '${cuit}' en el fonograma '${isrc}'`,
      })
    )
  ); 

  // 7. Devolver respuesta final
  const message =
    overlappingPeriods.length > 0
      ? `Carga completada con advertencias: ${overlappingPeriods.join("; ")}`
      : "Carga completada exitosamente.";

  return { message, errores };
};

export const listParticipaciones = async (fonogramaId: string, query: any) => {
    const { fecha_inicio, fecha_hasta } = query;

    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findByPk(fonogramaId);
    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Construir filtro de búsqueda
    const whereCondition: any = { fonograma_id: fonogramaId };

    if (fecha_inicio && fecha_hasta) {
        whereCondition[Op.or] = [
            { fecha_participacion_inicio: { [Op.lte]: fecha_hasta } },
            { fecha_participacion_hasta: { [Op.gte]: fecha_inicio } }
        ];
    }

    // Obtener participaciones filtradas
    const participaciones = await FonogramaParticipacion.findAll({
        where: whereCondition,
        include: [
            {
                model: Productora,
                as: "productoraDeParticipante",
                attributes: ["id_productora", "nombre_productora", "cuit_cuil"]
            }
        ],
        order: [["fecha_participacion_inicio", "ASC"], ["fecha_participacion_hasta", "ASC"]]
    });

    if (!participaciones.length) {
        throw new Err.NotFoundError(MESSAGES.ERROR.PARTICIPACION.NOT_FOUND_PERIOD);
    }

    // Calcular los momentos en los que cambia la participación total
    const cambiosParticipacion: { [key: string]: number } = {};
    let participacionAcumulada = 0;

    participaciones.forEach((participacion) => {
        const inicio = participacion.fecha_participacion_inicio.toISOString().split("T")[0];
        const fin = participacion.fecha_participacion_hasta.toISOString().split("T")[0];

        // Incrementar la participación en la fecha de inicio
        if (!cambiosParticipacion[inicio]) cambiosParticipacion[inicio] = participacionAcumulada;
        cambiosParticipacion[inicio] += participacion.porcentaje_participacion;

        // Disminuir la participación en la fecha de fin (cuando deja de ser válida)
        if (!cambiosParticipacion[fin]) cambiosParticipacion[fin] = participacionAcumulada;
        cambiosParticipacion[fin] -= participacion.porcentaje_participacion;
    });

    // Ordenar los cambios de participación por fecha
    const momentosClave = Object.keys(cambiosParticipacion)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .reduce((acc, fecha) => {
            participacionAcumulada = cambiosParticipacion[fecha];
            acc[fecha] = participacionAcumulada;
            return acc;
        }, {} as { [key: string]: number });

    return {
        fonograma_id: fonogramaId,
        participaciones,
        momentosClave
    };  
};

export const updateParticipacion = async (fonogramaId: string, participacionId: string, req: any) => {  

    const { porcentaje_participacion, fecha_participacion_inicio, fecha_participacion_hasta } = req.body;

    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findByPk(fonogramaId);
    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Verificar si la participación existe y pertenece al fonograma
    const participacion = await FonogramaParticipacion.findOne({
        where: { id_participacion: participacionId, fonograma_id: fonogramaId }
    });

    if (!participacion) {
        throw new Err.NotFoundError(MESSAGES.ERROR.PARTICIPACION.NOT_FOUND);
    }

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Obtener todas las participaciones en el período actualizado
    const participacionesEnPeriodo = await FonogramaParticipacion.findAll({
        where: {
            fonograma_id: fonogramaId,
            id_participacion: { [Op.ne]: participacionId }, // Excluir la participación a actualizar
            [Op.or]: [
                { fecha_participacion_inicio: { [Op.between]: [fecha_participacion_inicio, fecha_participacion_hasta] } },
                { fecha_participacion_hasta: { [Op.between]: [fecha_participacion_inicio, fecha_participacion_hasta] } }
            ]
        }
    });

    // Calcular el total de participación dentro del período actualizado
    const totalParticipacion = participacionesEnPeriodo.reduce(
        (sum, p) => sum + p.porcentaje_participacion,
        porcentaje_participacion // Incluir el nuevo porcentaje de la participación actualizada
    );

    // Mensaje de advertencia si supera el 100%
    let warningMessage = null;
    if (totalParticipacion > 100) {
        warningMessage = `Advertencia: El total de participación en el período ${fecha_participacion_inicio} - ${fecha_participacion_hasta} ahora es ${totalParticipacion}%, lo que supera el 100%.`;
    }

    // Actualizar la participación
    await participacion.update({
        porcentaje_participacion,
        fecha_participacion_inicio,
        fecha_participacion_hasta
    });

    // Registrar la operación en FonogramaMaestro
    await FonogramaMaestro.create({
        fonograma_id: fonograma.id_fonograma,
        operacion: "PARTICIPACION",
        fecha_operacion: new Date(),
    });

    // Registrar auditoría
    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaParticipacion",
        tipo_auditoria: "CAMBIO",
        detalle: `Se actualizó la participación de la productora con CUIT '${participacion.productoraDeParticipante?.cuit_cuil}' para el fonograma con ID '${fonogramaId}'`,
    });  

    return {
        message: "Participación actualizada exitosamente.",
        data: participacion,
        warning: warningMessage || undefined // Solo se incluye si hay una advertencia
    }; 
};

export const deleteParticipacion = async (fonogramaId: string, participacionId: string, req: any) => {

    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findByPk(fonogramaId);
    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Verificar si la participación existe e incluir la relación con la productora
    const participacion = await FonogramaParticipacion.findOne({
        where: { id_participacion: participacionId, fonograma_id: fonogramaId },
        include: [{ model: Productora, as: "productoraDeParticipante" }]
    });

    if (!participacion) {
        throw new Err.NotFoundError(MESSAGES.ERROR.PARTICIPACION.NOT_FOUND);
    }

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Guardar los datos del período antes de eliminar la participación
    const { fecha_participacion_inicio, fecha_participacion_hasta } = participacion;

    // Eliminar la participación
    await participacion.destroy();

    // Registrar la operación en FonogramaMaestro
    await FonogramaMaestro.create({
        fonograma_id: fonograma.id_fonograma,
        operacion: "PARTICIPACION",
        fecha_operacion: new Date(),
    });

    // Registrar auditoría de eliminación
    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaParticipacion",
        tipo_auditoria: "BAJA",
        detalle: `Se eliminó la participación de '${participacion.productoraDeParticipante?.nombre_productora}' del fonograma '${fonogramaId}'`,
    });

    // Recalcular la participación total en el período de la participación eliminada
    const totalParticipacionEnPeriodo = await FonogramaParticipacion.sum('porcentaje_participacion', {
        where: {
            fonograma_id: fonogramaId,
            [Op.or]: [
                { fecha_participacion_inicio: { [Op.between]: [fecha_participacion_inicio, fecha_participacion_hasta] } },
                { fecha_participacion_hasta: { [Op.between]: [fecha_participacion_inicio, fecha_participacion_hasta] } }
            ]
        }
    });   

    // Mensaje de advertencia si el total en el período sigue siendo mayor al 100%
    let warningMessage = null;
    if (totalParticipacionEnPeriodo > 100) {
        warningMessage = `Advertencia: Luego de eliminar la participación, el total de participación en el período ${fecha_participacion_inicio} - ${fecha_participacion_hasta} sigue siendo ${totalParticipacionEnPeriodo}%, lo que supera el 100%.`;
    }

    return {
        message: "Participación eliminada exitosamente.",
        warning: warningMessage || undefined
    };
};

export const addTerritorioToFonograma = async (fonogramaId: string, req: any) => {

    const { codigo_iso, is_activo = true } = req.body; // is_activo por defecto en true

    if (!codigo_iso) {
       throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.TERRITORIO_ISO_NOT_FOUND);
    }
    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findByPk(fonogramaId);
    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Verificar si el territorio existe en FonogramaTerritorio y se encuentra habilitado
    const territorio = await FonogramaTerritorio.findOne({ where: { codigo_iso, is_habilitado: true } });
    if (!territorio) {
        throw new Err.NotFoundError(MESSAGES.ERROR.TERRITORIO.NOT_FOUND);
    }

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Verificar si el fonograma ya tiene este territorio registrado en FonogramaTerritorioMaestro
    const territorioExistente = await FonogramaTerritorioMaestro.findOne({
        where: {
            fonograma_id: fonogramaId,
            territorio_id: territorio.id_territorio,
        },
    });

    if (territorioExistente) {
        throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.TERRITORIO_ALREADY_EXIST);
    }

    // Crear la nueva relación en FonogramaTerritorioMaestro con is_activo definido por el usuario o en true por defecto
    const nuevoVinculo = await FonogramaTerritorioMaestro.create({
        fonograma_id: fonogramaId,
        territorio_id: territorio.id_territorio,
        is_activo,
    });

    // Registrar la operación en FonogramaMaestro
    await FonogramaMaestro.create({
        fonograma_id: fonograma.id_fonograma,
        operacion: "TERRITORIO",
        fecha_operacion: new Date(),
    });

    // Registrar auditoría
    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaTerritorioMaestro",
        tipo_auditoria: "ALTA",
        detalle: `Se agregó el territorio '${territorio.codigo_iso}' al fonograma con ID '${fonogramaId}', estado: ${is_activo ? "Activo" : "Inactivo"}`,
    });

    return {
        message: "Territorio agregado exitosamente al fonograma.",
        data: nuevoVinculo,
    };
};

export const listTerritorios = async (fonogramaId: string) => {

    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findByPk(fonogramaId);
    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Obtener todos los territorios habilitados vinculados a este fonograma
    const territorios = await FonogramaTerritorioMaestro.findAll({
        where: { fonograma_id: fonogramaId },
        include: [
            {
                model: FonogramaTerritorio,
                as: "territorioDelVinculo",
                attributes: ["id_territorio", "nombre_pais", "codigo_iso", "is_habilitado"],
                where: { is_habilitado: true } // Filtrar solo los territorios habilitados
            }
        ],
        order: [["createdAt", "ASC"]] // Ordenar por fecha de vinculación
    });

    if (!territorios.length) {
        throw new Err.NotFoundError(MESSAGES.ERROR.TERRITORIO.NOT_ASSIGNED);
    }

    // Formatear respuesta
    const resultado = territorios.map(vinculo => ({
        id_territorio_maestro: vinculo.id_territorio_maestro,
        id_territorio: vinculo.territorioDelVinculo?.id_territorio,
        nombre_pais: vinculo.territorioDelVinculo?.nombre_pais,
        codigo_iso: vinculo.territorioDelVinculo?.codigo_iso,
        is_habilitado: vinculo.territorioDelVinculo?.is_habilitado,
        is_activo: vinculo.is_activo
    }));

    return {
        fonograma_id: fonogramaId,
        territorios: resultado
    };
};

export const updateTerritorio = async (fonogramaId: string, territorioId: string, req: any) => {
    const { is_activo } = req.body;

    // Validar que is_activo sea booleano
    if (typeof is_activo !== "boolean") {
        throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.TERRITORIO_STATUS_NOT_FOUND);
    }

    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findByPk(fonogramaId);
    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
    
    // Verificar si el territorio está habilitado en FonogramaTerritorio
    const territorio = await FonogramaTerritorio.findByPk(territorioId);

    if (!territorio) {
        throw new Err.NotFoundError(MESSAGES.ERROR.TERRITORIO.NOT_FOUND);
    }

    if (!territorio.is_habilitado) {
        throw new Err.ForbiddenError(MESSAGES.ERROR.TERRITORIO.NOT_ENABLED);
    }

    // Verificar si el territorio está vinculado al fonograma en FonogramaTerritorioMaestro
    const territorioVinculado = await FonogramaTerritorioMaestro.findOne({
        where: { fonograma_id: fonogramaId, territorio_id: territorioId },
    });

    if (!territorioVinculado) {
        throw new Err.NotFoundError(MESSAGES.ERROR.TERRITORIO.NOT_ASSIGNED);
    }

    // Actualizar el estado is_activo
    await territorioVinculado.update({ is_activo });

    // Registrar la operación en FonogramaMaestro
    await FonogramaMaestro.create({
        fonograma_id: fonograma.id_fonograma,
        operacion: "TERRITORIO",
        fecha_operacion: new Date(),
    });

    // Registrar auditoría
    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaTerritorioMaestro",
        tipo_auditoria: "CAMBIO",
        detalle: `Se actualizó el estado de territorio ID '${territorioId}' en el fonograma '${fonogramaId}' a ${is_activo ? "Activo" : "Inactivo"}.`,
    });

    return {
        message: "Estado del territorio actualizado exitosamente.",
        data: {
            fonograma_id: fonogramaId,
            territorio_id: territorioId,
            is_activo,
        },
    };
};

export const deleteTerritorio = async (fonogramaId: string, territorioId: string, req: any) => {

    // Verificar si el fonograma existe
    const fonograma = await Fonograma.findByPk(fonogramaId);
    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Verificar si el territorio está vinculado al fonograma en FonogramaTerritorioMaestro
    const territorioVinculado = await FonogramaTerritorioMaestro.findOne({
        where: { fonograma_id: fonogramaId, territorio_id: territorioId },
    });

    if (!territorioVinculado) {
        throw new Err.NotFoundError(MESSAGES.ERROR.TERRITORIO.NOT_ASSIGNED);
    }

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Eliminar la relación del territorio con el fonograma
    await territorioVinculado.destroy();

    // Registrar la operación en FonogramaMaestro
    await FonogramaMaestro.create({
        fonograma_id: fonograma.id_fonograma,
        operacion: "TERRITORIO",
        fecha_operacion: new Date(),
    });

    // Registrar auditoría
    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaTerritorioMaestro",
        tipo_auditoria: "BAJA",
        detalle: `Se eliminó el territorio ID '${territorioId}' del fonograma '${fonogramaId}'.`,
    });

    return {
        message: "Territorio eliminado exitosamente del fonograma.",
        data: {
            fonograma_id: fonogramaId,
            territorio_id: territorioId
        },
    };   
};