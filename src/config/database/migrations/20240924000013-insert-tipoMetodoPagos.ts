'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoMetodoPago', [
      { descripcion: 'Tarjeta de crédito', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Tarjeta de débito', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Transferencia bancaria', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'PayPal', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Pago en efectivo', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Mercado Pago', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Cheque', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Criptomonedas', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Billetera digital', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Pago móvil', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoMetodoPago', {}, {});
  },
};
