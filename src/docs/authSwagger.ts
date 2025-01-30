export const authSwaggerDocs = {
    tags: [
        {
            name: "Autenticación",
            description: "Gestión de la autenticación de los usuarios y registros nuevos."
        }
    ],
    paths: {
        "/auth/prods/secondary": {
            post: {
                summary: "Registro de usuario secundario",
                description: "Registra un nuevo usuario secundario en el sistema.",
                tags: ["Autenticación"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/RegisterSecondary"
                            }
                        }
                    }
                },
                responses: {
                    201: { description: "Usuario registrado exitosamente" },
                    400: { description: "Error en los datos proporcionados" }
                }
            }
        },
        "/auth/prods/primary/step-two": {
            post: {
                summary: "Enviar solicitud de aplicación.",
                description: "Permite a un usuario enviar una solicitud de aplicación con sus datos y documentos asociados.",
                tags: ["Autenticación"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    description: "Datos de la solicitud de aplicación.",
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    productoraData: {
                                        type: "string",
                                        description: "Datos relacionados con la productora en formato JSON.",
                                        example: "{\"tipo_persona\":\"FISICA\",\"nombre_productora\":\"Productora Ejemplo\",\"cuit_cuil\":\"30123456789\"}"
                                    },
                                    nombre: {
                                        type: "string",
                                        description: "Nombre del usuario que envía la solicitud.",
                                        example: "Juan"
                                    },
                                    apellido: {
                                        type: "string",
                                        description: "Apellido del usuario que envía la solicitud.",
                                        example: "Pérez"
                                    },
                                    telefono: {
                                        type: "string",
                                        description: "Teléfono del usuario que envía la solicitud.",
                                        example: "+54 11 1234-5678"
                                    },
                                    documentos: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "binary"
                                        },
                                        description: "Archivos asociados a la solicitud."
                                    },
                                    tipoDocumento: {
                                        type: "array",
                                        items: {
                                            type: "string"
                                        },
                                        description: "Tipos de documentos correspondientes a los archivos cargados. Cada tipoDocumento debe estar en el mismo orden que los archivos en 'documentos'.",
                                        example: ["dni_persona_fisica", "comprobante_domicilio"]
                                    }
                                },
                                required: ["productoraData", "nombre", "apellido", "telefono"]
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Solicitud enviada exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para realizar esta acción." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/auth/prods/primary/step-one": {
            post: {
                summary: "Registro de un usuario primario",
                description: "Registra un nuevo usuario primario en el sistema.",
                tags: ["Autenticación"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/RegisterPrimary"
                            }
                        }
                    }
                },
                responses: {
                201: { description: "Usuario registrado exitosamente" },
                400: { description: "Error en los datos proporcionados" }
                }
            }
        },
        "/auth/prods/primary/{usuarioId}/reject": {
            post: {
                summary: "Rechazar la solicitud de aplicación de un usuario.",
                description: "Rechaza la solicitud de un usuario especificando el motivo del rechazo.",
                tags: ["Autenticación"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    name: "usuarioId",
                    in: "path",
                    required: true,
                    description: "ID del usuario cuya solicitud de aplicación será rechazada",
                    schema: {
                        type: "string",
                        format: "uuid"
                    }
                }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/RejectApplication"
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Solicitud rechazada exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para realizar esta acción." },
                    404: { description: "Usuario no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/auth/prods/primary/{usuarioId}/authorize": {
            post: {
                summary: "Aprobar la solicitud de aplicación de un usuario.",
                description: "Autoriza la solicitud de un usuario, asigna una productora y actualiza los registros asociados.",
                tags: ["Autenticación"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    name: "usuarioId",
                    in: "path",
                    required: true,
                    description: "ID del usuario cuya aplicación será aprobada",
                    schema: {
                        type: "string",
                        format: "uuid"
                    }
                }
                ],
                responses: {
                    200: { description: "Aplicación aprobada exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para realizar esta acción." },
                    404: { description: "Usuario no encontrado." },
                    409: { description: "Productora ya existente para este usuario." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/auth/me/{productoraId}": {
            post: {
                summary: "Seleccionar productora activa",
                tags: ["Autenticación"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    name: "productoraId",
                    in: "path",
                    required: true,
                    description: "ID de la productora activa",
                    schema: {
                        type: "string",
                        format: "uuid"
                    }
                }
                ],
                responses: {
                    200: { description: "Productora activa seleccionada exitosamente" },
                    400: { description: "Error en los datos proporcionados" }
                }
            }
        },
        "/auth/logout": {
            post: {
                summary: "Cerrar sesión",
                tags: ["Autenticación"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Sesión cerrada exitosamente" }
                }
            }
        },
        "/auth/login": {
            post: {
                summary: "Iniciar sesión",
                description: "Permite a un usuario iniciar sesión y recibir un token.",
                tags: ["Autenticación"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Login"
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Inicio de sesión exitoso" },
                    401: { description: "Credenciales inválidas" }
                }
            }
        },
        "/auth/admins/secondary": {
            post: {
                summary: "Crear un nuevo usuario administrador.",
                tags: ["Autenticación"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    description: "Datos del administrador a crear.",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateAdminUser"
                            }
                        }
                    }
                },
                responses: {
                201: { description: "Usuario administrador creado exitosamente." },
                400: { description: "Datos inválidos." },
                401: { description: "Usuario no autenticado." },
                403: { description: "Usuario no autorizado." },
                500: { description: "Error interno del servidor." }
                }
            }
        },
        "/auth/pending": {
            get: {
                summary: "Obtener registros pendientes de uno o todos los usuarios.",
                description: "Devuelve la información del registro pendiente para un usuario especificado o todos los usuarios con registro pendiente.",
                tags: ["Autenticación"],
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
                    description: "ID del usuario. Si no se especifica, devuelve todos los usuarios pendientes.",
                    example: "123e4567-e89b-12d3-a456-426614174000"
                }
                ],
                responses: {
                    200: { description: "Registros pendientes obtenidos exitosamente." },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para acceder a este recurso." },
                    404: { description: "Registro pendiente no encontrado." },
                    500: { description: "Error interno del servidor." }
                }
            }
        },
        "/auth/validate/{token}": {
            put: {
                summary: "Validar correo electrónico",
                tags: ["Autenticación"],
                parameters: [
                {
                    in: "path",
                    name: "token",
                    required: true,
                    schema: {
                        type: "string",
                        description: "Token de validación de correo"
                    }
                }
                ],
                responses: {
                    200: { description: "Correo validado exitosamente" }
                }
            }
        },
        "/auth/password/reset": {
            put: {
                summary: "Restablecer contraseña",
                tags: ["Autenticación"],
                requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ResetPassword"
                        }
                    }
                }
                },
                responses: {
                200: {
                    description: "Contraseña restablecida exitosamente"
                },
                400: {
                    description: "Error en los datos proporcionados"
                }
                }
            }
        },
        "/auth/password/request-reset": {
            put: {
                summary: "Solicitar restablecimiento de contraseña",
                tags: ["Autenticación"],
                requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RequestPassword"
                        }
                    }
                }
                },
                responses: {
                    200: { description: "Solicitud de restablecimiento enviada exitosamente" },
                    400: { description: "Datos inválidos" }
                }
            }
        },
        "/auth/pending/{usuarioId}": {
            delete: {
                summary: "Eliminar una aplicación pendiente.",
                description: "Elimina una aplicación con tipo_registro distinto a HABILITADO o DESHABILITADO, solo si el usuario es productor_principal. También elimina todas las entidades relacionadas como Productora, ProductoraDocumentos, ProductoraMensaje, UsuarioVistaMaestro, AuditoriaCambio y AuditoriaSesion.",
                tags: ["Autenticación"],
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
                    description: "ID del usuario cuya aplicación se eliminará."
                }
                ],
                responses: {
                    200: { description: "Aplicación eliminada exitosamente." },
                    400: { description: "Parámetros inválidos o condiciones no cumplidas." },
                    401: { description: "Usuario no autenticado." },
                    404: { description: "Aplicación o datos relacionados no encontrados." },
                    500: { description: "Error interno del servidor." }
                }
            }
        }
    }
}