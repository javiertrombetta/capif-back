import { Request, Response } from 'express';
import { Op } from "sequelize";
import { Productora, Conflicto, Fonograma, FonogramaParticipacion, ConflictoParte } from '../models';
import { sendEmailWithErrorHandling } from '../services/emailService';

import * as MESSAGES from "../utils/messages";

export const crearConflicto = async (req: Request, res: Response): Promise<void> => {
  const { isrc, fecha_periodo_desde, fecha_periodo_hasta } = req.body;

  if (!isrc || !fecha_periodo_desde || !fecha_periodo_hasta) {
    res.status(400).json({ message: 'El ISRC, fecha_periodo_desde y fecha_periodo_hasta son obligatorios' });
    return;
  }

  try {
    // Verificar que el fonograma exista
    const fonograma = await Fonograma.findOne({ where: { isrc } });

    if (!fonograma) {
      res.status(404).json({ message: `El fonograma con ISRC ${isrc} no existe` });
      return;
    }

    // Obtener las participaciones dentro del período especificado
    const participaciones = await FonogramaParticipacion.findAll({
      where: {
        fonograma_id: fonograma.id_fonograma,
        fecha_participacion_inicio: { [Op.lte]: new Date(fecha_periodo_hasta) },
        fecha_participacion_hasta: { [Op.gte]: new Date(fecha_periodo_desde) },
      },
    });

    if (participaciones.length === 0) {
      res.status(400).json({
        message: `El fonograma con ISRC ${isrc} no tiene participaciones registradas en el período especificado`,
      });
      return;
    }

    // Crear un mapa de períodos con porcentajes acumulados
    const periodos: Array<{ fecha_inicio: Date; fecha_fin: Date; participaciones: typeof participaciones }> = [];

    for (const participacion of participaciones) {
      const inicio = new Date(participacion.fecha_participacion_inicio > new Date(fecha_periodo_desde)
        ? participacion.fecha_participacion_inicio
        : fecha_periodo_desde);
      const fin = new Date(participacion.fecha_participacion_hasta < new Date(fecha_periodo_hasta)
        ? participacion.fecha_participacion_hasta
        : fecha_periodo_hasta);

      periodos.push({ fecha_inicio: inicio, fecha_fin: fin, participaciones: [participacion] });
    }

    // Agrupar los períodos que exceden el 100%
    const conflictosCreados = [];
    for (const periodo of periodos) {
      const porcentajeTotal = periodo.participaciones.reduce((acc, curr) => acc + curr.porcentaje_participacion, 0);

      if (porcentajeTotal > 100) {
        // Crear conflicto para este período
        const nuevoConflicto = await Conflicto.create({
          fonograma_id: fonograma.id_fonograma,
          productora_conflicto_id: fonograma.productora_id,
          estado_conflicto: 'PENDIENTE CAPIF',
          fecha_periodo_desde: periodo.fecha_inicio,
          fecha_periodo_hasta: periodo.fecha_fin,
          porcentaje_periodo: porcentajeTotal,
        });

        conflictosCreados.push(nuevoConflicto);

        // Crear registros en ConflictoParte para cada participación involucrada
        for (const participacion of periodo.participaciones) {
          await ConflictoParte.create({
            conflicto_id: nuevoConflicto.id_conflicto,
            participacion_id: participacion.id_participacion,
            estado: 'PENDIENTE',
            porcentaje_confirmado: null,
            is_documentos_enviados: false,
          });
        }
      }
    }

    if (conflictosCreados.length === 0) {
      res.status(400).json({
        message: 'No se encontraron períodos con porcentaje de participación superior al 100%',
      });
      return;
    }

    res.status(201).json({
      message: 'Conflictos creados exitosamente',
      conflictos: conflictosCreados,
    });
  } catch (error: any) {
    console.error('Error al crear conflicto:', error);
    res.status(500).json({ message: 'Error al crear el conflicto', error: error.message });
  }
};

export const obtenerConflictos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta, estado } = req.query;

    // Filtros iniciales
    const where: any = {};

    // Filtro por fechas de período
    if (fecha_desde || fecha_hasta) {
      where.fecha_periodo_desde = {
        ...(fecha_desde ? { [Op.gte]: new Date(fecha_desde as string) } : {}),
        ...(fecha_hasta ? { [Op.lte]: new Date(fecha_hasta as string) } : {}),
      };
    }

    // Filtro por estado del conflicto
    if (estado) {
      if (estado === 'en curso') {
        where.estado_conflicto = {
          [Op.in]: ['PENDIENTE CAPIF', 'PRIMERA INSTANCIA', 'PRIMERA PRORROGA', 'SEGUNDA INSTANCIA', 'SEGUNDA PRORROGA'],
        };
      } else if (estado === 'cerrado') {
        where.estado_conflicto = 'CERRADO';
      } else if (estado === 'vencido') {
        where.estado_conflicto = 'VENCIDO';
      }
    }

    // Consulta a la base de datos
    const conflictos = await Conflicto.findAll({
      where,
      include: [
        {
          model: Fonograma,
          as: 'fonogramaDelConflicto',
          attributes: ['id_fonograma', 'isrc', 'titulo', 'artista'],
        },
        {
          model: Productora,
          as: 'productoraDelConflicto',
          attributes: ['id_productora', 'nombre'],
        },
      ],
      order: [['fecha_inicio_conflicto', 'DESC']],
    });

    res.status(200).json({
      message: 'Conflictos obtenidos exitosamente',
      conflictos,
    });
  } catch (error: any) {
    console.error('Error al obtener conflictos:', error);
    res.status(500).json({ message: 'Error al obtener conflictos', error: error.message });
  }
};

export const obtenerConflicto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Buscar el conflicto por ID incluyendo sus relaciones
    const conflicto = await Conflicto.findOne({
      where: { id_conflicto: id },
      include: [
        {
          model: Fonograma,
          as: 'fonogramaDelConflicto',
          attributes: ['id_fonograma', 'isrc', 'titulo', 'artista', 'sello_discografico', 'anio_lanzamiento'],
        },
        {
          model: Productora,
          as: 'productoraDelConflicto',
          attributes: ['id_productora', 'nombre'],
        },
        {
          model: ConflictoParte,
          as: 'partesDelConflicto',
          include: [
            {
              model: FonogramaParticipacion,
              as: 'participacionDeLaParte',
              attributes: ['id_participacion', 'porcentaje_participacion', 'fecha_participacion_inicio', 'fecha_participacion_hasta'],
            },
          ],
        },
      ],
    });

    // Verificar si el conflicto existe
    if (!conflicto) {
      res.status(404).json({ message: `No se encontró el conflicto con ID ${id}` });
      return;
    }

    res.status(200).json({
      message: 'Conflicto obtenido exitosamente',
      conflicto,
    });
  } catch (error: any) {
    console.error('Error al obtener el conflicto:', error);
    res.status(500).json({ message: 'Error al obtener el conflicto', error: error.message });
  }
};

export const actualizarEstadoConflicto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado_conflicto } = req.body;

    // Buscar el conflicto por ID
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      res.status(404).json({ message: `No se encontró el conflicto con ID ${id}` });
      return;
    }     

    // Validar que el estado del conflicto sea válido
    const TIPO_ESTADOS = [
      'PENDIENTE CAPIF',
      'PRIMERA INSTANCIA',
      'PRIMERA PRORROGA',
      'SEGUNDA INSTANCIA',
      'SEGUNDA PRORROGA',
      'VENCIDO',
      'CERRADO',
    ] as const;

    if (estado_conflicto && !TIPO_ESTADOS.includes(estado_conflicto)) {
      res.status(400).json({ message: `El estado ${estado_conflicto} no es válido.` });
      return;
    }

    // Actualizar el estado del conflicto
    await conflicto.update({ estado_conflicto });

    res.status(200).json({
      message: 'Estado del conflicto actualizado exitosamente',
      conflicto,
    });

  } catch (error: any) {
    console.error('Error al actualizar el estado del conflicto:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del conflicto', error: error.message });
  }
};

export const desistirConflicto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Buscar el conflicto por ID
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      res.status(404).json({ message: `No se encontró el conflicto con ID ${id}` });
      return;
    }

    // Cambiar el estado del conflicto a "CERRADO"
    await conflicto.update({
      estado_conflicto: 'CERRADO',
      fecha_fin_conflicto: new Date(),
    });

    // Cambiar el estado de todas las partes del conflicto a "DESISTIDO"
    await ConflictoParte.update(
      { estado: 'DESISTIDO' },
      { where: { conflicto_id: id } }
    );

    res.status(200).json({
      message: 'Conflicto cancelado exitosamente y todas sus partes marcadas como DESISTIDO',
      conflicto,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al cancelar el conflicto', error: error.message });
  }
};

export const eliminarConflicto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Buscar el conflicto por ID
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      res.status(404).json({ message: `No se encontró el conflicto con ID ${id}` });
      return;
    }

    // Eliminar las partes asociadas al conflicto
    await ConflictoParte.destroy({ where: { conflicto_id: id } });

    // Eliminar el conflicto
    await conflicto.destroy();

    res.status(200).json({
      message: 'Conflicto eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar el conflicto:', error);
    res.status(500).json({ message: 'Error al eliminar el conflicto', error: error.message });
  }
};

export const actualizarPorResolucion = (req: Request, res: Response): void => {
  res.status(200).json({ message: `Segunda instancia manejada para el conflicto con ID ${req.params.id}` });
};

export const otorgarProrroga = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Buscar el conflicto por ID
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      res.status(404).json({ message: `No se encontró el conflicto con ID ${id}` });
      return;
    }

    let nuevoEstado: string | null = null;

    // Determinar la prórroga a otorgar según el estado actual
    if (conflicto.estado_conflicto === 'PRIMERA INSTANCIA') {
      nuevoEstado = 'PRIMERA PRORROGA';
    } else if (conflicto.estado_conflicto === 'SEGUNDA INSTANCIA') {
      nuevoEstado = 'SEGUNDA PRORROGA';
    } else {
      res.status(400).json({
        message: `No se puede otorgar una prórroga. El conflicto está en estado ${conflicto.estado_conflicto}.`,
      });
      return;
    }

    // Actualizar el estado del conflicto
    await conflicto.update({ estado_conflicto: nuevoEstado });

    res.status(200).json({
      message: `Prórroga otorgada exitosamente. El nuevo estado es ${nuevoEstado}.`,
      conflicto,
    });
  } catch (error: any) {
    console.error('Error al otorgar la prórroga:', error);
    res.status(500).json({ message: 'Error al otorgar la prórroga', error: error.message });
  }
};

export const confirmarPorcentaje = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { participacion_id, porcentaje_confirmado } = req.body;

    if (!participacion_id || porcentaje_confirmado === undefined) {
      res.status(400).json({ message: 'El ID de participación y el porcentaje confirmado son obligatorios.' });
      return;
    }

    // Buscar la participación en el conflicto
    const conflictoParte = await ConflictoParte.findOne({
      where: { conflicto_id: id, participacion_id },
    });

    if (!conflictoParte) {
      res.status(404).json({ message: `No se encontró la participación con ID ${participacion_id} en el conflicto.` });
      return;
    }

    // Marcar como RESPONDIDO y establecer fecha_respuesta
    await conflictoParte.update({
      estado: 'RESPONDIDO',
      porcentaje_confirmado,
      fecha_respuesta: new Date(),
    });

    // Verificar si todas las participaciones han sido respondidas
    const participacionesPendientes = await ConflictoParte.findOne({
      where: { conflicto_id: id, estado: { [Op.ne]: 'RESPONDIDO' } },
    });

    if (participacionesPendientes) {
      res.status(200).json({
        message: 'Porcentaje confirmado. Aún hay participantes sin responder.',
        conflictoParte,
      });
      return;
    }

    // Si todos los participantes han respondido, verificar el total de participación
    const conflicto = await Conflicto.findOne({ where: { id_conflicto: id } });

    if (!conflicto) {
      res.status(404).json({ message: `No se encontró el conflicto con ID ${id}.` });
      return;
    }

    // Calcular el total de participación confirmada
    const participaciones = await ConflictoParte.findAll({
      where: { conflicto_id: id },
      include: [{ model: FonogramaParticipacion, as: 'participacionDeLaParte', attributes: ['porcentaje_participacion'] }],
    });

    const totalPorcentaje = participaciones.reduce((acc, curr) => acc + (curr.porcentaje_confirmado || 0), 0);

    // Determinar si el conflicto pasa a SEGUNDA INSTANCIA o se cierra
    let nuevoEstado = '';
    let updateData: any = {};

    if (totalPorcentaje > 100) {
      nuevoEstado = 'SEGUNDA INSTANCIA';
      updateData = { estado_conflicto: nuevoEstado, fecha_segunda_instancia: new Date() };
    } else {
      nuevoEstado = 'CERRADO';
      updateData = { estado_conflicto: nuevoEstado, fecha_fin_conflicto: new Date() };
    }

    await conflicto.update(updateData);

    res.status(200).json({
      message: `Porcentaje confirmado. El conflicto ha cambiado a estado ${nuevoEstado}.`,
      conflicto,
    });
  } catch (error: any) {
    console.error('Error al confirmar el porcentaje:', error);
    res.status(500).json({ message: 'Error al confirmar el porcentaje', error: error.message });
  }
};

export const enviarDocumentos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre_participante } = req.body;

    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({ message: 'No se adjuntó ningún documento' });
      return;
    }

    // Convertir los archivos de memoria en adjuntos para el correo
    const archivosAdjuntos = (req.files as Express.Multer.File[]).map((file) => ({
      filename: file.originalname,
      content: file.buffer, // Se envía el contenido en memoria, sin guardarlo
    }));

    // Dirección de correo establecida en las variables de entorno
    const destinatario = process.env.CAPIF_EMAIL_RECEIVER;
    if (!destinatario) {
      res.status(500).json({ message: 'No se ha configurado un destinatario en las variables de entorno' });
      return;
    }

    // Obtener el contenido del correo desde messages.ts
    const emailContent = MESSAGES.EMAIL_BODY.SEND_DOCUMENTS_NOTIFICATION(nombre_participante, id);

    // Enviar correo utilizando emailService
    await sendEmailWithErrorHandling(
      {
        to: destinatario,
        subject: `Documentos adjuntos para el Conflicto ID: ${id}`,
        html: emailContent,
        successLog: `Documentos enviados con éxito para el conflicto ID ${id}`,
        errorLog: `Error al enviar documentos para el conflicto ID ${id}`,
      },
      req
    );

    res.status(200).json({
      message: 'Documentos enviados exitosamente',
      archivos: archivosAdjuntos.map((archivo) => archivo.filename),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al enviar documentos', error: error.message });
  }
};

export const generarReporteConflictos = (req: Request, res: Response): void => {
  res.status(200).json({ message: 'Reporte de conflictos generado' });
};