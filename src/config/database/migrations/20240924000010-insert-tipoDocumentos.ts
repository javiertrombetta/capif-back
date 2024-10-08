'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoDocumento', [
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'DNI',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Pasaporte',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'CUIL',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'CUIT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Partida de nacimiento',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Título universitario',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Licencia de conducir',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Permiso de residencia',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Certificado de antecedentes penales',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Certificado médico',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Certificado de estudios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Declaración jurada',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Boleta de servicio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Acta de matrimonio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Acta de defunción',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Contrato de trabajo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Poder notarial',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Escritura pública',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
        descripcion: 'Constancia de inscripción en AFIP',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_documento: uuidv4(),
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
