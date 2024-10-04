'use strict';

import { QueryInterface } from 'sequelize';
import bcrypt from 'bcrypt';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const saltRounds = 10;

    const hashedAdminPassword = await bcrypt.hash('admin1234', saltRounds);
    const hashedProductorPassword = await bcrypt.hash('productor1234', saltRounds);

    const adminRole = (await queryInterface.sequelize.query(
      `SELECT id_rol FROM "Rol" WHERE descripcion = 'admin';`
    )) as [{ id_rol: number }[], unknown];

    const productorRole = (await queryInterface.sequelize.query(
      `SELECT id_rol FROM "Rol" WHERE descripcion = 'productor';`
    )) as [{ id_rol: number }[], unknown];

    const authorizedState = (await queryInterface.sequelize.query(
      `SELECT id_estado FROM "Estado" WHERE descripcion = 'autorizado';`
    )) as [{ id_estado: number }[], unknown];

    const personaFisicaType = (await queryInterface.sequelize.query(
      `SELECT id_tipo_persona FROM "TipoPersona" WHERE descripcion = 'Persona Física';`
    )) as [{ id_tipo_persona: number }[], unknown];

    await queryInterface.bulkInsert('Usuario', [
      {
        nombre: 'Admin',
        apellido: 'User',
        email: 'admin@c.com',
        clave: hashedAdminPassword,
        rol_id: adminRole[0][0].id_rol,
        fecha_registro: new Date(),
        estado_id: authorizedState[0][0].id_estado,
        cuit: '20304050607',
        tipo_persona_id: personaFisicaType[0][0].id_tipo_persona,
        domicilio: 'Admin Address',
        ciudad: 'Buenos Aires',
        provincia: 'Buenos Aires',
        pais: 'Argentina',
        telefono: '123456789',
        isRegistro_pendiente: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('Usuario', [
      {
        nombre: 'Productor',
        apellido: 'User',
        email: 'productor@c.com',
        clave: hashedProductorPassword,
        rol_id: productorRole[0][0].id_rol,
        fecha_registro: new Date(),
        estado_id: authorizedState[0][0].id_estado,
        cuit: '20304050608',
        tipo_persona_id: personaFisicaType[0][0].id_tipo_persona,
        domicilio: 'Productor Address',
        ciudad: 'Buenos Aires',
        provincia: 'Buenos Aires',
        pais: 'Argentina',
        telefono: '987654321',
        isRegistro_pendiente: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('Usuario', { email: 'admin@c.com' }, {});
    await queryInterface.bulkDelete('Usuario', { email: 'productor@c.com' }, {});
  },
};
