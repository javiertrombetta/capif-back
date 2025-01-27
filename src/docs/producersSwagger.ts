export const producersSwaggerDocs = {
    tags: [
        {
            name: "Productoras",
            description: "Gestión de documentos y datos de las productoras.",
        },
    ],
    paths: {
        "/productoras/{id}/documentos/{docId}": {
            put: {
                summary: "Actualizar un documento específico por ID",
                description: "Actualiza los detalles de un documento asociado a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                    {
                        name: "docId",
                        in: "path",
                        required: true,
                        description: "ID del documento asociado.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateDocumento",
                            },
                        },
                    },
                },
                responses: {
                200: {
                    description: "Documento actualizado exitosamente.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        description: "Mensaje de éxito.",
                                        example: "Documento actualizado exitosamente.",
                                    },
                                    documento: {
                                        $ref: "#/components/schemas/UpdateDocumento",
                                    },
                                },
                            },
                        },
                    },
                },
                400: { description: "Datos inválidos en la solicitud." },
                401: { description: "Usuario no autenticado." },
                403: { description: "Usuario no autorizado." },
                404: { description: "Documento no encontrado." },
                500: { description: "Error interno del servidor." },
                },
            },
            get: {
                summary: "Obtener un documento específico por ID",
                description: "Devuelve un archivo asociado a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID de la productora.",
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                },
                {
                    name: "docId",
                    in: "path",
                    required: true,
                    description: "ID del documento asociado.",
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                },
                ],
                responses: {
                    200: { description: "Archivo enviado exitosamente." },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Documento no encontrado." },
                    500: { description: "Error interno del servidor." },
                },
            },
            delete: {
                summary: "Eliminar un documento específico por ID",
                description: "Elimina un documento asociado a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                    {
                        name: "docId",
                        in: "path",
                        required: true,
                        description: "ID del documento asociado.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "Documento eliminado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            description: "Mensaje de éxito.",
                                            example: "Documento eliminado exitosamente.",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Documento no encontrado." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/productoras/{id}/documentos/zip": {
            get: {
                summary: "Obtener todos los archivos de una productora",
                description: "Devuelve un archivo ZIP con todos los documentos asociados a la productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    200: { description: "Archivos comprimidos enviados exitosamente." },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Documentos no encontrados." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/productoras/{id}/documentos": {
            post: {
                summary: "Crear un documento para una productora",
                description: "Permite subir un archivo asociado a una productora.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    documento: {
                                        type: "string",
                                        format: "binary",
                                        description: "Archivo del documento a subir.",
                                    },
                                    tipoDocumento: {
                                        type: "string",
                                        enum: [
                                            "dni_persona_fisica",
                                            "dni_representante_legal",
                                            "comprobante_ISRC",
                                            "contrato_social",
                                        ],
                                        description: "Tipo de documento a subir.",
                                    },
                                    cuit: {
                                        type: "string",
                                        description: "CUIT asociado al documento.",
                                        example: "30123456789",
                                    },
                                },
                                required: ["documento", "tipoDocumento", "cuit"],
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Documento creado exitosamente." },
                    400: { description: "Datos inválidos o archivo faltante." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." },
                },
            },
            get: {
                summary: "Obtener metadatos de todos los documentos de una productora",
                description: "Devuelve los IDs y las rutas de los documentos asociados a la productora.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                200: {
                    description: "Metadatos de documentos obtenidos exitosamente.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Metadatos de documentos obtenidos exitosamente.",
                                    },
                                    documentos: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id_documento: {
                                                    type: "string",
                                                    description: "ID del documento.",
                                                    example: "123e4567-e89b-12d3-a456-426614174000",
                                                },
                                                ruta_archivo_documento: {
                                                    type: "string",
                                                    description: "Ruta del archivo del documento.",
                                                    example: "/uploads/documento.pdf",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Documentos no encontrados." },
                    500: { description: "Error interno del servidor." },
                },
            },
            delete: {
                summary: "Eliminar todos los documentos de una productora",
                description: "Elimina todos los documentos asociados a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                200: {
                    description: "Todos los documentos eliminados exitosamente.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        description: "Mensaje de éxito.",
                                        example: "Todos los documentos eliminados exitosamente.",
                                    },
                                },
                            },
                        },
                    },
                },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Documentos no encontrados." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/productoras/{id}/isrc": {
            post: {
                summary: "Crear un nuevo ISRC para una productora",
                description: "Crea un nuevo código ISRC asociado a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                    ],
                    requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateISRC",
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "ISRC creado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            description: "Mensaje de éxito.",
                                            example: "ISRC creado exitosamente.",
                                        },
                                        isrc: {
                                            $ref: "#/components/schemas/CreateISRC",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Datos inválidos en la solicitud." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    409: { description: "El ISRC ya existe." },
                    500: { description: "Error interno del servidor." },
                },
            },
            get: {
                summary: "Obtener ISRC de una productora",
                description: "Devuelve los códigos ISRC asociados a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    200: { description: "ISRC encontrado exitosamente." },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "ISRC no encontrado para la productora." },
                    500: { description: "Error interno del servidor." },
                },
            },
            put: {
                summary: "Actualizar un ISRC para una productora",
                description: "Actualiza los detalles de un ISRC asociado a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UpdateISRC",
                        },
                    },
                },
                },
                responses: {
                    200: {
                        description: "ISRC actualizado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            description: "Mensaje de éxito.",
                                            example: "ISRC actualizado exitosamente.",
                                        },
                                        isrc: {
                                            $ref: "#/components/schemas/UpdateISRC",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Datos inválidos en la solicitud." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "ISRC no encontrado para la productora." },
                    500: { description: "Error interno del servidor." },
                },
            },
            delete: {
                summary: "Eliminar todos los ISRCs de una productora",
                description: "Elimina todos los códigos ISRC asociados a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "ISRCs eliminados exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            description: "Mensaje de éxito.",
                                            example: "ISRCs eliminados exitosamente.",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "No se encontraron ISRCs para la productora." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/productoras/isrc": {
            get: {
                summary: "Obtener todos los ISRCs",
                description: "Devuelve una lista de todos los ISRCs registrados en el sistema.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "ISRCs encontrados exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/GetAllISRCs",
                                },
                            },
                        },
                    },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "No se encontraron ISRCs." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/productoras/{id}/postulaciones": {
            get: {
                summary: "Obtener postulaciones de una productora",
                description: "Devuelve las postulaciones asociadas a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID de la productora.",
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                },
                ],
                responses: {
                    200: {
                        description: "Postulaciones encontradas exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/GetPostulacionesById",
                                },
                            },
                        },
                    },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "No se encontraron postulaciones para la productora." },
                    500: { description: "Error interno del servidor." },
                },
            },
            put: {
                summary: "Actualizar una postulación para una productora",
                description: "Actualiza los detalles de una postulación asociada a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdatePostulacion",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Postulación actualizada exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            description: "Mensaje de éxito.",
                                            example: "Postulación actualizada exitosamente.",
                                        },
                                        postulacion: {
                                            $ref: "#/components/schemas/UpdatePostulacion",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Datos inválidos en la solicitud." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Postulación no encontrada para la productora." },
                    500: { description: "Error interno del servidor." },
                },
            },
            delete: {
                summary: "Eliminar todas las postulaciones de una productora",
                description: "Elimina todas las postulaciones asociadas a una productora por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "Postulaciones eliminadas exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            description: "Mensaje de éxito.",
                                            example: "Postulaciones eliminadas exitosamente.",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "No se encontraron postulaciones para la productora." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/productoras/postulaciones": {
            post: {
                summary: "Crear postulaciones masivamente",
                description: "Crea postulaciones para productoras filtrando por un rango de fechas.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "startDate",
                        in: "query",
                        required: true,
                        description: "Fecha de inicio para el filtro de creación de postulaciones.",
                        schema: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                    {
                        name: "endDate",
                        in: "query",
                        required: true,
                        description: "Fecha de fin para el filtro de creación de postulaciones.",
                        schema: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                ],
                responses: {
                    201: {
                        description: "Postulaciones creadas exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            description: "Mensaje de éxito.",
                                            example: "Postulaciones creadas exitosamente.",
                                        },
                                        total: {
                                            type: "integer",
                                            description: "Total de postulaciones creadas.",
                                            example: 25,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Parámetros inválidos o fechas ausentes." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." },
                },
            },
            get: {
                summary: "Obtener todas las postulaciones",
                description: "Devuelve una lista de todas las postulaciones con soporte para filtros opcionales.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                {
                    name: "startDate",
                    in: "query",
                    required: false,
                    description: "Fecha de inicio para filtrar postulaciones.",
                    schema: {
                        type: "string",
                        format: "date-time",
                    },
                },
                {
                    name: "endDate",
                    in: "query",
                    required: false,
                    description: "Fecha de fin para filtrar postulaciones.",
                    schema: {
                        type: "string",
                        format: "date-time",
                    },
                },
                {
                    name: "productoraName",
                    in: "query",
                    required: false,
                    description: "Nombre parcial o completo de la productora.",
                    schema: {
                        type: "string",
                    },
                },
                ],
                responses: {
                    200: {
                        description: "Postulaciones obtenidas exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/GetAllPostulaciones",
                                },
                            },
                        },
                    },
                    400: { description: "Parámetros inválidos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    500: { description: "Error interno del servidor." },
                },
            },
            delete: {
                summary: "Eliminar todas las postulaciones",
                description: "Elimina todas las postulaciones de todas las productoras.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Todas las postulaciones eliminadas exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/DeleteAllPostulaciones",
                                },
                            },
                        },
                    },
                    404: { description: "No se encontraron postulaciones para eliminar." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/productoras/{id}": {
            get: {
                summary: "Obtener una productora por ID",
                description: "Devuelve los detalles de una productora específica por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "Productora encontrada exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/GetProductoraById",
                                },
                            },
                        },
                    },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Productora no encontrada." },
                    500: { description: "Error interno del servidor." },
                },
            },
            put: {
                summary: "Actualizar una productora",
                description: "Actualiza los datos de una productora específica por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateProductora",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Productora actualizada exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            description: "Mensaje de éxito.",
                                            example: "Productora actualizada exitosamente.",
                                        },
                                        productora: {
                                            $ref: "#/components/schemas/UpdateProductora",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Datos inválidos en la solicitud." },
                    404: { description: "Productora no encontrada." },
                    500: { description: "Error interno del servidor." },
                },
            },
            delete: {
                summary: "Eliminar una productora por ID",
                description: "Elimina una productora específica por su ID.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID de la productora.",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "Productora eliminada exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/DeleteProductora",
                                },
                            },
                        },
                    },
                    404: { description: "Productora no encontrada." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/productoras": {
            post: {
                summary: "Crear una nueva productora",
                description: "Crea una nueva productora con los datos proporcionados.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateProductora",
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Productora creada exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            description: "Mensaje de éxito.",
                                            example: "Productora creada exitosamente.",
                                        },
                                        productora: {
                                            $ref: "#/components/schemas/CreateProductora",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Datos inválidos en la solicitud." },
                    409: { description: "La productora ya existe." },
                    500: { description: "Error interno del servidor." },
                },
            },
            get: {
                summary: "Obtener todas las productoras",
                description: "Devuelve una lista de todas las productoras con sus detalles e ISRCs asociados.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Lista de productoras obtenida exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/GetAllProductoras",
                                },
                            },
                        },
                    },
                    404: { description: "No se encontraron productoras." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
    },
};