export const miscSwaggerDocs = {
    tags: [
        {
            name: "Misc",
            description: "Rutas misceláneas relacionadas con datos base del sistema.",
        },
    ],
    paths: {
        "/misc/documents": {
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
        "/misc/logs": {
            get: {
                summary: "Obtener registros de logs del sistema.",
                tags: ["Misc"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "level",
                        schema: {
                            type: "string",
                            enum: ["info", "warn", "error"],
                        },
                        description: "Filtrar logs por nivel (info, warn, error).",
                    },
                    {
                        in: "query",
                        name: "date",
                        schema: {
                            type: "string",
                            format: "date",
                        },
                        description: "Fecha de los logs a obtener (formato YYYY-MM-DD). Si no se proporciona, se usa la fecha actual en la zona horaria de Argentina.",
                    },
                    {
                        in: "query",
                        name: "startTime",
                        schema: {
                            type: "string",
                            pattern: "^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$",
                        },
                        description: "Hora de inicio en formato HH:mm:ss para filtrar logs por rango de tiempo.",
                    },
                    {
                        in: "query",
                        name: "endTime",
                        schema: {
                            type: "string",
                            pattern: "^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$",
                        },
                        description: "Hora de fin en formato HH:mm:ss para filtrar logs por rango de tiempo.",
                    },
                    {
                        in: "query",
                        name: "search",
                        schema: {
                            type: "string",
                        },
                        description: "Filtrar logs que contengan un texto específico.",
                    },
                    {
                        in: "query",
                        name: "lines",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 1000,
                            default: 100,
                        },
                        description: "Número máximo de líneas a retornar (entre 1 y 1000).",
                    },
                    {
                        in: "query",
                        name: "order",
                        schema: {
                            type: "string",
                            enum: ["asc", "desc"],
                            default: "desc",
                        },
                        description: "Orden de los logs: 'asc' para orden cronológico, 'desc' para el más reciente primero.",
                    },
                ],
                responses: {
                    200: {
                        description: "Logs obtenidos exitosamente.",
                        content: {
                            "text/plain": {
                                schema: {
                                    type: "string",
                                    example: "[INFO] 2024-02-16 12:00:00 - Sistema iniciado\n[ERROR] 2024-02-16 12:05:00 - Fallo en la autenticación",
                                },
                            },
                        },
                    },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "No se encontraron logs para la fecha especificada." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/misc/territories/{territoryId}/status": {
            put: {
                summary: "Modificar el estado de habilitación de un territorio.",
                tags: ["Misc"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id_territorio",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del territorio a modificar.",
                    },
                ],
                requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                is_habilitado: {
                                    type: "boolean",
                                    description: "Nuevo estado de habilitación del territorio.",
                                },
                            },
                            required: ["is_habilitado"],
                        },
                    },
                },
                },
                responses: {
                    200: {
                        description: "Estado actualizado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Estado actualizado exitosamente.",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_territorio: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "123e4567-e89b-12d3-a456-426614174000",
                                                },
                                                nombre_pais: {
                                                    type: "string",
                                                    example: "Argentina",
                                                },
                                                codigo_iso: {
                                                    type: "string",
                                                    example: "AR",
                                                },
                                                is_habilitado: {
                                                    type: "boolean",
                                                    example: false,
                                                },
                                                createdAt: {
                                                    type: "string",
                                                    format: "date-time",
                                                    example: "2024-02-16T10:00:00.000Z",
                                                },
                                                updatedAt: {
                                                    type: "string",
                                                    format: "date-time",
                                                    example: "2024-02-16T12:00:00.000Z",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Territorio no encontrado." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/territories/{territoryId}": {
            delete: {
                summary: "Eliminar un territorio.",
                tags: ["Misc"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id_territorio",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del territorio a eliminar.",
                    },
                ],
                responses: {
                    200: { description: "Territorio eliminado exitosamente." },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "El territorio no existe." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/territories/reports": {
            get: {
                summary: "Generar reporte de territorialidad en CSV.",
                tags: ["Misc"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "fecha_desde",
                        schema: {
                            type: "string",
                            format: "date",
                            example: "2024-01-01",
                        },
                        description: "Filtrar reportes desde esta fecha (YYYY-MM-DD).",
                    },
                    {
                        in: "query",
                        name: "fecha_hasta",
                        schema: {
                            type: "string",
                            format: "date",
                            example: "2024-12-31",
                        },
                        description: "Filtrar reportes hasta esta fecha (YYYY-MM-DD).",
                    },
                    {
                        in: "query",
                        name: "titulo",
                        schema: {
                            type: "string",
                            example: "Ejemplo de Tema",
                        },
                        description: "Filtrar por título del fonograma (búsqueda parcial).",
                    },
                    {
                        in: "query",
                        name: "isrc",
                        schema: {
                            type: "string",
                            example: "ARABC2100001",
                        },
                        description: "Filtrar por ISRC del fonograma (búsqueda parcial).",
                    },
                    {
                        in: "query",
                        name: "productora",
                        schema: {
                            type: "string",
                            example: "Sello Discográfico XYZ",
                        },
                        description: "Filtrar por nombre de la productora (búsqueda parcial).",
                    },
                    {
                        in: "query",
                        name: "tipo_modificacion",
                        schema: {
                            type: "string",
                            enum: ["ALTA", "DATOS", "ARCHIVO", "TERRITORIO", "PARTICIPACION"],
                        },
                        description: "Filtrar por tipo de modificación.",
                    },
                ],
                responses: {
                    200: {
                        description: "Reporte generado exitosamente en formato CSV.",
                        content: {
                            "text/csv": {
                                schema: {
                                    type: "string",
                                    format: "binary",
                                },
                                example: `"Nombre del Tema","Artista","Duración","Fecha de Lanzamiento","ISRC","Sello Originario","Participación Desde","Participación Hasta","Porcentaje de Titularidad","Tipo de Modificación","Fecha de última modificación"
"Ejemplo de Canción","Artista 1","03:45","2024","ABC123456789","Sello Ejemplo","2024-01-01","2025-01-01",50,"ALTA DE FONOGRAMA","2024-02-16 10:00:00"
                                `,
                            },
                        },
                    },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "No hay datos para el reporte." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/misc/territories": {
            post: {
                summary: "Agregar un nuevo territorio.",
                tags: ["Misc"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    nombre_pais: {
                                        type: "string",
                                        example: "Argentina",
                                    },
                                    codigo_iso: {
                                        type: "string",
                                        example: "AR",
                                    },
                                    is_habilitado: {
                                        type: "boolean",
                                        example: true,
                                    },
                                },
                                required: ["nombre_pais", "codigo_iso", "is_habilitado"],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Territorio agregado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Territorio agregado exitosamente." },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_territorio: { type: "string", format: "uuid" },
                                                nombre_pais: { type: "string" },
                                                codigo_iso: { type: "string" },
                                                is_habilitado: { type: "boolean" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Datos inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    409: { description: "El código ISO ya está en uso." },
                    500: { description: "Error interno del servidor." },
                },
            },
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
        "/misc/reset": {
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
        "/misc/views": {
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
    },
};