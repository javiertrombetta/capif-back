'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Manejo de concurrencia
      const preventDuplicateUpdatesFunction = `
        CREATE OR REPLACE FUNCTION prevent_duplicate_updates()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (OLD.updated_at = NEW.updated_at) THEN
            RAISE EXCEPTION 'El registro ya ha sido modificado por otro proceso';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;

      await queryInterface.sequelize.query(preventDuplicateUpdatesFunction);

      // Triggers para cada tabla
      const tables = [
        'Usuario',
        'Compania',
        'Fonograma',
        'Estado',
        'TipoPersona',
        'UsuarioAsignado',
        'Repertorio',
        'ISRC',
        'Conflicto',
        'ComentarioConflicto',
        'Consulta',
        'Tramite',
        'Documento',
        'AltaMasivaTemp',
        'Reporte',
        'Pago',
        'CuentaCorriente',
        'Archivo',
        'Sesion',
        'LogActividad',
        'AuditoriaCambio',
        'ErroresInsercion',
        'Regla',
        'TitularFonograma',
        'Involucrados',
        'DecisionInvolucrados',
        'PostulacionPremio',
      ];

      for (const table of tables) {
        await queryInterface.sequelize.query(`
          CREATE TRIGGER prevent_duplicate_updates_${table.toLowerCase()}
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_updates();
        `);
      }

      console.log('Triggers para manejo de concurrencia creados correctamente.');
    } catch (error) {
      console.error('Error en la creación de triggers de manejo de concurrencia:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      const tables = [
        'Usuario',
        'Compania',
        'Fonograma',
        'Estado',
        'TipoPersona',
        'UsuarioAsignado',
        'Repertorio',
        'ISRC',
        'Conflicto',
        'ComentarioConflicto',
        'Consulta',
        'Tramite',
        'Documento',
        'AltaMasivaTemp',
        'Reporte',
        'Pago',
        'CuentaCorriente',
        'Archivo',
        'Sesion',
        'LogActividad',
        'AuditoriaCambio',
        'ErroresInsercion',
        'Regla',
        'TitularFonograma',
        'Involucrados',
        'DecisionInvolucrados',
        'PostulacionPremio',
      ];

      for (const table of tables) {
        await queryInterface.sequelize.query(`
          DROP TRIGGER IF EXISTS prevent_duplicate_updates_${table.toLowerCase()} ON ${table};
        `);
      }

      await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS prevent_duplicate_updates;`);

      console.log('Triggers de manejo de concurrencia eliminados correctamente.');
    } catch (error) {
      console.error('Error al eliminar los triggers de manejo de concurrencia:', error);
      throw error;
    }
  },
};
