'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoConflicto', [
      {
        descripcion: 'Disputa sobre titularidad de fonograma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Conflicto por derechos de autor',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Desacuerdo sobre repartición de regalías',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { descripcion: 'Incumplimiento de contrato', createdAt: new Date(), updatedAt: new Date() },
      {
        descripcion: 'Disputa sobre la propiedad de ISRC',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Conflicto de titularidad compartida',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Denegación de solicitud de fonograma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { descripcion: 'Invalidez de código ISRC', createdAt: new Date(), updatedAt: new Date() },
      {
        descripcion: 'Problemas con la inscripción de fonogramas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Controversias de titularidad en plataformas digitales',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Errores de información de fonogramas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Disputa por actualización de datos de fonograma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoConflicto', {}, {});
  },
};
