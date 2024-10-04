'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoCompania', [
      { descripcion: 'Productora Discográfica', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Distribuidora', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Productora Audiovisual', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Agencia de Marketing', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Agencia de Publicidad', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Productora Independiente', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Compañía de Grabación', createdAt: new Date(), updatedAt: new Date() },
      {
        descripcion: 'Compañía de Distribución Digital',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Agencia de Gestión de Derechos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Agencia de Servicios Audiovisuales',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { descripcion: 'Estudio de Grabación', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Estudio de Postproducción', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Compañía de Licenciamiento', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Asociación de Derechos', createdAt: new Date(), updatedAt: new Date() },
      {
        descripcion: 'Compañía de Representación de Artistas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { descripcion: 'Servicios Técnicos de Audio', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Servicios Técnicos de Video', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoCompania', {}, {});
  },
};
