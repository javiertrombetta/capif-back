export const repertoiresSwaggerDocs = {
    tags: [
        {
            name: "Repertorios",
            description: "Gestión de los repertorios.",
        },
    ],
    paths: {
        "/repertoires/{id}/file": {
            post: {
                summary: "Agregar archivo de audio a un fonograma",
                description: "Sube un archivo de audio a un fonograma específico, asegurándose de que su nombre coincida con el ISRC del fonograma y actualizando la información en la base de datos.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma al que se agregará el archivo de audio."
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    audioFile: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo de audio a subir."
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Archivo de audio cargado o actualizado correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Archivo de audio cargado correctamente."
                                        },
                                        ruta_archivo: {
                                            type: "string",
                                            description: "Ruta donde se almacenó el archivo de audio.",
                                            example: "/uploads/audio/ARXX1234567.mp3"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o archivo no proporcionado." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            },
            get: {
                summary: "Obtener archivo de audio de un fonograma",
                description: "Recupera el archivo de audio asociado a un fonograma específico si existe en la base de datos y en el sistema de archivos.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma para obtener el archivo de audio."
                    }
                ],
                responses: {
                    200: {
                        description: "Archivo de audio encontrado y enviado correctamente.",
                        content: {
                            "application/octet-stream": {
                                schema: {
                                    type: "string",
                                    format: "binary"
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma no encontrado o no tiene archivo de audio asociado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/{id}/send/{sendId}": {
            put: {
                summary: "Actualizar estado del envío de un fonograma",
                description: "Permite cambiar el estado de un envío de fonograma, notificando al productor principal en caso de rechazo por Vericast.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma cuyo estado de envío se actualizará."
                    },
                    {
                        in: "path",
                        name: "sendId",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del envío de fonograma a actualizar."
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    nuevoEstado: {
                                        type: "string",
                                        enum: ["RECHAZADO POR VERICAST", "ERROR EN EL ENVIO"],
                                        description: "Nuevo estado del envío."
                                    },
                                    comentario: {
                                        type: "string",
                                        description: "Comentario opcional sobre el cambio de estado."
                                    }
                                },
                                required: ["nuevoEstado"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Estado del envío actualizado correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Estado del envío actualizado a 'PENDIENTE DE ENVIO'."
                                        },
                                        data: {
                                            type: "object",
                                            description: "Información del envío actualizado."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma o envío no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/{id}/send": {
            get: {
                summary: "Obtener envíos de un fonograma",
                description: "Recupera todos los envíos realizados para un fonograma específico, ordenados por la fecha del último envío.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma para obtener los envíos asociados."
                    }
                ],
                responses: {
                    200: {
                        description: "Lista de envíos obtenida exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        fonograma_id: {
                                            type: "string",
                                            format: "uuid",
                                            description: "UUID del fonograma.",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        envios: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_envio_vericast: {
                                                        type: "string",
                                                        description: "ID del envío en Vericast.",
                                                        example: "456e7890-a12b-34cd-56ef-7890abcdef12"
                                                    },
                                                    tipo_estado: {
                                                        type: "string",
                                                        description: "Estado actual del envío.",
                                                        example: "ENVIADO A VERICAST"
                                                    },
                                                    fecha_envio_inicial: {
                                                        type: "string",
                                                        format: "date-time",
                                                        description: "Fecha del primer envío.",
                                                        example: "2024-01-15T10:00:00Z"
                                                    },
                                                    fecha_envio_ultimo: {
                                                        type: "string",
                                                        format: "date-time",
                                                        description: "Fecha del último envío.",
                                                        example: "2024-02-20T15:30:00Z"
                                                    },
                                                    createdAt: {
                                                        type: "string",
                                                        format: "date-time",
                                                        description: "Fecha de creación del registro.",
                                                        example: "2024-01-10T08:45:00Z"
                                                    },
                                                    updatedAt: {
                                                        type: "string",
                                                        format: "date-time",
                                                        description: "Fecha de la última actualización.",
                                                        example: "2024-02-21T12:00:00Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma no encontrado o sin envíos asociados." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/{id}/shares/{shareId}": {
            put: {
                summary: "Actualizar participación en un fonograma",
                description: "Permite modificar los detalles de una participación en un fonograma, asegurando que el porcentaje total de participación no supere el 100%.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma al que pertenece la participación."
                    },
                    {
                        in: "path",
                        name: "shareId",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID de la participación que se actualizará."
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    porcentaje_participacion: {
                                        type: "number",
                                        description: "Nuevo porcentaje de participación.",
                                        example: 30.0
                                    },
                                    fecha_participacion_inicio: {
                                        type: "string",
                                        format: "date",
                                        description: "Nueva fecha de inicio de la participación.",
                                        example: "2024-01-01"
                                    },
                                    fecha_participacion_hasta: {
                                        type: "string",
                                        format: "date",
                                        description: "Nueva fecha de finalización de la participación.",
                                        example: "2024-12-31"
                                    }
                                },
                                required: ["porcentaje_participacion", "fecha_participacion_inicio", "fecha_participacion_hasta"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Participación actualizada exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Participación actualizada exitosamente."
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_participacion: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID de la participación actualizada.",
                                                    example: "987e6543-e21b-11d3-b456-426614174000"
                                                },
                                                porcentaje_participacion: {
                                                    type: "number",
                                                    example: 30.0
                                                },
                                                fecha_participacion_inicio: {
                                                    type: "string",
                                                    format: "date",
                                                    example: "2024-01-01"
                                                },
                                                fecha_participacion_hasta: {
                                                    type: "string",
                                                    format: "date",
                                                    example: "2024-12-31"
                                                }
                                            }
                                        },
                                        warning: {
                                            type: "string",
                                            description: "Advertencia si la participación total supera el 100%.",
                                            example: "Advertencia: El total de participación en el período 2024-01-01 - 2024-12-31 ahora es 110%, lo que supera el 100%."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o período de participación en conflicto." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma o participación no encontrada." },
                    500: { description: "Error interno del servidor." }
                }
            },
            delete: {
                summary: "Eliminar participación de un fonograma",
                description: "Permite eliminar una participación de un fonograma, asegurando la recalculación del porcentaje total de participación.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma al que pertenece la participación."
                    },
                    {
                        in: "path",
                        name: "shareId",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID de la participación que se eliminará."
                    }
                ],
                responses: {
                    200: {
                        description: "Participación eliminada exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Participación eliminada exitosamente."
                                        },
                                        warning: {
                                            type: "string",
                                            description: "Advertencia si la participación total en el período sigue superando el 100%.",
                                            example: "Advertencia: Luego de eliminar la participación, el total de participación en el período 2024-01-01 - 2024-12-31 sigue siendo 110%, lo que supera el 100%."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma o participación no encontrada." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/{id}/shares": {
            post: {
                summary: "Agregar participaciones a un fonograma",
                description: "Permite agregar participaciones de distintas productoras a un fonograma, asegurando que no se superpongan los períodos de participación.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma al que se agregarán participaciones."
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    participaciones: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                cuit: {
                                                    type: "string",
                                                    description: "CUIT de la productora que participa en el fonograma.",
                                                    example: "30123456789"
                                                },
                                                porcentaje_participacion: {
                                                    type: "number",
                                                    description: "Porcentaje de participación de la productora en el fonograma.",
                                                    example: 50.0
                                                },
                                                fecha_inicio: {
                                                    type: "string",
                                                    format: "date",
                                                    description: "Fecha de inicio de la participación.",
                                                    example: "2024-01-01"
                                                },
                                                fecha_hasta: {
                                                    type: "string",
                                                    format: "date",
                                                    description: "Fecha de finalización de la participación.",
                                                    example: "2024-12-31"
                                                }
                                            },
                                            required: ["cuit", "porcentaje_participacion", "fecha_inicio", "fecha_hasta"]
                                        }
                                    }
                                },
                                required: ["participaciones"]
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Participaciones agregadas exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Participaciones agregadas exitosamente."
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                fonogramaId: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                participaciones: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            cuit: {
                                                                type: "string",
                                                                example: "30123456789"
                                                            },
                                                            porcentaje_participacion: {
                                                                type: "number",
                                                                example: 50.0
                                                            },
                                                            fecha_inicio: {
                                                                type: "string",
                                                                format: "date",
                                                                example: "2024-01-01"
                                                            },
                                                            fecha_hasta: {
                                                                type: "string",
                                                                format: "date",
                                                                example: "2024-12-31"
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o períodos de participación superpuestos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma o productora no encontrados." },
                    500: { description: "Error interno del servidor." }
                }
            },
            get: {
                summary: "Listar participaciones de un fonograma",
                description: "Obtiene la lista de participaciones de un fonograma específico, permitiendo filtrar por un rango de fechas.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma para obtener las participaciones asociadas."
                    },
                    {
                        in: "query",
                        name: "fecha_inicio",
                        required: false,
                        schema: {
                            type: "string",
                            format: "date"
                        },
                        description: "Filtrar participaciones a partir de esta fecha.",
                        example: "2024-01-01"
                    },
                    {
                        in: "query",
                        name: "fecha_hasta",
                        required: false,
                        schema: {
                            type: "string",
                            format: "date"
                        },
                        description: "Filtrar participaciones hasta esta fecha.",
                        example: "2024-12-31"
                    }
                ],
                responses: {
                    200: {
                        description: "Lista de participaciones obtenida exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        fonograma_id: {
                                            type: "string",
                                            format: "uuid",
                                            description: "UUID del fonograma.",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        participaciones: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_productora: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "ID de la productora asociada.",
                                                        example: "987e6543-e21b-11d3-b456-426614174000"
                                                    },
                                                    nombre: {
                                                        type: "string",
                                                        description: "Nombre de la productora.",
                                                        example: "Productora Ejemplo S.A."
                                                    },
                                                    cuit_cuil: {
                                                        type: "string",
                                                        description: "CUIT o CUIL de la productora.",
                                                        example: "30123456789"
                                                    },
                                                    porcentaje_participacion: {
                                                        type: "number",
                                                        description: "Porcentaje de participación en el fonograma.",
                                                        example: 25.0
                                                    },
                                                    fecha_participacion_inicio: {
                                                        type: "string",
                                                        format: "date",
                                                        description: "Fecha de inicio de la participación.",
                                                        example: "2024-01-01"
                                                    },
                                                    fecha_participacion_hasta: {
                                                        type: "string",
                                                        format: "date",
                                                        description: "Fecha de finalización de la participación.",
                                                        example: "2024-12-31"
                                                    }
                                                }
                                            }
                                        },
                                        momentosClave: {
                                            type: "object",
                                            additionalProperties: {
                                                type: "number"
                                            },
                                            description: "Momentos clave en los que cambia la participación total.",
                                            example: {
                                                "2024-01-01": 50,
                                                "2024-06-01": 75,
                                                "2024-12-31": 100
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma no encontrado o sin participaciones en el período indicado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/shares/bulk": {
            post: {
                summary: "Carga masiva de participaciones",
                description: "Permite la carga masiva de participaciones en fonogramas a partir de un archivo CSV.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    sharesFile: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo CSV con las participaciones a cargar.",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Carga masiva completada con éxito.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Carga completada exitosamente.",
                                        },
                                        errores: {
                                            type: "array",
                                            items: { type: "string" },
                                            example: [
                                                "No se encontró ningún fonograma con el ISRC: US-DEF-23-11111",
                                                "La productora con CUIT '30711234567' ya tiene participación en el período.",
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        description: "Datos inválidos o archivo no proporcionado.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        error: { type: "string", example: "No se subió ningún archivo." },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/repertoires/{id}/territories/{territoryId}/state": {
            put: {
                summary: "Actualizar estado de un territorio en un fonograma",
                description: "Permite activar o desactivar un territorio vinculado a un fonograma.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma al que pertenece el territorio."
                    },
                    {
                        in: "path",
                        name: "territoryId",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del territorio que se actualizará."
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    is_activo: {
                                        type: "boolean",
                                        description: "Estado del territorio en el fonograma.",
                                        example: true
                                    }
                                },
                                required: ["is_activo"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Estado del territorio actualizado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Estado del territorio actualizado exitosamente."
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                fonograma_id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID del fonograma.",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                territorio_id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID del territorio actualizado.",
                                                    example: "321e6543-e21b-11d3-b456-426614174000"
                                                },
                                                is_activo: {
                                                    type: "boolean",
                                                    description: "Estado actualizado del territorio.",
                                                    example: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o estado del territorio no proporcionado." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma o territorio no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/{id}/territories/{territoryId}": {
            delete: {
                summary: "Eliminar territorio de un fonograma",
                description: "Permite eliminar la asociación de un territorio con un fonograma.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma al que pertenece el territorio."
                    },
                    {
                        in: "path",
                        name: "territoryId",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del territorio que se eliminará."
                    }
                ],
                responses: {
                    200: {
                        description: "Territorio eliminado exitosamente del fonograma.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Territorio eliminado exitosamente del fonograma."
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                fonograma_id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID del fonograma.",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                territorio_id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID del territorio eliminado.",
                                                    example: "321e6543-e21b-11d3-b456-426614174000"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma o territorio no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/{id}/territories": {
            post: {
                summary: "Agregar territorio a un fonograma",
                description: "Permite agregar un territorio específico a un fonograma, validando que no se repita.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma al que se agregará el territorio."
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    codigo_iso: {
                                        type: "string",
                                        description: "Código ISO del territorio a agregar.",
                                        example: "AR"
                                    },
                                    is_activo: {
                                        type: "boolean",
                                        description: "Indica si el territorio está activo para el fonograma.",
                                        example: true,
                                        default: true
                                    }
                                },
                                required: ["codigo_iso"]
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Territorio agregado exitosamente al fonograma.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Territorio agregado exitosamente al fonograma."
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                fonograma_id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID del fonograma.",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                territorio_id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID del territorio agregado.",
                                                    example: "321e6543-e21b-11d3-b456-426614174000"
                                                },
                                                is_activo: {
                                                    type: "boolean",
                                                    description: "Estado del territorio en el fonograma.",
                                                    example: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o territorio ya existe en el fonograma." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma o territorio no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            },
            get: {
                summary: "Listar territorios de un fonograma",
                description: "Obtiene la lista de territorios asociados a un fonograma específico.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma para obtener los territorios asociados."
                    }
                ],
                responses: {
                    200: {
                        description: "Lista de territorios obtenida exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        fonograma_id: {
                                            type: "string",
                                            format: "uuid",
                                            description: "UUID del fonograma.",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        territorios: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_territorio_maestro: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "UUID del vínculo del territorio con el fonograma.",
                                                        example: "abc12345-6789-01de-fg23-456789abcdef"
                                                    },
                                                    id_territorio: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "UUID del territorio.",
                                                        example: "321e6543-e21b-11d3-b456-426614174000"
                                                    },
                                                    nombre_pais: {
                                                        type: "string",
                                                        description: "Nombre del país del territorio.",
                                                        example: "Argentina"
                                                    },
                                                    codigo_iso: {
                                                        type: "string",
                                                        description: "Código ISO del territorio.",
                                                        example: "AR"
                                                    },
                                                    is_habilitado: {
                                                        type: "boolean",
                                                        description: "Indica si el territorio está habilitado en el sistema.",
                                                        example: true
                                                    },
                                                    is_activo: {
                                                        type: "boolean",
                                                        description: "Indica si el territorio está activo para el fonograma.",
                                                        example: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma no encontrado o sin territorios asignados." },
                    500: { description: "Error interno del servidor." }
                }
            },
        },
        "/repertoires/{id}": {
            get: {
                summary: "Obtener un fonograma por ID",
                description: "Recupera la información detallada de un fonograma, incluyendo participaciones, archivos y territorios asociados.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma a buscar."
                    }
                ],
                responses: {
                    200: {
                        description: "Fonograma encontrado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Fonograma encontrado"
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_fonograma: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID del fonograma.",
                                                    example: "987e6543-e21b-11d3-b456-426614174000"
                                                },
                                                titulo: {
                                                    type: "string",
                                                    description: "Título del fonograma.",
                                                    example: "Canción Ejemplo"
                                                },
                                                isrc: {
                                                    type: "string",
                                                    description: "Código ISRC del fonograma.",
                                                    example: "ARABC2412345"
                                                },
                                                artista: {
                                                    type: "string",
                                                    description: "Nombre del artista.",
                                                    example: "Artista Ejemplo"
                                                },
                                                album: {
                                                    type: "string",
                                                    description: "Nombre del álbum.",
                                                    example: "Álbum Ejemplo"
                                                },
                                                duracion: {
                                                    type: "string",
                                                    description: "Duración del fonograma en formato HH:MM:SS.",
                                                    example: "00:03:36"
                                                },
                                                anio_lanzamiento: {
                                                    type: "integer",
                                                    description: "Año de lanzamiento del fonograma.",
                                                    example: 2024
                                                },
                                                sello_discografico: {
                                                    type: "string",
                                                    description: "Sello discográfico del fonograma.",
                                                    example: "Sello Ejemplo"
                                                },
                                                is_dominio_publico: {
                                                    type: "boolean",
                                                    description: "Indica si el fonograma es de dominio público.",
                                                    example: false
                                                },
                                                estado_fonograma: {
                                                    type: "string",
                                                    description: "Estado actual del fonograma.",
                                                    example: "ACTIVO"
                                                },
                                                archivos: {
                                                    type: "array",
                                                    description: "Lista de archivos asociados al fonograma.",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id_fonograma_archivo: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "321e6543-e21b-11d3-b456-426614174000"
                                                            },
                                                            ruta_archivo_audio: {
                                                                type: "string",
                                                                description: "Ruta del archivo de audio.",
                                                                example: "/uploads/audio/ARABC2412345.mp3"
                                                            }
                                                        }
                                                    }
                                                },
                                                participaciones: {
                                                    type: "array",
                                                    description: "Lista de participaciones en el fonograma.",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id_fonograma_participacion: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "789e6543-e21b-11d3-b456-426614174000"
                                                            },
                                                            productora_id: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                                            },
                                                            porcentaje_participacion: {
                                                                type: "number",
                                                                example: 50.0
                                                            },
                                                            fecha_participacion_inicio: {
                                                                type: "string",
                                                                format: "date",
                                                                example: "2024-01-01"
                                                            },
                                                            fecha_participacion_hasta: {
                                                                type: "string",
                                                                format: "date",
                                                                example: "2024-12-31"
                                                            }
                                                        }
                                                    }
                                                },
                                                territorios: {
                                                    type: "array",
                                                    description: "Lista de territorios asociados al fonograma.",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id_territorio_maestro: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "456e6543-e21b-11d3-b456-426614174000"
                                                            },
                                                            territorio_id: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "321e6543-e21b-11d3-b456-426614174000"
                                                            },
                                                            is_activo: {
                                                                type: "boolean",
                                                                description: "Indica si el territorio está activo para el fonograma.",
                                                                example: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            },
            put: {
                summary: "Actualizar fonograma",
                description: "Permite actualizar la información de un fonograma existente.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma que se actualizará."
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    titulo: {
                                        type: "string",
                                        description: "Título del fonograma.",
                                        example: "Nueva Canción Ejemplo"
                                    },
                                    artista: {
                                        type: "string",
                                        description: "Nombre del artista.",
                                        example: "Nuevo Artista Ejemplo"
                                    },
                                    album: {
                                        type: "string",
                                        description: "Nombre del álbum.",
                                        example: "Nuevo Álbum Ejemplo"
                                    },
                                    duracion: {
                                        type: "string",
                                        description: "Duración del fonograma en formato HH:MM:SS.",
                                        example: "00:03:36"
                                    },
                                    anio_lanzamiento: {
                                        type: "integer",
                                        description: "Año de lanzamiento del fonograma.",
                                        example: 2025
                                    },
                                    sello_discografico: {
                                        type: "string",
                                        description: "Sello discográfico del fonograma.",
                                        example: "Nuevo Sello Ejemplo"
                                    },
                                    estado_fonograma: {
                                        type: "string",
                                        description: "Estado del fonograma.",
                                        example: "INACTIVO"
                                    }
                                },
                                required: ["titulo", "artista", "anio_lanzamiento", "estado_fonograma"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Fonograma actualizado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Fonograma actualizado exitosamente."
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_fonograma: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID del fonograma.",
                                                    example: "987e6543-e21b-11d3-b456-426614174000"
                                                },
                                                titulo: {
                                                    type: "string",
                                                    description: "Título actualizado del fonograma.",
                                                    example: "Nueva Canción Ejemplo"
                                                },
                                                artista: {
                                                    type: "string",
                                                    description: "Artista actualizado.",
                                                    example: "Nuevo Artista Ejemplo"
                                                },
                                                album: {
                                                    type: "string",
                                                    description: "Álbum actualizado.",
                                                    example: "Nuevo Álbum Ejemplo"
                                                },
                                                duracion: {
                                                    type: "string",
                                                    description: "Duración del fonograma en formato HH:MM:SS.",
                                                    example: "00:03:36"
                                                },
                                                anio_lanzamiento: {
                                                    type: "integer",
                                                    description: "Año de lanzamiento actualizado.",
                                                    example: 2025
                                                },
                                                sello_discografico: {
                                                    type: "string",
                                                    description: "Sello discográfico actualizado.",
                                                    example: "Nuevo Sello Ejemplo"
                                                },
                                                estado_fonograma: {
                                                    type: "string",
                                                    description: "Estado del fonograma actualizado.",
                                                    example: "INACTIVO"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            },
            delete: {
                summary: "Eliminar fonograma",
                description: "Elimina un fonograma junto con todas sus asociaciones.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del fonograma que se eliminará."
                    }
                ],
                responses: {
                    200: {
                        description: "Fonograma eliminado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "El fonograma con ID '987e6543-e21b-11d3-b456-426614174000' y sus asociaciones han sido eliminados exitosamente."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Fonograma no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/isrc/prefix": {
            get: {
                summary: "Obtener prefijo ISRC",
                description:
                "Devuelve los primeros 7 caracteres de un ISRC basado en la productora del usuario autenticado. El usuario debe tener el rol adecuado para acceder a esta información.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                responses: {
                200: {
                    description: "Prefijo ISRC obtenido exitosamente.",
                    content: {
                    "application/json": {
                        schema: {
                        type: "object",
                        properties: {
                            message: {
                            type: "string",
                            example: "Prefijo ISRC obtenido parar la productora ID: 987e6543-e21b-11d3-b456-426614174000",
                            },
                            data: {
                            type: "string",
                            description: "Los primeros 7 caracteres de un ISRC.",
                            example: "AR98725",
                            },
                        },
                        },
                    },
                    },
                },
                400: { description: "Datos inválidos o falta el ID de la productora en el token." },
                401: { description: "Usuario no autenticado." },
                403: { description: "Usuario no autorizado para obtener el prefijo ISRC." },
                500: { description: "Error interno del servidor." },
                },
            },
         },
        "/repertoires/isrc/validate": {
            post: {
                summary: "Validar ISRC",
                description: "Verifica si un ISRC es válido, asegurando que sigue el formato correcto y no está en uso.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    isrc: {
                                        type: "string",
                                        description: "Código ISRC a validar.",
                                        example: "ARABC2412345"
                                    }
                                },
                                required: ["isrc"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "ISRC validado correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        isrc: {
                                            type: "string",
                                            description: "Código ISRC validado.",
                                            example: "ARABC2412345"
                                        },
                                        available: {
                                            type: "boolean",
                                            description: "Indica si el ISRC está disponible para uso.",
                                            example: true
                                        },
                                        message: {
                                            type: "string",
                                            description: "Mensaje descriptivo del resultado de la validación.",
                                            example: "ISRC disponible para uso."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos, formato incorrecto o ISRC con prefijo incorrecto." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Productora del ISRC no encontrada." },
                    409: { description: "El ISRC ya está en uso." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/bulk": {
            post: {
                summary: "Carga masiva de repertorios",
                description: "Permite cargar múltiples repertorios mediante un archivo CSV, registrando fonogramas, participaciones y territorios.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    csvFile: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo CSV con los repertorios a cargar."
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Carga masiva completada.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Carga masiva completada."
                                        },
                                        registrosCreados: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    titulo: {
                                                        type: "string",
                                                        description: "Título del fonograma.",
                                                        example: "Ejemplo de Fonograma"
                                                    },
                                                    isrc: {
                                                        type: "string",
                                                        description: "Código ISRC generado.",
                                                        example: "ARABC2412345"
                                                    }
                                                }
                                            }
                                        },
                                        conflictos: {
                                            type: "array",
                                            items: {
                                                type: "string"
                                            },
                                            description: "Lista de conflictos detectados en la carga.",
                                            example: [
                                                "Conflicto en el fonograma con ISRC 'ARABC2412345': El porcentaje total supera el 100% entre 2024-01-01 y 2024-12-31 (110%)"
                                            ]
                                        },
                                        errores: {
                                            type: "array",
                                            items: {
                                                type: "string"
                                            },
                                            description: "Lista de errores detectados durante la carga.",
                                            example: [
                                                "Error en fila 2: El fonograma con ISRC 'ARABC2412345' ya existe en la base de datos."
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o archivo CSV no proporcionado." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/repertoires/send": {
            post: {
                summary: "Enviar fonogramas",
                description: "Envía fonogramas a un servidor FTP, procesándolos y actualizando sus estados en la base de datos.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    fonograma_ids: {
                                        type: "array",
                                        items: { type: "string", format: "uuid" },
                                        description: "Lista de IDs de fonogramas a enviar.",
                                        example: [
                                            "123e4567-e89b-12d3-a456-426614174000",
                                            "987e6543-e21b-11d3-b456-426614174000"
                                        ]
                                    }
                                },
                                required: ["fonograma_ids"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Fonogramas enviados correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Fonogramas enviados correctamente."
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o fonogramas no en estado pendiente de envío." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Uno o más fonogramas no encontrados." },
                    500: { description: "Error interno del servidor." }
                }
            },
            "get": {
                summary: "Obtener novedades de fonogramas",
                description: "Recupera las novedades de fonogramas filtradas por operación, fecha de operación, ID del fonograma y paginación.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "operacion",
                        schema: {
                            type: "array",
                            items: {
                                type: "string",
                                enum: ["ALTA", "DATOS", "ARCHIVO", "TERRITORIO", "PARTICIPACION", "BAJA"]
                            }
                        },
                        description: "Tipo de operación para filtrar las novedades. Se pueden incluir múltiples valores.",
                        example: ["ALTA", "DATOS"]
                    },
                    {
                        in: "query",
                        name: "fonogramaId",
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "ID del fonograma para filtrar las novedades específicas de un fonograma.",
                        example: "123e4567-e89b-12d3-a456-426614174000"
                    },
                    {
                        in: "query",
                        name: "fecha_desde",
                        schema: {
                            type: "string",
                            format: "date"
                        },
                        description: "Fecha desde la cual se buscarán novedades (formato ISO: YYYY-MM-DD).",
                        example: "2024-01-01"
                    },
                    {
                        in: "query",
                        name: "fecha_hasta",
                        schema: {
                            type: "string",
                            format: "date"
                        },
                        description: "Fecha hasta la cual se buscarán novedades (formato ISO: YYYY-MM-DD).",
                        example: "2024-12-31"
                    },
                    {
                        in: "query",
                        name: "page",
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "Número de página para la paginación. Debe ser un número entero mayor o igual a 1.",
                        example: 1
                    },
                    {
                        in: "query",
                        name: "limit",
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "Número máximo de resultados por página. Debe ser un número entero mayor o igual a 1.",
                        example: 10
                    }
                ],
                responses: {
                    200: {
                        description: "Novedades de fonogramas obtenidas exitosamente o sin resultados.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Novedades encontradas."
                                        },
                                        total: {
                                            type: "integer",
                                            description: "Número total de registros encontrados.",
                                            example: 25
                                        },
                                        page: {
                                            type: "integer",
                                            description: "Número de página actual.",
                                            example: 1
                                        },
                                        limit: {
                                            type: "integer",
                                            description: "Número de resultados por página.",
                                            example: 10
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_fonograma_maestro: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "ID del registro en la tabla FonogramaMaestro."
                                                    },
                                                    fonograma_id: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "ID del fonograma asociado."
                                                    },
                                                    operacion: {
                                                        type: "string",
                                                        enum: ["ALTA", "DATOS", "ARCHIVO", "TERRITORIO", "PARTICIPACION", "BAJA"],
                                                        description: "Tipo de operación registrada."
                                                    },
                                                    fecha_operacion: {
                                                        type: "string",
                                                        format: "date-time",
                                                        description: "Fecha en la que se realizó la operación."
                                                    },
                                                    fonogramaDelMaestroDeFonograma: {
                                                        type: "object",
                                                        properties: {
                                                            id_fonograma: {
                                                                type: "string",
                                                                format: "uuid",
                                                                description: "ID del fonograma."
                                                            },
                                                            titulo: {
                                                                type: "string",
                                                                description: "Título del fonograma."
                                                            },
                                                            isrc: {
                                                                type: "string",
                                                                description: "Código ISRC del fonograma."
                                                            },
                                                            artista: {
                                                                type: "string",
                                                                description: "Nombre del artista."
                                                            },
                                                            album: {
                                                                type: "string",
                                                                description: "Nombre del álbum."
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": { "description": "Datos inválidos o parámetros incorrectos en la consulta." },
                    "401": { "description": "Usuario no autenticado." },
                    "403": { "description": "Usuario no autorizado." },
                    "500": { "description": "Error interno del servidor." }
                }
            }
        },
        "/repertoires/": {
            post: {
                summary: "Crear un nuevo fonograma",
                description: "Permite registrar un nuevo fonograma con sus participaciones y territorios.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    productora_id: {
                                        type: "string",
                                        format: "uuid",
                                        description: "UUID de la productora propietaria del fonograma.",
                                        example: "123e4567-e89b-12d3-a456-426614174000"
                                    },
                                    titulo: {
                                        type: "string",
                                        description: "Título del fonograma.",
                                        example: "Canción Ejemplo"
                                    },
                                    artista: {
                                        type: "string",
                                        description: "Nombre del artista.",
                                        example: "Artista Ejemplo"
                                    },
                                    album: {
                                        type: "string",
                                        description: "Nombre del álbum.",
                                        example: "Álbum Ejemplo"
                                    },
                                    duracion: {
                                        type: "string",
                                        description: "Duración del fonograma en formato HH:MM:SS.",
                                        example: "00:03:36"
                                    },
                                    anio_lanzamiento: {
                                        type: "integer",
                                        description: "Año de lanzamiento del fonograma.",
                                        example: 2024
                                    },
                                    sello_discografico: {
                                        type: "string",
                                        description: "Sello discográfico del fonograma.",
                                        example: "Sello Ejemplo"
                                    },
                                    codigo_designacion: {
                                        type: "string",
                                        description: "Código de designación único del fonograma.",
                                        example: "12345"
                                    },
                                    participaciones: {
                                        type: "array",
                                        description: "Lista de participaciones en el fonograma.",
                                        items: {
                                            type: "object",
                                            properties: {
                                                cuit: {
                                                    type: "string",
                                                    description: "CUIT de la productora participante.",
                                                    example: "30123456789"
                                                },
                                                porcentaje_participacion: {
                                                    type: "number",
                                                    description: "Porcentaje de participación en el fonograma.",
                                                    example: 50.0
                                                },
                                                fecha_inicio: {
                                                    type: "string",
                                                    format: "date",
                                                    description: "Fecha de inicio de la participación.",
                                                    example: "2024-01-01"
                                                },
                                                fecha_hasta: {
                                                    type: "string",
                                                    format: "date",
                                                    description: "Fecha de finalización de la participación.",
                                                    example: "2024-12-31"
                                                }
                                            },
                                            required: ["cuit", "porcentaje_participacion", "fecha_inicio", "fecha_hasta"]
                                        }
                                    },
                                    territorios: {
                                        type: "array",
                                        description: "Lista de códigos ISO de los territorios en los que el fonograma tiene derechos.",
                                        items: {
                                            type: "string"
                                        },
                                        example: ["AR", "US", "BR"]
                                    }
                                },
                                required: [
                                    "productora_id",
                                    "titulo",
                                    "artista",
                                    "anio_lanzamiento",
                                    "codigo_designacion",
                                    "participaciones",
                                    "territorios"
                                ]
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Fonograma creado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Fonograma creado exitosamente."
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_fonograma: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID del fonograma creado.",
                                                    example: "987e6543-e21b-11d3-b456-426614174000"
                                                },
                                                isrc: {
                                                    type: "string",
                                                    description: "Código ISRC del fonograma generado.",
                                                    example: "ARABC2412345"
                                                },
                                                titulo: {
                                                    type: "string",
                                                    example: "Canción Ejemplo"
                                                },
                                                artista: {
                                                    type: "string",
                                                    example: "Artista Ejemplo"
                                                },
                                                album: {
                                                    type: "string",
                                                    example: "Álbum Ejemplo"
                                                },
                                                duracion: {
                                                    type: "string",
                                                    example: "00:03:36"
                                                },
                                                anio_lanzamiento: {
                                                    type: "integer",
                                                    example: 2024
                                                },
                                                sello_discografico: {
                                                    type: "string",
                                                    example: "Sello Ejemplo"
                                                },
                                                estado_fonograma: {
                                                    type: "string",
                                                    example: "ACTIVO"
                                                },                                                
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o información faltante." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Productora no encontrada o sin código ISRC asignado." },
                    409: { description: "El fonograma ya existe con el mismo ISRC." },
                    500: { description: "Error interno del servidor." }
                }
            },
            get: {
                summary: "Listar fonogramas",
                description: "Obtiene una lista de fonogramas, permitiendo la búsqueda por título, ISRC, artista, álbum, año de lanzamiento, sello discográfico y productora, con soporte para paginación.",
                tags: ["Repertorios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "titulo",
                        required: false,
                        schema: { type: "string" },
                        description: "Filtrar fonogramas por título.",
                        example: "Canción Ejemplo"
                    },
                    {
                        in: "query",
                        name: "isrc",
                        required: false,
                        schema: { type: "string" },
                        description: "Filtrar fonogramas por código ISRC.",
                        example: "ARABC2412345"
                    },
                    {
                        in: "query",
                        name: "artista",
                        required: false,
                        schema: { type: "string" },
                        description: "Filtrar fonogramas por nombre del artista.",
                        example: "Artista Ejemplo"
                    },
                    {
                        in: "query",
                        name: "album",
                        required: false,
                        schema: { type: "string" },
                        description: "Filtrar fonogramas por nombre del álbum.",
                        example: "Álbum Ejemplo"
                    },
                    {
                        in: "query",
                        name: "anio_lanzamiento",
                        required: false,
                        schema: { type: "integer" },
                        description: "Filtrar fonogramas por año de lanzamiento.",
                        example: 2024
                    },
                    {
                        in: "query",
                        name: "sello_discografico",
                        required: false,
                        schema: { type: "string" },
                        description: "Filtrar fonogramas por sello discográfico (coincidencias parciales permitidas).",
                        example: "Sello Ejemplo"
                    },
                    {
                        in: "query",
                        name: "nombre_productora",
                        required: false,
                        schema: { type: "string" },
                        description: "Filtrar fonogramas por nombre de la productora propietaria.",
                        example: "Productora Ejemplo"
                    },
                    {
                        in: "query",
                        name: "page",
                        required: false,
                        schema: { type: "integer", minimum: 1 },
                        description: "Número de página para la paginación. Debe ser un número entero mayor o igual a 1.",
                        example: 1
                    },
                    {
                        in: "query",
                        name: "limit",
                        required: false,
                        schema: { type: "integer", minimum: 1 },
                        description: "Número máximo de resultados por página. Debe ser un número entero mayor o igual a 1.",
                        example: 50
                    }
                ],
                responses: {
                    200: {
                        description: "Lista de fonogramas obtenida exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        total: {
                                            type: "integer",
                                            description: "Cantidad total de fonogramas encontrados.",
                                            example: 5
                                        },
                                        page: {
                                            type: "integer",
                                            description: "Número de página actual.",
                                            example: 1
                                        },
                                        limit: {
                                            type: "integer",
                                            description: "Número de resultados por página.",
                                            example: 50
                                        },
                                        data: {
                                            type: "array",
                                            description: "Lista de fonogramas encontrados.",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_fonograma: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "UUID del fonograma.",
                                                        example: "987e6543-e21b-11d3-b456-426614174000"
                                                    },
                                                    titulo: {
                                                        type: "string",
                                                        description: "Título del fonograma.",
                                                        example: "Canción Ejemplo"
                                                    },
                                                    isrc: {
                                                        type: "string",
                                                        description: "Código ISRC del fonograma.",
                                                        example: "ARABC2412345"
                                                    },
                                                    artista: {
                                                        type: "string",
                                                        description: "Nombre del artista.",
                                                        example: "Artista Ejemplo"
                                                    },
                                                    album: {
                                                        type: "string",
                                                        description: "Nombre del álbum.",
                                                        example: "Álbum Ejemplo"
                                                    },
                                                    anio_lanzamiento: {
                                                        type: "integer",
                                                        description: "Año de lanzamiento del fonograma.",
                                                        example: 2024
                                                    },
                                                    estado_fonograma: {
                                                        type: "string",
                                                        description: "Estado actual del fonograma.",
                                                        example: "ACTIVO"
                                                    },
                                                    sello_discografico: {
                                                        type: "string",
                                                        description: "Sello discográfico del fonograma.",
                                                        example: "Sello Ejemplo"
                                                    },
                                                    nombre_productora: {
                                                        type: "string",
                                                        description: "Nombre de la productora propietaria del fonograma.",
                                                        example: "Productora Ejemplo"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        }
    }
};