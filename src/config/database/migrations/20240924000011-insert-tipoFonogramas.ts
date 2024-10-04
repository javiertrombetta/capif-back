'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoFonograma', [
      { descripcion: 'Fonograma Musical', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Fonograma Literario', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Fonograma Audiovisual', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Fonograma Educativo', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Fonograma Publicitario', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Fonograma Informativo', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Fonograma Artístico', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Fonograma Cultural', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoFonograma', {}, {});
  },
};
