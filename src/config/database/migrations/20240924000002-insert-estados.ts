'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tipoEstadoRegistroUUID = uuidv4();
    const tipoEstadoConflictoUUID = uuidv4();

    await queryInterface.bulkInsert('TipoEstado', [
      {
        id_tipo_estado: tipoEstadoRegistroUUID,
        descripcion: 'registro',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_estado: tipoEstadoConflictoUUID,
        descripcion: 'conflicto',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('Estado', [
      {
        id_estado: uuidv4(),
        descripcion: 'nuevo',
        tipo_estado_id: tipoEstadoRegistroUUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_estado: uuidv4(),
        descripcion: 'confirmado',
        tipo_estado_id: tipoEstadoRegistroUUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_estado: uuidv4(),
        descripcion: 'autorizado',
        tipo_estado_id: tipoEstadoRegistroUUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_estado: uuidv4(),
        descripcion: 'pendiente',
        tipo_estado_id: tipoEstadoConflictoUUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_estado: uuidv4(),
        descripcion: 'resuelto',
        tipo_estado_id: tipoEstadoConflictoUUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_estado: uuidv4(),
        descripcion: 'en proceso',
        tipo_estado_id: tipoEstadoConflictoUUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_estado: uuidv4(),
        descripcion: 'rechazado',
        tipo_estado_id: tipoEstadoConflictoUUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('Estado', {}, {});
    await queryInterface.bulkDelete('TipoEstado', {}, {});
  },
};