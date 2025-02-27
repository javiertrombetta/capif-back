import { Request } from "express";
import { Op } from "sequelize";
import logger from "../config/logger";

import { AuditoriaCambio, AuditoriaRepertorio, AuditoriaSesion, Fonograma, Productora, Usuario }  from "../models";
import { ENTIDADES_PERMITIDAS } from "../models/AuditoriaCambio";

import * as MESSAGES from "../utils/messages";
import * as Err from "../utils/customErrors";

/**
 * Crea un registro de auditoría genérico.
 * @param usuario_originario_id ID del usuario que realiza la acción (opcional).
 * @param usuario_destino_id ID del usuario afectado por la acción (opcional).
 * @param modelo Modelo afectado (debe estar en ENTIDADES_PERMITIDAS).
 * @param tipo_auditoria Tipo de auditoría (ALTA, BAJA, CAMBIO, etc.).
 * @param detalle Detalle adicional sobre la acción realizada.
 * @throws Error si los parámetros no son válidos.
 */
export const registrarAuditoria = async (
  {
    usuario_originario_id = null,
    usuario_destino_id = null,
    modelo,
    tipo_auditoria,
    detalle,
  }: {
    usuario_originario_id?: string | null;
    usuario_destino_id?: string | null;
    modelo: string;
    tipo_auditoria: string;
    detalle: string;
  }
): Promise<void> => {
  try {
    // Validar que el modelo sea uno de los permitidos
    if (!ENTIDADES_PERMITIDAS.includes(modelo)) {
      const validModels = ENTIDADES_PERMITIDAS.join(", ");
      throw new Error(
        `El modelo especificado (${modelo}) no es válido. Debe ser uno de: ${validModels}.`
      );
    }

    // Validar que los campos obligatorios estén presentes
    if (!modelo || !tipo_auditoria || !detalle) {
      throw new Error(
        "Modelo, tipo de auditoría y detalle son obligatorios para registrar una auditoría."
      );
    }

    // Crear el registro de auditoría dentro de la transacción si está disponible
    await AuditoriaCambio.create(
      {
        usuario_originario_id,
        usuario_destino_id,
        modelo,
        tipo_auditoria,
        detalle,
      }
    );

    logger.info(
      `Auditoría creada: Tipo '${tipo_auditoria}' en modelo '${modelo}' con detalle: '${detalle}'`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    logger.error(`Error al crear auditoría: ${errorMessage}`);
    throw error;
  }
};

/**
 * Crea un registro de auditoría en la tabla AuditoriaRepertorio.
 * @param params - Objeto con los parámetros requeridos para crear la auditoría.
 * @param params.usuario_registrante_id - ID del usuario que realiza la acción (opcional).
 * @param params.fonograma_id - ID del fonograma auditado.
 * @param params.tipo_auditoria - Tipo de auditoría (ALTA, BAJA, CAMBIO, etc.).
 * @param params.detalle - Detalle adicional sobre la acción realizada.
 * @throws Error - Lanza un error si los parámetros no son válidos.
 */
export const registrarRepertorio = async ({
  usuario_registrante_id = null,
  fonograma_id,
  tipo_auditoria,
  detalle,
}: {
  usuario_registrante_id?: string | null;
  fonograma_id: string;
  tipo_auditoria: string;
  detalle: string;
}): Promise<void> => {
  try {
    // Validar que los parámetros obligatorios sean proporcionados
    if (!fonograma_id) {
      throw new Error("El ID del fonograma es obligatorio.");
    }
    if (!tipo_auditoria) {
      throw new Error("El tipo de auditoría es obligatorio.");
    }
    if (!detalle) {
      throw new Error("El detalle de la auditoría es obligatorio.");
    }

    // Crear el registro de auditoría
    await AuditoriaRepertorio.create({
      fonograma_id,
      usuario_registrante_id,
      tipo_auditoria,
      detalle,
    });

    logger.info(
      `Auditoría de repertorio creada: ${tipo_auditoria} en fonograma ${fonograma_id} con detalle: ${detalle}`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    logger.error(`Error al crear auditoría de repertorio: ${errorMessage}`);
    throw error;
  }
};

/**
 * Registra una nueva sesión para un usuario, incluyendo los detalles de inicio de sesión
 * y opcionalmente la fecha de fin de sesión.
 *
 * @param params - Objeto con los detalles de la sesión.
 * @param params.usuarioRegistranteId - ID del usuario que inicia la sesión.
 * @param params.ipOrigen - Dirección IP de origen de la sesión.
 * @param params.navegador - Información del navegador utilizado.
 * @param params.fechaInicioSesion - Fecha y hora de inicio de la sesión. Si no se proporciona, se usará la fecha actual.
 * @param params.fechaFinSesion - Fecha y hora de fin de la sesión. Es opcional y puede ser null.
 * @returns La instancia de la sesión registrada en la base de datos.
 * @throws Error - Lanza un error si ocurre algún problema al registrar la sesión.
 */
export const registrarSesion = async ({
  usuarioRegistranteId,
  ipOrigen,
  navegador,
  fechaInicioSesion,
  fechaFinSesion,
}: {
  usuarioRegistranteId: string;
  ipOrigen: string;
  navegador: string;
  fechaInicioSesion: Date;
  fechaFinSesion?: Date | null;
}) => {
  try {
    const sesion = await AuditoriaSesion.create({
      usuario_registrante_id: usuarioRegistranteId,
      ip_origen: ipOrigen,
      navegador,
      fecha_inicio_sesion: fechaInicioSesion,
      fecha_fin_sesion: fechaFinSesion || null,
    });

    return sesion;
  } catch (error) {
    throw new Error(
      `Error al registrar la auditoría de sesión: ${error instanceof Error ? error.message : "Error desconocido"}`
    );
  }
};


/**
 * Actualiza la fecha de fin de sesión para la sesión más reciente de un usuario.
 * @param usuarioRegistranteId - ID del usuario cuya sesión será actualizada.
 * @returns La instancia actualizada de AuditoriaSesion.
 * @throws Error - Lanza un error si ocurre algún problema durante la actualización.
 */
export const actualizarFechaFinSesion = async (
  usuarioRegistranteId: string
): Promise<AuditoriaSesion | null> => {
  try {
    // Obtener la sesión más reciente del usuario
    const sesion = await AuditoriaSesion.findOne({
      where: { usuario_registrante_id: usuarioRegistranteId },
      order: [["fecha_inicio_sesion", "DESC"]],
    });

    if (!sesion) {
      throw new Error(
        `No se encontró una sesión activa para el usuario con ID: ${usuarioRegistranteId}.`
      );
    }

    // Actualizar la fecha de fin de sesión
    sesion.fecha_fin_sesion = new Date();
    await sesion.save();

    logger.info(
      `Fecha de fin de sesión actualizada correctamente para la sesión con ID: ${sesion.id_sesion}`
    );

    return sesion;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    logger.error(`Error al actualizar la fecha de fin de sesión: ${errorMessage}`);
    throw error;
  }
};

export const getAuditChanges = async (req: Request) => {
  const { fechaDesde, fechaHasta, emailUsuario, tablaDb, tipoAuditoria, page, limit } = req.query;

  const filters: any = {};

  // Manejo de fechas en formato ISO (YYYY-MM-DD)
  if (fechaDesde || fechaHasta) {
    try {
      let startDate: Date | null = fechaDesde ? new Date(fechaDesde as string) : null;
      let endDate: Date | null = fechaHasta ? new Date(fechaHasta as string) : new Date();

      // Verificar si las fechas son válidas
      if (startDate && isNaN(startDate.getTime())) {
        throw new Err.BadRequestError(`Error en la fecha proporcionada: fechaDesde.`);
      }

      if (endDate && isNaN(endDate.getTime())) {
        throw new Err.BadRequestError(`Error en la fecha proporcionada: fechaHasta.`);
      }

      // Si `fechaDesde` no se proporciona, usar un valor mínimo (2000-01-01)
      if (!startDate) {
        startDate = new Date(2000, 0, 1);
      }

      // Si `fechaHasta` no se proporciona, ajustarlo al final del día actual
      if (!endDate) {
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      }

      // Verificar que `fechaDesde` no sea posterior a `fechaHasta`
      if (startDate > endDate) {
        throw new Err.BadRequestError(`El rango de fechas es inválido: fechaDesde (${fechaDesde}) es posterior a fechaHasta (${fechaHasta || "hoy"}).`);
      }

      // Filtrar transacciones entre las fechas proporcionadas
      filters.createdAt = {
        ...(startDate && { [Op.gte]: startDate }),
        ...(endDate && { [Op.lte]: endDate }),
      };
    } catch (error) {
      throw new Err.BadRequestError(`Error en las fechas proporcionadas. Verifica el formato o el rango.`);
    }
  }

  // Filtrado por email del usuario en ambas relaciones (registrante y auditado)
  if (emailUsuario) {
    filters[Op.or] = [
      { "$registranteDeAuditoria.email$": { [Op.iLike]: `%${emailUsuario}%` } },
      { "$usuarioAuditado.email$": { [Op.iLike]: `%${emailUsuario}%` } },
    ];
  }

  // Filtrado por tabla de base de datos
  if (tablaDb && ENTIDADES_PERMITIDAS.includes(tablaDb as string)) {
    filters.modelo = tablaDb;
  } else if (tablaDb) {
    throw new Err.BadRequestError(MESSAGES.ERROR.DATABASE.INVALID_TABLE);
  }

  // Filtrado por tipo de auditoría
  if (tipoAuditoria) {
    filters.tipo_auditoria = tipoAuditoria;
  }

  // Manejo de paginación con valores por defecto
  const pageNumber = page ? parseInt(page as string, 10) : 1;
  const limitNumber = limit ? parseInt(limit as string, 10) : 10;
  const offset = (pageNumber - 1) * limitNumber;

  // Contar el total de registros sin paginación
  const total = await AuditoriaCambio.count({
    where: filters,
    include: [
      { model: Usuario, as: "registranteDeAuditoria", attributes: [] },
      { model: Usuario, as: "usuarioAuditado", attributes: [] },
    ],
  });

  // Consulta con paginación
  const cambios = await AuditoriaCambio.findAll({
    where: filters,
    include: [
      {
        model: Usuario,
        as: "registranteDeAuditoria",
        attributes: ["id_usuario", "email", "nombre", "apellido"],
      },
      {
        model: Usuario,
        as: "usuarioAuditado",
        attributes: ["id_usuario", "email", "nombre", "apellido"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: limitNumber,
    offset: offset,
  });

  return {
    message: "Cambios de auditoría obtenidos exitosamente.",
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
    data: cambios,
  };
};

export const getRepertoireAuditChanges = async (req: Request) => {
  const { fechaDesde, fechaHasta, isrc, emailUsuario, productora, tipoCambio, detalle, page, limit } = req.query;

  const filters: any = {};

  // Manejo de rango de fechas en formato ISO (YYYY-MM-DD)
  if (fechaDesde || fechaHasta) {
    try {
      let startDate: Date | null = fechaDesde ? new Date(fechaDesde as string) : null;
      let endDate: Date | null = fechaHasta ? new Date(fechaHasta as string) : new Date();

      // Verificar si las fechas son válidas
      if (startDate && isNaN(startDate.getTime())) {
        throw new Err.BadRequestError(`Error en la fecha proporcionada: fechaDesde.`);
      }

      if (endDate && isNaN(endDate.getTime())) {
        throw new Err.BadRequestError(`Error en la fecha proporcionada: fechaHasta.`);
      }

      // Si `fechaDesde` no se proporciona, usar un valor mínimo (2000-01-01)
      if (!startDate) {
        startDate = new Date(2000, 0, 1);
      }

      // Si `fechaHasta` no se proporciona, ajustarlo al final del día actual
      if (!endDate) {
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      }

      // Verificar que `fechaDesde` no sea posterior a `fechaHasta`
      if (startDate > endDate) {
        throw new Err.BadRequestError(`El rango de fechas es inválido: fechaDesde (${fechaDesde}) es posterior a fechaHasta (${fechaHasta || "hoy"}).`);
      }

      // Filtrar transacciones entre las fechas proporcionadas
      filters.createdAt = {
        ...(startDate && { [Op.gte]: startDate }),
        ...(endDate && { [Op.lte]: endDate }),
      };
    } catch (error) {
      throw new Err.BadRequestError(`Error en las fechas proporcionadas. Verifica el formato o el rango.`);
    }
  }

  // Filtrado por email del usuario en ambas relaciones (registrante)
  if (emailUsuario) {
    filters[Op.or] = [
      { "$registranteDeRepertorio.email$": { [Op.iLike]: `%${emailUsuario}%` } },
    ];
  }

  // Filtrado por ISRC (ILIKE)
  if (isrc) {
    filters["$fonogramaAuditado.isrc$"] = { [Op.iLike]: `%${isrc}%` };
  }

  // Filtrado por Productora (ILIKE)
  if (productora) {
    filters["$fonogramaAuditado.productoraDelFonograma.nombre_productora$"] = {
      [Op.iLike]: `%${productora}%`,
    };
  }

  // Filtrado por tipo de cambio
  if (tipoCambio) {
    filters.tipo_auditoria = tipoCambio;
  }

  // Búsqueda insensible a mayúsculas en detalle
  if (detalle) {
    filters.detalle = {
      [Op.iLike]: `%${detalle}%`,
    };
  }

  // Manejo de paginación con valores por defecto
  const pageNumber = page ? parseInt(page as string, 10) : 1;
  const limitNumber = limit ? parseInt(limit as string, 10) : 10;
  const offset = (pageNumber - 1) * limitNumber;

  // Contar el total de registros sin paginación
  const total = await AuditoriaRepertorio.count({
    where: filters,
    include: [
      { model: Usuario, as: "registranteDeRepertorio", attributes: [] },
      {
        model: Fonograma,
        as: "fonogramaAuditado",
        attributes: [],
        include: [
          {
            model: Productora,
            as: "productoraDelFonograma",
            attributes: [],
          },
        ],
      },
    ],
  });

  // Consulta con paginación
  const repertorioCambios = await AuditoriaRepertorio.findAll({
    where: filters,
    include: [
      {
        model: Usuario,
        as: "registranteDeRepertorio",
        attributes: ["id_usuario", "email", "nombre", "apellido"],
      },
      {
        model: Fonograma,
        as: "fonogramaAuditado",
        attributes: ["id_fonograma", "isrc", "titulo", "artista"],
        include: [
          {
            model: Productora,
            as: "productoraDelFonograma",
            attributes: ["id_productora", "nombre_productora"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: limitNumber,
    offset: offset,
  });

  return {
    message: "Cambios en repertorios obtenidos exitosamente.",
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
    data: repertorioCambios,
  };
};

export const getSessionAuditChanges = async (req: Request) => {
  const { nombre, apellido, email, fechaDesde, fechaHasta, page, limit } = req.query;

  const filters: any = {};
  const usuarioFilters: any = {};

  // Manejo de rango de fechas en formato ISO (YYYY-MM-DD)
  if (fechaDesde || fechaHasta) {
    try {
      let startDate: Date | null = fechaDesde ? new Date(fechaDesde as string) : null;
      let endDate: Date | null = fechaHasta ? new Date(fechaHasta as string) : new Date();

      // Verificar si las fechas son válidas
      if (startDate && isNaN(startDate.getTime())) {
        throw new Err.BadRequestError(`Error en la fecha proporcionada: fechaDesde.`);
      }

      if (endDate && isNaN(endDate.getTime())) {
        throw new Err.BadRequestError(`Error en la fecha proporcionada: fechaHasta.`);
      }

      // Si `fechaDesde` no se proporciona, usar un valor mínimo (2000-01-01)
      if (!startDate) {
        startDate = new Date(2000, 0, 1);
      }

      // Si `fechaHasta` no se proporciona, ajustarlo al final del día actual
      if (!endDate) {
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      }

      // Verificar que `fechaDesde` no sea posterior a `fechaHasta`
      if (startDate > endDate) {
        throw new Err.BadRequestError(`El rango de fechas es inválido: fechaDesde (${fechaDesde}) es posterior a fechaHasta (${fechaHasta || "hoy"}).`);
      }

      // Filtrar transacciones entre las fechas proporcionadas
      filters.fecha_inicio_sesion = {
        ...(startDate && { [Op.gte]: startDate }),
        ...(endDate && { [Op.lte]: endDate }),
      };
    } catch (error) {
      throw new Err.BadRequestError(`Error en las fechas proporcionadas. Verifica el formato o el rango.`);
    }
  }

  // Filtrado por email sin lanzar error si no hay coincidencias
  if (email) {
    usuarioFilters.email = { [Op.iLike]: `%${email}%` };
  }

  // Búsqueda insensible a mayúsculas y minúsculas en nombre y apellido
  if (nombre) {
    usuarioFilters.nombre = { [Op.iLike]: `%${nombre}%` };
  }
  if (apellido) {
    usuarioFilters.apellido = { [Op.iLike]: `%${apellido}%` };
  }

  // Manejo de paginación con valores por defecto
  const pageNumber = page ? parseInt(page as string, 10) : 1;
  const limitNumber = limit ? parseInt(limit as string, 10) : 10;
  const offset = (pageNumber - 1) * limitNumber;

  // Contar el total de registros sin paginación
  const total = await AuditoriaSesion.count({
    where: filters,
    include: [
      {
        model: Usuario,
        as: "registranteDeSesion",
        where: Object.keys(usuarioFilters).length > 0 ? usuarioFilters : undefined,
      },
    ],
  });

  // Consulta con paginación
  const sesiones = await AuditoriaSesion.findAll({
    where: filters,
    include: [
      {
        model: Usuario,
        as: "registranteDeSesion",
        attributes: ["id_usuario", "email", "nombre", "apellido"],
        where: Object.keys(usuarioFilters).length > 0 ? usuarioFilters : undefined,
      },
    ],
    order: [["fecha_inicio_sesion", "DESC"]],
    limit: limitNumber,
    offset: offset,
  });

  return {
    message: "Sesiones iniciadas obtenidas exitosamente.",
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
    data: sesiones,
  };
};