import { Cashflow, CashflowMaestro, CashflowLiquidacion, CashflowPago, CashflowRechazo, CashflowTraspaso, CashflowPendiente, Productora } from "../models";

const seedCashflowData = async () => {
  try {

    const paisesData = [
        { nombre_pais: "Paraguay", codigo_iso: "PY", is_activo: true },
        { nombre_pais: "Uruguay", codigo_iso: "UY", is_activo: true },
        { nombre_pais: "Brasil", codigo_iso: "BR", is_activo: true },
        { nombre_pais: "Guatemala", codigo_iso: "GT", is_activo: true },
        { nombre_pais: "Costa Rica", codigo_iso: "CR", is_activo: true },
        { nombre_pais: "El Salvador", codigo_iso: "SV", is_activo: true },
        { nombre_pais: "Panamá", codigo_iso: "PA", is_activo: true },
        { nombre_pais: "República Dominicana", codigo_iso: "DO", is_activo: true },
        { nombre_pais: "España", codigo_iso: "ES", is_activo: true },
        { nombre_pais: "India", codigo_iso: "IN", is_activo: true },
        { nombre_pais: "Italia", codigo_iso: "IT", is_activo: true },
        { nombre_pais: "Ucrania", codigo_iso: "UA", is_activo: true },
        { nombre_pais: "Colombia", codigo_iso: "CO", is_activo: false },
        { nombre_pais: "Chile", codigo_iso: "CL", is_activo: false },
        { nombre_pais: "Ecuador", codigo_iso: "EC", is_activo: false },
        { nombre_pais: "México", codigo_iso: "MX", is_activo: false },
        { nombre_pais: "Venezuela", codigo_iso: "VE", is_activo: false },
        { nombre_pais: "Estados Unidos", codigo_iso: "US", is_activo: false },
        { nombre_pais: "Gran Bretaña", codigo_iso: "GB", is_activo: false },
    ];

    const generateISRC = (): string => {
        const paisesActivos = paisesData.filter(pais => pais.is_activo);
        const pais = paisesActivos[Math.floor(Math.random() * paisesActivos.length)].codigo_iso;

        const letrasNumeros = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 caracteres alfanuméricos
        const anio = new Date().getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
        const numeroAleatorio = Math.floor(Math.random() * 100000).toString().padStart(5, '0'); // 5 dígitos

        return `${pais}${letrasNumeros}${anio}${numeroAleatorio}`;
    };

    // Buscar productoras existentes
    const productoras = await Productora.findAll();

    console.log(`Se encontraron ${productoras.length} productoras, creando registros de Cashflow...`);

    // Crear cashflows iniciales para productoras con saldo en 0
    for (const productora of productoras) {
        await Cashflow.findOrCreate({
            where: { productora_id: productora.id_productora },
            defaults: {
            productora_id: productora.id_productora,
            saldo_actual_productora: 0,
            },
        });
    }

    console.log(`Se insertaron registros de cashflow con saldo inicial 0 para ${productoras.length} productoras.`);

    // Buscar Cashflows existentes con Productoras asociadas
    const cashflows = await Cashflow.findAll({
        include: [{ model: Productora, as: "productoraDeCC" }],
    });

    // Filtrar los cashflows con CUIT válidos (que no sean 00000000000 ni 99999999999)
    const cashflowsValidos = cashflows.filter(
        cf => cf.productoraDeCC?.cuit_cuil && 
        cf.productoraDeCC.cuit_cuil !== '00000000000' && 
        cf.productoraDeCC.cuit_cuil !== '99999999999'
    );

    if (cashflowsValidos.length < 2) {
        throw new Error("Se necesitan al menos dos Cashflows con CUIT válidos para generar datos de cashflow.");
    }

    // Filtrar Cashflow de la productora con CUIT 00000000000
    const cashflowCuitCero = cashflows.find(cf => cf.productoraDeCC?.cuit_cuil === '00000000000');

    if (!cashflowCuitCero) {
        throw new Error("No se encontró un Cashflow asociado a la productora con CUIT '00000000000'");
    }

    console.log(`Generando transacciones para ${cashflows.length} cashflows...`);

    let numeroLote = 0;    

    for (const cashflow of cashflows) {

        // Asegurar que saldoActual es un número
        let saldoActual = Number(cashflow.saldo_actual_productora) || 0;      

        // LIQUIDACION por FONOGRAMA     
        let isrcLiquidacion = generateISRC();
        numeroLote++;
        const nacionalidadFonograma = isrcLiquidacion.startsWith("AR") ? "NACIONAL" : "INTERNACIONAL";
        const montoLiquidacionFonograma = Math.round(Math.random() * 10000 * 100) / 100;
        saldoActual = Number(saldoActual + montoLiquidacionFonograma);

        const liquidacionFonogramaMaestro = await CashflowMaestro.create({
            cashflow_id: cashflow.id_cashflow,
            tipo_transaccion: "LIQUIDACION",
            monto: montoLiquidacionFonograma,
            saldo_resultante: saldoActual,
            numero_lote: numeroLote,
            referencia: `SISTEMA-EXTERNO-LIQUIDACION-FONOGRAMA-${numeroLote}`,
            fecha_transaccion: new Date(),
        });

        const liquidacionFonograma = await CashflowLiquidacion.create({
            cashflow_maestro_id: liquidacionFonogramaMaestro.id_transaccion,
            concepto: "FONOGRAMA",
            nacionalidad_fonograma: nacionalidadFonograma,
            monto: montoLiquidacionFonograma,
            isRetencion: Math.random() > 0.5,
            cuit: "20123456789",
            isrc: isrcLiquidacion,
            pasadas: Math.floor(Math.random() * 100),
            nombre_fonograma: `Fonograma de prueba ${numeroLote}`,
            nombre_artista: `Artista Prueba ${numeroLote}`,
            sello_discografico: `Sello Prueba ${numeroLote}`,
            fecha_liquidacion: new Date(),
        });

        await liquidacionFonogramaMaestro.update({ liquidacion_id: liquidacionFonograma.id_liquidacion });
        await cashflow.update({ saldo_actual_productora: saldoActual });

        // console.log(`Liquidación por fonograma creada con transacción ID: ${liquidacionFonogramaMaestro.id_transaccion}`);

        // LIQUIDACIÓN GENERAL
        numeroLote++;
        const montoLiquidacionGeneral = Math.round(Math.random() * 10000 * 100) / 100;  
        saldoActual = Number(saldoActual + montoLiquidacionGeneral);
        const liquidacionGeneralMaestro = await CashflowMaestro.create({
            cashflow_id: cashflow.id_cashflow,
            tipo_transaccion: "LIQUIDACION",
            monto: montoLiquidacionGeneral,
            saldo_resultante: saldoActual,
            numero_lote: numeroLote,
            referencia: `SISTEMA-EXTERNO-LIQUIDACION-GENERAL-${numeroLote}`,
            fecha_transaccion: new Date(),
        });

        const liquidacionGeneral = await CashflowLiquidacion.create({
            cashflow_maestro_id: liquidacionGeneralMaestro.id_transaccion,
            concepto: "GENERAL",
            nacionalidad_fonograma: null,
            monto: montoLiquidacionGeneral,
            isRetencion: Math.random() > 0.5,
            cuit: "20123456789",
            isrc: null,
            pasadas: 0,
            nombre_fonograma: null,
            nombre_artista: null,
            sello_discografico: null,
            fecha_liquidacion: new Date(),
        });

        await liquidacionGeneralMaestro.update({ liquidacion_id: liquidacionGeneral.id_liquidacion });
        await cashflow.update({ saldo_actual_productora: saldoActual });

        // console.log(`Liquidación general creada con transacción ID: ${liquidacionGeneralMaestro.id_transaccion}`);

        // PAGO GENERAL
        numeroLote++;
        const montoPagoGeneral = Math.round(Math.random() * 10000 * 100) / 100;
        saldoActual = Number(saldoActual - montoPagoGeneral);
        const pagoGeneralMaestro = await CashflowMaestro.create({
            cashflow_id: cashflow.id_cashflow,
            tipo_transaccion: "PAGO",
            monto: -montoPagoGeneral,
            saldo_resultante: saldoActual,
            numero_lote: numeroLote,
            referencia: `SISTEMA-EXTERNO-PAGO-GENERAL-${numeroLote}`,
            fecha_transaccion: new Date(),
        });

        const pagoGeneral = await CashflowPago.create({
            cashflow_maestro_id: pagoGeneralMaestro.id_transaccion,
            concepto: "GENERAL",
            monto: montoPagoGeneral,
            isRetencion: Math.random() > 0.5,
            cuit: "20365478912",
            isrc: null,
            fecha_pago: new Date(),
        });

        await pagoGeneralMaestro.update({ pago_id: pagoGeneral.id_pago });
        await cashflow.update({ saldo_actual_productora: saldoActual });

        // console.log(`Pago general creado con transacción ID: ${pagoGeneralMaestro.id_transaccion}`);

        // PAGO POR FONOGRAMA
        let isrcFonograma = generateISRC();
        numeroLote++;
        const montoPagoFonograma = Math.round(Math.random() * 10000 * 100) / 100;
        saldoActual = Number(saldoActual - montoPagoFonograma);
        const pagoFonogramaMaestro = await CashflowMaestro.create({
            cashflow_id: cashflow.id_cashflow,
            tipo_transaccion: "PAGO",
            monto: -montoPagoFonograma,
            saldo_resultante: saldoActual,
            numero_lote: numeroLote,
            referencia: `SISTEMA-EXTERNO-PAGO-FONOGRAMA-${numeroLote}`,
            fecha_transaccion: new Date(),
        });

        const pagoFonograma = await CashflowPago.create({
            cashflow_maestro_id: pagoFonogramaMaestro.id_transaccion,
            concepto: "FONOGRAMA",
            monto: -montoPagoFonograma,
            isRetencion: Math.random() > 0.5,
            cuit: "20365478912",
            isrc: isrcFonograma,
            fecha_pago: new Date(),
        });

        await pagoFonogramaMaestro.update({ pago_id: pagoFonograma.id_pago });
        await cashflow.update({ saldo_actual_productora: saldoActual });

        // console.log(`Pago por fonograma creado con transacción ID: ${pagoFonogramaMaestro.id_transaccion}`);

        // RECHAZO
        numeroLote++;
        saldoActual = Number(saldoActual + montoPagoFonograma);
        const rechazoMaestro = await CashflowMaestro.create({
            cashflow_id: cashflow.id_cashflow,
            tipo_transaccion: "RECHAZO",
            monto: montoPagoFonograma,
            saldo_resultante: saldoActual,
            numero_lote: numeroLote,
            referencia: `SISTEMA-EXTERNO-PAGO_RECHAZADO-${numeroLote}`,
            fecha_transaccion: new Date(),
        });

        const rechazo = await CashflowRechazo.create({
            cashflow_maestro_id: rechazoMaestro.id_transaccion,
            monto: montoPagoFonograma,
            referencia: `SISTEMA-EXTERNO-RECHAZO-${numeroLote}`,
            fecha_rechazo: new Date(),
        });

        await rechazoMaestro.update({ rechazo_id: rechazo.id_rechazo });
        await cashflow.update({ saldo_actual_productora: saldoActual });

        // console.log(`Rechazo creado con transacción ID: ${rechazoMaestro.id_transaccion}`);

        // TRASPASO GENERAL
        if (cashflows.length > 1) {
            numeroLote++;
            const cashflowDestinoGeneral = cashflows.find((cf) => cf.id_cashflow !== cashflow.id_cashflow);
            let montoTraspasoGeneral = Number(Math.random() * 10000);

            if (cashflowDestinoGeneral) {
                if (cashflow.saldo_actual_productora < montoTraspasoGeneral) {
                    montoTraspasoGeneral = cashflow.saldo_actual_productora;
                }

                // Calcular nuevos saldos
                const saldoOrigenTraspasoGeneral = Number(Number(cashflow.saldo_actual_productora) - montoTraspasoGeneral);
                const saldoDestinoTraspasoGeneral = Number(Number(cashflowDestinoGeneral.saldo_actual_productora) + montoTraspasoGeneral);

                // Crear transacción en CashflowMaestro para el origen
                const traspasoGeneralMaestro = await CashflowMaestro.create({
                    cashflow_id: cashflow.id_cashflow,
                    tipo_transaccion: "TRASPASO",
                    monto: -montoTraspasoGeneral,
                    saldo_resultante: saldoOrigenTraspasoGeneral,
                    numero_lote: numeroLote,
                    referencia: `SISTEMA-EXTERNO-TRASPASO-GENERAL-${numeroLote}`,
                    fecha_transaccion: new Date(),
                });

                // Crear traspaso en CashflowTraspaso
                const traspasoGeneral = await CashflowTraspaso.create({
                    cashflow_maestro_id: traspasoGeneralMaestro.id_transaccion,
                    tipo_traspaso: "GENERAL",
                    cuit_origen: "20365478912",
                    cuit_destino: "30987654321",
                    monto: montoTraspasoGeneral,
                    fecha_traspaso: new Date(),
                });

                // Actualizar CashflowMaestro con el ID del traspaso
                await traspasoGeneralMaestro.update({ traspaso_id: traspasoGeneral.id_traspaso });

                // Actualizar saldos de las productoras
                await cashflow.update({ saldo_actual_productora: saldoOrigenTraspasoGeneral });
                await cashflowDestinoGeneral.update({ saldo_actual_productora: saldoDestinoTraspasoGeneral });

                // console.log(`Traspaso GENERAL creado de ${cashflow.id_cashflow} a ${cashflowDestinoGeneral.id_cashflow} con transacción ID: ${traspasoGeneralMaestro.id_transaccion}`);
            }
        }

        // Crear registros en CashflowPendiente
        let isrcPendiente = generateISRC();
        let montoPendiente = Number(Math.random() * 10000);
        const cashflowPendiente = await CashflowPendiente.create({
            isrc: isrcPendiente,
            monto: montoPendiente,
        });
        cashflowCuitCero.saldo_actual_productora += montoPendiente;
        await cashflowCuitCero.save();

        let isrcPendienteTraspaso = generateISRC();
        let montoPendienteTraspaso = Number(Math.random() * 10000);
        const cashflowPendienteTraspaso = await CashflowPendiente.create({
            isrc: isrcPendienteTraspaso,
            monto: montoPendienteTraspaso,
        });
        cashflowCuitCero.saldo_actual_productora += montoPendienteTraspaso;
        await cashflowCuitCero.save();

        // console.log(`Registro de CashflowPendiente creado con ID: ${cashflowPendiente.id_pendiente}`);

        // TRASPASO POR FONOGRAMA
        if (cashflows.length > 1) {
            numeroLote++;
            const cashflowDestinoFonograma = cashflows.find((cf) => cf.id_cashflow !== cashflow.id_cashflow);
            if (cashflowDestinoFonograma) {
                const pendiente = await CashflowPendiente.findOne({ where: { isrc: isrcPendienteTraspaso } });

                if (pendiente && pendiente.monto > 0) {
                    let porcentaje = Math.floor(Math.random() * 50) + 1; // Entre 1% y 50%
                    porcentaje = Number(porcentaje);
                    let montoTraspaso = Number((pendiente.monto * porcentaje) / 100);

                    // Verificar que el monto no sea mayor que el disponible en CashflowPendiente
                    if (montoTraspaso > pendiente.monto) {
                        montoTraspaso = pendiente.monto;
                    }

                    // Verificar que la productora de origen tenga saldo suficiente
                    if (montoTraspaso > cashflow.saldo_actual_productora) {
                        montoTraspaso = cashflow.saldo_actual_productora;
                    }

                    if (montoTraspaso > 0) {
                        const saldoOrigenTraspasoFonograma = Number(cashflow.saldo_actual_productora - montoTraspaso);
                        const saldoDestinoTraspasoFonograma = Number(cashflowDestinoFonograma.saldo_actual_productora + montoTraspaso);

                        const traspasoFonogramaMaestro = await CashflowMaestro.create({
                            cashflow_id: cashflow.id_cashflow,
                            tipo_transaccion: "TRASPASO",
                            monto: -montoTraspaso,
                            saldo_resultante: saldoOrigenTraspasoFonograma,
                            numero_lote: numeroLote,
                            referencia: `SISTEMA-EXTERNO-TRASPASO-FONOGRAMA-${numeroLote}`,
                            fecha_transaccion: new Date(),
                        });

                        const traspasoFonograma = await CashflowTraspaso.create({
                            cashflow_maestro_id: traspasoFonogramaMaestro.id_transaccion,
                            tipo_traspaso: "FONOGRAMA",
                            cuit_origen: "20365478912",
                            cuit_destino: "30987654321",
                            porcentaje_traspaso: porcentaje,
                            isrc: pendiente.isrc,
                            monto: montoTraspaso,
                            fecha_traspaso: new Date(),
                        });

                        await traspasoFonogramaMaestro.update({ traspaso_id: traspasoFonograma.id_traspaso });
                        await cashflow.update({ saldo_actual_productora: saldoOrigenTraspasoFonograma });
                        await cashflowDestinoFonograma.update({ saldo_actual_productora: saldoDestinoTraspasoFonograma });

                        // Actualizar el monto en CashflowPendiente
                        pendiente.monto = Number(pendiente.monto - montoTraspaso);
                        await pendiente.save();

                        // console.log(`Traspaso por FONOGRAMA creado de ${cashflow.id_cashflow} a ${cashflowDestinoFonograma.id_cashflow} con transacción ID: ${traspasoFonogramaMaestro.id_transaccion}`);
                    }
                }
            }
        }
    }   
    
    console.log("[SEED] cashflow.seed completado con éxito.");
  } catch (error) {
    console.error("Error durante el seeding de cashflow:", error);
  }
};

export default seedCashflowData;