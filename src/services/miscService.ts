import { v4 as uuidv4 } from "uuid";
import { Fonograma, FonogramaTerritorio, FonogramaTerritorioMaestro } from "../models";
import * as Err from "../utils/customErrors";

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