export const producersSwaggerDocs = {
    tags: [
        {
            name: "Productoras",
            description: "Gestión de documentos y datos de las productoras.",
        },
    ],
    paths: {
        "/producers/{id}/docs/{docId}": {
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
        "/producers/{id}/docs/zip": {
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
        "/producers/{id}/docs": {
            post: {
                summary: "Subir un documento para una productora",
                description: "Permite subir un documento asociado a una productora. Si ya existe un documento del mismo tipo, se sobrescribe con el nuevo archivo.",
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
                                        description: "Tipo de documento a subir. Solo se permite un archivo por tipo.",
                                    },
                                },
                                required: ["documento", "tipoDocumento"],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Documento creado o actualizado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Documentos creados exitosamente.",
                                        },
                                        documentos: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_documento: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "ID del documento.",
                                                        example: "123e4567-e89b-12d3-a456-426614174000",
                                                    },
                                                    tipo_documento: {
                                                        type: "string",
                                                        description: "Tipo de documento subido.",
                                                        example: "Contrato Social",
                                                    },
                                                    ruta_archivo_documento: {
                                                        type: "string",
                                                        format: "uri",
                                                        description: "URL o ruta donde se almacenó el documento.",
                                                        example: "https://example.com/documentos/documento.pdf",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        description: "Solicitud incorrecta. Puede deberse a un archivo faltante o un tipo de documento inválido.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Error: Debe subir al menos un archivo.",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado para realizar esta acción." },
                    500: { description: "Error interno del servidor." },
                },
            },
            get: {
                summary: "Obtener metadatos de todos los documentos de una productora",
                description: "Devuelve los metadatos de los documentos asociados a una productora, incluyendo el tipo de documento.",
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
                                                        format: "uuid",
                                                        description: "ID del documento.",
                                                        example: "123e4567-e89b-12d3-a456-426614174000",
                                                    },
                                                    ruta_archivo_documento: {
                                                        type: "string",
                                                        description: "Ruta del archivo del documento.",
                                                        example: "https://example.com/documentos/documento.pdf",
                                                    },
                                                    tipo_documento: {
                                                        type: "string",
                                                        description: "Tipo de documento.",
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
        "/producers/{id}/isrc": {
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
        "/producers/isrc": {
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
        "/producers/{id}/awards": {
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
        "/producers/awards": {
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
        "/producers/{id}": {
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
        "/producers": {
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
                description: "Devuelve una lista paginada de todas las productoras con sus detalles, documentos e ISRCs asociados. Permite filtrar por nombre, CUIT y estado.",
                tags: ["Productoras"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "nombre",
                        in: "query",
                        description: "Filtro opcional por nombre de la productora (búsqueda parcial).",
                        schema: {
                            type: "string",
                            example: "Records",
                        },
                    },
                    {
                        name: "cuit",
                        in: "query",
                        description: "Filtro opcional por CUIT de la productora (búsqueda exacta).",
                        schema: {
                            type: "string",
                            example: "20123456789",
                        },
                    },
                    {
                        name: "estado",
                        in: "query",
                        description: "Filtro opcional por estado de la productora ('Autorizada' o 'Pendiente').",
                        schema: {
                            type: "string",
                            enum: ["Autorizada", "Pendiente"],
                            example: "Autorizada",
                        },
                    },
                    {
                        name: "page",
                        in: "query",
                        description: "Número de página para la paginación (por defecto 1).",
                        schema: {
                            type: "integer",
                            example: 1,
                            minimum: 1,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        description: "Cantidad de registros por página (máximo 100).",
                        schema: {
                            type: "integer",
                            example: 10,
                            minimum: 1,
                            maximum: 50,
                        },
                    },
                ],
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
                    400: { description: "Parámetros de consulta inválidos." },
                    404: { description: "No se encontraron productoras." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
    },
};