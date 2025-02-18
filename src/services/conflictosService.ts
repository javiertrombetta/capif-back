import { Request } from 'express';
import { Op } from "sequelize";
import { Parser } from 'json2csv';
import { Productora, Conflicto, Fonograma, FonogramaParticipacion, ConflictoParte } from '../models';

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";

import { sendEmailWithErrorHandling } from '../services/emailService';
import { registrarAuditoria } from "./auditService";
import { getAuthenticatedUser } from "./authService";

import * as MESSAGES from "../utils/messages";
import * as Err from "../utils/customErrors";

const TIPO_ESTADOS = [
  "PENDIENTE CAPIF",
  "PRIMERA INSTANCIA",
  "PRIMERA PRORROGA",
  "SEGUNDA INSTANCIA",
  "SEGUNDA PRORROGA",
  "VENCIDO",
  "CERRADO",
] as const;

export const crearConflicto = async (req: AuthenticatedRequest, isrc: string, fecha_periodo_desde: string, fecha_periodo_hasta: string) => {

    // Verificar usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);

    // Convertir fechas a objetos Date
    const fechaDesde = new Date(fecha_periodo_desde);
    const fechaHasta = new Date(fecha_periodo_hasta);
    
    if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime()) || fechaDesde > fechaHasta) {
        throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.DATES_INVALID);
    }

    // Buscar fonograma
    const fonograma = await Fonograma.findOne({ where: { isrc } });

    if (!fonograma) {
        throw new Err.NotFoundError(MESSAGES.ERROR.FONOGRAMA.NOT_FOUND);
    }

    // Obtener participaciones dentro del período
    const participaciones = await FonogramaParticipacion.findAll({
      where: {
        fonograma_id: fonograma.id_fonograma,
        [Op.or]: [
          { fecha_participacion_inicio: { [Op.between]: [fechaDesde, fechaHasta] } },
          { fecha_participacion_hasta: { [Op.between]: [fechaDesde, fechaHasta] } },
          { 
            [Op.and]: [
              { fecha_participacion_inicio: { [Op.lte]: fechaDesde } },
              { fecha_participacion_hasta: { [Op.gte]: fechaHasta } },
            ],
          },
        ],
      },
    });

    if (participaciones.length === 0) {
        throw new Err.BadRequestError(MESSAGES.ERROR.PARTICIPACION.NOT_FOUND_PERIOD);
    }

    // Agrupar participaciones por períodos superpuestos
    const periodosMap = new Map<string, { fecha_inicio: Date; fecha_fin: Date; participaciones: typeof participaciones }>();

    participaciones.forEach((participacion) => {
      const inicio = participacion.fecha_participacion_inicio > fechaDesde ? participacion.fecha_participacion_inicio : fechaDesde;
      const fin = participacion.fecha_participacion_hasta < fechaHasta ? participacion.fecha_participacion_hasta : fechaHasta;

      const key = `${inicio.toISOString()}_${fin.toISOString()}`;
      if (!periodosMap.has(key)) {
        periodosMap.set(key, { fecha_inicio: inicio, fecha_fin: fin, participaciones: [] });
      }
      periodosMap.get(key)!.participaciones.push(participacion);
    });

    // Crear conflictos cuando la suma de los porcentajes supera 100%
    const conflictosCreados = await Promise.all(
      Array.from(periodosMap.values()).map(async (periodo) => {
        const porcentajeTotal = periodo.participaciones.reduce((acc, curr) => acc + curr.porcentaje_participacion, 0);

        if (porcentajeTotal > 100) {
          const nuevoConflicto = await Conflicto.create({
            fonograma_id: fonograma.id_fonograma,
            productora_conflicto_id: fonograma.productora_id,
            estado_conflicto: 'PRIMERA INSTANCIA',
            fecha_periodo_desde: periodo.fecha_inicio,
            fecha_periodo_hasta: periodo.fecha_fin,
            porcentaje_periodo: porcentajeTotal,
          });

          await registrarAuditoria({
            usuario_originario_id: authUser.id_usuario,
            usuario_destino_id: null,
            modelo: "Conflicto",
            tipo_auditoria: "ALTA",
            detalle: `Se creó un nuevo conflicto para el ISRC '${isrc}' con ID '${nuevoConflicto.id_conflicto}'`,
          });

          await Promise.all(
            periodo.participaciones.map(async (participacion) => {
              await ConflictoParte.create({
                conflicto_id: nuevoConflicto.id_conflicto,
                participacion_id: participacion.id_participacion,
                estado: 'PENDIENTE',
                porcentaje_declarado: participacion.porcentaje_participacion,
                porcentaje_confirmado: null,
                is_documentos_enviados: false,
              });

              await registrarAuditoria({
                usuario_originario_id: authUser.id_usuario,
                usuario_destino_id: null,
                modelo: "ConflictoParte",
                tipo_auditoria: "ALTA",
                detalle: `Se creó una nueva participación en conflicto para el ISRC '${isrc}' para la participación ID '${participacion.id_participacion}'`,
              });
            })
          );          

          return nuevoConflicto;
        }
        return null;
      })
    );

    // Filtrar los conflictos creados (eliminar los `null`)
    const conflictosFiltrados = conflictosCreados.filter((conflicto) => conflicto !== null);

    if (conflictosFiltrados.length === 0) {
        throw new Err.BadRequestError(MESSAGES.ERROR.CONFLICTO.NO_SUPERPOSITION_FOUND);
    }

    return {
        message: MESSAGES.SUCCESS.CONFLICTO.CONFLICTO_CREATED,
        data: conflictosFiltrados,
    };
};

export const obtenerConflictos = async (filtros: {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  isrc?: string;
  productora_id?: string;
  page?: number;
  limit?: number;
}) => {
  const { fecha_desde, fecha_hasta, estado, isrc, productora_id, page = 1, limit = 50 } = filtros;

  // Filtros iniciales
  const where: any = {};

  // Filtro por fechas de período
  if (fecha_desde) where.fecha_periodo_desde = { [Op.gte]: new Date(fecha_desde) };
  if (fecha_hasta) where.fecha_periodo_hasta = { [Op.lte]: new Date(fecha_hasta) };

  // Filtro por estado del conflicto
  if (estado) {
    if (estado === "en curso") {
      where.estado_conflicto = {
        [Op.in]: [
          "PENDIENTE CAPIF",
          "PRIMERA INSTANCIA",
          "PRIMERA PRORROGA",
          "SEGUNDA INSTANCIA",
          "SEGUNDA PRORROGA",
        ],
      };
    } else if (estado === "cerrado") {
      where.estado_conflicto = "CERRADO";
    } else if (estado === "vencido") {
      where.estado_conflicto = "VENCIDO";
    }
  }

  // Construcción de condiciones para incluir relaciones
  const include: any[] = [
    {
      model: Fonograma,
      as: "fonogramaDelConflicto",
      attributes: ["id_fonograma", "isrc", "titulo", "artista"],
      where: isrc ? { isrc } : undefined,
    },
    {
      model: Productora,
      as: "productoraDelConflicto",
      attributes: ["id_productora", "nombre_productora"],
      where: productora_id ? { id_productora: productora_id } : undefined
    },
    {
      model: ConflictoParte,
      as: "partesDelConflicto",
      attributes: [
        "id_conflicto_participacion",
        "estado",
        "porcentaje_declarado",
        "porcentaje_confirmado",
        "is_documentos_enviados",
      ],
      include: [
        {
          model: FonogramaParticipacion,
          as: "participacionDeLaParte",
          attributes: [
            "id_participacion",
            "porcentaje_participacion",
            "fecha_participacion_inicio",
            "fecha_participacion_hasta",
          ],
        },
      ],
    },
  ].filter((inc) => !inc.where || Object.keys(inc.where).length > 0);

  // Paginación
  const offset = (page - 1) * limit;

  // Consulta a la base de datos
  const { count, rows: conflictos } = await Conflicto.findAndCountAll({
    where,
    include,
    order: [["fecha_inicio_conflicto", "DESC"]],
    limit,
    offset,
  });

  if (!conflictos.length) {
    throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
  }

  return {
    message: MESSAGES.SUCCESS.CONFLICTO.CONFLICTO_FETCHED,
    total: count,
    page,
    limit,
    data: conflictos,
  };
};

export const obtenerConflicto = async (id: string) => {
  // Buscar el conflicto por ID incluyendo sus relaciones excepto participacionDeLaParte
  const conflicto = await Conflicto.findOne({
    where: { id_conflicto: id },
    include: [
      {
        model: Productora,
        as: "productoraDelConflicto",
        attributes: ["id_productora", "nombre_productora"],
      },
      {
        model: Fonograma,
        as: "fonogramaDelConflicto",
        attributes: [
          "id_fonograma",
          "isrc",
          "titulo",
          "artista",
          "sello_discografico",
          "anio_lanzamiento",
        ],
      },
      {
        model: ConflictoParte,
        as: "partesDelConflicto",
        attributes: [
          "id_conflicto_participacion",
          "estado",
          "porcentaje_declarado",
          "porcentaje_confirmado",
          "is_documentos_enviados",
          "fecha_respuesta_confirmacion",
          "fecha_respuesta_documentacion",
          "participacion_id",
        ],
      },
    ],
  });

  // Verificar si el conflicto existe
  if (!conflicto) {
    throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND);
  }

  // Extraer los IDs de participaciones para hacer la segunda consulta
  const participacionIds = (conflicto as unknown as { partesDelConflicto: ConflictoParte[] })
  .partesDelConflicto.map((parte) => parte.participacion_id);

  // Buscar manualmente los datos de participacionDeLaParte
  const participaciones = await FonogramaParticipacion.findAll({
    where: { id_participacion: participacionIds },
    attributes: [
      "id_participacion",
      "porcentaje_participacion",
      "fecha_participacion_inicio",
      "fecha_participacion_hasta",
    ],
    include: [
      {
        model: Productora,
        as: "productoraDeParticipante",
        attributes: ["id_productora", "nombre_productora"],
      },
    ],
  });

  // Mapear los datos de participaciones en partesDelConflicto
  const partesDelConflictoConParticipaciones = (conflicto as unknown as { partesDelConflicto: ConflictoParte[] })
  .partesDelConflicto.map((parte) => ({
    ...parte.toJSON(),
    participacionDeLaParte: participaciones.find(
      (p) => p.id_participacion === parte.participacion_id
    ),
  }));

  // Retornar la estructura final con la información correcta
  return {
    message: MESSAGES.SUCCESS.CONFLICTO.CONFLICTO_FETCHED,
    data: {
      ...conflicto.toJSON(),
      partesDelConflicto: partesDelConflictoConParticipaciones,
    },
  };
};

export const actualizarEstadoConflicto = async (req: AuthenticatedRequest, id: string, estado_conflicto: string) => {
  // Verificar usuario autenticado
  const { user: authUser } = await getAuthenticatedUser(req);

  // Buscar el conflicto por ID
  const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

  if (!conflicto) {
    throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND.replace("{id}", id));
  }

  // Validar que el estado del conflicto sea válido
  if (!TIPO_ESTADOS.includes(estado_conflicto as any)) {
    throw new Err.BadRequestError(MESSAGES.ERROR.CONFLICTO.INVALID_STATE.replace("{estado}", estado_conflicto));
  }

  // Si el estado cambia a SEGUNDA INSTANCIA y antes no lo era, actualizar las partes del conflicto
  if (estado_conflicto === "SEGUNDA INSTANCIA" && conflicto.estado_conflicto !== "SEGUNDA INSTANCIA") {
    await ConflictoParte.update(
      { estado: "PENDIENTE" },
      { where: { conflicto_id: id } }
    );
  }

  // Actualizar el estado del conflicto
  await conflicto.update({ estado_conflicto });

  // Registrar Auditoría
  await registrarAuditoria({
    usuario_originario_id: authUser.id_usuario,
    usuario_destino_id: null,
    modelo: "Conflicto",
    tipo_auditoria: "CAMBIO",
    detalle: `El usuario '${authUser.id_usuario}' actualizó el estado del conflicto con ID '${id}' a '${estado_conflicto}'.`,
  });

  return {
    message: MESSAGES.SUCCESS.CONFLICTO.STATUS_UPDATED.replace("{estado}", estado_conflicto),
    data: conflicto,
  };
};

export const desistirConflicto = async (req: AuthenticatedRequest, id: string) => {

    // Verificar usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);

    // Buscar el conflicto por ID
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND)    
    }

    // Cambiar el estado del conflicto a "CERRADO"
    await conflicto.update({
      estado_conflicto: "CERRADO",
      fecha_fin_conflicto: new Date(),
    });

    // Cambiar el estado de todas las partes del conflicto a "DESISTIDO"
    await ConflictoParte.update(
      { estado: "DESISTIDO" },
      { where: { conflicto_id: id } }
    );

    // Registrar Auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: null,
      modelo: "Conflicto",
      tipo_auditoria: "CAMBIO",
      detalle: `El usuario '${authUser.id_usuario}' desistió del conflicto con ID '${id}', marcándolo como CERRADO.`,
    });

    return {
      message: MESSAGES.SUCCESS.CONFLICTO.CONFLICTO_CANCELED,
      data: conflicto,
    };
};

export const eliminarConflicto = async (req: AuthenticatedRequest, id: string) => {

    // Verificar usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);

    // Buscar el conflicto por ID
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND)
    }

    // Eliminar las partes asociadas al conflicto
    await ConflictoParte.destroy({ where: { conflicto_id: id } });

    // Eliminar el conflicto
    await conflicto.destroy();

    // Registrar Auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: null,
      modelo: "Conflicto",
      tipo_auditoria: "BAJA",
      detalle: `El usuario '${authUser.id_usuario}' eliminó el conflicto con ID '${id}'.`,
    });

    return {
      message: MESSAGES.SUCCESS.CONFLICTO.CONFLICTO_DELETED,
      data: conflicto,
    };
};

export const actualizarPorResolucion = async (req: AuthenticatedRequest, id: string, resoluciones: any[]) => {

    // Verificar usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req); 

    // Verificar si el conflicto existe
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND)
    }

    // Obtener todas las participaciones del fonograma relacionadas con el conflicto
    const fonogramaId = conflicto.fonograma_id;
    const participacionesActuales = await FonogramaParticipacion.findAll({ where: { fonograma_id: fonogramaId } });

    // Calcular el porcentaje total después de aplicar las resoluciones
    let totalPorcentaje = participacionesActuales.reduce((sum, p) => sum + p.porcentaje_participacion, 0);
    let nuevoTotal = totalPorcentaje;

    for (const resolucion of resoluciones) {
      const { id_conflicto_participacion, porcentaje_participacion } = resolucion;

      const conflictoParte = await ConflictoParte.findOne({ where: { id_conflicto_participacion } });

      if (!conflictoParte) {
        throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.PART_NOT_FOUND);
      }

      const participacion = await FonogramaParticipacion.findOne({ where: { id_participacion: conflictoParte.participacion_id } });

      if (!participacion) {
        throw new Err.NotFoundError(MESSAGES.ERROR.PARTICIPACION.NOT_FOUND);
      }

      // Ajustar el total de porcentaje antes de aplicar los cambios
      nuevoTotal += porcentaje_participacion - participacion.porcentaje_participacion;
    }

    // Validar que la participación total no supere el 100% antes de hacer cambios
    if (nuevoTotal > 100) {
      throw new Err.BadRequestError(MESSAGES.ERROR.CONFLICTO.EXCEEDS_100_PERCENT);
    }

    // Aplicar los cambios después de verificar que no se excede el 100%
    for (const resolucion of resoluciones) {
      const { id_conflicto_participacion, porcentaje_participacion, fecha_participacion_inicio, fecha_participacion_hasta } = resolucion;

      const conflictoParte = await ConflictoParte.findOne({ where: { id_conflicto_participacion } });

      if (!conflictoParte) continue;

      const participacion = await FonogramaParticipacion.findOne({ where: { id_participacion: conflictoParte.participacion_id } });

      if (!participacion) continue;

      // Si el porcentaje es 0, se retira la participación
      if (porcentaje_participacion === 0) {
        await conflictoParte.update({ estado: "RETIRADO" });
        await participacion.destroy();

        // **Registrar Auditoría**
        await registrarAuditoria({
          usuario_originario_id: authUser.id_usuario,
          usuario_destino_id: null,
          modelo: "FonogramaParticipacion",
          tipo_auditoria: "BAJA",
          detalle: `El usuario '${authUser.id_usuario}' eliminó una participación del conflicto con ID '${id}'`,
        });
        
        continue;
      }

      // Verificar si los valores han cambiado
      const cambioPorcentaje = participacion.porcentaje_participacion !== porcentaje_participacion;
      const cambioFechas =
        participacion.fecha_participacion_inicio.getTime() !== new Date(fecha_participacion_inicio).getTime() ||
        participacion.fecha_participacion_hasta.getTime() !== new Date(fecha_participacion_hasta).getTime();

      if (!cambioPorcentaje && !cambioFechas) {
        await conflictoParte.update({ estado: "ACEPTADO" });
      } else {
        // Actualizar la participación con los valores definitivos
        await participacion.update({
          porcentaje_participacion,
          fecha_participacion_inicio: new Date(fecha_participacion_inicio),
          fecha_participacion_hasta: new Date(fecha_participacion_hasta),
        });

        await conflictoParte.update({ estado: "MODIFICADO" });

        // Registrar Auditoría
        await registrarAuditoria({
          usuario_originario_id: authUser.id_usuario,
          usuario_destino_id: null,
          modelo: "FonogramaParticipacion",
          tipo_auditoria: "CAMBIO",
          detalle: `El usuario '${authUser.id_usuario}' actualizó una participación en el conflicto con ID '${id}'`,
        });
      }
    }

    return {
      message: MESSAGES.SUCCESS.CONFLICTO.RESOLUTION_APPLIED,
      data: resoluciones,
    };
};

export const otorgarProrroga = async (req: AuthenticatedRequest, id: string) => {

    // Verificar usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);

    // Buscar el conflicto por ID
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND)
    }

    let nuevoEstado: string | null = null;

    // Determinar la prórroga a otorgar según el estado actual
    if (conflicto.estado_conflicto === "PRIMERA INSTANCIA") {
      nuevoEstado = "PRIMERA PRORROGA";
    } else if (conflicto.estado_conflicto === "SEGUNDA INSTANCIA") {
      nuevoEstado = "SEGUNDA PRORROGA";
    } else {
      throw new Err.BadRequestError(
        MESSAGES.ERROR.CONFLICTO.CANNOT_EXTEND)
    }

    // Actualizar el estado del conflicto
    await conflicto.update({ estado_conflicto: nuevoEstado });

    // Registrar Auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: null,
      modelo: "Conflicto",
      tipo_auditoria: "CAMBIO",
      detalle: `El usuario '${authUser.id_usuario}' otorgó una prórroga al conflicto con ID '${id}', cambiando su estado a '${nuevoEstado}'.`,
    });

    return {
      message: MESSAGES.SUCCESS.CONFLICTO.EXTENSION_GRANTED,
      data: conflicto,
    };
};

export const confirmarPorcentaje = async (req: AuthenticatedRequest, id: string, participacion_id: string, porcentaje_confirmado: number) => {

    // Verificar usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);

    // Buscar la participación en el conflicto
    const conflictoParte = await ConflictoParte.findOne({
      where: { conflicto_id: id, participacion_id },
    });

    if (!conflictoParte) {
      throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.PART_NOT_FOUND.replace("{id}", participacion_id));
    }

    // Marcar como RESPONDIDO y establecer fecha_respuesta
    await conflictoParte.update({
      estado: "RESPONDIDO",
      porcentaje_confirmado,
      fecha_respuesta_confirmacion: new Date(),
    });

    // Registrar Auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: null,
      modelo: "ConflictoParte",
      tipo_auditoria: "CAMBIO",
      detalle: `El usuario confirmó el porcentaje de participación (${porcentaje_confirmado}%) en el conflicto con ID '${id}' para la participación ID '${participacion_id}'.`,
    });

    // Verificar si todas las participaciones han sido respondidas
    const participacionesPendientes = await ConflictoParte.findOne({
      where: { conflicto_id: id, estado: { [Op.ne]: "RESPONDIDO" } },
    });

    if (participacionesPendientes) {
      return {
        message: MESSAGES.SUCCESS.CONFLICTO.PARTICIPATION_CONFIRMED_PENDING,
        data: conflictoParte,
      };
    }

    // Si todos los participantes han respondido, verificar el total de participación
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND)
    }

    // Calcular el total de participación confirmada
    const participaciones = await ConflictoParte.findAll({
      where: { conflicto_id: id },
      include: [
        { model: FonogramaParticipacion, as: "participacionDeLaParte", attributes: ["porcentaje_participacion"] },
      ],
    });

    const totalPorcentaje = participaciones.reduce((acc, curr) => acc + (curr.porcentaje_confirmado || 0), 0);

    // Determinar si el conflicto pasa a SEGUNDA INSTANCIA o se cierra
    let nuevoEstado = "";
    let updateData: any = {};

    if (totalPorcentaje > 100) {
      nuevoEstado = "SEGUNDA INSTANCIA";
      updateData = { estado_conflicto: nuevoEstado, fecha_segunda_instancia: new Date() };

      // Si cambia a SEGUNDA INSTANCIA, actualizar todas las partes del conflicto a PENDIENTE
      await ConflictoParte.update(
        { estado: "PENDIENTE" },
        { where: { conflicto_id: id } }
      );
    } else {
      nuevoEstado = "CERRADO";
      updateData = { estado_conflicto: nuevoEstado, fecha_fin_conflicto: new Date() };
    }

    await conflicto.update(updateData);

    // Registrar Auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: null,
      modelo: "Conflicto",
      tipo_auditoria: "CAMBIO",
      detalle: `El usuario confirmó la última participación en el conflicto con ID '${id}', cambiando su estado a '${nuevoEstado}'.`,
    });

    return {
      message: MESSAGES.SUCCESS.CONFLICTO.STATUS_UPDATED,
      data: conflicto,
    };
 
};

export const enviarDocumentos = async (req: AuthenticatedRequest, id: string, archivos: Express.Multer.File[]) => {
    // Verificar usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);
 
    if (!archivos || archivos.length === 0) {
      throw new Err.BadRequestError(MESSAGES.ERROR.CONFLICTO.NO_DOCUMENTS_ATTACHED);
    }

    // Convertir los archivos de memoria en adjuntos para el correo
    const archivosAdjuntos = archivos.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    }));

    // Verificar si el conflicto existe antes de actualizar
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NOT_FOUND)
    }

    // Actualizar el estado de todas las partes del conflicto a RESPONDIDO
    await ConflictoParte.update(
      { estado: "RESPONDIDO", fecha_respuesta_documentacion: new Date() },
      { where: { conflicto_id: id } }
    );

    // Registrar Auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: null,
      modelo: "Conflicto",
      tipo_auditoria: "CAMBIO",
      detalle: `El usuario '${authUser.id_usuario}' envió documentos para el conflicto con ID '${id}'.`,
    });

    // Dirección de correo establecida en las variables de entorno
    const destinatario = process.env.CAPIF_EMAIL_RECEIVER;
    if (!destinatario) {
      throw new Err.InternalServerError(MESSAGES.ERROR.CONFLICTO.MAIN_EMAIL_NOT_CONFIGURED);
    }

    // Obtener el contenido del correo desde messages.ts
    const emailContent = MESSAGES.EMAIL_BODY.SEND_DOCUMENTS_NOTIFICATION(authUser.nombre!, id);

    // Enviar correo utilizando emailService
    await sendEmailWithErrorHandling(
      {
        to: destinatario,
        subject: `Documentos adjuntos para el Conflicto ID: ${id}`,
        html: emailContent,
        attachments: archivosAdjuntos.length > 0 ? archivosAdjuntos : undefined,
        successLog: `Documentos enviados con éxito para el conflicto ID ${id}`,
        errorLog: `Error al enviar documentos para el conflicto ID ${id}`,
      },
      req
    );

    return {
      message: MESSAGES.SUCCESS.CONFLICTO.DOCUMENTS_SENT,
      data: archivosAdjuntos.map((archivo) => archivo.filename),
    };
};

export const generarReporteConflictos = async (filtros: {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  isrc?: string;
  productora_id?: string;
  formato?: string;
}) => {

    const { fecha_desde, fecha_hasta, estado, isrc, productora_id, formato } = filtros;

    // Construcción de filtros para conflictos
    const where: any = {};

    if (fecha_desde || fecha_hasta) {
      where.fecha_periodo_desde = {
        ...(fecha_desde ? { [Op.gte]: new Date(fecha_desde) } : {}),
        ...(fecha_hasta ? { [Op.lte]: new Date(fecha_hasta) } : {}),
      };
    }

    if (estado) {
      where.estado_conflicto = estado;
    }

    // Consulta de conflictos sin partes asociadas
    const conflictos = await Conflicto.findAll({
      where,
      include: [
        {
          model: Fonograma,
          as: "fonogramaDelConflicto",
          attributes: ["id_fonograma", "isrc", "titulo", "artista"],
          where: isrc ? { isrc } : undefined,
        },
        {
          model: Productora,
          as: "productoraDelConflicto",
          attributes: ["id_productora", "nombre"],
          where: productora_id ? { id_productora: productora_id } : undefined,
        },
      ],
      order: [["fecha_inicio_conflicto", "DESC"]],
    });

    if (conflictos.length === 0) {
      throw new Err.NotFoundError(MESSAGES.ERROR.CONFLICTO.NO_CONFLICTS_FOUND);
    }

    // Obtener todas las partes de los conflictos en una sola consulta
    const conflictoIds = conflictos.map((c) => c.id_conflicto);
    const partes = await ConflictoParte.findAll({
      where: { conflicto_id: conflictoIds },
      include: [
        {
          model: FonogramaParticipacion,
          as: "participacionDeLaParte",
          attributes: ["id_participacion", "porcentaje_participacion", "fecha_participacion_inicio", "fecha_participacion_hasta"],
        },
      ],
    });

    // Organizar las partes de los conflictos en un diccionario
    const partesMap = new Map<string, ConflictoParte[]>();
    partes.forEach((parte) => {
      if (!partesMap.has(parte.conflicto_id)) {
        partesMap.set(parte.conflicto_id, []);
      }
      partesMap.get(parte.conflicto_id)?.push(parte);
    });

    // Añadir las partes a los conflictos manualmente
    const conflictosConPartes = conflictos.map((conflicto) => ({
      ...conflicto.toJSON(),
      partesDelConflicto: partesMap.get(conflicto.id_conflicto) || [],
    }));

    // Formato JSON
    if (!formato || formato === "json") {
      return {
        message: MESSAGES.SUCCESS.CONFLICTO.REPORT_GENERATED,
        data: conflictosConPartes,
      };
    }

    // Formato CSV
    if (formato === "csv") {
      const csvFields = [
        "ID Conflicto",
        "Estado",
        "Fecha Inicio",
        "Fecha Fin",
        "Porcentaje Periodo",
        "ISRC",
        "Título Fonograma",
        "Artista",
        "Productora",
        "Partes del Conflicto",
      ];

      const csvData = conflictosConPartes.map((conflicto) => ({
        "ID Conflicto": conflicto.id_conflicto,
        Estado: conflicto.estado_conflicto,
        "Fecha Inicio": conflicto.fecha_inicio_conflicto,
        "Fecha Fin": conflicto.fecha_fin_conflicto || "N/A",
        "Porcentaje Periodo": conflicto.porcentaje_periodo,
        ISRC: conflicto.fonogramaDelConflicto?.isrc || "N/A",
        "Título Fonograma": conflicto.fonogramaDelConflicto?.titulo || "N/A",
        Artista: conflicto.fonogramaDelConflicto?.artista || "N/A",
        Productora: conflicto.productoraDelConflicto?.nombre_productora || "N/A",
        "Partes del Conflicto": (partesMap.get(conflicto.id_conflicto) || [])
          .map((parte) => `${parte.estado}: ${parte.porcentaje_declarado}%`)
          .join("; "),
      }));

      const json2csvParser = new Parser({ fields: csvFields });
      const csv = json2csvParser.parse(csvData);

      return { formato: "csv", data: csv };
    }

    throw new Err.BadRequestError(MESSAGES.ERROR.CONFLICTO.INVALID_REPORT_FORMAT);

};