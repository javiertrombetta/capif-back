import { Op } from "sequelize";
import { Readable } from "stream";
import { parse } from "json2csv";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import Client from "ftp";

import { UsuarioResponse } from "../interfaces/UsuarioResponse";

import { Fonograma, FonogramaArchivo, FonogramaEnvio, FonogramaMaestro, FonogramaParticipacion, FonogramaTerritorio, FonogramaTerritorioMaestro, Productora, ProductoraISRC } from "../models";

import { getAuthenticatedUser } from "./authService";
import { registrarAuditoria } from "./auditService";

import * as MESSAGES from "../utils/messages";
import * as Err from "../utils/customErrors";


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
        }
    }

    // Recalcular y actualizar el porcentaje total de titularidad del fonograma al día de hoy para el modelo Productora
    const totalParticipationToday = await FonogramaParticipacion.sum('porcentaje_participacion', {
        where: {
            fonograma_id: fonograma.id_fonograma,
            fecha_participacion_inicio: { [Op.lte]: new Date() },
            fecha_participacion_hasta: { [Op.gte]: new Date() },
        },
    });

        fonograma.porcentaje_titularidad_total = totalParticipationToday || 0;
        await fonograma.save();

    // Verificar si hubo períodos superpuestos y cargalos como mensaje de retorno
    const message = overlappingPeriods.length > 0
        ? `Fonograma creado con éxito, pero hay períodos donde se supera el 100% de participación: ${overlappingPeriods.join("; ")}`
        : "Fonograma creado exitosamente";


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

    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaMaestro",
        tipo_auditoria: "ALTA",
        detalle: `Se registró el alta del fonograma ID: '${fonograma.id_fonograma}'`,
    });

    return {
        fonograma,
        message: "Fonograma creado exitosamente",
    };
};

export const cargarRepertoriosMasivo = async (req: any) => {
    
    if (!req.file || !req.file.buffer) {
      throw new Err.BadRequestError("Debe proporcionar un archivo CSV.");
    }

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
                            porcentaje_participacion
                        );

                        if (porcentajeSuperpuesto > 100) {
                            conflictos.push(
                                `Conflicto en el fonograma con ISRC '${isrc}': El porcentaje total supera el 100% entre ${fecha_inicio} y ${fecha_hasta} (${porcentajeSuperpuesto}%)`
                            );
                        }
                    }
                }

                // Recalcular y actualizar el porcentaje total de titularidad del fonograma al día de hoy
                const totalParticipationToday = await FonogramaParticipacion.sum('porcentaje_participacion', {
                    where: {
                        fonograma_id: fonograma.id_fonograma,
                        fecha_participacion_inicio: { [Op.lte]: new Date() },
                        fecha_participacion_hasta: { [Op.gte]: new Date() },
                    },
                });

                fonograma.porcentaje_titularidad_total = totalParticipationToday || 0;
                await fonograma.save();

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
            } catch (err:any) {
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
      throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Devolver el fonograma encontrado
    return fonograma;
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
      // Eliminar asociaciones relacionadas
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
          detalle: `El fonograma con ID '${id}' y todas sus asociaciones han sido eliminados.`,
      });

      return {
          message: `El fonograma con ID '${id}' y sus asociaciones han sido eliminados exitosamente.`,
      };
    } catch (err: any) {
        throw new Error(`Error al eliminar el fonograma con ID '${id}': ${err.message}`);
    }

};

export const listFonogramas = async (search?: string) => {

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
    return {
        data: fonogramas,
        total: fonogramas.length,
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

      // Registrar auditoría en FonogramaMaestro
      await registrarAuditoria({
          usuario_originario_id: authUser.id_usuario,
          usuario_destino_id: null,
          modelo: "FonogramaMaestro",
          tipo_auditoria: "ARCHIVO",
          detalle: `Se registró el cambio de archivo en el fonograma ID: '${fonograma.id_fonograma}'`,
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
const subirArchivoFTP = (zipPath: string, isrc: string, FTP_CONFIG: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const client = new Client();
    client.on("ready", () => {
      client.put(zipPath, `/uploads/${isrc}.zip`, (err: any) => {
        if (err) {
          reject(new Error(`Error al subir el archivo ${zipPath}: ${err.message}`));
        } else {
          console.log(`Archivo ${zipPath} subido correctamente.`);
          resolve();
        }
        client.end();
      });
    });
    client.connect(FTP_CONFIG);
  });
};

// EnviarFonograma: Función para eliminar archivos temporales
const eliminarArchivosTemporales = (paths: string[], audioPath: string | null) => {
  try {
    paths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  } catch (err) {
    console.warn("Error al eliminar archivos temporales:", err);
  }
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
        await subirArchivoFTP(zipPath, isrc, FTP_CONFIG);

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
        eliminarArchivosTemporales([zipPath, metadataPath], audioExists ? path.join(resourcesDir, path.basename(archivoAudio)) : null);
    }

    return { message: "Fonogramas enviados correctamente." };
};

export const getNovedadesFonograma = async (query: any) => {

    // Definir los valores permitidos para operación
    const OPERACIONES_VALIDAS = ["ALTA", "DATOS", "ARCHIVO", "TERRITORIO", "PARTICIPACION", "BAJA"] as const;  
 
    // Obtener los parámetros de la query
    let { operacion, isProcesado } = query;

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
          throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.OPERATIONS_INVALID);
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
        return { message: "No hay novedades pendientes de procesamiento." };
    }

    return {
        message: "Novedades encontradas.",
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
        }
    }

    // Recalcular y actualizar el porcentaje total de titularidad del fonograma al día de hoy
    const totalParticipationToday = await FonogramaParticipacion.sum('porcentaje_participacion', {
        where: {
            fonograma_id: fonograma.id_fonograma,
            fecha_participacion_inicio: { [Op.lte]: new Date() },
            fecha_participacion_hasta: { [Op.gte]: new Date() },
        },
    });

    fonograma.porcentaje_titularidad_total = totalParticipationToday || 0;
    await fonograma.save();

    // Responder con mensaje de éxito o advertencias
    const message = overlappingPeriods.length > 0
        ? `Participaciones agregadas con éxito, pero hay períodos donde se supera el 100% de participación: ${overlappingPeriods.join("; ")}`
        : "Participaciones agregadas exitosamente";

    return { message, data: { fonogramaId, participaciones } };
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
                attributes: ["id_productora", "nombre", "cuit_cuil"]
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
    await participacion.update(
        {
            porcentaje_participacion,
            fecha_participacion_inicio,
            fecha_participacion_hasta
        }
    );

    // Registrar auditoría
    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaParticipacion",
        tipo_auditoria: "CAMBIO",
        detalle: `Se actualizó la participación de la productora con CUIT '${participacion.productoraDeParticipante?.cuit_cuil}' para el fonograma con ID '${fonogramaId}'`,
    });

    // Recalcular y actualizar el porcentaje total de titularidad del fonograma al día de hoy
    const totalParticipationToday = await FonogramaParticipacion.sum('porcentaje_participacion', {
        where: {
            fonograma_id: fonogramaId,
            fecha_participacion_inicio: { [Op.lte]: new Date() },
            fecha_participacion_hasta: { [Op.gte]: new Date() },
        },
    });

    fonograma.porcentaje_titularidad_total = totalParticipationToday || 0;
    await fonograma.save();

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

    // Verificar si la participación existe
    const participacion = await FonogramaParticipacion.findOne({
        where: { id_participacion: participacionId, fonograma_id: fonogramaId }
    });

    if (!participacion) {
        throw new Err.NotFoundError(MESSAGES.ERROR.PARTICIPACION.NOT_FOUND);
    }

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Guardar los datos del período antes de eliminar la participación
    const { fecha_participacion_inicio, fecha_participacion_hasta, porcentaje_participacion } = participacion;

    // Eliminar la participación
    await participacion.destroy();

    // Registrar auditoría de eliminación
    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaParticipacion",
        tipo_auditoria: "BAJA",
        detalle: `Se eliminó la participación con ID '${participacionId}' del fonograma '${fonogramaId}'`,
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

    // Recalcular y actualizar el porcentaje total de titularidad del fonograma al día de hoy
    const totalParticipationToday = await FonogramaParticipacion.sum('porcentaje_participacion', {
        where: {
            fonograma_id: fonogramaId,
            fecha_participacion_inicio: { [Op.lte]: new Date() },
            fecha_participacion_hasta: { [Op.gte]: new Date() },
        },
    });

    fonograma.porcentaje_titularidad_total = totalParticipationToday || 0;
    await fonograma.save();

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

    // Verificar si el territorio existe en FonogramaTerritorio
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

    // Obtener todos los territorios vinculados a este fonograma
    const territorios = await FonogramaTerritorioMaestro.findAll({
        where: { fonograma_id: fonogramaId },
        include: [
            {
                model: FonogramaTerritorio,
                as: "territorioDelVinculo",
                attributes: ["id_territorio", "nombre_pais", "codigo_iso", "is_habilitado"]
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

    // Verificar si el territorio está vinculado al fonograma en FonogramaTerritorioMaestro
    const territorioVinculado = await FonogramaTerritorioMaestro.findOne({
        where: { fonograma_id: fonogramaId, territorio_id: territorioId },
    });

    if (!territorioVinculado) {
        throw new Err.NotFoundError(MESSAGES.ERROR.TERRITORIO.NOT_ASSIGNED);
    }

    // Actualizar el estado is_activo
    await territorioVinculado.update({ is_activo });

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