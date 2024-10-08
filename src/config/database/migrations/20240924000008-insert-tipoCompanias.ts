'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid'; // Importar la función para generar UUID

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoCompania', [
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Productora Discográfica',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Distribuidora',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Productora Audiovisual',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Agencia de Marketing',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Agencia de Publicidad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Productora Independiente',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Compañía de Grabación',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Compañía de Distribución Digital',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Agencia de Gestión de Derechos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Agencia de Servicios Audiovisuales',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Estudio de Grabación',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Estudio de Postproducción',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Compañía de Licenciamiento',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Asociación de Derechos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Compañía de Representación de Artistas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Servicios Técnicos de Audio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_compania: uuidv4(),
        descripcion: 'Servicios Técnicos de Video',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoCompania', {}, {});
  },
};