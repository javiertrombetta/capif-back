'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Función para marcar un pago como realizado y actualizar el saldo
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION marcar_pago_realizado(id_pago_param INTEGER)
        RETURNS VOID AS $$
        BEGIN
          -- Marcar el pago con la fecha actual
          UPDATE Pago
          SET fecha_pago = NOW()
          WHERE id_pago = id_pago_param;

          -- Llamar a la función para actualizar el saldo del usuario correspondiente
          PERFORM actualizar_saldo(id_pago_param);
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Crear la función para actualizar el saldo en la tabla CuentaCorriente
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION actualizar_saldo(id_pago_param INTEGER)
        RETURNS VOID AS $$
        DECLARE
          id_usuario_pago INTEGER;
          monto_pago DECIMAL(10, 2);
        BEGIN
          -- Obtener el id_usuario y monto del pago
          SELECT id_usuario, monto INTO id_usuario_pago, monto_pago
          FROM Pago
          WHERE id_pago = id_pago_param;

          -- Actualizar el saldo de la cuenta corriente del usuario
          UPDATE CuentaCorriente
          SET saldo = saldo + monto_pago, fecha_actualizacion = NOW()
          WHERE id_usuario = id_usuario_pago;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Triggers para aplicar la función después de cada pago realizado
      await queryInterface.sequelize.query(`
        CREATE TRIGGER trigger_pago_realizado
        AFTER UPDATE ON Pago
        FOR EACH ROW
        WHEN (NEW.fecha_pago IS NOT NULL)
        EXECUTE FUNCTION marcar_pago_realizado(NEW.id_pago);
      `);

      console.log(
        'Funciones y triggers para marcar pagos y actualizar saldo creados correctamente.'
      );
    } catch (error) {
      console.error('Error en la creación de la función para marcar pago realizado:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS trigger_pago_realizado ON Pago;
        DROP FUNCTION IF EXISTS marcar_pago_realizado;
        DROP FUNCTION IF EXISTS actualizar_saldo;
      `);

      console.log('Funciones y triggers para marcar pagos eliminados correctamente.');
    } catch (error) {
      console.error('Error al eliminar las funciones y triggers de pago:', error);
      throw error;
    }
  },
};
