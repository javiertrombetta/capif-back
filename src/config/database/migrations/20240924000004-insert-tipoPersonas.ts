'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoPersona', [
      {
        id_tipo_persona: uuidv4(),
        descripcion: 'Persona Física',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_persona: uuidv4(),
        descripcion: 'Persona Jurídica',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoPersona', {
      descripcion: ['Persona Física', 'Persona Jurídica'],
    });
  },
};
