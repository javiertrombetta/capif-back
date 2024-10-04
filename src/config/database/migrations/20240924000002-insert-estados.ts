'use strict';

import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoEstado', [
      { descripcion: 'registro', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'conflicto', createdAt: new Date(), updatedAt: new Date() },
    ]);

    const tipoEstadoRegistro = (await queryInterface.sequelize.query(
      `SELECT id_tipo_estado FROM "TipoEstado" WHERE descripcion = 'registro';`
    )) as [{ id_tipo_estado: number }[], unknown];

    const tipoEstadoConflicto = (await queryInterface.sequelize.query(
      `SELECT id_tipo_estado FROM "TipoEstado" WHERE descripcion = 'conflicto';`
    )) as [{ id_tipo_estado: number }[], unknown];

    await queryInterface.bulkInsert('Estado', [
      {
        descripcion: 'nuevo',
        tipo_estado_id: tipoEstadoRegistro[0][0].id_tipo_estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'confirmado',
        tipo_estado_id: tipoEstadoRegistro[0][0].id_tipo_estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'autorizado',
        tipo_estado_id: tipoEstadoRegistro[0][0].id_tipo_estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'pendiente',
        tipo_estado_id: tipoEstadoConflicto[0][0].id_tipo_estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'resuelto',
        tipo_estado_id: tipoEstadoConflicto[0][0].id_tipo_estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'en proceso',
        tipo_estado_id: tipoEstadoConflicto[0][0].id_tipo_estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'rechazado',
        tipo_estado_id: tipoEstadoConflicto[0][0].id_tipo_estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('Estado', {}, {});
    await queryInterface.bulkDelete('TipoEstado', {}, {});

    await queryInterface.dropTable('Estado');
    await queryInterface.dropTable('TipoEstado');
  },
};
