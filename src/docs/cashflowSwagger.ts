export const cashflowSwaggerDocs = {
    tags: [
        {
            name: "Cashflow",
            description: "Gestión del cashflow.",
        },
    ],
    paths: {
        "/cashflow/payments": {
            post: {
                summary: "Procesar pagos",
                description: "Carga un archivo CSV con pagos a procesar, actualiza los registros de Cashflow y envía notificaciones por correo electrónico a las productoras.",
                tags: ["Cashflow"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    file: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo CSV con los pagos a procesar."
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Pagos procesados correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Pagos procesados correctamente."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    207: {
                        description: "Algunos pagos no pudieron procesarse.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Algunos pagos no pudieron procesarse"
                                        },
                                        registrosNoProcesados: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    CUIT: { type: "string", example: "20123456789" },
                                                    MONTO: { type: "number", example: 1500.75 },
                                                    REFERENCIA: { type: "string", example: "Pago pendiente" }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Archivo no proporcionado o con formato incorrecto." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor al procesar los pagos." }
                }
            }
        },
        "/cashflow/rejections": {
            post: {
                summary: "Procesar rechazos de pagos",
                description: "Carga un archivo CSV con rechazos de pagos, actualiza los registros de Cashflow y envía notificaciones por correo electrónico a las productoras afectadas.",
                tags: ["Cashflow"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    file: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo CSV con los rechazos de pagos a procesar."
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Rechazos procesados correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Rechazos procesados correctamente."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    207: {
                        description: "Algunos rechazos no pudieron procesarse.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Algunos rechazos no pudieron procesarse"
                                        },
                                        registrosNoProcesados: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    CUIT: { type: "string", example: "20123456789" },
                                                    MONTO: { type: "number", example: 1500.75 },
                                                    REFERENCIA: { type: "string", example: "Pago rechazado" }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Archivo no proporcionado o con formato incorrecto." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor al procesar los rechazos." }
                }
            }
        },
        "/cashflow/reproductions": {
            post: {
                summary: "Procesar pasadas de repertorio (reproducciones)",
                description: "Carga un archivo CSV con pasadas de repertorio y procesa la información para determinar titularidad y conflictos en la base de datos.",
                tags: ["Cashflow"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    file: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo CSV con las pasadas de repertorio.",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Procesamiento de pasadas de repertorio completado correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Procesamiento completado",
                                        },
                                        errores: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    row: {
                                                        type: "object",
                                                        description: "Datos de la fila con error.",
                                                    },
                                                    error: {
                                                        type: "string",
                                                        example: "ISRC no proporcionado",
                                                    },
                                                },
                                            },
                                        },
                                        downloadUrl: {
                                            type: "string",
                                            description: "Ruta para descargar el archivo procesado con las pasadas de repertorio.",
                                            example: "/downloads/output_reproductions.csv",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "No se ha subido ningún archivo o formato incorrecto." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor al procesar el archivo." },
                },
            },
        },
        "/cashflow/settlements/pending": {
            get: {
                summary: "Obtener liquidaciones pendientes",
                description: "Devuelve una lista de liquidaciones pendientes de procesar.",
                tags: ["Cashflow"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Lista de liquidaciones pendientes obtenida correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Pendientes de liquidación obtenidos correctamente",
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    isrc: {
                                                        type: "string",
                                                        description: "Código ISRC de la liquidación pendiente.",
                                                        example: "ARAAB2512345",
                                                    },
                                                    monto: {
                                                        type: "number",
                                                        description: "Monto pendiente de liquidación.",
                                                        example: 1500.75,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor al obtener liquidaciones pendientes." },
                },
            },
        },
        "/cashflow/settlements": {
            post: {
                summary: "Procesar liquidaciones",
                description: "Carga un archivo CSV con liquidaciones y actualiza el cashflow de las productoras correspondientes.",
                tags: ["Cashflow"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    file: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo CSV con las liquidaciones.",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Liquidaciones procesadas correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Liquidaciones procesadas correctamente",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    207: {
                        description: "Algunas liquidaciones no pudieron procesarse.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Algunos registros no pudieron procesarse",
                                        },
                                        registrosNoProcesados: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                description: "Registros que no pudieron ser procesados.",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "No se ha subido ningún archivo o formato incorrecto." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor al procesar el archivo." },
                },
            },
        },
        "/cashflow/transactions": {
            get: {
                summary: "Listar transacciones de cashflow",
                description: "Obtiene una lista paginada de las transacciones de cashflow filtradas por diferentes criterios.",
                tags: ["Cashflow"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "cuit",
                        schema: {
                            type: "string",
                            example: "30123456789"
                        },
                        description: "CUIT de la productora para filtrar las transacciones."
                    },
                    {
                        in: "query",
                        name: "productora_id",
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "ID de la productora para filtrar las transacciones."
                    },
                    {
                        in: "query",
                        name: "tipo_transaccion",
                        schema: {
                            type: "string",
                            enum: ["LIQUIDACION", "PAGO", "RECHAZO", "TRASPASO", "ACTUALIZACION"]
                        },
                        description: "Tipo de transacción a filtrar."
                    },
                    {
                        in: "query",
                        name: "fecha_desde",
                        schema: {
                            type: "string",
                            format: "date",
                            example: "01/01/2024"
                        },
                        description: "Fecha de inicio para el filtro de transacciones (formato DD/MM/YYYY)."
                    },
                    {
                        in: "query",
                        name: "fecha_hasta",
                        schema: {
                            type: "string",
                            format: "date",
                            example: "31/01/2024"
                        },
                        description: "Fecha de fin para el filtro de transacciones (formato DD/MM/YYYY)."
                    },
                    {
                        in: "query",
                        name: "referencia",
                        schema: {
                            type: "string"
                        },
                        description: "Referencia de la transacción para filtrar resultados."
                    },
                    {
                        in: "query",
                        name: "page",
                        schema: {
                            type: "integer",
                            example: 1
                        },
                        description: "Número de página para la paginación."
                    },
                    {
                        in: "query",
                        name: "limit",
                        schema: {
                            type: "integer",
                            example: 50
                        },
                        description: "Cantidad de registros por página."
                    }
                ],
                responses: {
                    200: {
                        description: "Lista de transacciones obtenida correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        total: {
                                            type: "integer",
                                            example: 100
                                        },
                                        page: {
                                            type: "integer",
                                            example: 1
                                        },
                                        limit: {
                                            type: "integer",
                                            example: 50
                                        },
                                        transactions: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_transaccion: { type: "string", format: "uuid" },
                                                    cashflow_id: { type: "string", format: "uuid" },
                                                    tipo_transaccion: { type: "string", enum: ["LIQUIDACION", "PAGO", "RECHAZO", "TRASPASO", "ACTUALIZACION"] },
                                                    monto: { type: "number", example: 5000.00 },
                                                    saldo_resultante: { type: "number", example: 10000.00 },
                                                    referencia: { type: "string", example: "Pago de regalías" },
                                                    fecha_transaccion: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos en la solicitud." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "No se encontraron transacciones con los criterios especificados." },
                    500: { description: "Error interno del servidor." }
                }
            },
            put: {
                summary: "Actualizar el cashflow de productoras",
                description: "Permite actualizar el saldo del cashflow de múltiples productoras a partir de un archivo CSV con los datos requeridos.",
                tags: ["Cashflow"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    file: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo CSV con las actualizaciones de cashflow. Debe contener las columnas CUIT, MONTO, FECHA y REFERENCIA (opcional)."
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Cashflow actualizado correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Cashflow actualizado correctamente."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    207: {
                        description: "Algunas actualizaciones no pudieron procesarse.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Algunas actualizaciones no pudieron procesarse"
                                        },
                                        registrosNoProcesados: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    CUIT: { type: "string", example: "30123456789" },
                                                    MONTO: { type: "number", example: 5000.00 },
                                                    FECHA: { type: "string", format: "date", example: "01/01/2024" },
                                                    REFERENCIA: { type: "string", example: "Actualización mensual" },
                                                    error: { type: "string", example: "Productora no encontrada" }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Archivo no proporcionado o formato inválido." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para realizar esta acción." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/cashflow/transfers": {
            post: {
                summary: "Procesar traspasos de fondos",
                description: "Carga un archivo CSV con los traspasos de fondos entre productoras, actualiza los registros de Cashflow y realiza auditorías.",
                tags: ["Cashflow"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    file: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo CSV con los traspasos de fondos a procesar."
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Traspasos procesados correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Traspasos procesados correctamente."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    207: {
                        description: "Algunos traspasos no pudieron procesarse.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Algunos traspasos no pudieron procesarse"
                                        },
                                        registrosNoProcesados: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    CUIT_ORIGEN: { type: "string", example: "20123456789" },
                                                    CUIT_DESTINO: { type: "string", example: "20876543210" },
                                                    MONTO: { type: "number", example: 5000.00 },
                                                    REFERENCIA: { type: "string", example: "Traspaso de fondos" }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Archivo no proporcionado o con formato incorrecto." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor al procesar los traspasos." }
                }
            }
        },
        "/cashflow": {
            get: {
                summary: "Obtener cashflows",
                description: "Recupera los registros de Cashflow según el rol del usuario.",
                tags: ["Cashflow"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "cuit",
                        schema: { type: "string", pattern: "^[0-9]{11}$" },
                        description: "CUIT de la productora (solo para administradores).",
                        example: "20123456789",
                    },
                    {
                        in: "query",
                        name: "productora_id",
                        schema: { type: "string", format: "uuid" },
                        description: "ID de la productora en formato UUID (solo para administradores).",
                        example: "550e8400-e29b-41d4-a716-446655440000",
                    },
                    {
                        in: "query",
                        name: "page",
                        schema: { type: "integer", minimum: 1, default: 1 },
                        description: "Número de página para la paginación.",
                        example: 1,
                    },
                    {
                        in: "query",
                        name: "limit",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
                        description: "Cantidad de registros por página (máximo 100).",
                        example: 50,
                    },
                ],
                responses: {
                    200: {
                        description: "Lista de cashflows obtenida exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        total: { type: "integer", example: 100 },
                                        page: { type: "integer", example: 1 },
                                        limit: { type: "integer", example: 50 },
                                        cashflows: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_cashflow: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
                                                    productora_id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" },
                                                    saldo_actual_productora: { type: "number", format: "decimal", example: 25000.50 },
                                                    createdAt: { type: "string", format: "date-time", example: "2024-01-15T14:30:00.000Z" },
                                                    updatedAt: { type: "string", format: "date-time", example: "2024-02-10T09:20:00.000Z" }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Parámetros inválidos en la consulta." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Acceso no permitido para el usuario." },
                    404: { description: "No se encontró la productora o el cashflow." },
                    500: { description: "Error interno del servidor al obtener cashflows." }
                }
            }
        }
    },
};