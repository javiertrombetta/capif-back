'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoReporte', [
      {
        descripcion: 'Generación de reporte de ISRC',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Generación de reporte financiero',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Generación de reporte de fonogramas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Generación de reporte de pagos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Generación de reporte de trámites',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Generación de reporte de conflictos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Generación de reporte de usuarios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Generación de reporte de auditoría',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Generación de reporte de actividad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoReporte', {}, {});
  },
};