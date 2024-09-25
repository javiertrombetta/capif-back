'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoPersona', [
      {
        id_tipo_persona: 1,
        descripcion: 'Persona Física',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_persona: 2,
        descripcion: 'Persona Jurídica',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoPersona', {}, {});
  },
};