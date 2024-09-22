'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
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

        CREATE TRIGGER audit_usuario
        AFTER INSERT OR UPDATE OR DELETE ON Usuario
        FOR EACH ROW EXECUTE FUNCTION audit_changes();
        
        CREATE TRIGGER audit_compania
        AFTER INSERT OR UPDATE OR DELETE ON Compania
        FOR EACH ROW EXECUTE FUNCTION audit_changes();
        
        CREATE TRIGGER audit_fonograma
        AFTER INSERT OR UPDATE OR DELETE ON Fonograma
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_estado
        AFTER INSERT OR UPDATE OR DELETE ON Estado
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_tipo_persona
        AFTER INSERT OR UPDATE OR DELETE ON TipoPersona
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_usuario_asignado
        AFTER INSERT OR UPDATE OR DELETE ON UsuarioAsignado
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_repertorio
        AFTER INSERT OR UPDATE OR DELETE ON Repertorio
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_isrc
        AFTER INSERT OR UPDATE OR DELETE ON ISRC
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_conflicto
        AFTER INSERT OR UPDATE OR DELETE ON Conflicto
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_comentario_conflicto
        AFTER INSERT OR UPDATE OR DELETE ON ComentarioConflicto
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_consulta
        AFTER INSERT OR UPDATE OR DELETE ON Consulta
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_tramite
        AFTER INSERT OR UPDATE OR DELETE ON Tramite
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_documento
        AFTER INSERT OR UPDATE OR DELETE ON Documento
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_alta_masiva_temp
        AFTER INSERT OR UPDATE OR DELETE ON AltaMasivaTemp
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_reporte
        AFTER INSERT OR UPDATE OR DELETE ON Reporte
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_pago
        AFTER INSERT OR UPDATE OR DELETE ON Pago
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_cuenta_corriente
        AFTER INSERT OR UPDATE OR DELETE ON CuentaCorriente
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_archivo
        AFTER INSERT OR UPDATE OR DELETE ON Archivo
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_sesion
        AFTER INSERT OR UPDATE OR DELETE ON Sesion
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_log_actividad
        AFTER INSERT OR UPDATE OR DELETE ON LogActividad
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_titular_fonograma
        AFTER INSERT OR UPDATE OR DELETE ON TitularFonograma
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_involucrados
        AFTER INSERT OR UPDATE OR DELETE ON Involucrados
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_decision_involucrados
        AFTER INSERT OR UPDATE OR DELETE ON DecisionInvolucrados
        FOR EACH ROW EXECUTE FUNCTION audit_changes();

        CREATE TRIGGER audit_postulacion_premio
        AFTER INSERT OR UPDATE OR DELETE ON PostulacionPremio
        FOR EACH ROW EXECUTE FUNCTION audit_changes();
      `);

      console.log('Triggers de auditoría creados correctamente.');
    } catch (error) {
      console.error('Error en la creación de triggers de auditoría:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_usuario ON Usuario;`);
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_compania ON Compania;`);
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_fonograma ON Fonograma;`);
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_estado ON Estado;`);
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_tipo_persona ON TipoPersona;`
      );
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_usuario_asignado ON UsuarioAsignado;`
      );
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_repertorio ON Repertorio;`
      );
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_isrc ON ISRC;`);
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_conflicto ON Conflicto;`);
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_comentario_conflicto ON ComentarioConflicto;`
      );
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_consulta ON Consulta;`);
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_tramite ON Tramite;`);
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_documento ON Documento;`);
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_alta_masiva_temp ON AltaMasivaTemp;`
      );
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_reporte ON Reporte;`);
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_pago ON Pago;`);
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_cuenta_corriente ON CuentaCorriente;`
      );
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_archivo ON Archivo;`);
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS audit_sesion ON Sesion;`);
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_log_actividad ON LogActividad;`
      );
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_titular_fonograma ON TitularFonograma;`
      );
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_involucrados ON Involucrados;`
      );
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_decision_involucrados ON DecisionInvolucrados;`
      );
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS audit_postulacion_premio ON PostulacionPremio;`
      );

      console.log('Triggers de auditoría eliminados correctamente.');
    } catch (error) {
      console.error('Error al eliminar los triggers de auditoría:', error);
      throw error;
    }
  },
};
