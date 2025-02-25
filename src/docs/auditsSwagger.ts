export const auditsSwaggerDocs = {
    tags: [
        {
            name: "Auditorías",
            description: "Gestión de auditorías.",
        },
    ],
    paths: {        
        "/audits/repertoire": {
            get: {
                summary: "Listar cambios en repertorios",
                description: "Obtiene una lista de cambios registrados en repertorios, con filtros opcionales por fecha, ISRC, usuario, productora y tipo de cambio.",
                tags: ["Auditorías"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "fechaDesde",
                        schema: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$", 
                        },
                        description: "Fecha de inicio del rango en formato ISO (YYYY-MM-DD).",
                        example: "2024-01-01"
                    },
                    {
                        in: "query",
                        name: "fechaHasta",
                        schema: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                        },
                        description: "Fecha de fin del rango en formato ISO (YYYY-MM-DD).",
                        example: "2024-12-31"
                    },
                    {
                        in: "query",
                        name: "isrc",
                        schema: {
                            type: "string",
                            minLength: 12,
                            maxLength: 12
                        },
                        description: "Código ISRC del fonograma afectado.",
                        example: "ARABC2500001"
                    },
                    {
                        in: "query",
                        name: "emailUsuario",
                        schema: {
                            type: "string",
                            format: "email"
                        },
                        description: "Correo electrónico del usuario que realizó el cambio.",
                        example: "usuario@example.com"
                    },
                    {
                        in: "query",
                        name: "productora",
                        schema: {
                            type: "string"
                        },
                        description: "Nombre de la productora involucrada en el cambio.",
                        example: "SONY MUSIC ENTERTAINMENT ARGENTINA S.A."
                    },
                    {
                        in: "query",
                        name: "tipoCambio",
                        schema: {
                            type: "string",
                            enum: ["ALTA", "BAJA", "CAMBIO", "ERROR", "SISTEMA"]
                        },
                        description: "Tipo de cambio registrado en la auditoría.",
                        example: "CAMBIO"
                    },
                    {
                        in: "query",
                        name: "detalle",
                        schema: {
                            type: "string",
                            maxLength: 255
                        },
                        description: "Detalle del cambio realizado.",
                        example: "Se modificó el título del fonograma."
                    },
                    {
                        in: "query",
                        name: "page",
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "Número de página para paginación.",
                        example: 1
                    },
                    {
                        in: "query",
                        name: "limit",
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "Cantidad de registros por página.",
                        example: 50
                    }
                ],
                responses: {
                    200: {
                        description: "Lista de cambios en repertorios obtenida correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Cambios en repertorios obtenidos exitosamente."
                                        },
                                        total: {
                                            type: "integer",
                                            example: 50
                                        },
                                        page: {
                                            type: "integer",
                                            example: 1
                                        },
                                        limit: {
                                            type: "integer",
                                            example: 50
                                        },
                                        totalPages: {
                                            type: "integer",
                                            example: 5
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_auditoria: {
                                                        type: "string",
                                                        format: "uuid",
                                                        example: "550e8400-e29b-41d4-a716-446655440000"
                                                    },
                                                    fonograma: {
                                                        type: "object",
                                                        properties: {
                                                            id_fonograma: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                                            },
                                                            isrc: {
                                                                type: "string",
                                                                example: "ARABC2500001"
                                                            },
                                                            titulo: {
                                                                type: "string",
                                                                example: "Nombre del fonograma"
                                                            },
                                                            artista: {
                                                                type: "string",
                                                                example: "Artista del fonograma"
                                                            },
                                                            productora: {
                                                                type: "string",
                                                                example: "SONY MUSIC ENTERTAINMENT ARGENTINA S.A."
                                                            }
                                                        }
                                                    },
                                                    tipo_auditoria: {
                                                        type: "string",
                                                        example: "CAMBIO"
                                                    },
                                                    detalle: {
                                                        type: "string",
                                                        example: "Se modificó el título del fonograma."
                                                    },
                                                    usuario_originario: {
                                                        type: "object",
                                                        properties: {
                                                            id_usuario: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                                            },
                                                            email: {
                                                                type: "string",
                                                                format: "email",
                                                                example: "usuario@example.com"
                                                            },
                                                            nombre: {
                                                                type: "string",
                                                                example: "Juan"
                                                            },
                                                            apellido: {
                                                                type: "string",
                                                                example: "Pérez"
                                                            }
                                                        }
                                                    },
                                                    createdAt: {
                                                        type: "string",
                                                        format: "date-time",
                                                        example: "2024-02-01T15:30:00.000Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos en la consulta." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/audits/sessions": {
            get: {
                summary: "Listar sesiones iniciadas",
                description: "Obtiene una lista de sesiones iniciadas por los usuarios, con filtros opcionales por fecha, nombre, apellido y correo electrónico.",
                tags: ["Auditorías"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "fechaDesde",
                        schema: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$"
                        },
                        description: "Fecha de inicio del rango en formato ISO (YYYY-MM-DD).",
                        example: "2024-01-01"
                    },
                    {
                        in: "query",
                        name: "fechaHasta",
                        schema: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$"
                        },
                        description: "Fecha de fin del rango en formato ISO (YYYY-MM-DD).",
                        example: "2024-12-31"
                    },
                    {
                        in: "query",
                        name: "nombre",
                        schema: {
                            type: "string",
                            maxLength: 100
                        },
                        description: "Nombre del usuario que inició sesión.",
                        example: "Juan"
                    },
                    {
                        in: "query",
                        name: "apellido",
                        schema: {
                            type: "string",
                            maxLength: 100
                        },
                        description: "Apellido del usuario que inició sesión.",
                        example: "Pérez"
                    },
                    {
                        in: "query",
                        name: "email",
                        schema: {
                            type: "string",
                            format: "email"
                        },
                        description: "Correo electrónico del usuario que inició sesión.",
                        example: "usuario@example.com"
                    },
                    {
                        in: "query",
                        name: "page",
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "Número de página para paginación.",
                        example: 1
                    },
                    {
                        in: "query",
                        name: "limit",
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "Cantidad de registros por página.",
                        example: 10
                    }
                ],
                responses: {
                    200: {
                        description: "Lista de sesiones iniciadas obtenida correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Sesiones iniciadas obtenidas exitosamente."
                                        },
                                        total: {
                                            type: "integer",
                                            example: 50
                                        },
                                        page: {
                                            type: "integer",
                                            example: 1
                                        },
                                        limit: {
                                            type: "integer",
                                            example: 10
                                        },
                                        totalPages: {
                                            type: "integer",
                                            example: 5
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_sesion: {
                                                        type: "string",
                                                        format: "uuid",
                                                        example: "550e8400-e29b-41d4-a716-446655440000"
                                                    },
                                                    usuario: {
                                                        type: "object",
                                                        properties: {
                                                            id_usuario: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                                            },
                                                            email: {
                                                                type: "string",
                                                                format: "email",
                                                                example: "usuario@example.com"
                                                            },
                                                            nombre: {
                                                                type: "string",
                                                                example: "Juan"
                                                            },
                                                            apellido: {
                                                                type: "string",
                                                                example: "Pérez"
                                                            }
                                                        }
                                                    },
                                                    ip_origen: {
                                                        type: "string",
                                                        example: "192.168.1.1"
                                                    },
                                                    navegador: {
                                                        type: "string",
                                                        example: "Google Chrome"
                                                    },
                                                    fecha_inicio_sesion: {
                                                        type: "string",
                                                        format: "date-time",
                                                        example: "2024-02-01T15:30:00.000Z"
                                                    },
                                                    fecha_fin_sesion: {
                                                        type: "string",
                                                        format: "date-time",
                                                        example: "2024-02-01T16:00:00.000Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos en la consulta." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/audits": {
            get: {
                summary: "Listar cambios de auditoría",
                description: "Obtiene una lista de cambios registrados en la auditoría, con filtros opcionales por fecha, usuario, tabla afectada y tipo de cambio.",
                tags: ["Auditorías"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "fechaDesde",
                        schema: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$"
                        },
                        description: "Fecha de inicio del rango en formato ISO (YYYY-MM-DD).",
                        example: "2024-01-01"
                    },
                    {
                        in: "query",
                        name: "fechaHasta",
                        schema: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$"
                        },
                        description: "Fecha de fin del rango en formato ISO (YYYY-MM-DD).",
                        example: "2024-12-31"
                    },
                    {
                        in: "query",
                        name: "emailUsuario",
                        schema: {
                            type: "string",
                            format: "email"
                        },
                        description: "Correo electrónico del usuario que realizó el cambio.",
                        example: "usuario@example.com"
                    },
                    {
                        in: "query",
                        name: "tablaDb",
                        schema: {
                            type: "string",
                            enum: [
                                "AuditoriaCambio",
                                "AuditoriaRepertorio",
                                "AuditoriaSesion",
                                "Cashflow",
                                "CashflowLiquidacion",
                                "CashflowMaestro",
                                "CashflowPago",
                                "CashflowPendiente",
                                "CashflowRechazo",
                                "CashflowTraspaso",
                                "Conflicto",
                                "ConflictoParte",
                                "Fonograma",
                                "FonogramaArchivo",
                                "FonogramaEnvio",
                                "FonogramaMaestro",
                                "FonogramaParticipacion",
                                "FonogramaTerritorio",
                                "FonogramaTerritorioMaestro",
                                "Productora",
                                "ProductoraDocumento",
                                "ProductoraDocumentoTipo",
                                "ProductoraISRC",
                                "ProductoraMensaje",
                                "ProductoraPremio",
                                "Usuario",
                                "UsuarioMaestro",
                                "UsuarioRol",
                                "UsuarioVista",
                                "UsuarioVistaMaestro"
                            ]
                        },
                        description: "Nombre de la tabla afectada en la auditoría.",
                        example: "Usuario"
                    },
                    {
                        in: "query",
                        name: "tipoAuditoria",
                        schema: {
                            type: "string",
                            enum: ["ALTA", "BAJA", "CAMBIO", "ERROR", "SISTEMA", "AUTH"]
                        },
                        description: "Tipo de cambio registrado en la auditoría.",
                        example: "CAMBIO"
                    },
                    {
                        in: "query",
                        name: "page",
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "Número de página para paginación.",
                        example: 1
                    },
                    {
                        in: "query",
                        name: "limit",
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "Cantidad de registros por página.",
                        example: 10
                    }
                ],
                responses: {
                    200: {
                        description: "Lista de cambios de auditoría obtenida correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Cambios de auditoría obtenidos exitosamente."
                                        },
                                        total: {
                                            type: "integer",
                                            example: 50
                                        },
                                        page: {
                                            type: "integer",
                                            example: 1
                                        },
                                        limit: {
                                            type: "integer",
                                            example: 10
                                        },
                                        totalPages: {
                                            type: "integer",
                                            example: 5
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_auditoria: {
                                                        type: "string",
                                                        format: "uuid",
                                                        example: "550e8400-e29b-41d4-a716-446655440000"
                                                    },
                                                    modelo: {
                                                        type: "string",
                                                        example: "Usuario"
                                                    },
                                                    tipo_auditoria: {
                                                        type: "string",
                                                        example: "CAMBIO"
                                                    },
                                                    detalle: {
                                                        type: "string",
                                                        example: "Se modificó el correo electrónico."
                                                    },
                                                    usuario_originario: {
                                                        type: "object",
                                                        properties: {
                                                            id_usuario: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                                            },
                                                            email: {
                                                                type: "string",
                                                                format: "email",
                                                                example: "usuario@example.com"
                                                            },
                                                            nombre: {
                                                                type: "string",
                                                                example: "Juan"
                                                            },
                                                            apellido: {
                                                                type: "string",
                                                                example: "Pérez"
                                                            }
                                                        }
                                                    },
                                                    createdAt: {
                                                        type: "string",
                                                        format: "date-time",
                                                        example: "2024-02-01T15:30:00.000Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos en la consulta." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
    }
};