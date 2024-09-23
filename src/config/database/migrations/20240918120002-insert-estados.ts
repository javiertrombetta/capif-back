'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.bulkInsert('Estado', [
      { descripcion: 'nuevo', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'confirmado', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'autorizado', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'bloqueado', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'habilitado', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.bulkDelete('Estado', {
      descripcion: ['nuevo', 'confirmado', 'autorizado', 'bloqueado', 'habilitado'],
    });
  },
};
