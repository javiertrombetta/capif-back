'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoNavegador', [
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Chrome',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Firefox',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Safari',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Edge',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Opera',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Internet Explorer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Brave',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Tor',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Vivaldi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'UC Browser',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Samsung Internet',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Yandex Browser',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Coc Coc',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_navegador: uuidv4(),
        descripcion: 'Puffin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoNavegador', {}, {});
  },
};
