'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Función para asignar un premio a un usuario
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION asignar_premio(id_usuario_param INTEGER, codigo_premio_param TEXT)
        RETURNS VOID AS $$
        BEGIN
          INSERT INTO PostulacionPremio (id_usuario, codigo_postulacion, fecha_asignacion)
          VALUES (id_usuario_param, codigo_premio_param, NOW());
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Funciones adicionales para otras tablas si es necesario
      const assignFunctions = [
        { table: 'Conflicto', column: 'estado_id', functionName: 'actualizar_estado_conflicto' },
        { table: 'Fonograma', column: 'estado_id', functionName: 'actualizar_estado_fonograma' },
        {
          table: 'Repertorio',
          column: 'id_usuario',
          functionName: 'actualizar_repertorio_usuario',
        },
      ];

      for (const fn of assignFunctions) {
        await queryInterface.sequelize.query(`
          CREATE OR REPLACE FUNCTION ${fn.functionName}(id_param INTEGER, nuevo_valor INTEGER)
          RETURNS VOID AS $$
          BEGIN
            UPDATE ${fn.table}
            SET ${fn.column} = nuevo_valor
            WHERE id_${fn.table.toLowerCase()} = id_param;
          END;
          $$ LANGUAGE plpgsql;
        `);
      }

      console.log('Funciones de asignación de premio y actualización creadas correctamente.');
    } catch (error) {
      console.error('Error en la creación de la función para asignar premio:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS asignar_premio;
      `);

      const assignFunctions = [
        'actualizar_estado_conflicto',
        'actualizar_estado_fonograma',
        'actualizar_repertorio_usuario',
      ];

      for (const fn of assignFunctions) {
        await queryInterface.sequelize.query(`
          DROP FUNCTION IF EXISTS ${fn};
        `);
      }

      console.log('Funciones de asignación eliminadas correctamente.');
    } catch (error) {
      console.error('Error al eliminar las funciones de asignación:', error);
      throw error;
    }
  },
};
