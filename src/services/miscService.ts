import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { Parser } from "json2csv";

import { Fonograma, FonogramaMaestro, FonogramaParticipacion, FonogramaTerritorio, FonogramaTerritorioMaestro, Productora } from "../models";

import * as Err from "../utils/customErrors";

const MODIFICACION_MAP = {
  ALTA: "ALTA DE FONOGRAMA",
  DATOS: "DATOS DEL FONOGRAMA",
  ARCHIVO: "ARCHIVO DE AUDIO",
  TERRITORIO: "TERRITORIOS",
  PARTICIPACION: "TITULARIDAD",
};

export const generateTerritorialityReportService = async (filters: any): Promise<string> => {
  const whereFonograma: any = {};
  const whereMaestro: any = {};
  const whereProductora: any = {};

  // Aplicar filtros en Fonograma
  if (filters.titulo) {
    whereFonograma.titulo = { [Op.iLike]: `%${filters.titulo}%` };
  }

  if (filters.isrc) {
    whereFonograma.isrc = { [Op.iLike]: `%${filters.isrc}%` };
  }

  if (filters.productora) {
    whereProductora.nombre_productora = { [Op.iLike]: `%${filters.productora}%` };
  }

  // Aplicar filtros en FonogramaMaestro
  if (filters.fecha_desde || filters.fecha_hasta) {
    whereMaestro.fecha_operacion = {};
    if (filters.fecha_desde) {
      whereMaestro.fecha_operacion[Op.gte] = new Date(filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      whereMaestro.fecha_operacion[Op.lte] = new Date(filters.fecha_hasta);
    }
  }

  if (filters.tipo_modificacion) {
    whereMaestro.operacion = filters.tipo_modificacion;
  }

  // Obtener Fonogramas primero, aplicando filtros para reducir la cantidad de datos
  const fonogramas = await Fonograma.findAll({
    where: whereFonograma,
    include: [
      {
        model: Productora,
        as: "productoraDelFonograma",
        attributes: ["nombre_productora"],
        where: Object.keys(whereProductora).length ? whereProductora : undefined,
      },
      {
        model: FonogramaMaestro,
        as: "maestrosDelFonograma",
        attributes: ["operacion", "fecha_operacion"],
        where: Object.keys(whereMaestro).length ? whereMaestro : undefined,
        order: [["fecha_operacion", "DESC"]], // Tomar la última modificación
        limit: 1,
      },
    ],
    attributes: [
      "id_fonograma",
      "titulo",
      "artista",
      "duracion",
      "anio_lanzamiento",
      "isrc",
      "sello_discografico",
    ],
  });

  if (!fonogramas.length) {
    throw new Err.NotFoundError("No hay fonogramas disponibles para el reporte.");
  }

  // Extraer IDs de fonogramas para buscar en FonogramaParticipacion
  const fonogramaIds = fonogramas.map(f => f.id_fonograma);

  // Obtener todas las participaciones SOLO de los fonogramas filtrados
  const participaciones = await FonogramaParticipacion.findAll({
    where: { fonograma_id: { [Op.in]: fonogramaIds } }, // Filtrar solo los fonogramas seleccionados
    include: [
      {
        model: Productora,
        as: "productoraDeParticipante",
        attributes: ["nombre_productora"],
      },
    ],
    attributes: [
      "fonograma_id",
      "fecha_participacion_inicio",
      "fecha_participacion_hasta",
      "porcentaje_participacion",
    ],
  });

  if (!participaciones.length) {
    throw new Err.NotFoundError("No hay participaciones asociadas a los fonogramas seleccionados.");
  }

  // Cruzar fonogramas con participaciones
  const reportData = participaciones.map((participacion) => {
    const fonograma = fonogramas.find((f) => f.id_fonograma === participacion.fonograma_id);
   
    const ultimaModificacion = (fonograma as unknown as { maestrosDelFonograma?: { operacion: keyof typeof MODIFICACION_MAP; fecha_operacion: Date }[] })?.maestrosDelFonograma?.[0];

    return {
      "Nombre del Tema": fonograma?.titulo || "Desconocido",
      "Artista": fonograma?.artista || "Desconocido",
      "Duración": fonograma?.duracion || "Desconocido",
      "Fecha de Lanzamiento": fonograma?.anio_lanzamiento || "Desconocido",
      "ISRC": fonograma?.isrc || "Desconocido",
      "Sello Originario": fonograma?.productoraDelFonograma?.nombre_productora || "Desconocido",
      "Participación Desde": participacion.fecha_participacion_inicio,
      "Participación Hasta": participacion.fecha_participacion_hasta,
      "Porcentaje de Titularidad": participacion.porcentaje_participacion,
      "Tipo de Modificación": MODIFICACION_MAP[ultimaModificacion?.operacion as keyof typeof MODIFICACION_MAP] || "DATOS DEL FONOGRAMA",
      "Fecha de última modificación": ultimaModificacion?.fecha_operacion || "Desconocido",
    };
  });

  if (!reportData.length) {
    throw new Err.NotFoundError("No hay datos válidos para generar el reporte.");
  }

  const json2csvParser = new Parser();
  return json2csvParser.parse(reportData);
};

export const updateStatusService = async (id_territorio: string, is_habilitado: boolean) => {
  const territorio = await FonogramaTerritorio.findByPk(id_territorio);

  if (!territorio) {
    throw new Err.NotFoundError("Territorio no encontrado.");
  }

  territorio.is_habilitado = is_habilitado;
  await territorio.save();

  return territorio;
};

export const createTerritorioService = async ({
  nombre_pais,
  codigo_iso,
  is_habilitado,
}: {
  nombre_pais: string;
  codigo_iso: string;
  is_habilitado: boolean;
}) => {
  // Verificar si ya existe un territorio con el mismo código ISO
  const existingTerritorio = await FonogramaTerritorio.findOne({
    where: { codigo_iso },
  });

  if (existingTerritorio) {
    throw new Err.ConflictError("El código ISO ya está en uso.");
  }

  // Crear el nuevo territorio
  const newTerritorio = await FonogramaTerritorio.create({
    id_territorio: uuidv4(),
    nombre_pais,
    codigo_iso,
    is_habilitado,
  });

  // Obtener todos los fonogramas existentes
  const fonogramas = await Fonograma.findAll({ attributes: ["id_fonograma"] });

  // Vincular el nuevo territorio con todos los fonogramas
  const vinculaciones = fonogramas.map((fonograma) => ({
    id_territorio_maestro: uuidv4(),
    fonograma_id: fonograma.id_fonograma,
    territorio_id: newTerritorio.id_territorio,
    is_activo: is_habilitado,
  }));

  await FonogramaTerritorioMaestro.bulkCreate(vinculaciones);

  return newTerritorio;
};

export const deleteTerritorioService = async (id_territorio: string) => {
  // Verificar si el territorio existe
  const territorio = await FonogramaTerritorio.findByPk(id_territorio);

  if (!territorio) {
    throw new Err.NotFoundError("El territorio no existe.");
  }

  // Eliminar todas las referencias en FonogramaTerritorioMaestro
  await FonogramaTerritorioMaestro.destroy({
    where: { territorio_id: id_territorio },
  });

  // Eliminar el territorio de FonogramaTerritorio
  await territorio.destroy();
};