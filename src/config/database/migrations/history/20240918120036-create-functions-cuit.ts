'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Función para validar CUIT
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION validar_cuit(cuit_param CHAR(11))
        RETURNS BOOLEAN AS $$
        BEGIN
          IF cuit_param ~ '^[0-9]{11}$' THEN
            RETURN TRUE;
          ELSE
            RAISE EXCEPTION 'CUIT inválido: %', cuit_param;
            RETURN FALSE;
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Función para validar otros identificadores en diferentes tablas
      const validateFunctions = [
        { table: 'Compania', column: 'cuit', functionName: 'validar_cuit_compania' },
        { table: 'Usuario', column: 'cuit', functionName: 'validar_cuit_usuario' },
        { table: 'ISRC', column: 'codigo_isrc', functionName: 'validar_isrc_fonograma' },
      ];

      for (const fn of validateFunctions) {
        await queryInterface.sequelize.query(`
          CREATE OR REPLACE FUNCTION ${fn.functionName}(id_param INTEGER, valor_param CHAR(11))
          RETURNS BOOLEAN AS $$
          BEGIN
            IF valor_param ~ '^[0-9]{11}$' THEN
              RETURN TRUE;
            ELSE
              RAISE EXCEPTION '${fn.column} inválido: %', valor_param;
              RETURN FALSE;
            END IF;
          END;
          $$ LANGUAGE plpgsql;
        `);
      }

      console.log('Funciones de validación de CUIT y otros identificadores creadas correctamente.');
    } catch (error) {
      console.error('Error en la creación de funciones de validación:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS validar_cuit;
      `);

      const validateFunctions = [
        'validar_cuit_compania',
        'validar_cuit_usuario',
        'validar_isrc_fonograma',
      ];

      for (const fn of validateFunctions) {
        await queryInterface.sequelize.query(`
          DROP FUNCTION IF EXISTS ${fn};
        `);
      }

      console.log('Funciones de validación eliminadas correctamente.');
    } catch (error) {
      console.error('Error al eliminar las funciones de validación:', error);
      throw error;
    }
  },
};
