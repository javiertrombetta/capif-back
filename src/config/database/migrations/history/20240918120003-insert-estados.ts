'use strict';

import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoEstado', [
      { descripcion: 'registro', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'acceso', createdAt: new Date(), updatedAt: new Date() },
    ]);

    const tipoEstadoRegistro = (await queryInterface.sequelize.query(
      `SELECT id_tipo_estado FROM "TipoEstado" WHERE descripcion = 'registro';`
    )) as [{ id_tipo_estado: string }[], unknown];

    const tipoEstadoAcceso = (await queryInterface.sequelize.query(
      `SELECT id_tipo_estado FROM "TipoEstado" WHERE descripcion = 'acceso';`
    )) as [{ id_tipo_estado: string }[], unknown];

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
        descripcion: 'habilitado',
        tipo_estado_id: tipoEstadoAcceso[0][0].id_tipo_estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'bloqueado',
        tipo_estado_id: tipoEstadoAcceso[0][0].id_tipo_estado,
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
