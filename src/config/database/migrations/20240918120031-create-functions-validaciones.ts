'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Validaciones para la tabla Documento (fecha no futura)
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION validate_document_date()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (NEW.fecha_subida > NOW()) THEN
            RAISE EXCEPTION 'La fecha de subida no puede ser futura';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER validate_document_date_trigger
        BEFORE INSERT OR UPDATE ON Documento
        FOR EACH ROW EXECUTE FUNCTION validate_document_date();
      `);

      // Validaciones para la tabla Usuario (CUIT y email válidos)
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION validate_usuario_data()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (NEW.cuit !~ '^[0-9]{11}$') THEN
            RAISE EXCEPTION 'CUIT inválido';
          END IF;
          IF (NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
            RAISE EXCEPTION 'Email inválido';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER validate_usuario_data_trigger
        BEFORE INSERT OR UPDATE ON Usuario
        FOR EACH ROW EXECUTE FUNCTION validate_usuario_data();
      `);

      // Validaciones para la tabla Compania (CUIT y email válidos)
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION validate_compania_data()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (NEW.cuit !~ '^[0-9]{11}$') THEN
            RAISE EXCEPTION 'CUIT inválido';
          END IF;
          IF (NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
            RAISE EXCEPTION 'Email inválido';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER validate_compania_data_trigger
        BEFORE INSERT OR UPDATE ON Compania
        FOR EACH ROW EXECUTE FUNCTION validate_compania_data();
      `);

      // Validaciones para la tabla Fonograma (fecha de lanzamiento no futura y duración válida)
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION validate_fonograma_data()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (NEW.fecha_lanzamiento > NOW()) THEN
            RAISE EXCEPTION 'La fecha de lanzamiento no puede ser futura';
          END IF;
          IF (NEW.duracion IS NULL OR NEW.duracion !~ '^[0-9]{2}:[0-9]{2}:[0-9]{2}$') THEN
            RAISE EXCEPTION 'Duración inválida';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER validate_fonograma_data_trigger
        BEFORE INSERT OR UPDATE ON Fonograma
        FOR EACH ROW EXECUTE FUNCTION validate_fonograma_data();
      `);

      // Validaciones para la tabla ISRC (código ISRC válido)
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION validate_isrc_code()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (NEW.codigo_isrc !~ '^[A-Z]{2}[0-9A-Z]{3}[0-9]{2}[0-9]{5}$') THEN
            RAISE EXCEPTION 'Código ISRC inválido';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER validate_isrc_code_trigger
        BEFORE INSERT OR UPDATE ON ISRC
        FOR EACH ROW EXECUTE FUNCTION validate_isrc_code();
      `);

      // Validaciones para la tabla Pago (monto positivo)
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION validate_pago_monto()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (NEW.monto <= 0) THEN
            RAISE EXCEPTION 'El monto del pago debe ser mayor a 0';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER validate_pago_monto_trigger
        BEFORE INSERT OR UPDATE ON Pago
        FOR EACH ROW EXECUTE FUNCTION validate_pago_monto();
      `);

      // Validaciones para la tabla TitularFonograma (porcentaje de titularidad válido)
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION validate_titular_fonograma()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (NEW.porcentaje_titularidad < 0 OR NEW.porcentaje_titularidad > 100) THEN
            RAISE EXCEPTION 'El porcentaje de titularidad debe estar entre 0 y 100';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER validate_titular_fonograma_trigger
        BEFORE INSERT OR UPDATE ON TitularFonograma
        FOR EACH ROW EXECUTE FUNCTION validate_titular_fonograma();
      `);

      console.log('Todas las validaciones para las 30 tablas han sido creadas correctamente.');
    } catch (error) {
      console.error('Error en la creación de validaciones:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS validate_document_date_trigger ON Documento;
        DROP FUNCTION IF EXISTS validate_document_date;
        DROP TRIGGER IF EXISTS validate_usuario_data_trigger ON Usuario;
        DROP FUNCTION IF EXISTS validate_usuario_data;
        DROP TRIGGER IF EXISTS validate_compania_data_trigger ON Compania;
        DROP FUNCTION IF EXISTS validate_compania_data;
        DROP TRIGGER IF EXISTS validate_fonograma_data_trigger ON Fonograma;
        DROP FUNCTION IF EXISTS validate_fonograma_data;
        DROP TRIGGER IF EXISTS validate_isrc_code_trigger ON ISRC;
        DROP FUNCTION IF EXISTS validate_isrc_code;
        DROP TRIGGER IF EXISTS validate_pago_monto_trigger ON Pago;
        DROP FUNCTION IF EXISTS validate_pago_monto;
        DROP TRIGGER IF EXISTS validate_titular_fonograma_trigger ON TitularFonograma;
        DROP FUNCTION IF EXISTS validate_titular_fonograma;
      `);

      console.log('Todas las validaciones han sido eliminadas correctamente.');
    } catch (error) {
      console.error('Error al eliminar las validaciones:', error);
      throw error;
    }
  },
};
