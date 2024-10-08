export const archivoSchemas = {
  ArchivoCreate: {
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        description: 'Nombre del archivo',
        example: 'archivo_ejemplo.pdf', // Valor por defecto
      },
      tipo: {
        type: 'string',
        description: 'Tipo de archivo',
        example: 'pdf', // Valor por defecto
      },
      ruta: {
        type: 'string',
        description: 'Ruta del archivo en el servidor',
        example: '/uploads/archivo_ejemplo.pdf', // Valor por defecto
      },
    },
    required: ['nombre', 'tipo', 'ruta'],
  },
  ArchivoUpdate: {
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        description: 'Nombre actualizado del archivo',
        example: 'archivo_actualizado.pdf', // Valor por defecto
      },
      tipo: {
        type: 'string',
        description: 'Tipo actualizado del archivo',
        example: 'pdf', // Valor por defecto
      },
    },
  },
  Archivo: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID del archivo',
        example: '123e4567-e89b-12d3-a456-426614174000', // UUID de ejemplo
      },
      nombre: {
        type: 'string',
        description: 'Nombre del archivo',
        example: 'archivo_final.pdf', // Valor por defecto
      },
      tipo: {
        type: 'string',
        description: 'Tipo de archivo',
        example: 'pdf', // Valor por defecto
      },
      ruta: {
        type: 'string',
        description: 'Ruta del archivo en el servidor',
        example: '/uploads/archivo_final.pdf', // Valor por defecto
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de creación del archivo',
        example: '2023-09-30T12:34:56Z', // Ejemplo de fecha en formato ISO
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de actualización del archivo',
        example: '2023-10-01T12:34:56Z', // Ejemplo de fecha en formato ISO
      },
    },
  },
};
