'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoActividad', [
      { descripcion: 'Registro de usuario', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Actualización de datos', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Subida de archivos', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Pago realizado', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Generación de reporte', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Resolución de conflicto', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Eliminación de usuario', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Acceso al sistema', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Modificación de permisos', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Creación de cuenta bancaria', createdAt: new Date(), updatedAt: new Date() },
      {
        descripcion: 'Actualización de información de fonogramas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Asignación de titular de fonograma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { descripcion: 'Gestión de ISRC', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Comentario sobre conflicto', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Consulta realizada', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Modificación de trámite', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Subida de documento', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Alta masiva', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Registro de actividad', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Auditoría de cambios', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Error de inserción', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Modificación de regla', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Modificación de estado', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Postulación a premio', createdAt: new Date(), updatedAt: new Date() },
      {
        descripcion: 'Modificación de tipo de persona',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Modificación de tipo de compañía',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Descarga de catálogos de repertorios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Monitoreo de conflictos de titularidad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { descripcion: 'Depuración de repertorio', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Subida de archivo masivo', createdAt: new Date(), updatedAt: new Date() },
      {
        descripcion: 'Resolución de declaración de derechos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoActividad', {}, {});
  },
};
