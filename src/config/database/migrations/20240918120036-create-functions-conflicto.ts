'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Función para verificar si un conflicto ha sido resuelto
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION verificar_conflicto_resuelto(id_conflicto_param INTEGER)
        RETURNS BOOLEAN AS $$
        DECLARE
            conflicto_resuelto BOOLEAN;
        BEGIN
            SELECT (fecha_resolucion IS NOT NULL) INTO conflicto_resuelto
            FROM Conflicto
            WHERE id_conflicto = id_conflicto_param;

            RETURN conflicto_resuelto;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Función para verificar estados en otras tablas
      const verificarFunciones = [
        {
          table: 'Fonograma',
          column: 'fecha_lanzamiento',
          functionName: 'verificar_fonograma_lanzado',
        },
        { table: 'Tramite', column: 'estado_id', functionName: 'verificar_tramite_finalizado' },
        { table: 'Pago', column: 'fecha_pago', functionName: 'verificar_pago_realizado' },
      ];

      for (const fn of verificarFunciones) {
        await queryInterface.sequelize.query(`
          CREATE OR REPLACE FUNCTION ${fn.functionName}(id_param INTEGER)
          RETURNS BOOLEAN AS $$
          DECLARE
              resultado BOOLEAN;
          BEGIN
              SELECT (${fn.column} IS NOT NULL) INTO resultado
              FROM ${fn.table}
              WHERE id_${fn.table.toLowerCase()} = id_param;

              RETURN resultado;
          END;
          $$ LANGUAGE plpgsql;
        `);
      }

      console.log(
        'Funciones de verificación para conflictos y otras tablas creadas correctamente.'
      );
    } catch (error) {
      console.error('Error en la creación de funciones de verificación:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS verificar_conflicto_resuelto;
      `);

      const verificarFunciones = [
        'verificar_fonograma_lanzado',
        'verificar_tramite_finalizado',
        'verificar_pago_realizado',
      ];

      for (const fn of verificarFunciones) {
        await queryInterface.sequelize.query(`
          DROP FUNCTION IF EXISTS ${fn};
        `);
      }

      console.log('Funciones de verificación eliminadas correctamente.');
    } catch (error) {
      console.error('Error al eliminar las funciones de verificación:', error);
      throw error;
    }
  },
};
