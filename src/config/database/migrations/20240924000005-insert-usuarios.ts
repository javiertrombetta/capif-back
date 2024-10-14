'use strict';

import { QueryInterface } from 'sequelize';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const saltRounds = 10;

    const hashedAdminPassword = await bcrypt.hash('admin1234', saltRounds);
    const hashedProductorPassword = await bcrypt.hash('productor1234', saltRounds);

    const [adminRole]: any = await queryInterface.sequelize.query(
      `SELECT id_rol FROM "Rol" WHERE descripcion = 'admin';`
    );

    const [productorRole]: any = await queryInterface.sequelize.query(
      `SELECT id_rol FROM "Rol" WHERE descripcion = 'productor';`
    );

    const [authorizedState]: any = await queryInterface.sequelize.query(
      `SELECT id_estado FROM "Estado" WHERE descripcion = 'autorizado';`
    );

    const [personaFisicaType]: any = await queryInterface.sequelize.query(
      `SELECT id_tipo_persona FROM "TipoPersona" WHERE descripcion = 'Persona Física';`
    );

     await queryInterface.bulkInsert('Usuario', [
       {
         id_usuario: uuidv4(),
         nombre: 'Admin',
         apellido: 'User',
         email: 'admin@c.com',
         clave: hashedAdminPassword,
         rol_id: adminRole[0].id_rol,
         fecha_registro: new Date(),
         estado_id: authorizedState[0].id_estado,
         cuit: '20304050607',
         tipo_persona_id: personaFisicaType[0].id_tipo_persona,
         domicilio: 'Admin Address',
         ciudad: 'Buenos Aires',
         provincia: 'Buenos Aires',
         pais: 'Argentina',
         codigo_postal: '1414',
         telefono: '123456789',
         isRegistro_pendiente: false,
         createdAt: new Date(),
         updatedAt: new Date(),
       },
     ]);

    await queryInterface.bulkInsert('Usuario', [
      {
        id_usuario: uuidv4(),
        nombre: 'Productor',
        apellido: 'User',
        email: 'productor@c.com',
        clave: hashedProductorPassword,
        rol_id: productorRole[0].id_rol,
        fecha_registro: new Date(),
        estado_id: authorizedState[0].id_estado,
        cuit: '20304050608',
        tipo_persona_id: personaFisicaType[0].id_tipo_persona,
        domicilio: 'Productor Address',
        ciudad: 'Buenos Aires',
        provincia: 'Buenos Aires',
        pais: 'Argentina',
        codigo_postal: '1414',
        telefono: '987654321',
        isRegistro_pendiente: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {  
    await queryInterface.bulkDelete('Usuario', { email: 'admin@c.com' });
    await queryInterface.bulkDelete('Usuario', { email: 'productor@c.com' });
  },
};