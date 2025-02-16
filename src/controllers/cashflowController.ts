import { Request, Response } from 'express';
import fs from 'fs';
import csvParser from 'csv-parser';
import { Parser as Json2CsvParser } from 'json2csv';
import path from 'path';

import { Conflicto, Fonograma, FonogramaParticipacion, Productora } from '../models';


export const processReproductions = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const filePath = req.file.path;
    const processedData: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', async (row) => {
        try {
          const { isrc, ...rest } = row;

          if (!isrc) {
            return;
          }

          // Buscar el fonograma en la base de datos
          const fonograma = await Fonograma.findOne({ where: { isrc } });

          if (!fonograma) {
            processedData.push({
              ...row,
              ID: null,
              CUIT_DEL_TITULAR: '000000000000',
              PORCENTAJE_DE_TITULARIDAD: 0,
              SELLO_ORIGINARIO: 'No asignado',
            });
            return;
          }

          // Verificar si el fonograma tiene conflictos activos
          const conflictoActivo = await Conflicto.findOne({
            where: {
              fonograma_id: fonograma.id_fonograma,
              fecha_fin_conflicto: { $ne: null }, // Solo conflictos aún abiertos
            },
          });

          if (conflictoActivo) {
            processedData.push({
              ...row,
              ID: null,
              CUIT_DEL_TITULAR: '999999999999',
              PORCENTAJE_DE_TITULARIDAD: 0,
              SELLO_ORIGINARIO: 'Conflicto Activo',
            });
            return;
          }

          // Obtener los participantes del fonograma con la relación de Productora
          const participaciones = await FonogramaParticipacion.findAll({
            where: { fonograma_id: fonograma.id_fonograma },
            include: [{ model: Productora, as: 'productoraDeParticipante' }],
          });

          if (participaciones.length === 0) {
            processedData.push({
              ...row,
              ID: null,
              CUIT_DEL_TITULAR: '000000000000',
              PORCENTAJE_DE_TITULARIDAD: 0,
              SELLO_ORIGINARIO: 'No asignado',
            });
            return;
          }

          // Obtener la productora originaria del fonograma
          const productora = await Productora.findOne({ where: { id_productora: fonograma.productora_id } });

          // Contador autoincremental por cada fila
          let idCounter = 1

          // Agregar una entrada por cada participación
          participaciones.forEach((participacion) => {
            processedData.push({
              ...rest,
              ID: `${row.date}_${row.time}_${row.channel}_${idCounter++}`,
              CUIT_DEL_TITULAR: participacion.productoraDeParticipante?.cuit_cuil || 'Desconocido',
              PORCENTAJE_DE_TITULARIDAD: participacion.porcentaje_participacion,
              SELLO_ORIGINARIO: productora ? productora.nombre_productora : 'Desconocido',
            });
          });

        } catch (error) {
          console.error('Error procesando fila:', error);
        }
      })
      .on('end', () => {
        // Generar el nuevo archivo CSV
        const csvFields = [
          'date', 'time', 'duration', 'channel', 'country', 'city', 'track', 'artist', 'label', 'isrc', 'bmatid',
          'catalog', 'program title', 'episode title', 'episode number', 'program category', 'program type',
          'program production company', 'ID', 'CUIT_DEL_TITULAR', 'PORCENTAJE_DE_TITULARIDAD', 'SELLO_ORIGINARIO'
        ];
        const json2csvParser = new Json2CsvParser({ fields: csvFields });
        const csvOutput = json2csvParser.parse(processedData);

        // Guardar el archivo de salida
        const outputFilePath = path.join(__dirname, '../../uploads/output_reproductions.csv');
        fs.writeFileSync(outputFilePath, csvOutput);

        res.download(outputFilePath, 'pasadas.csv', () => {
          // Eliminar archivos temporales después de la descarga
          fs.unlinkSync(filePath);
          fs.unlinkSync(outputFilePath);
        });
      });

  } catch (error) {
    console.error('Error procesando el archivo:', error);
    res.status(500).json({ error: 'Error interno al procesar el archivo.' });
  }
};

// export const importSettlements = (req: Request, res: Response) => res.sendStatus(200);
// export const validateSettlements = (req: Request, res: Response) => res.sendStatus(200);
export const processSettlements = (req: Request, res: Response) => res.sendStatus(200);
export const getAllSettlements = (req: Request, res: Response) => res.sendStatus(200);
export const getSettlementById = (req: Request, res: Response) => res.sendStatus(200);
export const deleteSettlement = (req: Request, res: Response) => res.sendStatus(200);

// export const validateTransfers = (req: Request, res: Response) => res.sendStatus(200);
export const createTransfers = (req: Request, res: Response) => res.sendStatus(200);
export const getAllTransfers = (req: Request, res: Response) => res.sendStatus(200);
export const getTransferById = (req: Request, res: Response) => res.sendStatus(200);
export const deleteTransfer = (req: Request, res: Response) => res.sendStatus(200);

// export const validatePayments = (req: Request, res: Response) => res.sendStatus(200);
export const processPayments = (req: Request, res: Response) => res.sendStatus(200);
export const getAllPayments = (req: Request, res: Response) => res.sendStatus(200);
export const getPaymentById = (req: Request, res: Response) => res.sendStatus(200);
export const deletePayment = (req: Request, res: Response) => res.sendStatus(200);

// export const approveRejection = (req: Request, res: Response) => res.sendStatus(200);
// export const reverseRejection = (req: Request, res: Response) => res.sendStatus(200);
export const processRejections = (req: Request, res: Response) => res.sendStatus(200);
export const getAllRejections = (req: Request, res: Response) => res.sendStatus(200);
export const getRejectionById = (req: Request, res: Response) => res.sendStatus(200);
export const deleteRejection = (req: Request, res: Response) => res.sendStatus(200);