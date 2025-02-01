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
            get: {
                summary: "Obtener novedades de fonogramas",
                description: "Recupera las novedades de fonogramas filtradas por operación e indicador de procesamiento.",
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
                        name: "isProcesado",
                        schema: {
                            type: "boolean"
                        },
                        description: "Indica si se deben recuperar solo los fonogramas procesados o no procesados.",
                        example: false
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
                                                    isProcesado: {
                                                        type: "boolean",
                                                        description: "Indica si la operación ya ha sido procesada."
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
                    400: { description: "Datos inválidos o parámetros incorrectos en la consulta." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        }
    }
};