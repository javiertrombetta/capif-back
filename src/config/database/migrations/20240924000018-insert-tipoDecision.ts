'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoDecision', [
      {
        id_tipo_decision: uuidv4(),
        descripcion: 'aceptado',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_decision: uuidv4(),
        descripcion: 'pendiente',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_decision: uuidv4(),
        descripcion: 'rechazado',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoDecision', {}, {});
  },
};