'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('Rol', [
      {
        id_rol: uuidv4(),
        descripcion: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_rol: uuidv4(),
        descripcion: 'productor',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('Rol', { descripcion: ['admin', 'productor'] });
  },
};