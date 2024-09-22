'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Calcular el saldo actual de un usuario
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION calcular_saldo_actual(id_usuario_param INTEGER)
        RETURNS DECIMAL(10, 2) AS $$
        DECLARE
            saldo_actual DECIMAL(10, 2);
        BEGIN
            SELECT saldo INTO saldo_actual
            FROM CuentaCorriente
            WHERE id_usuario = id_usuario_param
            ORDER BY fecha_actualizacion DESC
            LIMIT 1;
            
            RETURN saldo_actual;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Obtener datos adicionales o calcular totales
      const calculateFunctions = [
        { table: 'Pago', column: 'monto', functionName: 'calcular_total_pago' },
        { table: 'Reporte', column: 'ruta_archivo', functionName: 'contar_reportes_generados' },
        { table: 'Tramite', column: 'estado_id', functionName: 'contar_tramites_activos' },
      ];

      for (const fn of calculateFunctions) {
        await queryInterface.sequelize.query(`
          CREATE OR REPLACE FUNCTION ${fn.functionName}(id_usuario_param INTEGER)
          RETURNS INTEGER AS $$
          DECLARE
              total_count INTEGER;
          BEGIN
              SELECT COUNT(${fn.column}) INTO total_count
              FROM ${fn.table}
              WHERE id_usuario = id_usuario_param;
              
              RETURN total_count;
          END;
          $$ LANGUAGE plpgsql;
        `);
      }

      console.log('Funciones de cálculo de saldo y contadores generadas correctamente.');
    } catch (error) {
      console.error('Error en la creación de funciones de cálculo:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS calcular_saldo_actual;
      `);

      const calculateFunctions = [
        'calcular_total_pago',
        'contar_reportes_generados',
        'contar_tramites_activos',
      ];

      for (const fn of calculateFunctions) {
        await queryInterface.sequelize.query(`
          DROP FUNCTION IF EXISTS ${fn};
        `);
      }

      console.log('Funciones de cálculo eliminadas correctamente.');
    } catch (error) {
      console.error('Error al eliminar las funciones de cálculo:', error);
      throw error;
    }
  },
};
