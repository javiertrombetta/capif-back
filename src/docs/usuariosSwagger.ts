export const usuariosSwaggerDocs = {
    tags: [
        {
            name: "Usuarios",
            description: "Gestión de los usuarios."
        }
    ],
    paths: {
        "/users/me": {
            get: {
                summary: "Obtener información del usuario autenticado",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Información del usuario obtenida exitosamente" }
                }
            }
        },
        "/users/{usuarioId}/views": {
            get: {
                summary: "Obtener todas las vistas de un usuario.",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "usuarioId",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID del usuario a buscar."
                    }
                ],
                responses: {
                    200: { description: "Vistas obtenidas exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            },
            put: {
                summary: "Actualizar las vistas de un usuario.",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    in: "path",
                    name: "usuarioId",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    description: "UUID del usuario al que se le actualizarán las vistas."
                }
                ],
                requestBody: {
                required: true,
                content: {
                    "application/json": {
                    schema: {
                        $ref: "#/components/schemas/UpdateUserViews"
                    }
                    }
                }
                },
                responses: {
                    200: { description: "Vistas actualizadas exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/users": {
            get: {
                summary: "Obtener usuarios filtrados.",
                description: "Permite obtener una lista de usuarios aplicando filtros en los parámetros de consulta.",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    in: "query",
                    name: "usuarioId",
                    required: false,
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    description: "ID del usuario.",
                    example: "123e4567-e89b-12d3-a456-426614174000"
                },
                {
                    in: "query",
                    name: "email",
                    schema: {
                        type: "string"
                    },
                    description: "Correo electrónico del usuario."
                },
                {
                    in: "query",
                    name: "nombre",
                    schema: {
                        type: "string"
                    },
                    description: "Nombre del usuario."
                },
                {
                    in: "query",
                    name: "apellido",
                    schema: {
                        type: "string"
                    },
                    description: "Apellido del usuario."
                },
                {
                    in: "query",
                    name: "estado",
                    schema: {
                        type: "string",
                        enum: ["DEPURAR", "NUEVO", "CONFIRMADO", "PENDIENTE", "ENVIADO", "HABILITADO", "DESHABILITADO"]
                    },
                    description: "Tipo de registro del usuario."
                },
                {
                    in: "query",
                    name: "rolId",
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    description: "ID del rol asignado al usuario."
                },
                {
                    in: "query",
                    name: "rolNombre",
                    schema: {
                        type: "string"
                    },
                    description: "Nombre del rol asignado al usuario."
                },
                {
                    in: "query",
                    name: "productoraId",
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    description: "ID de la productora asociada."
                },
                {
                    in: "query",
                    name: "productoraNombre",
                    schema: {
                        type: "string"
                    },
                    description: "Nombre de la productora asociada."
                },
                {
                    in: "query",
                    name: "limit",
                    schema: {
                        type: "integer",
                        format: "int32",
                        minimum: 1
                    },
                    description: "Número máximo de resultados a devolver."
                },
                {
                    in: "query",
                    name: "offset",
                    schema: {
                        type: "integer",
                        format: "int32",
                        minimum: 0
                    },
                    description: "Desplazamiento para la paginación."
                }
                ],
                responses: {
                    200: { description: "Lista de usuarios obtenida exitosamente." },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para acceder a este recurso." },
                    404: { description: "No se encontraron usuarios con los filtros proporcionados." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/users/{usuarioId}/views/status": {
            put: {
                summary: "Cambiar el estado de habilitación de las vistas de un usuario.",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    in: "path",
                    name: "usuarioId",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    description: "UUID del usuario cuyas vistas se van a actualizar."
                }
                ],
                requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ToggleUserViewStatus"
                        }
                    }
                }
                },
                responses: {
                    200: { description: "Estado de vistas actualizado exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/users/{usuarioId}/status/login": {
            put: {
                summary: "Bloquear o desbloquear el login de un usuario.",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    in: "path",
                    name: "usuarioId",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    description: "ID del usuario que se desea bloquear o desbloquear"
                }
                ],
                requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/BlockOrUnblockUser"
                        }
                    }
                }
                },
                responses: {
                    200: { description: "Usuario bloqueado o desbloqueado exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para realizar esta acción." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/users/{usuarioId}/status": {
            put: {
                summary: "Habilitar o deshabilitar un usuario para su posterior depuración.",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    in: "path",
                    name: "usuarioId",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    description: "ID del usuario que se desea habilitar o deshabilitar"
                }
                ],
                responses: {
                    200: { description: "Usuario habilitado o deshabilitado exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para realizar esta acción." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/users/{usuarioId}/password": {
            put: {
                summary: "Cambiar contraseña de un usuario.",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    in: "path",
                    name: "usuarioId",
                    required: true,
                    schema: {
                    type: "string",
                    format: "uuid"
                    },
                    description: "UUID del usuario cuya contraseña será cambiada."
                }
                ],
                requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ChangePassword"
                        }
                    }
                }
                },
                responses: {
                    200: { description: "Contraseña cambiada exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/users/{usuarioId}": {
            put: {
                summary: "Actualizar información del usuario.",
                description: "Permite actualizar los datos personales, rol y estado de un usuario existente.",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    in: "path",
                    name: "usuarioId",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    description: "ID del usuario que será actualizado."
                }
                ],
                requestBody: {
                description: "Datos del usuario que se desea actualizar.",
                required: true,
                content: {
                    "application/json": {
                    schema: {
                        $ref: "#/components/schemas/UpdateUser"
                    }
                    }
                }
                },
                responses: {
                    200: { description: "Usuario actualizado exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para realizar esta acción." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            },
            delete: {
                summary: "Eliminar un usuario.",
                description: "Permite a los administradores eliminar un usuario específico del sistema.",
                tags: ["Usuarios"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    in: "path",
                    name: "usuarioId",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    description: "ID del usuario a eliminar.",
                    example: "123e4567-e89b-12d3-a456-426614174000"
                }
                ],
                responses: {
                    200: { description: "Usuario eliminado exitosamente." },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para realizar esta acción." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
    }
};