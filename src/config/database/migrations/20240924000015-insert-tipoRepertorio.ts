'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoRepertorio', [
      {
        id_tipo_repertorio: uuidv4(),
        descripcion: 'tema',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_repertorio: uuidv4(),
        descripcion: 'album',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoRepertorio', {}, {});
  },
};