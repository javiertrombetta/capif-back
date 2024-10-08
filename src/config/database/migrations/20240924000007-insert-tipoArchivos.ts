'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoArchivo', [
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.docx',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.txt',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.jpeg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.gif',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.mp3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.wav',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.mp4',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.avi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.xlsx',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.csv',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.pptx',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.zip',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_archivo: uuidv4(),
        descripcion: '.rar',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoArchivo', {}, {});
  },
};