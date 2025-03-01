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
import { registrarAuditoria, registrarRepertorio } from "./auditService";

import * as MESSAGES from "../utils/messages";
import * as Err from "../utils/customErrors";
import { sendEmailWithErrorHandling } from "./emailService";
import { createProductoraMessage } from "./productoraService";
import { crearConflicto } from "./conflictosService";

const fonogramaIncludeModels = [
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
      "fecha_participacion_inicio",
      "fecha_participacion_hasta",
      "porcentaje_participacion",
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
        where: { is_habilitado: true },
      },
    ],
  },
  {
    model: Productora,
    as: "productoraDelFonograma",
    attributes: ["id_productora", "nombre_productora", "cuit_cuil"],
  },
];

const fonogramaAttributes = [
  "id_fonograma",
  "estado_fonograma",
  "isrc",
  "titulo",
  "artista",
  "album",
  "duracion",
  "anio_lanzamiento",
  "sello_discografico",
  "is_dominio_publico",
  "cantidad_conflictos_activos",
];

export const validateISRC = async (isrc: string) => {
  if (!isrc || typeof isrc !== "string") {
    throw new Err.BadRequestError(MESSAGES.ERROR.ISRC.ISRC_REQUIRED);
  }

  const fonogramaExistente = await Fonograma.findOne({ where: { isrc } });

  if (fonogramaExistente) {
    return {
      available: false,
      message: MESSAGES.ERROR.ISRC.ISRC_IN_USE,
      id_repertorio: fonogramaExistente.id_fonograma,
    };
  }

  return { available: true, message: MESSAGES.SUCCESS.ISRC.ISRC_AVAILABLE };
};

export const createFonograma = async (req: any) => {
  
    const {
      productora_id: bodyProductoraId,
      cuit,
      isrc,
      titulo,
      artista,
      album,
      duracion,
      anio_lanzamiento,
      sello_discografico,
      territorios: territoriosActivos
    } = req.body;

    // Verificar el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Determinar si el usuario es un productor o un administrador
    const isAdmin = authUser.rol?.nombre_rol === "admin_principal" || authUser.rol?.nombre_rol === "admin_secundario";

    // Chequear si tiene un req.productoraId
    if(!isAdmin && !req.productoraId){
        throw new Err.NotFoundError(`No se encontró una productora activa en la solicitud.`);
    }

    // Obtener productora_id
    let productora_id = isAdmin ? bodyProductoraId : req.productoraId;

    // Si el usuario es admin, se puede buscar con el cuit
    if (isAdmin && !productora_id && cuit) {
        const productora = await Productora.findOne({ where: { cuit_cuil: cuit } });
        if (!productora) {
            throw new Err.NotFoundError(`No se encontró ninguna productora con el CUIT: ${cuit}`);
        }
        productora_id = productora.id_productora;
    }

    if (!productora_id) throw new Err.ForbiddenError("Acceso denegado: no se encontró el ID de la productora.");       

    // Verificar si existe el fonograma
    const existingFonograma = await Fonograma.findOne({ where: { isrc } });
    if (existingFonograma) throw new Err.ConflictError("Ya existe un repertorio declarado con el ISRC a generar.");

    // Calcular si es dominio público
    const currentYear = new Date().getFullYear();
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

    await registrarRepertorio({
        usuario_registrante_id: authUser.id_usuario,
        fonograma_id: fonograma.id_fonograma,
        tipo_auditoria: "ALTA",
        detalle: `Se registró el fonograma con ISRC '${isrc}', título '${titulo}', y productora '${productora_id}'.`,
    });

    // Actualizar la fecha_ultimo_fonograma en la Productora
    await Productora.update(
        { fecha_ultimo_fonograma: new Date() },
        { where: { id_productora: productora_id } }
    );
    
    // Registrar las participaciones del fonograma
    const participacionResponse = await addParticipacionToFonograma(fonograma.id_fonograma, req);

    // Registrar los territorios
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

    await FonogramaEnvio.create({
        fonograma_id: fonograma.id_fonograma,
        tipo_estado: 'PENDIENTE DE ENVIO',
        tipo_contenido: 'DATOS',
        fecha_envio_inicial: null,
        fecha_envio_ultimo: null,
    });    

    await registrarAuditoria({
        usuario_originario_id: authUser.id_usuario,
        usuario_destino_id: null,
        modelo: "FonogramaEnvio",
        tipo_auditoria: "ALTA",
        detalle: `Se registró el envío del fonograma con ID: '${fonograma.id_fonograma}' en estado 'PENDIENTE DE ENVIO' y contenido 'DATOS'.`,
    });

    return {
        message: 'Fonograma creado existosamente.',
        data: {
            ...fonograma.toJSON(),
            participaciones: participacionResponse.data.participacionesAgregadas
        }
    };
};

const parseFecha = (fecha: string) => {
    if (!fecha) return null; // Maneja valores vacíos
    const partes = fecha.split("/");
    if (partes.length !== 3) return null; // Maneja formatos incorrectos
    const [dia, mes, anio] = partes.map(n => n.padStart(2, "0")); // Asegura formato correcto
    return `${anio}-${mes}-${dia}`; // Retorna en formato YYYY-MM-DD
};

export const cargarRepertoriosMasivo = async (req: any) => {
    
    if (!req.file || !req.file.buffer) throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.NO_CSV_FOUND);

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    const resultados: any[] = [];
    const errores: string[] = [];
    const registrosCreados: any[] = [];
    const conflictos: string[] = [];
    const isrcExistentes: any[] = [];
    
    // Leer y procesar el archivo CSV desde el stream del request
    await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(req.file!.buffer);
        stream
            .pipe(csv())
            .on("data", (data) => {
                // Convertir las claves a mayúsculas
                const row = Object.keys(data).reduce((acc, key) => {
                    acc[key.trim().toUpperCase()] = data[key].trim();
                    return acc;
                }, {} as Record<string, string>);

                resultados.push(row);
            })
            .on("end", resolve)
            .on("error", reject);
    });

    console.log("Datos procesados del CSV:", resultados);

    // Obtener todos los territorios habilitados en un Map para búsqueda rápida
    const territoriosDisponibles = await FonogramaTerritorio.findAll({ 
        attributes: ["codigo_iso", "id_territorio"],
        where: { is_habilitado: true }
    });

    const territoriosMapa = new Map(
        territoriosDisponibles.map(t => [t.codigo_iso, t.id_territorio])
    );

    // Procesar cada registro del CSV
    await Promise.all(
        resultados.map(async (row, index) => {
            try {
                console.log("Fila procesada:", row);

                    // Extraer datos asegurando mayúsculas
                    const CUIT = row["CUIT"] || "";
                    const ISRC = row["ISRC"] || "";
                    const ARTISTA = row["ARTISTA"] || "";
                    const TEMA = row["TEMA"] || "";
                    const ALBUM = row["ALBUM"] || "";
                    const DURACION = row["DURACION"] || "";
                    const ANIO_PUBLICACION = row["ANIO_PUBLICACION"] || "";
                    const SELLO_DISCOGRAFICO = row["SELLO_DISCOGRAFICO"] || "";
                    const TITULAR_DESDE = parseFecha(row["TITULAR_DESDE"]);
                    const TITULAR_HASTA = parseFecha(row["TITULAR_HASTA"]);
                    const PORCENTAJE_TITULARIDAD = row["PORCENTAJE_TITULARIDAD"] || "";
                    const TERRITORIALIDAD = row["TERRITORIALIDAD"] || "";

                    if (!CUIT || !ISRC) {
                        errores.push(`Error en fila ${index + 1}: CUIT o ISRC vacío.`);
                        return;
                    }

                    console.log(`Procesando fila ${index + 1}, CUIT:`, CUIT);
                    
                    // Verificar la productora según el CUIT
                    const productora = await Productora.findOne({ where: { cuit_cuil: CUIT } });
                    if (!productora) {
                        errores.push(`No se encontró productora con CUIT '${CUIT}'`);
                        return;
                    }

                    // Definir el sello discográfico a insertar
                    const selloFinal = SELLO_DISCOGRAFICO || productora.nombre_productora;            
                        
                    // Fecha para dominio público
                    const currentYear = new Date().getFullYear();   

                    // Verificar si el fonograma ya existe
                    let fonograma = await Fonograma.findOne({ where: { isrc: ISRC } });

                    // Crear el fonograma
                    if (!fonograma) {
                        fonograma = await Fonograma.create({
                            productora_id: productora.id_productora,
                            isrc: ISRC,
                            titulo: TEMA,
                            artista: ARTISTA,
                            album: ALBUM,
                            duracion: DURACION,
                            anio_lanzamiento: ANIO_PUBLICACION,
                            sello_discografico: selloFinal,
                            is_dominio_publico: currentYear - Number(ANIO_PUBLICACION) > 70,
                            estado_fonograma: "ACTIVO",
                            fecha_ultimo_fonograma: new Date(),
                        });

                        await registrarAuditoria({
                            usuario_originario_id: authUser.id_usuario,
                            modelo: "Fonograma",
                            tipo_auditoria: "ALTA",
                            detalle: `Se creó el fonograma '${TEMA}' con ISRC '${ISRC}'`,
                        });

                        await registrarRepertorio({
                            usuario_registrante_id: authUser.id_usuario,
                            fonograma_id: fonograma.id_fonograma,
                            tipo_auditoria: "ALTA",
                            detalle: `Se creó el fonograma '${TEMA}' con ISRC '${ISRC}'`,
                        });

                        // Actualizar la fecha_ultimo_fonograma en la Productora
                        await Productora.update(
                            { fecha_ultimo_fonograma: new Date() },
                            { where: { id_productora: productora.id_productora } }
                        );

                        // Registrar en FonogramaMaestro
                        await FonogramaMaestro.create({
                            fonograma_id: fonograma.id_fonograma,
                            operacion: "ALTA",
                            fecha_operacion: new Date(),
                        });

                        await FonogramaEnvio.create({
                            fonograma_id: fonograma.id_fonograma,
                            tipo_estado: "PENDIENTE DE ENVIO",
                            tipo_contenido: "DATOS",
                            fecha_envio_inicial: null,
                            fecha_envio_ultimo: null,
                        });

                        await registrarAuditoria({
                            usuario_originario_id: authUser.id_usuario,
                            usuario_destino_id: null,
                            modelo: "FonogramaEnvio",
                            tipo_auditoria: "ALTA",
                            detalle: `Se registró el envío del fonograma con ID: '${fonograma.id_fonograma}' en estado 'PENDIENTE DE ENVIO' y contenido 'DATOS'.`,
                        });

                    } else {
                        isrcExistentes.push(ISRC);
                    }
                        
                    // Registrar participación
                    const resultadoParticipacion = await addParticipacionToFonograma(fonograma.id_fonograma, {
                        body: {
                            participaciones: [{
                                cuit: CUIT,
                                porcentaje_participacion: PORCENTAJE_TITULARIDAD,
                                fecha_inicio: TITULAR_DESDE,
                                fecha_hasta: TITULAR_HASTA,
                            }]
                        },
                        userId: authUser.id_usuario,
                    });

                    if (resultadoParticipacion.message.includes("se supera el 100%")) {
                        conflictos.push(resultadoParticipacion.message);
                    }
                    
                    // Registrar territorios
                    if (TERRITORIALIDAD) {
                        const codigosISO = TERRITORIALIDAD.split(";").map((c: string) => c.trim());
                        const territoriosValidos = codigosISO
                            .map((codigo: string) => territoriosMapa.get(codigo))
                            .filter(Boolean);

                        for (const territorio_id of territoriosValidos) {
                            await FonogramaTerritorioMaestro.create({
                                fonograma_id: fonograma.id_fonograma,
                                territorio_id,
                                is_activo: true,
                            });

                            await registrarAuditoria({
                                usuario_originario_id: authUser.id_usuario,
                                usuario_destino_id: null,
                                modelo: "FonogramaTerritorioMaestro",
                                tipo_auditoria: "ALTA",
                                detalle: `Se registró el territorio con ID '${territorio_id}' para el fonograma con ISRC '${ISRC}'`,
                            });
                        }
                    }
                    registrosCreados.push({ TEMA, ISRC });

            } catch (err: any) {
                errores.push(`Error en fila ${index + 1}: ${err.message}`);
            }
        })
    );

    // Responder con resultados
    return {
        message: "Carga masiva completada",
        registrosCreados,
        isrcExistentes,
        conflictos,
        errores,
    };
};

export const getFonogramaById = async (id: string) => {
  // Buscar el fonograma por ID
  const fonograma = await Fonograma.findOne({
    where: { id_fonograma: id },
    include: fonogramaIncludeModels,
    attributes: fonogramaAttributes,
  });

  // Verificar si el fonograma existe
  if (!fonograma) {
    throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
  }

  return {
    message: "Fonograma obtenido exitosamente.",
    data: fonograma,
  };
};

export const listFonogramas = async (req: any) => {
  // Verifica el usuario autenticado y obtiene sus relaciones con productoras
  const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);

  // Comprobar que el rol esté presente
  if (!authUser.rol) {
    throw new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED);
  }

  const { query } = req;
  const whereClause: any = {};

  const rolesProductores = ["productor_principal", "productor_secundario"];

  // Si el usuario es un productor, validar que la productora esté en authMaestros
  if (rolesProductores.includes(authUser.rol.nombre_rol)) {
    if (!req.productoraId) {
      throw new Error("El usuario productor no tiene una productora asignada.");
    }

    // Verificar que la productora exista en los maestros del usuario
    const productoraExiste = authMaestros.some(maestro => maestro.productora_id === req.productoraId);
    
    if (!productoraExiste) {
      throw new Error("La productora seleccionada no está asociada al usuario.");
    }

    whereClause.productora_id = req.productoraId;
  }

  // Aplicar filtros de búsqueda
  if (query.isrc) whereClause.isrc = { [Op.iLike]: `%${query.isrc}%` };
  if (query.titulo) whereClause.titulo = { [Op.iLike]: `%${query.titulo}%` };
  if (query.artista) whereClause.artista = { [Op.iLike]: `%${query.artista}%` };
  if (query.album) whereClause.album = { [Op.iLike]: `%${query.album}%` };
  if (query.anio_lanzamiento) whereClause.anio_lanzamiento = query.anio_lanzamiento;
  if (query.sello_discografico) whereClause.sello_discografico = { [Op.iLike]: `%${query.sello_discografico}%` };
  if (query.nombre_productora) {
    whereClause["$productoraDelFonograma.nombre_productora$"] = { [Op.iLike]: `%${query.nombre_productora}%` };
  }
  if (query.estado_fonograma && ["ACTIVO", "INACTIVO"].includes(query.estado_fonograma.toUpperCase())) {
    whereClause.estado_fonograma = query.estado_fonograma.toUpperCase();
  }  

  // Paginación
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 50;
  const offset = (page - 1) * limit;

  // Obtener el total de registros sin paginación
  const total = await Fonograma.count({
    where: whereClause,
    include: [
      {
        model: Productora,
        as: "productoraDelFonograma",
        required: true,
        attributes: [],
      },
    ],
  });

  if (total === 0) {
  return {
    message: "No se encontraron fonogramas con los filtros aplicados.",
    total: 0,
    page,
    limit,
    data: [],
  };
}

  // Obtener datos paginados con sus relaciones
  const fonogramas = await Fonograma.findAll({
    where: whereClause,
    attributes: fonogramaAttributes,
    include: [
      ...fonogramaIncludeModels,
      {
        model: Productora,
        as: "productoraDelFonograma",
        required: true,
        attributes: ["nombre_productora"],
      },
    ],
    order: [["titulo", "ASC"]],
    limit,
    offset,
  });

  return {
    message: "Fonogramas obtenidos exitosamente.",
    total,
    page,
    limit,
    data: fonogramas,
  };
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

    // Guardar valores antes de la actualización para auditoría
    const cambiosRealizados: string[] = [];
    if (titulo && titulo !== fonograma.titulo) cambiosRealizados.push(`Título: '${fonograma.titulo}' → '${titulo}'`);
    if (artista && artista !== fonograma.artista) cambiosRealizados.push(`Artista: '${fonograma.artista}' → '${artista}'`);
    if (album && album !== fonograma.album) cambiosRealizados.push(`Álbum: '${fonograma.album}' → '${album}'`);
    if (duracion && duracion !== fonograma.duracion) cambiosRealizados.push(`Duración: '${fonograma.duracion}' → '${duracion}'`);
    if (anio_lanzamiento && anio_lanzamiento !== fonograma.anio_lanzamiento) cambiosRealizados.push(`Año de lanzamiento: '${fonograma.anio_lanzamiento}' → '${anio_lanzamiento}'`);
    if (sello_discografico && sello_discografico !== fonograma.sello_discografico) cambiosRealizados.push(`Sello discográfico: '${fonograma.sello_discografico}' → '${sello_discografico}'`);
    if (estado_fonograma && estado_fonograma !== fonograma.estado_fonograma) cambiosRealizados.push(`Estado: '${fonograma.estado_fonograma}' → '${estado_fonograma}'`);

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

    // Registrar cambios en Auditoría de Fonogramas
    if (cambiosRealizados.length > 0) {
        await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "Fonograma",
            tipo_auditoria: "CAMBIO",
            detalle: `Se modificaron los datos del fonograma ID: '${fonograma.id_fonograma}'. Cambios: ${cambiosRealizados.join(", ")}.`,
        });

        await registrarRepertorio({
            usuario_registrante_id: authUser.id_usuario,
            fonograma_id: fonograma.id_fonograma,
            tipo_auditoria: "CAMBIO",
            detalle: `Se modificaron los datos del fonograma con ISRC '${fonograma.isrc}'. Cambios: ${cambiosRealizados.join(", ")}.`,
        });
    }

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
        await FonogramaEnvio.create({
            fonograma_id: fonograma.id_fonograma,
            tipo_estado: "PENDIENTE DE ENVIO",
            tipo_contenido: "DATOS",
            fecha_envio_inicial: null,
            fecha_envio_ultimo: null,
        });       

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

        await registrarRepertorio({
            usuario_registrante_id: authUser.id_usuario,
            fonograma_id: id,
            tipo_auditoria: "BAJA",
            detalle: `Se eliminó el fonograma con ISRC '${fonograma.isrc}' y todas sus asociaciones.`,
        });

        return {
            message: `El fonograma con ID '${id}', sus conflictos y asociaciones han sido eliminados exitosamente.`,
        };
    } catch (err: any) {
        throw new Error(`Error al eliminar el fonograma con ID '${id}': ${err.message}`);
    }
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

      await registrarRepertorio({
          usuario_registrante_id: authUser.id_usuario,
          fonograma_id: fonograma.id_fonograma,
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

      await registrarRepertorio({
          usuario_registrante_id: authUser.id_usuario,
          fonograma_id: fonograma.id_fonograma,
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
        await FonogramaEnvio.create({
            fonograma_id: fonograma.id_fonograma,
            tipo_estado: "PENDIENTE DE ENVIO",
            tipo_contenido: "COMPLETO",
            fecha_envio_inicial: null,
            fecha_envio_ultimo: null,
        });        

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
        //   console.log(`Archivo ${zipPath} subido correctamente como ${ftpFileName}.`);

          // Eliminar el archivo ZIP después de subirlo
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
            // console.log(`Archivo ZIP eliminado: ${zipPath}`);
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
    host: process.env.FTP_HOST || "127.0.0.1",
    user: process.env.FTP_USER || "test",
    password: process.env.FTP_PASSWORD || "password",
    port: Number(process.env.FTP_PORT) || 2121,
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
        fs.writeFileSync(metadataPath, metadataCsv, { encoding: "utf8" });

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

        if (!fs.existsSync(zipPath)) {
            throw new Error(`El archivo ZIP ${zipPath} no existe antes de subirlo.`);
        }
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

export const cambiarEstadoEnvioFonograma = async (
  fonogramaId: string,
  sendId: string,
  nuevoEstado: typeof FonogramaEnvio.prototype.tipo_estado,
  comentario: string | undefined,
  req: any
) => {
  // Verificar el usuario autenticado
  const { user: authUser } = await getAuthenticatedUser(req);

  // Buscar el envío relacionado al fonograma
  const envio = await FonogramaEnvio.findOne({
    where: { id_envio_vericast: sendId, fonograma_id: fonogramaId },
    include: [{ model: Fonograma, as: 'fonogramaDelEnvio', attributes: ['productora_id', 'titulo'] }],
  });

  if (!envio) throw new Err.NotFoundError(MESSAGES.ERROR.ENVIO.NOT_FOUND);
  if (!envio.fonogramaDelEnvio) throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);

  const oldState = envio.tipo_estado;

  // Estados permitidos para cambio a PENDIENTE DE ENVIO
  const estadosPermitidosParaPendiente = ['RECHAZADO POR VERICAST', 'ERROR EN EL ENVIO'];

  if (nuevoEstado === 'PENDIENTE DE ENVIO' && !estadosPermitidosParaPendiente.includes(oldState)) {
    throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ENVIO_STATE_INVALID);
  }

  // Validar el estado
  const estadosValidos = ['RECHAZADO POR VERICAST', 'ERROR EN EL ENVIO', 'PENDIENTE DE ENVIO'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ENVIO_STATE_INVALID);
  }

  // Si el nuevo estado es RECHAZADO POR VERICAST, notificar al productor
  if (nuevoEstado === 'RECHAZADO POR VERICAST') {
    const { productora_id: productoraId } = envio.fonogramaDelEnvio;
    if (!productoraId) throw new Err.NotFoundError(MESSAGES.ERROR.PRODUCTORA.NOT_FOUND);

    const { user: targetUser } = await getTargetUser({ productoraId, nombre_rol: 'productor_principal' }, req);
    const rejectionComment = comentario || `El envío del archivo de audio del repertorio '${envio.fonogramaDelEnvio.titulo}' fue rechazado.`;

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
      req
    );
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
                attributes: ["id_fonograma","isrc","titulo", "artista", "album", "duracion", "sello_discografico", "anio_lanzamiento"],
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
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Determinar si es productor
    const isProductor = authUser.rol?.nombre_rol === "productor_principal" || authUser.rol?.nombre_rol === "productor_secundario";

    let participacionesFiltradas = participaciones;

    if (isProductor) {

        // Verifica que el productor tenga una productora activa
        if (!req.productoraId) {
            throw new Err.BadRequestError("No se encontró el ID de la productora activa en la sesión del usuario.");
        }
        // Obtener el CUIT correspondiente a la productora autenticada
        const productora = await Productora.findOne({ where: { id_productora: req.productoraId } });
        if (!productora) {
            throw new Err.NotFoundError(`No se encontró ninguna productora con ID: ${req.productoraId}`);
        }

        // Filtrar solo la participación de la productora autenticada
        participacionesFiltradas = participaciones.filter((p: Record<string, any>) => p.cuit === productora.cuit_cuil);

        if (!participacionesFiltradas.length) {
            throw new Err.ForbiddenError("No se encontró ninguna participación válida para la productora autenticada.");
        }
    }
    
    const overlappingPeriods: string[] = [];
    const participacionesGuardadas = [];

    // Procesar cada participación
    for (const participacion of participacionesFiltradas) {
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

        const fechaInicioFormateada = new Date(fecha_inicio).toLocaleDateString('es-AR', { timeZone: 'UTC' });
        const fechaHastaFormateada = new Date(fecha_hasta).toLocaleDateString('es-AR', { timeZone: 'UTC' });        

        if (participacionExistente) {
            throw new Err.BadRequestError(
              `La productora con CUIT '${cuit}' ya tiene una participación registrada en este fonograma para el período entre ${fechaInicioFormateada} y ${fechaHastaFormateada}.`
            );
        }
    
        // Crear la nueva participación
        const nuevaParticipacion = await FonogramaParticipacion.create({
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

        await registrarRepertorio({
            usuario_registrante_id: authUser.id_usuario,
            fonograma_id: fonogramaId,
            tipo_auditoria: "ALTA",
            detalle: `Se agregó la participación de la productora con CUIT '${cuit}' con ${porcentaje_participacion}% de titularidad para el fonograma con ISRC '${fonograma.isrc}'`,
        });

        participacionesGuardadas.push({
            id: nuevaParticipacion.id_participacion,
            cuit,
            porcentaje_participacion,
            fecha_inicio,
            fecha_hasta,
        });

        // Cargar en FonogramaMaestro
        await FonogramaMaestro.create({ fonograma_id: fonograma.id_fonograma, operacion: "PARTICIPACION", fecha_operacion: new Date() });

        // Verificar si hay superposición y si la suma de los porcentajes supera el 100%
        const participacionesExistentes = await FonogramaParticipacion.findAll({
            where: {
                fonograma_id: fonogramaId,
                [Op.or]: [
                    { fecha_participacion_inicio: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                    { fecha_participacion_hasta: { [Op.between]: [fecha_inicio, fecha_hasta] } },
                    { 
                        [Op.and]: [
                            { fecha_participacion_inicio: { [Op.lte]: fecha_inicio } },
                            { fecha_participacion_hasta: { [Op.gte]: fecha_hasta } },
                        ],
                    },
                ],
            },
        });

        // console.log("DEBUG: participacionesExistentes antes del cálculo:");
        // console.log(participacionesExistentes.map(p => ({
        //     id: p.id_participacion,
        //     porcentaje: p.porcentaje_participacion
        // })));

        const idsUnicos = new Set();
        const porcentajeSuperpuesto = participacionesExistentes.reduce((sum, p) => {
            if (!idsUnicos.has(p.id_participacion)) {
                idsUnicos.add(p.id_participacion);
                return sum + p.porcentaje_participacion;
            }
            return sum;
        }, 0);

        // console.log(`DEBUG: PORCENTAJE FINAL CORREGIDO: ${porcentajeSuperpuesto}%`);

        if (porcentajeSuperpuesto > 100) {
            overlappingPeriods.push(
                `Entre ${fechaInicioFormateada} y ${fechaHastaFormateada} se supera el 100% con un total de ${porcentajeSuperpuesto}%`
            );

            // Llamar automáticamente a crearConflicto cuando se detecte exceso de participación
            await crearConflicto(req, fonograma.isrc, fecha_inicio, fecha_hasta);
        }
    }    

    // Responder con mensaje de éxito o advertencias
    const message = overlappingPeriods.length > 0
        ? `Participaciones agregadas con éxito, pero hay períodos donde se supera el 100% de participación: ${overlappingPeriods.join("; ")}`
        : "Participaciones agregadas exitosamente";

    return { message, data: { fonogramaId, participacionesAgregadas: participacionesGuardadas } };
};

export const cargarParticipacionesMasivo = async (req: any) => {
    if (!req.file || !req.file.buffer) {
        throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.NO_CSV_FOUND);
    }

    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
    const participaciones: any[] = [];
    const errores: string[] = [];
    const overlappingPeriods: string[] = [];

    await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(req.file!.buffer);
        stream
            .pipe(csv())
            .on("data", (data) => participaciones.push(data))
            .on("end", resolve)
            .on("error", reject);
    });

    await Promise.all(
        participaciones.map(async (row, index) => {
            try {
                const resultadoParticipacion = await addParticipacionToFonograma(row.isrc, {
                    body: {
                        participaciones: [{
                            cuit: row.cuit,
                            porcentaje_participacion: row.porcentaje_titularidad,
                            fecha_inicio: row.titular_desde,
                            fecha_hasta: row.titular_hasta,
                        }]
                    },
                    userId: authUser.id_usuario,
                });

                if (resultadoParticipacion.message.includes("se supera el 100%")) {
                    overlappingPeriods.push(resultadoParticipacion.message);
                }

                // Obtener el fonograma para registrar en la auditoría de repertorios
                const fonograma = await Fonograma.findOne({ where: { isrc: row.isrc } });

                if (fonograma) {
                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "FonogramaParticipacion",
                        tipo_auditoria: "ALTA",
                        detalle: `Se registró la participación de la productora con CUIT '${row.cuit}' con ${row.porcentaje_titularidad}% en el fonograma con ISRC '${row.isrc}'.`,
                    });

                    await registrarRepertorio({
                        usuario_registrante_id: authUser.id_usuario,
                        fonograma_id: fonograma.id_fonograma,
                        tipo_auditoria: "ALTA",
                        detalle: `Se agregó la participación de la productora con CUIT '${row.cuit}' con ${row.porcentaje_titularidad}% de titularidad para el fonograma con ISRC '${row.isrc}'`,
                    });
                }

            } catch (err: any) {
                errores.push(`Error en fila ${index + 1}: ${err.message}`);
            }
        })
    );

    const message = overlappingPeriods.length > 0
        ? `Carga completada con advertencias: ${overlappingPeriods.join("; ")}`
        : "Carga completada exitosamente.";

    return { message, errores };
};

export const listParticipaciones = async (fonogramaId: string, query: any, req: any) => {
    const { fecha_inicio, fecha_hasta } = query;

    // Obtener usuario autenticado
    const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);

    // Comprobar que el rol esté presente
    if (!authUser.rol) {
        throw new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED);
    }

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

    // Determinar si el usuario es productor y aplicar restricción
    const rolesProductores = ["productor_principal", "productor_secundario"];
    if (rolesProductores.includes(authUser.rol.nombre_rol)) {
        if (!req.productoraId) {
            throw new Err.ForbiddenError("No tiene permiso para acceder a estas participaciones.");
        }

        // Validar que el usuario pertenece a la productora asociada
        const productoraAsociada = authMaestros.some(maestro => maestro.productora_id === req.productoraId);
        if (!productoraAsociada) {
            throw new Err.ForbiddenError("No tiene permiso para acceder a estas participaciones.");
        }

        // Filtrar por productora asociada
        whereCondition["$productoraDeParticipante.id_productora$"] = req.productoraId;
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
            id_participacion: { [Op.ne]: participacionId },
            [Op.or]: [
                { fecha_participacion_inicio: { [Op.between]: [fecha_participacion_inicio, fecha_participacion_hasta] } },
                { fecha_participacion_hasta: { [Op.between]: [fecha_participacion_inicio, fecha_participacion_hasta] } },
                { [Op.and]: [
                    { fecha_participacion_inicio: { [Op.lte]: fecha_participacion_inicio } },
                    { fecha_participacion_hasta: { [Op.gte]: fecha_participacion_hasta } },
                ]},
            ]
        }
    });

    // Calcular el total de participación dentro del período actualizado
    const idsUnicos = new Set();
    const totalParticipacion = participacionesEnPeriodo.reduce((sum, p) => {
        if (!idsUnicos.has(p.id_participacion)) {
            idsUnicos.add(p.id_participacion);
            return sum + p.porcentaje_participacion;
        }
        return sum;
    }, porcentaje_participacion);

    // Mensaje de advertencia si supera el 100%
    let warningMessage = null;
    if (totalParticipacion > 100) {
        warningMessage = `Advertencia: El total de participación en el período ${fecha_participacion_inicio} - ${fecha_participacion_hasta} ahora es ${totalParticipacion}%, lo que supera el 100%.`;
    }

    // Guardar datos previos para la auditoría
    const cambiosRealizados: string[] = [];
    if (porcentaje_participacion !== participacion.porcentaje_participacion) {
        cambiosRealizados.push(`Porcentaje: '${participacion.porcentaje_participacion}%' → '${porcentaje_participacion}%'`);
    }
    if (fecha_participacion_inicio !== participacion.fecha_participacion_inicio.toISOString().split('T')[0]) {
        cambiosRealizados.push(`Fecha inicio: '${participacion.fecha_participacion_inicio.toISOString().split('T')[0]}' → '${fecha_participacion_inicio}'`);
    }
    if (fecha_participacion_hasta !== participacion.fecha_participacion_hasta.toISOString().split('T')[0]) {
        cambiosRealizados.push(`Fecha fin: '${participacion.fecha_participacion_hasta.toISOString().split('T')[0]}' → '${fecha_participacion_hasta}'`);
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

    await registrarRepertorio({
        usuario_registrante_id: authUser.id_usuario,
        fonograma_id: fonograma.id_fonograma,
        tipo_auditoria: "CAMBIO",
        detalle: `Se actualizó la participación de la productora con CUIT '${participacion.productoraDeParticipante?.cuit_cuil}' en el fonograma con ISRC '${fonograma.isrc}'. Cambios: ${cambiosRealizados.join(", ")}`,
    });

    return {
        message: "Participación actualizada exitosamente.",
        data: participacion,
        warning: warningMessage || undefined
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
    const { fecha_participacion_inicio, fecha_participacion_hasta, porcentaje_participacion } = participacion;

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

    await registrarRepertorio({
        usuario_registrante_id: authUser.id_usuario,
        fonograma_id: fonograma.id_fonograma,
        tipo_auditoria: "BAJA",
        detalle: `Se eliminó la participación de '${participacion.productoraDeParticipante?.nombre_productora}' con ${porcentaje_participacion}% de titularidad del fonograma con ISRC '${fonograma.isrc}'`,
    });

    // Recalcular la participación total en el período de la participación eliminada
    const participacionesRestantes = await FonogramaParticipacion.findAll({
        where: {
            fonograma_id: fonogramaId,
            [Op.or]: [
                { fecha_participacion_inicio: { [Op.between]: [fecha_participacion_inicio, fecha_participacion_hasta] } },
                { fecha_participacion_hasta: { [Op.between]: [fecha_participacion_inicio, fecha_participacion_hasta] } },
                {
                    [Op.and]: [
                        { fecha_participacion_inicio: { [Op.lte]: fecha_participacion_inicio } },
                        { fecha_participacion_hasta: { [Op.gte]: fecha_participacion_hasta } },
                    ]
                },
            ]
        }
    });

    const idsUnicos = new Set();
    const totalParticipacionEnPeriodo = participacionesRestantes.reduce((sum, p) => {
        if (!idsUnicos.has(p.id_participacion)) {
            idsUnicos.add(p.id_participacion);
            return sum + p.porcentaje_participacion;
        }
        return sum;
    }, porcentaje_participacion);

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

    const { codigo_iso, is_activo = true } = req.body;

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

    await registrarRepertorio({
        usuario_registrante_id: authUser.id_usuario,
        fonograma_id: fonograma.id_fonograma,
        tipo_auditoria: "ALTA",
        detalle: `Se agregó el territorio '${territorio.codigo_iso}' al fonograma con ISRC '${fonograma.isrc}', estado: ${is_activo ? "Activo" : "Inactivo"}`,
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

    // Guardar estado anterior para la auditoría
    const estadoAnterior = territorioVinculado.is_activo;

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

    await registrarRepertorio({
        usuario_registrante_id: authUser.id_usuario,
        fonograma_id: fonograma.id_fonograma,
        tipo_auditoria: "CAMBIO",
        detalle: `Se actualizó el estado del territorio '${territorio.codigo_iso}' en el fonograma con ISRC '${fonograma.isrc}' de ${estadoAnterior ? "Activo" : "Inactivo"} a ${is_activo ? "Activo" : "Inactivo"}.`,
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
        include: [{ model: FonogramaTerritorio, as: "territorioDelVinculo" }]
    });

    if (!territorioVinculado) {
        throw new Err.NotFoundError(MESSAGES.ERROR.TERRITORIO.NOT_ASSIGNED);
    }

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Guardar datos antes de la eliminación para la auditoría
    const codigoIsoTerritorio = territorioVinculado.territorioDelVinculo?.codigo_iso || "Desconocido";

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

    await registrarRepertorio({
        usuario_registrante_id: authUser.id_usuario,
        fonograma_id: fonograma.id_fonograma,
        tipo_auditoria: "BAJA",
        detalle: `Se eliminó el territorio '${codigoIsoTerritorio}' del fonograma con ISRC '${fonograma.isrc}'.`,
    });

    return {
        message: "Territorio eliminado exitosamente del fonograma.",
        data: {
            fonograma_id: fonogramaId,
            territorio_id: territorioId
        },
    };   
};