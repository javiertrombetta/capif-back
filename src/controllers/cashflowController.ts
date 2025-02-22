import { Request, Response } from 'express';
import { Parser as Json2CsvParser } from 'json2csv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import csvParser from 'csv-parser';
import path from 'path';

import { Conflicto, Fonograma, FonogramaParticipacion, Productora, Cashflow, CashflowMaestro, CashflowLiquidacion, CashflowPendiente } from '../models';


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
              fecha_fin_conflicto: { $ne: null }, // Solo los conflictos todavía abiertos
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
          // Eliminar archivos temporales después de descargalo
          fs.unlinkSync(filePath);
          fs.unlinkSync(outputFilePath);
        });
      });

  } catch (error) {
    console.error('Error procesando el archivo:', error);
    res.status(500).json({ error: 'Error interno al procesar el archivo.' });
  }
};

export const processSettlements = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }
        
        const filePath = req.file.path;
        const results: any[] = [];
        const registrosNoProcesados: any[] = [];

        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: '\t' }))
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                for (const row of results) {
                    const cuit = row.CUIT?.trim() || '00000000000';
                    const monto = parseFloat(row.Liquidación.replace(',', '.'));
                    const retencion = row.Retención.trim().toLowerCase() === 'si';
                    
                    const isFonograma = 'ISRC' in row;
                    const concepto = isFonograma ? 'FONOGRAMA' : 'GENERAL';
                    const nacionalidadFonograma = isFonograma && row.ISRC.startsWith('AR') ? 'NACIONAL' : 'INTERNACIONAL';
                    const isrc = isFonograma ? row.ISRC.trim() : null;
                    
                    const productora = await Productora.findOne({ where: { cuit } });
                    if (!productora) {
                        registrosNoProcesados.push(row);
                        continue;
                    }
                    
                    const cashflow = await Cashflow.findOne({ where: { productora_id: productora.id_productora } });
                    if (!cashflow) {
                        registrosNoProcesados.push(row);
                        continue;
                    }
                    
                    const cashflowMaestro = await CashflowMaestro.create({
                        id_transaccion: uuidv4(),
                        cashflow_id: cashflow.id_cashflow,
                        tipo_transaccion: 'LIQUIDACION',
                        monto,
                        saldo_resultante: parseFloat(cashflow.saldo_actual_productora.toString()) + monto,
                        numero_lote: Date.now(),
                    });
                    
                    await CashflowLiquidacion.create({
                        id_liquidacion: uuidv4(),
                        cashflow_maestro_id: cashflowMaestro.id_transaccion,
                        concepto,
                        nacionalidad_fonograma: nacionalidadFonograma,
                        monto,
                        isRetencion: retencion,
                        cuit,
                        isrc,
                        nombre_fonograma: row['Nombre del fonograma']?.trim() || null,
                        nombre_artista: row['Nombre del artista']?.trim() || null,
                        sello_discografico: row['Sello']?.trim() || null,
                    });
                    
                    cashflow.saldo_actual_productora = cashflowMaestro.saldo_resultante;
                    await cashflow.save();
                }
                
                if (registrosNoProcesados.length) {
                    return res.status(207).json({ message: 'Algunos registros no pudieron procesarse', registrosNoProcesados });
                }
                return res.status(200).json({ message: 'Liquidaciones procesadas correctamente' });
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error procesando liquidaciones' });
    }
};

export const pendingSettlements = (req: Request, res: Response) => res.sendStatus(200);
export const processTransfers = (req: Request, res: Response) => res.sendStatus(200);
export const processPayments = (req: Request, res: Response) => res.sendStatus(200);
export const processRejections = (req: Request, res: Response) => res.sendStatus(200);
export const listTransactions = (req: Request, res: Response) => res.sendStatus(200);
export const updateCashflow = (req: Request, res: Response) => res.sendStatus(200);