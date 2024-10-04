'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoArchivo', [
      { descripcion: '.pdf', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.docx', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.txt', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.png', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.jpg', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.jpeg', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.gif', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.mp3', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.wav', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.mp4', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.avi', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.xlsx', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.csv', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.pptx', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.zip', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: '.rar', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoArchivo', {}, {});
  },
};
