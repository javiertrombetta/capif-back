'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Integridad referencial para la tabla UsuarioAsignado
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION check_fk_usuario_asignado()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM Usuario WHERE id_usuario = NEW.id_usuario) THEN
            RAISE EXCEPTION 'La clave foránea id_usuario no existe en Usuario';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM Compania WHERE id_compania = NEW.id_compania) THEN
            RAISE EXCEPTION 'La clave foránea id_compania no existe en Compania';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER check_fk_before_insert_usuario_asignado
        BEFORE INSERT OR UPDATE ON UsuarioAsignado
        FOR EACH ROW EXECUTE FUNCTION check_fk_usuario_asignado();
      `);

      // Integridad referencial para la tabla Fonograma
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION check_fk_fonograma()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM Repertorio WHERE id_repertorio = NEW.id_repertorio) THEN
            RAISE EXCEPTION 'La clave foránea id_repertorio no existe en Repertorio';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER check_fk_before_insert_fonograma
        BEFORE INSERT OR UPDATE ON Fonograma
        FOR EACH ROW EXECUTE FUNCTION check_fk_fonograma();
      `);

      // Integridad referencial para la tabla Conflicto
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION check_fk_conflicto()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM Fonograma WHERE id_fonograma = NEW.id_fonograma) THEN
            RAISE EXCEPTION 'La clave foránea id_fonograma no existe en Fonograma';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER check_fk_before_insert_conflicto
        BEFORE INSERT OR UPDATE ON Conflicto
        FOR EACH ROW EXECUTE FUNCTION check_fk_conflicto();
      `);

      // Integridad referencial para la tabla ISRC
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION check_fk_isrc()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM Fonograma WHERE id_fonograma = NEW.id_fonograma) THEN
            RAISE EXCEPTION 'La clave foránea id_fonograma no existe en Fonograma';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER check_fk_before_insert_isrc
        BEFORE INSERT OR UPDATE ON ISRC
        FOR EACH ROW EXECUTE FUNCTION check_fk_isrc();
      `);

      // Integridad referencial para la tabla Documento
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION check_fk_documento()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM Tramite WHERE id_tramite = NEW.id_tramite) THEN
            RAISE EXCEPTION 'La clave foránea id_tramite no existe en Tramite';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER check_fk_before_insert_documento
        BEFORE INSERT OR UPDATE ON Documento
        FOR EACH ROW EXECUTE FUNCTION check_fk_documento();
      `);

      // Integridad referencial para la tabla Pago
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION check_fk_pago()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM Usuario WHERE id_usuario = NEW.id_usuario) THEN
            RAISE EXCEPTION 'La clave foránea id_usuario no existe en Usuario';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER check_fk_before_insert_pago
        BEFORE INSERT OR UPDATE ON Pago
        FOR EACH ROW EXECUTE FUNCTION check_fk_pago();
      `);

      // Integridad referencial para la tabla TitularFonograma
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION check_fk_titular_fonograma()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM Fonograma WHERE id_fonograma = NEW.id_fonograma) THEN
            RAISE EXCEPTION 'La clave foránea id_fonograma no existe en Fonograma';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM Compania WHERE id_compania = NEW.id_titular) THEN
            RAISE EXCEPTION 'La clave foránea id_titular no existe en Compania';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER check_fk_before_insert_titular_fonograma
        BEFORE INSERT OR UPDATE ON TitularFonograma
        FOR EACH ROW EXECUTE FUNCTION check_fk_titular_fonograma();
      `);

      console.log('Triggers de integridad referencial creados correctamente.');
    } catch (error) {
      console.error('Error en la creación de triggers de integridad referencial:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS check_fk_before_insert_usuario_asignado ON UsuarioAsignado;
        DROP FUNCTION IF EXISTS check_fk_usuario_asignado;
        DROP TRIGGER IF EXISTS check_fk_before_insert_fonograma ON Fonograma;
        DROP FUNCTION IF EXISTS check_fk_fonograma;
        DROP TRIGGER IF EXISTS check_fk_before_insert_conflicto ON Conflicto;
        DROP FUNCTION IF EXISTS check_fk_conflicto;
        DROP TRIGGER IF EXISTS check_fk_before_insert_isrc ON ISRC;
        DROP FUNCTION IF EXISTS check_fk_isrc;
        DROP TRIGGER IF EXISTS check_fk_before_insert_documento ON Documento;
        DROP FUNCTION IF EXISTS check_fk_documento;
        DROP TRIGGER IF EXISTS check_fk_before_insert_pago ON Pago;
        DROP FUNCTION IF EXISTS check_fk_pago;
        DROP TRIGGER IF EXISTS check_fk_before_insert_titular_fonograma ON TitularFonograma;
        DROP FUNCTION IF EXISTS check_fk_titular_fonograma;
      `);

      console.log('Triggers y funciones de integridad referencial eliminados correctamente.');
    } catch (error) {
      console.error('Error al eliminar los triggers de integridad referencial:', error);
      throw error;
    }
  },
};
