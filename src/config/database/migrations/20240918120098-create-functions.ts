'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Función de auditoría
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION audit_changes()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (TG_OP = 'INSERT') THEN
            INSERT INTO AuditoriaCambio(tabla_afectada, operacion, descripcion, fecha, id_usuario)
            VALUES (TG_TABLE_NAME, 'INSERT', row_to_json(NEW), NOW(), NEW.id_usuario);
            RETURN NEW;
          ELSIF (TG_OP = 'UPDATE') THEN
            INSERT INTO AuditoriaCambio(tabla_afectada, operacion, descripcion, fecha, id_usuario)
            VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(NEW), NOW(), NEW.id_usuario);
            RETURN NEW;
          ELSIF (TG_OP = 'DELETE') THEN
            INSERT INTO AuditoriaCambio(tabla_afectada, operacion, descripcion, fecha, id_usuario)
            VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD), NOW(), OLD.id_usuario);
            RETURN OLD;
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Función para calcular el saldo actual
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

      // Función para registrar actividad
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION registrar_actividad(id_usuario_param INTEGER, actividad_param TEXT, ip_param TEXT)
        RETURNS VOID AS $$
        BEGIN
            INSERT INTO LogActividad (id_usuario, actividad, fecha, ip_origen, navegador)
            VALUES (id_usuario_param, actividad_param, NOW(), ip_param, 'NavegadorDesconocido');
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Función para marcar un pago como realizado
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION marcar_pago_realizado(id_pago_param INTEGER)
        RETURNS VOID AS $$
        BEGIN
            UPDATE Pago
            SET fecha_pago = NOW()
            WHERE id_pago = id_pago_param;

            PERFORM actualizar_saldo(id_pago_param);
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Función para actualizar saldo tras un pago
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION actualizar_saldo(id_pago_param INTEGER)
        RETURNS VOID AS $$
        DECLARE
            monto DECIMAL(10, 2);
            id_usuario INTEGER;
        BEGIN
            SELECT monto, id_usuario INTO monto, id_usuario
            FROM Pago
            WHERE id_pago = id_pago_param;

            UPDATE CuentaCorriente
            SET saldo = saldo - monto, fecha_actualizacion = NOW()
            WHERE id_usuario = id_usuario;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Función para verificar si un conflicto está resuelto
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

      // Función para asignar un premio
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION asignar_premio(id_usuario_param INTEGER, codigo_premio_param TEXT)
        RETURNS VOID AS $$
        BEGIN
            INSERT INTO PostulacionPremio (id_usuario, codigo_postulacion, fecha_asignacion)
            VALUES (id_usuario_param, codigo_premio_param, NOW());
        END;
        $$ LANGUAGE plpgsql;
      `);

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

      console.log('Funciones creadas correctamente.');
    } catch (error) {
      console.error('Error en la creación de funciones:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS audit_changes() CASCADE;`);
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS calcular_saldo_actual(INTEGER) CASCADE;`
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS registrar_actividad(INTEGER, TEXT, TEXT) CASCADE;`
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS marcar_pago_realizado(INTEGER) CASCADE;`
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS actualizar_saldo(INTEGER) CASCADE;`
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS verificar_conflicto_resuelto(INTEGER) CASCADE;`
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS asignar_premio(INTEGER, TEXT) CASCADE;`
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS validar_cuit(CHAR(11)) CASCADE;`
      );

      console.log('Funciones eliminadas correctamente.');
    } catch (error) {
      console.error('Error al eliminar las funciones:', error);
      throw error;
    }
  },
};
