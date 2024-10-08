'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoISRC', [
      {
        id_tipo_isrc: uuidv4(),
        descripcion: 'Audio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_isrc: uuidv4(),
        descripcion: 'Video',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoISRC', {}, {});
  },
};
