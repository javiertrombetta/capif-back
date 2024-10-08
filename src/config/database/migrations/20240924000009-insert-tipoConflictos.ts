'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoConflicto', [
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Disputa sobre titularidad de fonograma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Conflicto por derechos de autor',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Desacuerdo sobre repartición de regalías',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Incumplimiento de contrato',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Disputa sobre la propiedad de ISRC',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Conflicto de titularidad compartida',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Denegación de solicitud de fonograma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Invalidez de código ISRC',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Problemas con la inscripción de fonogramas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Controversias de titularidad en plataformas digitales',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Errores de información de fonogramas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_conflicto: uuidv4(),
        descripcion: 'Disputa por actualización de datos de fonograma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoConflicto', {}, {});
  },
};