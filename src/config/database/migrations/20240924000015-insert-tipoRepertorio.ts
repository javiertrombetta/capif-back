'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoRepertorio', [
      { descripcion: 'Música', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Literatura', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Cine', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Teatro', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Danza', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Audiovisual', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Fotografía', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Obra plástica', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Arquitectura', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Dibujo', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Escultura', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Arte digital', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Instalación artística', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Videojuegos', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Software', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Multimedia', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Otro', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoRepertorio', {}, {});
  },
};
