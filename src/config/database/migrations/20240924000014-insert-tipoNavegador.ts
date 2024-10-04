'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoNavegador', [
      { descripcion: 'Chrome', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Firefox', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Safari', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Edge', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Opera', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Internet Explorer', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Brave', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Tor', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Vivaldi', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'UC Browser', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Samsung Internet', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Yandex Browser', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Coc Coc', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Puffin', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoNavegador', {}, {});
  },
};
