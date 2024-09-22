'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Función para actualizar el saldo después de un pago
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION actualizar_saldo(id_pago_param INTEGER)
        RETURNS VOID AS $$
        DECLARE
            monto DECIMAL(10, 2);
            id_usuario INTEGER;
        BEGIN
            -- Obtener el monto y el usuario del pago
            SELECT monto, id_usuario INTO monto, id_usuario
            FROM Pago
            WHERE id_pago = id_pago_param;

            -- Actualizar el saldo de la cuenta corriente del usuario
            UPDATE CuentaCorriente
            SET saldo = saldo - monto, fecha_actualizacion = NOW()
            WHERE id_usuario = id_usuario;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Función de actualización de saldos en otras tablas relacionadas (si aplica)
      const updateFunctions = [
        { table: 'Fonograma', column: 'estado_id', functionName: 'actualizar_estado_fonograma' },
        { table: 'Conflicto', column: 'id_conflicto', functionName: 'actualizar_estado_conflicto' },
        { table: 'Tramite', column: 'estado_id', functionName: 'actualizar_estado_tramite' },
      ];

      for (const fn of updateFunctions) {
        await queryInterface.sequelize.query(`
          CREATE OR REPLACE FUNCTION ${fn.functionName}(id_param INTEGER)
          RETURNS VOID AS $$
          BEGIN
            UPDATE ${fn.table}
            SET ${fn.column} = (SELECT estado_id FROM Estado WHERE descripcion = 'Pagado')
            WHERE ${fn.column} = id_param;
          END;
          $$ LANGUAGE plpgsql;
        `);
      }

      console.log('Funciones de actualización de saldo y estado generadas correctamente.');
    } catch (error) {
      console.error('Error en la creación de funciones de actualización:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {  
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS actualizar_saldo;
      `);

      const updateFunctions = [
        'actualizar_estado_fonograma',
        'actualizar_estado_conflicto',
        'actualizar_estado_tramite',
      ];

      for (const fn of updateFunctions) {
        await queryInterface.sequelize.query(`
          DROP FUNCTION IF EXISTS ${fn};
        `);
      }

      console.log('Funciones de actualización eliminadas correctamente.');
    } catch (error) {
      console.error('Error al eliminar las funciones de actualización:', error);
      throw error;
    }
  },
};
