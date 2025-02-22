import { Request, Response } from 'express';
import { Parser as Json2CsvParser } from 'json2csv';
import { Op } from 'sequelize';
import { parse } from 'date-fns';
import fs from 'fs';
import csvParser from 'csv-parser';
import path from 'path';

import { Conflicto, Fonograma, FonogramaParticipacion, Productora, Cashflow, CashflowMaestro, CashflowLiquidacion, CashflowPago, CashflowPendiente, CashflowRechazo, CashflowTraspaso } from '../models';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { UsuarioResponse } from '../interfaces/UsuarioResponse';

import { getAuthenticatedUser } from '../services/authService';
import { registrarAuditoria } from '../services/auditService';
import { sendEmailWithErrorHandling } from "../services/emailService";

import * as MESSAGES from "../utils/messages";
import * as Err from "../utils/customErrors";


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

export const processSettlements = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
        
        const filePath = req.file.path;
        const results: any[] = [];
        const registrosNoProcesados: any[] = [];

        const lastLote = Number(await CashflowMaestro.max('numero_lote')) || 0;
        const newLote = lastLote + 1;

        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: '\t' }))
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                for (const row of results) {
                    const cuit = row['CUIT']?.trim() || '00000000000';
                    const monto = parseFloat(
                      row['MONTO']
                        .replace(/,/g, '')
                        .replace(/\.(?=\d{3}(\D|$))/g, '')
                        .replace(',', '.')
                    );
                    const retencion = row['RETENCION'].trim().toLowerCase() === 'si';
                    
                    const isFonograma = 'ISRC' in row;
                    const concepto = isFonograma ? 'FONOGRAMA' : 'GENERAL';
                    const nacionalidadFonograma = isFonograma && row['ISRC'].startsWith('AR') ? 'NACIONAL' : 'INTERNACIONAL';
                    const isrc = isFonograma ? row['ISRC'].trim() : null;                    
                    const fecha_liquidacion = parse(row['FECHA'], 'dd/MM/yyyy', new Date());
                    const pasadas = Number.isInteger(Number(row['PASADAS'])) ? parseInt(row['PASADAS'], 10) : NaN;

                    if (isNaN(pasadas)) {
                        console.error(`Valor inválido en PASADAS: ${row['PASADAS']}`);
                    }
                    
                    if (cuit === '00000000000' && isrc) {
                        const pendiente = await CashflowPendiente.findOne({ where: { isrc } });
                        if (pendiente) {
                            pendiente.monto += monto;
                            await pendiente.save();
                        } else {
                            await CashflowPendiente.create({                    
                                isrc,
                                monto,
                            });
                        }
                        continue;
                    }
                    
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
                        cashflow_id: cashflow.id_cashflow,
                        tipo_transaccion: 'LIQUIDACION',
                        monto,
                        saldo_resultante: parseFloat(cashflow.saldo_actual_productora.toString()) + monto,
                        numero_lote: newLote,
                        referencia: row['REFERENCIA']?.trim() || null,
                        fecha_transaccion: fecha_liquidacion,
                    });

                    const cashflowLiquidacion = await CashflowLiquidacion.create({            
                        cashflow_maestro_id: cashflowMaestro.id_transaccion,
                        concepto,
                        nacionalidad_fonograma: nacionalidadFonograma,
                        monto,
                        isRetencion: retencion,
                        cuit,
                        isrc,
                        pasadas,
                        nombre_fonograma: row['NOMBRE DEL FONOGRAMA']?.trim() || null,
                        nombre_artista: row['NOMBRE DEL ARTISTA']?.trim() || null,
                        sello_discografico: row['SELLO']?.trim() || null,
                        fecha_liquidacion,
                    });

                    await cashflowMaestro.update({ liquidacion_id: cashflowLiquidacion.id_liquidacion });

                    // Registrar en la auditoría de la transacción
                    await registrarAuditoria({
                      usuario_originario_id: authUser.id_usuario,
                      usuario_destino_id: null,
                      modelo: "CashflowMaestro",
                      tipo_auditoria: "ALTA",
                      detalle: `Liquidación registrada de ${monto} para el CUIT ${cuit} con lote ${cashflowMaestro.numero_lote} y referencia ${cashflowMaestro.referencia}` ,
                    });
                    
                    cashflow.saldo_actual_productora = cashflowMaestro.saldo_resultante;
                    await cashflow.save();

                    // Registrar en la auditoría del cashflow
                    await registrarAuditoria({
                      usuario_originario_id: authUser.id_usuario,
                      usuario_destino_id: null,
                      modelo: "Cashflow",
                      tipo_auditoria: "CAMBIO",
                      detalle: `Actualización del cashflow de la productora ${cashflow.productoraDeCC?.nombre_productora} ID: ${cashflow.productora_id}` ,
                    });
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

export const pendingSettlements = async (req: Request, res: Response) => {
    try {
        const pendientes = await CashflowPendiente.findAll({
            attributes: ['isrc', 'monto']
        });

        return res.status(200).json({
            message: 'Pendientes de liquidación obtenidos correctamente',
            data: pendientes
        });
    } catch (error) {
        console.error('Error al obtener pendientes de liquidación:', error);
        return res.status(500).json({ message: 'Error al obtener pendientes de liquidación' });
    }
};

export const processPayments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
        
        const filePath = req.file.path;
        const results: any[] = [];
        const registrosNoProcesados: any[] = [];

        const lastLote = Number(await CashflowMaestro.max('numero_lote')) || 0;
        const newLote = lastLote + 1;

        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: '\t' }))
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                for (const row of results) {
                    const cuit = row['CUIT']?.trim();
                    const monto = parseFloat(row['MONTO'].replace(/,/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
                    const retencion = row['RETENCION'].trim().toLowerCase() === 'si';
                    const concepto = 'ISRC' in row ? 'FONOGRAMA' : 'GENERAL';
                    const isrc = 'ISRC' in row ? row['ISRC'].trim() : null;
                    const fechaPago = parse(row['FECHA'], 'dd/MM/yyyy', new Date());
                    const referencia = row['REFERENCIA'].trim() || null;

                    const productora = await Productora.findOne({ where: { cuit } });
                    if (!productora) {
                        registrosNoProcesados.push(row);
                        continue;
                    }

                    const cashflow = await Cashflow.findOne({ where: { productora_id: productora.id_productora } });
                    if (!cashflow || cashflow.saldo_actual_productora < monto) {
                        registrosNoProcesados.push(row);
                        continue;
                    }
                    
                    const cashflowMaestro = await CashflowMaestro.create({
                        cashflow_id: cashflow.id_cashflow,
                        tipo_transaccion: 'PAGO',
                        monto,
                        saldo_resultante: parseFloat(cashflow.saldo_actual_productora.toString()) - monto,
                        numero_lote: newLote,
                        referencia,
                        fecha_transaccion: fechaPago,
                    });
                    
                    const cashflowPago = await CashflowPago.create({
                        cashflow_maestro_id: cashflowMaestro.id_transaccion,
                        concepto,
                        monto,
                        isRetencion: retencion,
                        cuit,
                        isrc,
                        fecha_pago: fechaPago,
                    });
                    
                    await cashflowMaestro.update({ pago_id: cashflowPago.id_pago });
                    
                    // Registrar en la auditoría de la transacción
                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "CashflowMaestro",
                        tipo_auditoria: "ALTA",
                        detalle: `Pago registrado de ${monto} para el CUIT ${cuit} con lote ${cashflowMaestro.numero_lote} y referencia ${referencia}`,
                    });

                    cashflow.saldo_actual_productora = cashflowMaestro.saldo_resultante;
                    await cashflow.save();

                    // Registrar en la auditoría del cashflow
                    await registrarAuditoria({
                      usuario_originario_id: authUser.id_usuario,
                      usuario_destino_id: null,
                      modelo: "Cashflow",
                      tipo_auditoria: "CAMBIO",
                      detalle: `Actualización del cashflow de la productora ${cashflow.productoraDeCC?.nombre_productora} ID: ${cashflow.productora_id}` ,
                    });

                    // Enviar correo de notificación
                    if (productora.email) {
                        await sendEmailWithErrorHandling(
                            {
                                to: productora.email,
                                subject: "Notificación de Pago Procesado",
                                html: `<p>Estimado/a ${productora.nombre_productora},</p>
                                       <p>Se ha registrado un pago de ${monto} para su productora.</p>
                                       <p>Referencia: ${referencia || 'N/A'}</p>
                                       <p>Fecha: ${fechaPago.toLocaleDateString()}</p>
                                       <p>Saludos cordiales,</p>
                                       <p>CAPIF</p>`,
                                successLog: `Correo de notificación enviado a ${productora.email} sobre el pago de ${monto}.`,
                                errorLog: `Error al enviar el correo de notificación a ${productora.email} sobre el pago de ${monto}.`,
                            }, req
                        );
                    }
                }
                
                if (registrosNoProcesados.length) {
                    return res.status(207).json({ message: 'Algunos pagos no pudieron procesarse', registrosNoProcesados });
                }
                return res.status(200).json({ message: 'Pagos procesados correctamente' });
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error procesando pagos' });
    }
};

export const processRejections = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
        
        const filePath = req.file.path;
        const results: any[] = [];
        const registrosNoProcesados: any[] = [];

        const lastLote = Number(await CashflowMaestro.max('numero_lote')) || 0;
        const newLote = lastLote + 1;

        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: '\t' }))
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                for (const row of results) {
                    const cuit = row['CUIT']?.trim();
                    const monto = parseFloat(row['MONTO'].replace(/,/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
                    const referencia = row['REFERENCIA'].trim() || null;
                    const fechaRechazo = parse(row['FECHA'], 'dd/MM/yyyy', new Date());

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

                    let montoReferencia = monto;
                    if (referencia) {
                        const cashflowMaestroRef = await CashflowMaestro.findOne({ where: { referencia } });
                        if (cashflowMaestroRef) {
                            montoReferencia = cashflowMaestroRef.monto;
                        }
                    }
                    
                    const cashflowMaestro = await CashflowMaestro.create({
                        cashflow_id: cashflow.id_cashflow,
                        tipo_transaccion: 'RECHAZO',
                        monto: montoReferencia,
                        saldo_resultante: parseFloat(cashflow.saldo_actual_productora.toString()) + montoReferencia,
                        numero_lote: newLote,
                        referencia,
                        fecha_transaccion: fechaRechazo,
                    });
                    
                    const cashflowRechazo =await CashflowRechazo.create({
                        cashflow_maestro_id: cashflowMaestro.id_transaccion,
                        monto: montoReferencia,
                        referencia,
                        fecha_rechazo: fechaRechazo,
                    });
                    
                    await cashflowMaestro.update({ rechazo_id: cashflowRechazo.id_rechazo });
                    
                    // Registrar en la auditoría de la transacción
                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "CashflowMaestro",
                        tipo_auditoria: "ALTA",
                        detalle: `Rechazo registrado de ${montoReferencia} para el CUIT ${cuit} con lote ${cashflowMaestro.numero_lote} y referencia ${referencia}`,
                    });

                    cashflow.saldo_actual_productora = cashflowMaestro.saldo_resultante;
                    await cashflow.save();

                    // Registrar en la auditoría del cashflow
                    await registrarAuditoria({
                      usuario_originario_id: authUser.id_usuario,
                      usuario_destino_id: null,
                      modelo: "Cashflow",
                      tipo_auditoria: "CAMBIO",
                      detalle: `Actualización del cashflow de la productora ${cashflow.productoraDeCC?.nombre_productora} ID: ${cashflow.productora_id}` ,
                    });

                    // Enviar correo de notificación
                    if (productora.email) {
                        await sendEmailWithErrorHandling(
                            {
                                to: productora.email,
                                subject: "Notificación de Rechazo de Pago",
                                html: `<p>Estimado/a ${productora.nombre_productora},</p>
                                       <p>Se ha registrado un rechazo de pago de ${montoReferencia} para su productora.</p>
                                       <p>Referencia: ${referencia || 'N/A'}</p>
                                       <p>Fecha: ${fechaRechazo.toLocaleDateString()}</p>
                                       <p>Saludos,</p>
                                       <p>El equipo de Finanzas</p>`,
                                successLog: `Correo de notificación enviado a ${productora.email} sobre el rechazo de pago de ${montoReferencia}.`,
                                errorLog: `Error al enviar el correo de notificación a ${productora.email} sobre el rechazo de pago de ${montoReferencia}.`,
                            }, req
                        );
                    }
                }
                
                if (registrosNoProcesados.length) {
                    return res.status(207).json({ message: 'Algunos rechazos no pudieron procesarse', registrosNoProcesados });
                }
                return res.status(200).json({ message: 'Rechazos procesados correctamente' });
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error procesando rechazos' });
    }
};

export const processTransfers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
        
        const filePath = req.file.path;
        const results: any[] = [];
        const registrosNoProcesados: any[] = [];

        const lastLote = Number(await CashflowMaestro.max('numero_lote')) || 0;
        const newLote = lastLote + 1;

        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: '\t' }))
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                for (const row of results) {
                    const isFonograma = 'ISRC' in row;
                    const fechaTraspaso = parse(row['FECHA'], 'dd/MM/yyyy', new Date());
                    const referencia = row['REFERENCIA']?.trim() || null;
                    
                    let monto = 0;
                    let cuit_origen = row['CUIT ORIGEN']?.trim() || '00000000000';
                    const cuit_destino = row['CUIT DESTINO']?.trim();

                    if (isFonograma) {
                        const cashflowPendiente = await CashflowPendiente.findOne({ where: { isrc: row['ISRC'] } });
                        if (!cashflowPendiente) {
                            registrosNoProcesados.push(row);
                            continue;
                        }
                        
                        monto = (parseFloat(cashflowPendiente.monto.toString()) * parseFloat(row['PORCENTAJE'])) / 100;
                        if (monto <= 0) {
                            registrosNoProcesados.push(row);
                            continue;
                        }
                        
                        cashflowPendiente.monto -= monto;
                        if (cashflowPendiente.monto <= 0) {
                            await cashflowPendiente.destroy();
                        } else {
                            await cashflowPendiente.save();
                        }
                    } else {
                        monto = parseFloat(row['MONTO'].replace(/,/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
                    }
                    
                    const productoraDestino = await Productora.findOne({ where: { cuit: cuit_destino } });
                    const productoraOrigen = await Productora.findOne({ where: { cuit: cuit_origen } });
                    if (!productoraDestino || !productoraOrigen) {
                        registrosNoProcesados.push(row);
                        continue;
                    }

                    const cashflowOrigen = await Cashflow.findOne({ where: { productora_id: productoraOrigen.id_productora } });
                    const cashflowDestino = await Cashflow.findOne({ where: { productora_id: productoraDestino.id_productora } });
                    if (!cashflowOrigen || !cashflowDestino || cashflowOrigen.saldo_actual_productora < monto) {
                        registrosNoProcesados.push(row);
                        continue;
                    }
                    
                    const cashflowMaestroOrigen = await CashflowMaestro.create({
                        cashflow_id: cashflowOrigen.id_cashflow,
                        tipo_transaccion: 'TRASPASO',
                        monto: -monto,
                        saldo_resultante: parseFloat(cashflowOrigen.saldo_actual_productora.toString()) - monto,
                        numero_lote: newLote,
                        referencia,
                        fecha_transaccion: fechaTraspaso,
                    });
                    
                    const cashflowTraspasoOrigen = await CashflowTraspaso.create({
                        cashflow_maestro_id: cashflowMaestroOrigen.id_transaccion,
                        tipo_traspaso: isFonograma ? 'FONOGRAMA' : 'GENERAL',
                        isrc: isFonograma ? row['ISRC'].trim() : null,
                        cuit_origen,
                        cuit_destino,
                        monto: -monto,
                        fecha_traspaso: fechaTraspaso,
                    });

                    await cashflowMaestroOrigen.update({ pago_id: cashflowTraspasoOrigen.id_traspaso });

                    // Registrar en la auditoría de la transacción
                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "CashflowMaestro",
                        tipo_auditoria: "ALTA",
                        detalle: `Transferencia registrada de -${monto} para el CUIT ${cuit_origen} con lote ${cashflowMaestroOrigen.numero_lote} y referencia ${referencia}`,
                    });

                    const cashflowMaestroDestino = await CashflowMaestro.create({
                        cashflow_id: cashflowOrigen.id_cashflow,
                        tipo_transaccion: 'TRASPASO',
                        monto,
                        saldo_resultante: parseFloat(cashflowDestino.saldo_actual_productora.toString()) + monto,
                        numero_lote: newLote,
                        referencia,
                        fecha_transaccion: fechaTraspaso,
                    });

                    const cashflowTraspasoDestino = await CashflowTraspaso.create({
                        cashflow_maestro_id: cashflowMaestroDestino.id_transaccion,
                        tipo_traspaso: isFonograma ? 'FONOGRAMA' : 'GENERAL',
                        isrc: isFonograma ? row['ISRC'].trim() : null,
                        cuit_origen,
                        cuit_destino,
                        monto,
                        fecha_traspaso: fechaTraspaso,
                    });

                    await cashflowMaestroDestino.update({ pago_id: cashflowTraspasoDestino.id_traspaso });

                    // Registrar en la auditoría de la transacción
                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "CashflowMaestro",
                        tipo_auditoria: "ALTA",
                        detalle: `Transferencia registrada de ${monto} para el CUIT ${cuit_destino} con lote ${cashflowMaestroOrigen.numero_lote} y referencia ${referencia}`,
                    });
                    
                    await cashflowOrigen.update({ saldo_actual_productora: cashflowMaestroOrigen.saldo_resultante });
                    await cashflowDestino.update({ saldo_actual_productora: cashflowMaestroDestino.saldo_resultante });
                    
                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "CashflowMaestro",
                        tipo_auditoria: "ALTA",
                        detalle: `Traspaso de ${monto} desde ${cuit_origen} hacia ${cuit_destino}`,
                    });
                }
                
                if (registrosNoProcesados.length) {
                    return res.status(207).json({ message: 'Algunos traspasos no pudieron procesarse', registrosNoProcesados });
                }
                return res.status(200).json({ message: 'Traspasos procesados correctamente' });
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error procesando traspasos' });
    }
};

export const listTransactions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { cuit, productora_id, tipo_transaccion, fecha_desde, fecha_hasta, referencia, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        // Obtener usuario autenticado
        const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);

        // Comprobar que el rol esté presente
        if (!authUser.rol) {
            throw new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED);
        }
        
        let whereCondition: any = {};
        
        if (cuit) {
            const productora = await Productora.findOne({ where: { cuit } });
            if (!productora) {
                return res.status(404).json({ message: 'No se encontró una productora con el CUIT proporcionado' });
            }
            const cashflow = await Cashflow.findOne({ where: { productora_id: productora.id_productora } });
            if (!cashflow) {
                return res.status(404).json({ message: 'No se encontró un cashflow asociado a la productora' });
            }
            whereCondition.cashflow_id = cashflow.id_cashflow;
        }

        if (productora_id) {
            const cashflow = await Cashflow.findOne({ where: { productora_id } });
            if (!cashflow) {
                return res.status(404).json({ message: 'No se encontró un cashflow asociado a la productora' });
            }
            whereCondition.cashflow_id = cashflow.id_cashflow;
        }

        if (tipo_transaccion) {
            whereCondition.tipo_transaccion = tipo_transaccion;
        }

        if (fecha_desde && fecha_hasta) {
            const fechaInicio = parse(fecha_desde as string, 'dd/MM/yyyy', new Date());
            const fechaFin = parse(fecha_hasta as string, 'dd/MM/yyyy', new Date());
            whereCondition.fecha_transaccion = { [Op.between]: [fechaInicio, fechaFin] };
        }
        
        if (referencia) {
            whereCondition.referencia = referencia;
        }
        
        const rolesProductores = ["productor_principal", "productor_secundario"];
        if (rolesProductores.includes(authUser.rol.nombre_rol)) {
            if (!req.productoraId) {
                return res.status(403).json({ message: 'No tiene permiso para acceder a estas operaciones.' });
            }

            // Validar que el usuario pertenece a la productora asociada
            const productoraAsociada = authMaestros.some(maestro => maestro.productora_id === req.productoraId);
            if (!productoraAsociada) {
                throw new Err.ForbiddenError("No tiene permiso para acceder a estas operaciones.");
            }

            const cashflow = await Cashflow.findOne({ where: { productora_id: req.productoraId } });
            if (!cashflow) {
                return res.status(404).json({ message: 'No se encontró un cashflow asociado a la productora' });
            }
            whereCondition.cashflow_id = cashflow.id_cashflow;
        }

        const { count, rows: transactions } = await CashflowMaestro.findAndCountAll({
            where: whereCondition,
            include: [
                { model: Cashflow, as: 'cashflow' },
                { model: CashflowLiquidacion, as: 'liquidacion' },
                { model: CashflowPago, as: 'pago' },
                { model: CashflowRechazo, as: 'rechazo' },
                { model: CashflowTraspaso, as: 'traspaso' }
            ],
            order: [['fecha_transaccion', 'DESC']],
            limit: parseInt(limit as string),
            offset: offset
        });
        
        return res.status(200).json({
            total: count,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            transactions
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error obteniendo las transacciones' });
    }
};

export const updateCashflow = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
        
        const filePath = req.file.path;
        const results: any[] = [];
        const registrosNoProcesados: any[] = [];

        const lastLote = Number(await CashflowMaestro.max('numero_lote')) || 0;
        const newLote = lastLote + 1;

        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: '\t' }))
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                for (const row of results) {
                    const cuit = row['CUIT']?.trim();
                    const monto = parseFloat(row['MONTO'].replace(/,/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
                    const fechaTransaccion = parse(row['FECHA'], 'dd/MM/yyyy', new Date());
                    const referencia = row['REFERENCIA']?.trim() || null;

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
                    
                    await CashflowMaestro.create({
                        cashflow_id: cashflow.id_cashflow,
                        tipo_transaccion: 'ACTUALIZACION',
                        monto,
                        saldo_resultante: monto,
                        numero_lote: newLote,
                        referencia,
                        fecha_transaccion: fechaTransaccion,
                    });

                    // Registrar en la auditoría de la transacción
                    await registrarAuditoria({
                        usuario_originario_id: authUser.id_usuario,
                        usuario_destino_id: null,
                        modelo: "CashflowMaestro",
                        tipo_auditoria: "ALTA",
                        detalle: `Actualización de saldo de ${monto} para el CUIT ${cuit} con referencia ${referencia}`,
                    });
                    
                    await cashflow.update({ saldo_actual_productora: monto });

                    // Registrar en la auditoría del cashflow
                    await registrarAuditoria({
                      usuario_originario_id: authUser.id_usuario,
                      usuario_destino_id: null,
                      modelo: "Cashflow",
                      tipo_auditoria: "CAMBIO",
                      detalle: `Actualización del cashflow de la productora ${cashflow.productoraDeCC?.nombre_productora} ID: ${cashflow.productora_id}` ,
                    });
                }
                
                if (registrosNoProcesados.length) {
                    return res.status(207).json({ message: 'Algunas actualizaciones no pudieron procesarse', registrosNoProcesados });
                }
                return res.status(200).json({ message: 'Cashflow actualizado correctamente' });
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error actualizando el cashflow' });
    }
};