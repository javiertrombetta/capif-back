'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoMetodoPago', [
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'Tarjeta de crédito',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'Tarjeta de débito',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'Transferencia bancaria',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'PayPal',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'Pago en efectivo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'Mercado Pago',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'Cheque',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'Criptomonedas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'Billetera digital',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_metodo_pago: uuidv4(),
        descripcion: 'Pago móvil',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoMetodoPago', {}, {});
  },
};