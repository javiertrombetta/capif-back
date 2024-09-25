'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.bulkInsert('Rol', [
      { descripcion: 'productor', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'admin', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
  down: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.bulkDelete('Rol', {}, {});
  },
};
