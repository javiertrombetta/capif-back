'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoPersona', [
      { descripcion: 'Persona Física', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Persona Jurídica', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoPersona', {}, {});
  },
};
