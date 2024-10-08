'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid'; // Importar la función para generar UUID

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoFonograma', [
      {
        id_tipo_fonograma: uuidv4(),
        descripcion: 'Fonograma Musical',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_fonograma: uuidv4(),
        descripcion: 'Fonograma Literario',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_fonograma: uuidv4(),
        descripcion: 'Fonograma Audiovisual',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_fonograma: uuidv4(),
        descripcion: 'Fonograma Educativo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_fonograma: uuidv4(),
        descripcion: 'Fonograma Publicitario',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_fonograma: uuidv4(),
        descripcion: 'Fonograma Informativo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_fonograma: uuidv4(),
        descripcion: 'Fonograma Artístico',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_fonograma: uuidv4(),
        descripcion: 'Fonograma Cultural',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoFonograma', {}, {});
  },
};
