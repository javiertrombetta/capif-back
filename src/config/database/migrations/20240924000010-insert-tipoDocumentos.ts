'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoDocumento', [
      { descripcion: 'DNI', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Pasaporte', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'CUIL', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'CUIT', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Partida de nacimiento', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Título universitario', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Licencia de conducir', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Permiso de residencia', createdAt: new Date(), updatedAt: new Date() },
      {
        descripcion: 'Certificado de antecedentes penales',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { descripcion: 'Certificado médico', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Certificado de estudios', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Declaración jurada', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Boleta de servicio', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Acta de matrimonio', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Acta de defunción', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Contrato de trabajo', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Poder notarial', createdAt: new Date(), updatedAt: new Date() },
      { descripcion: 'Escritura pública', createdAt: new Date(), updatedAt: new Date() },
      {
        descripcion: 'Constancia de inscripción en AFIP',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        descripcion: 'Constancia de inscripción en Ingresos Brutos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoDocumento', {}, {});
  },
};
