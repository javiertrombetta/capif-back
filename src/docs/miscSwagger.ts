export const miscSwaggerDocs = {
    tags: [
        {
            name: "Misc",
            description: "Rutas misceláneas relacionadas con datos base del sistema.",
        },
    ],
    paths: {
        "/base/documents": {
            get: {
                summary: "Obtener tipos de documentos",
                description: "Devuelve una lista con todos los tipos de documentos disponibles en el sistema.",
                tags: ["Misc"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Tipos de documentos obtenidos con éxito.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Tipos de documentos obtenidos con éxito",
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_documento_tipo: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "ID del tipo de documento.",
                                                        example: "a123e4567-e89b-12d3-a456-426614174000",
                                                    },
                                                    nombre_documento: {
                                                        type: "string",
                                                        description: "Nombre del tipo de documento.",
                                                        example: "Contrato Social",
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
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/base/territories": {
            get: {
                summary: "Obtener territorios",
                description: "Devuelve una lista con todos los territorios disponibles en el sistema.",
                tags: ["Misc"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Territorios obtenidos con éxito.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Territorios obtenidos con éxito",
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_territorio: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "ID del territorio.",
                                                        example: "b456e7890-e89b-12d3-a456-426614174001",
                                                    },
                                                    nombre_pais: {
                                                        type: "string",
                                                        description: "Nombre del país.",
                                                        example: "Argentina",
                                                    },
                                                    codigo_iso: {
                                                        type: "string",
                                                        description: "Código ISO del país.",
                                                        example: "AR",
                                                    },
                                                    is_habilitado: {
                                                        type: "boolean",
                                                        description: "Indica si el territorio está habilitado en el sistema.",
                                                        example: true,
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
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/base/views": {
            get: {
                summary: "Obtener vistas según el rol del usuario",
                description: "Devuelve las vistas disponibles para el usuario autenticado, basado en su rol.",
                tags: ["Misc"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Vistas obtenidas con éxito.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Vistas obtenidas con éxito",
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_vista: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "ID de la vista.",
                                                        example: "c789e4567-e89b-12d3-a456-426614174002",
                                                    },
                                                    rol_id: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "ID del rol asociado a la vista.",
                                                        example: "d789e4567-e89b-12d3-a456-426614174003",
                                                    },
                                                    nombre_vista_superior: {
                                                        type: "string",
                                                        description: "Nombre de la vista principal.",
                                                        example: "Gestión de Usuarios",
                                                    },
                                                    nombre_vista: {
                                                        type: "string",
                                                        description: "Nombre de la vista específica.",
                                                        example: "Crear Usuario",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    403: { description: "Rol no autorizado." },
                    401: { description: "Usuario no autenticado." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/base/reset": {
            post: {
                summary: "Reiniciar base de datos",
                description: "Restablece la base de datos a su estado inicial. Solo puede ejecutarse en entornos `development` o `production.remote`.",
                tags: ["Misc"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Base de datos reiniciada correctamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Base de datos reiniciada correctamente.",
                                        },
                                        output: {
                                            type: "string",
                                            description: "Salida del proceso de reinicio.",
                                            example: "Database reset complete.",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    403: { description: "Acción no permitida en el entorno actual." },
                    401: { description: "Usuario no autenticado." },
                    500: { description: "Error al reiniciar la base de datos." },
                },
            },
        },
    },
};