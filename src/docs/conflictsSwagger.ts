export const conflictsSwaggerDocs = {
  tags: [
    {
      name: "Conflictos",
      description: "Gestión de conflictos entre fonogramas y productoras.",
    },
  ],
    paths: {
        "/conflicts/{id}/desist": {
            post: {
                summary: "Desistir de un conflicto",
                description: "Permite a un productor principal o secundario desistir de un conflicto, cambiando su estado a 'CERRADO' y marcando todas sus partes como 'DESISTIDO'.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del conflicto al que se quiere desistir.",
                    },
                ],
                responses: {
                    200: {
                        description: "Conflicto cancelado exitosamente y marcado como 'CERRADO'.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Conflicto cancelado exitosamente.",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_conflicto: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "550e8400-e29b-41d4-a716-446655440000",
                                                },
                                                estado_conflicto: {
                                                    type: "string",
                                                    example: "CERRADO",
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
                    404: { description: "Conflicto no encontrado." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/conflicts/{id}/docs": {
            post: {
                summary: "Enviar documentos para un conflicto",
                description: "Permite a un productor principal o secundario enviar documentos adjuntos para un conflicto específico. Los documentos serán adjuntados y el estado del conflicto se actualizará a 'RESPONDIDO'.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del conflicto al que se enviarán los documentos.",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    nombre_participante: {
                                        type: "string",
                                        description: "Nombre del participante que envía los documentos.",
                                        example: "Juan Pérez",
                                    },
                                    documentos: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "binary",
                                        },
                                        description: "Archivos adjuntos enviados como documentación del conflicto.",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                200: {
                    description: "Documentos enviados exitosamente y estado actualizado.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Documentos enviados exitosamente.",
                                    },
                                    data: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                        },
                                        description: "Lista de nombres de archivos adjuntados.",
                                        example: ["contrato.pdf", "evidencia.jpg"],
                                    },
                                },
                            },
                        },
                    },
                },
                400: { description: "Datos inválidos o documentos no proporcionados." },
                401: { description: "Usuario no autenticado." },
                403: { description: "Usuario no autorizado." },
                404: { description: "Conflicto no encontrado." },
                500: { description: "Error interno del servidor." },
                },
            },
        },
        "/conflicts/{id}/extension": {
            post: {
                summary: "Otorgar prórroga a un conflicto",
                description: "Permite a un administrador principal o secundario otorgar una prórroga a un conflicto. Solo se puede otorgar una prórroga en PRIMERA INSTANCIA y una segunda en SEGUNDA INSTANCIA.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del conflicto al que se quiere otorgar la prórroga.",
                    },
                ],
                responses: {
                    200: {
                        description: "Prórroga otorgada exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Prórroga otorgada exitosamente.",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_conflicto: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "550e8400-e29b-41d4-a716-446655440000",
                                                },
                                                estado_conflicto: {
                                                    type: "string",
                                                    example: "PRIMERA PRORROGA",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "No se puede otorgar una prórroga en el estado actual del conflicto." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Conflicto no encontrado." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/conflicts/{id}/status": {
            put: {
                summary: "Actualizar el estado de un conflicto",
                description: "Permite a un administrador principal o secundario actualizar el estado de un conflicto. Si el estado cambia a 'SEGUNDA INSTANCIA', todas las partes del conflicto se marcarán como 'PENDIENTE'.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del conflicto cuyo estado será actualizado.",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                estado_conflicto: {
                                    type: "string",
                                    enum: ["PENDIENTE CAPIF", "PRIMERA INSTANCIA", "PRIMERA PRORROGA", "SEGUNDA INSTANCIA", "SEGUNDA PRORROGA", "VENCIDO", "CERRADO"],
                                    description: "Nuevo estado del conflicto.",
                                    example: "SEGUNDA INSTANCIA",
                                },
                                },
                                required: ["estado_conflicto"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Estado del conflicto actualizado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Estado del conflicto actualizado a SEGUNDA INSTANCIA.",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_conflicto: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "550e8400-e29b-41d4-a716-446655440000",
                                                },
                                                estado_conflicto: {
                                                    type: "string",
                                                    example: "SEGUNDA INSTANCIA",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Estado del conflicto no válido." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Conflicto no encontrado." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/conflicts/{id}/validate-porcentage": {
            post: {
                summary: "Confirmar porcentaje de participación en un conflicto",
                description: "Permite a un productor principal o secundario confirmar el porcentaje de participación en un conflicto. Si todas las participaciones son confirmadas, el conflicto se cierra o pasa a segunda instancia si el total de participación supera el 100%.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del conflicto en el que se confirmará el porcentaje de participación.",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    participacion_id: {
                                        type: "string",
                                        format: "uuid",
                                        description: "UUID de la participación en conflicto que se está confirmando.",
                                        example: "550e8400-e29b-41d4-a716-446655440000",
                                    },
                                    porcentaje_confirmado: {
                                        type: "number",
                                        minimum: 0,
                                        maximum: 100,
                                        description: "Porcentaje de participación confirmado por el usuario.",
                                        example: 25.5,
                                    },
                                },
                                required: ["participacion_id", "porcentaje_confirmado"],
                            },
                        },
                    },
                },
                responses: {
                200: {
                    description: "Porcentaje confirmado exitosamente. Si todas las participaciones han sido confirmadas, el estado del conflicto se actualiza.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Porcentaje confirmado. El conflicto ha cambiado a estado CERRADO.",
                                    },
                                    data: {
                                        type: "object",
                                        properties: {
                                            id_conflicto: {
                                                type: "string",
                                                format: "uuid",
                                                example: "550e8400-e29b-41d4-a716-446655440000",
                                            },
                                            estado_conflicto: {
                                                type: "string",
                                                example: "CERRADO",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                400: { description: "Datos inválidos o porcentaje fuera de rango." },
                401: { description: "Usuario no autenticado." },
                403: { description: "Usuario no autorizado." },
                404: { description: "Participación o conflicto no encontrado." },
                500: { description: "Error interno del servidor." },
                },
            },
        },
        "/conflicts/{id}": {
            post: {
                summary: "Aplicar resolución a un conflicto",
                description: "Permite a un administrador principal actualizar un conflicto aplicando resoluciones sobre las participaciones, ajustando los porcentajes o eliminando participaciones.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del conflicto al que se aplicarán las resoluciones.",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    resoluciones: {
                                        type: "array",
                                        description: "Lista de resoluciones aplicadas a las participaciones del conflicto.",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id_conflicto_participacion: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "UUID de la participación en conflicto que será actualizada.",
                                                    example: "550e8400-e29b-41d4-a716-446655440000",
                                                },
                                                porcentaje_participacion: {
                                                    type: "number",
                                                    minimum: 0,
                                                    maximum: 100,
                                                    description: "Nuevo porcentaje de participación para la parte del conflicto. Si es 0, la participación será eliminada.",
                                                    example: 25.5,
                                                },
                                                fecha_participacion_inicio: {
                                                    type: "string",
                                                    format: "date",
                                                    description: "Nueva fecha de inicio de la participación en conflicto.",
                                                    example: "2024-01-01",
                                                },
                                                fecha_participacion_hasta: {
                                                    type: "string",
                                                    format: "date",
                                                    description: "Nueva fecha de finalización de la participación en conflicto.",
                                                    example: "2024-06-30",
                                                },
                                            },
                                            required: ["id_conflicto_participacion", "porcentaje_participacion", "fecha_participacion_inicio", "fecha_participacion_hasta"],
                                        },
                                    },
                                },
                                required: ["resoluciones"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Resolución aplicada exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Resolución aplicada correctamente.",
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_conflicto_participacion: {
                                                        type: "string",
                                                        format: "uuid",
                                                        example: "550e8400-e29b-41d4-a716-446655440000",
                                                    },
                                                    porcentaje_participacion: {
                                                        type: "number",
                                                        example: 25.5,
                                                    },
                                                    fecha_participacion_inicio: {
                                                        type: "string",
                                                        format: "date",
                                                        example: "2024-01-01",
                                                    },
                                                    fecha_participacion_hasta: {
                                                        type: "string",
                                                        format: "date",
                                                        example: "2024-06-30",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Datos inválidos o el porcentaje total supera el 100%." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "Conflicto o participación no encontrada." },
                    500: { description: "Error interno del servidor." },
                },
            },
            get: {
                summary: "Obtener detalles de un conflicto",
                description: "Recupera los detalles de un conflicto específico, incluyendo información del fonograma, la productora involucrada y las participaciones asociadas.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del conflicto que se desea consultar.",
                    },
                ],
                responses: {
                    200: {
                        description: "Detalles del conflicto obtenidos exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Conflicto obtenido exitosamente.",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_conflicto: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "550e8400-e29b-41d4-a716-446655440000",
                                                },
                                                estado_conflicto: {
                                                    type: "string",
                                                    example: "PRIMERA INSTANCIA",
                                                },
                                                fonograma: {
                                                type: "object",
                                                properties: {
                                                    id_fonograma: {
                                                        type: "string",
                                                        format: "uuid",
                                                        example: "12d3e456-789b-12d3-a456-426614174000",
                                                    },
                                                    isrc: {
                                                        type: "string",
                                                        example: "ARZZ12345678",
                                                    },
                                                    titulo: {
                                                        type: "string",
                                                        example: "Canción Ejemplo",
                                                    },
                                                    artista: {
                                                        type: "string",
                                                        example: "Artista Ejemplo",
                                                    },
                                                    sello_discografico: {
                                                        type: "string",
                                                        example: "Sello Ejemplo",
                                                    },
                                                    anio_lanzamiento: {
                                                        type: "integer",
                                                        example: 2023,
                                                    },
                                                },
                                                },
                                                productora: {
                                                type: "object",
                                                properties: {
                                                    id_productora: {
                                                        type: "string",
                                                        format: "uuid",
                                                        example: "3a4b567c-8901-12d3-a456-426655440000",
                                                    },
                                                    nombre: {
                                                        type: "string",
                                                        example: "Productora Ejemplo",
                                                    },
                                                },
                                                },
                                                participaciones: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id_participacion: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "78d4e123-4567-89ab-cdef-1234567890ab",
                                                            },
                                                            porcentaje_participacion: {
                                                                type: "number",
                                                                example: 30.5,
                                                            },
                                                            fecha_participacion_inicio: {
                                                                type: "string",
                                                                format: "date",
                                                                example: "2024-01-01",
                                                            },
                                                            fecha_participacion_hasta: {
                                                                type: "string",
                                                                format: "date",
                                                                example: "2024-06-30",
                                                            },
                                                        },
                                                    },
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
                    404: { description: "Conflicto no encontrado." },
                    500: { description: "Error interno del servidor." },
                },
            },            
            delete: {
                summary: "Eliminar un conflicto",
                description: "Permite a un administrador principal eliminar un conflicto existente. Se eliminarán también todas las partes asociadas al conflicto.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID del conflicto que se desea eliminar.",
                    },
                ],
                responses: {
                    200: {
                        description: "Conflicto eliminado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Conflicto eliminado exitosamente.",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id_conflicto: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "550e8400-e29b-41d4-a716-446655440000",
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
                    404: { description: "Conflicto no encontrado." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/conflicts/reports": {
            get: {
                summary: "Generar reporte de conflictos",
                description: "Permite a un administrador generar un reporte de conflictos filtrado por fechas, estado, ISRC y productora. El reporte puede ser en formato JSON o CSV.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "fecha_desde",
                        schema: {
                            type: "string",
                            format: "date",
                        },
                        description: "Fecha de inicio del rango de búsqueda (ISO 8601: YYYY-MM-DD).",
                        example: "2024-01-01",
                    },
                    {
                        in: "query",
                        name: "fecha_hasta",
                        schema: {
                            type: "string",
                            format: "date",
                        },
                        description: "Fecha de finalización del rango de búsqueda (ISO 8601: YYYY-MM-DD).",
                        example: "2024-06-30",
                    },
                    {
                        in: "query",
                        name: "estado",
                        schema: {
                            type: "string",
                            enum: ["PENDIENTE CAPIF", "PRIMERA INSTANCIA", "PRIMERA PRORROGA", "SEGUNDA INSTANCIA", "SEGUNDA PRORROGA", "VENCIDO", "CERRADO"],
                        },
                        description: "Estado del conflicto para filtrar.",
                        example: "CERRADO",
                    },
                    {
                        in: "query",
                        name: "isrc",
                        schema: {
                            type: "string",
                            minLength: 12,
                            maxLength: 12,
                        },
                        description: "Código ISRC del fonograma en conflicto.",
                        example: "ARZZ12345678",
                    },
                    {
                        in: "query",
                        name: "productora_id",
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                        description: "UUID de la productora asociada al conflicto.",
                        example: "550e8400-e29b-41d4-a716-446655440000",
                    },
                    {
                        in: "query",
                        name: "formato",
                        schema: {
                            type: "string",
                            enum: ["json", "csv"],
                        },
                        description: "Formato en el que se devolverá el reporte.",
                        example: "csv",
                    },
                ],
                responses: {
                    200: {
                        description: "Reporte de conflictos generado exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Reporte de conflictos generado exitosamente.",
                                    },
                                    data: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id_conflicto: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "550e8400-e29b-41d4-a716-446655440000",
                                                },
                                                estado_conflicto: {
                                                    type: "string",
                                                    example: "PRIMERA INSTANCIA",
                                                },
                                                isrc: {
                                                    type: "string",
                                                    example: "ARZZ12345678",
                                                },
                                                titulo: {
                                                    type: "string",
                                                    example: "Canción Ejemplo",
                                                },
                                                artista: {
                                                    type: "string",
                                                    example: "Artista Ejemplo",
                                                },
                                                productora: {
                                                    type: "string",
                                                    example: "Productora Ejemplo",
                                                },
                                                porcentaje_periodo: {
                                                    type: "number",
                                                    example: 105.5,
                                                },
                                            },
                                        },
                                    },
                                },
                                },
                            },
                            "text/csv": {
                                schema: {
                                    type: "string",
                                    format: "binary",
                                },
                                description: "Archivo CSV con el reporte de conflictos.",
                            },
                        },
                    },
                    400: { description: "Datos inválidos o filtros incorrectos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "No se encontraron conflictos con los filtros aplicados." },
                    500: { description: "Error interno del servidor." },
                },
            },
        },
        "/conflicts": {
            post: {
                summary: "Crear un nuevo conflicto",
                description: "Permite a un administrador principal o secundario registrar un nuevo conflicto basado en un fonograma y su ISRC. Si el porcentaje de participación supera el 100% en un periodo determinado, se generará el conflicto.",
                tags: ["Conflictos"],
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
                                        description: "Código ISRC del fonograma que presenta conflicto.",
                                        example: "ARZZ12345678",
                                    },
                                    fecha_periodo_desde: {
                                        type: "string",
                                        format: "date",
                                        description: "Fecha de inicio del periodo en conflicto (ISO 8601: YYYY-MM-DD).",
                                        example: "2024-01-01",
                                    },
                                    fecha_periodo_hasta: {
                                        type: "string",
                                        format: "date",
                                        description: "Fecha de finalización del periodo en conflicto (ISO 8601: YYYY-MM-DD).",
                                        example: "2024-06-30",
                                    },
                                },
                                required: ["isrc", "fecha_periodo_desde", "fecha_periodo_hasta"],
                            },
                        },
                    },
                },
                responses: {
                201: {
                    description: "Conflicto creado exitosamente.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Conflicto creado exitosamente.",
                                    },
                                    data: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id_conflicto: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "550e8400-e29b-41d4-a716-446655440000",
                                                },
                                                estado_conflicto: {
                                                    type: "string",
                                                    example: "PRIMERA INSTANCIA",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                400: { description: "Datos inválidos o no hay superposición de participaciones." },
                401: { description: "Usuario no autenticado." },
                403: { description: "Usuario no autorizado." },
                404: { description: "Fonograma no encontrado o sin participaciones en el periodo indicado." },
                500: { description: "Error interno del servidor." },
                },
            },
            get: {
                summary: "Obtener lista de conflictos",
                description: "Recupera una lista de conflictos con la posibilidad de aplicar filtros como fecha, estado, ISRC y productora, con soporte para paginación.",
                tags: ["Conflictos"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "query",
                        name: "fecha_desde",
                        schema: {
                            type: "string",
                            format: "date"
                        },
                        description: "Fecha de inicio del rango de búsqueda (ISO 8601: YYYY-MM-DD).",
                        example: "2024-01-01"
                    },
                    {
                        in: "query",
                        name: "fecha_hasta",
                        schema: {
                            type: "string",
                            format: "date"
                        },
                        description: "Fecha de finalización del rango de búsqueda (ISO 8601: YYYY-MM-DD).",
                        example: "2024-06-30"
                    },
                    {
                        in: "query",
                        name: "estado",
                        schema: {
                            type: "string",
                            enum: ["PENDIENTE CAPIF", "PRIMERA INSTANCIA", "PRIMERA PRORROGA", "SEGUNDA INSTANCIA", "SEGUNDA PRORROGA", "VENCIDO", "CERRADO", "en curso"]
                        },
                        description: "Estado del conflicto para filtrar.",
                        example: "CERRADO"
                    },
                    {
                        in: "query",
                        name: "isrc",
                        schema: {
                            type: "string",
                            minLength: 12,
                            maxLength: 12
                        },
                        description: "Código ISRC del fonograma en conflicto.",
                        example: "AR1232512345"
                    },
                    {
                        in: "query",
                        name: "productora_id",
                        schema: {
                            type: "string",
                            format: "uuid"
                        },
                        description: "UUID de la productora asociada al conflicto.",
                        example: "550e8400-e29b-41d4-a716-446655440000"
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
                        description: "Lista de conflictos obtenida exitosamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Conflictos obtenidos exitosamente."
                                        },
                                        total: {
                                            type: "integer",
                                            description: "Cantidad total de conflictos encontrados.",
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
                                            example: 10
                                        },
                                        data: {
                                            type: "array",
                                            description: "Lista de conflictos encontrados.",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id_conflicto: {
                                                        type: "string",
                                                        format: "uuid",
                                                        example: "550e8400-e29b-41d4-a716-446655440000"
                                                    },
                                                    estado_conflicto: {
                                                        type: "string",
                                                        example: "PRIMERA INSTANCIA"
                                                    },
                                                    fonograma: {
                                                        type: "object",
                                                        properties: {
                                                            id_fonograma: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "12d3e456-789b-12d3-a456-426614174000"
                                                            },
                                                            isrc: {
                                                                type: "string",
                                                                example: "AR1232512345"
                                                            },
                                                            titulo: {
                                                                type: "string",
                                                                example: "Canción Ejemplo"
                                                            },
                                                            artista: {
                                                                type: "string",
                                                                example: "Artista Ejemplo"
                                                            }
                                                        }
                                                    },
                                                    productora: {
                                                        type: "object",
                                                        properties: {
                                                            id_productora: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "3a4b567c-8901-12d3-a456-426655440000"
                                                            },
                                                            nombre: {
                                                                type: "string",
                                                                example: "Productora Ejemplo"
                                                            }
                                                        }
                                                    },
                                                    porcentaje_periodo: {
                                                        type: "number",
                                                        example: 105.5
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Datos inválidos o filtros incorrectos." },
                    401: { description: "Usuario no autenticado." },
                    403: { description: "Usuario no autorizado." },
                    404: { description: "No se encontraron conflictos con los filtros aplicados." },
                    500: { description: "Error interno del servidor." }
                }
            },
        },
    },
};