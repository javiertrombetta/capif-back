'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoISRC', [
      { descripcion: 'Audio', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Video', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoISRC', {}, {});
  },
};
