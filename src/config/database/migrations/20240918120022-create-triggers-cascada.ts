'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Función para eliminación en cascada de dependientes
      const cascadeDeleteDependentsFunction = `
        CREATE OR REPLACE FUNCTION cascade_delete_dependents()
        RETURNS TRIGGER AS $$
        BEGIN
          DELETE FROM ComentarioConflicto WHERE id_conflicto = OLD.id_conflicto;
          DELETE FROM Involucrados WHERE id_conflicto = OLD.id_conflicto;
          RETURN OLD;
        END;
        $$ LANGUAGE plpgsql;
      `;

      await queryInterface.sequelize.query(cascadeDeleteDependentsFunction);

      // Triggers de eliminación en cascada para cada tabla crítica
      const cascadeTriggers = [
        {
          table: 'Conflicto',
          dependents: ['ComentarioConflicto', 'Involucrados'],
          foreignKey: 'id_conflicto',
        },
        { table: 'Fonograma', dependents: ['ISRC', 'Conflicto'], foreignKey: 'id_fonograma' },
        { table: 'Repertorio', dependents: ['Fonograma'], foreignKey: 'id_repertorio' },
        { table: 'UsuarioAsignado', dependents: [], foreignKey: 'id_usuario_asignado' },
        { table: 'Compania', dependents: ['UsuarioAsignado'], foreignKey: 'id_compania' },
        {
          table: 'Usuario',
          dependents: ['UsuarioAsignado', 'Repertorio', 'Consulta'],
          foreignKey: 'id_usuario',
        },
        { table: 'Tramite', dependents: ['Documento'], foreignKey: 'id_tramite' },
        { table: 'TipoCompania', dependents: ['Compania'], foreignKey: 'id_tipo_compania' },
        { table: 'TipoPersona', dependents: ['Usuario'], foreignKey: 'id_tipo_persona' },
        { table: 'Estado', dependents: ['Usuario', 'Conflicto'], foreignKey: 'id_estado' },
        { table: 'Pago', dependents: [], foreignKey: 'id_pago' },
        { table: 'CuentaCorriente', dependents: [], foreignKey: 'id_cuenta_corriente' },
        { table: 'Sesion', dependents: [], foreignKey: 'id_sesion' },
        { table: 'Archivo', dependents: [], foreignKey: 'id_archivo' },
        { table: 'Reporte', dependents: [], foreignKey: 'id_reporte' },
        { table: 'AltaMasivaTemp', dependents: [], foreignKey: 'id_temporal' },
        { table: 'Consulta', dependents: [], foreignKey: 'id_consulta' },
        { table: 'TitularFonograma', dependents: [], foreignKey: 'id_titular_fonograma' },
        { table: 'PostulacionPremio', dependents: [], foreignKey: 'id_postulacion' },
      ];

      for (const trigger of cascadeTriggers) {
        const { table, dependents, foreignKey } = trigger;
        let deleteStatements = '';

        for (const dependent of dependents) {
          deleteStatements += `DELETE FROM ${dependent} WHERE ${foreignKey} = OLD.${foreignKey};\n`;
        }

        await queryInterface.sequelize.query(`
          CREATE OR REPLACE FUNCTION cascade_delete_dependents_${table.toLowerCase()}()
          RETURNS TRIGGER AS $$
          BEGIN
            ${deleteStatements}
            RETURN OLD;
          END;
          $$ LANGUAGE plpgsql;

          CREATE TRIGGER cascade_delete_dependents_${table.toLowerCase()}_trigger
          AFTER DELETE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION cascade_delete_dependents_${table.toLowerCase()}();
        `);
      }

      console.log('Triggers de eliminación en cascada creados correctamente.');
    } catch (error) {
      console.error('Error en la creación de triggers de eliminación en cascada:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      const cascadeTriggers = [
        'Conflicto',
        'Fonograma',
        'Repertorio',
        'UsuarioAsignado',
        'Compania',
        'Usuario',
        'Tramite',
        'TipoCompania',
        'TipoPersona',
        'Estado',
        'Pago',
        'CuentaCorriente',
        'Sesion',
        'Archivo',
        'Reporte',
        'AltaMasivaTemp',
        'Consulta',
        'TitularFonograma',
        'PostulacionPremio',
      ];

      for (const table of cascadeTriggers) {
        await queryInterface.sequelize.query(`
          DROP TRIGGER IF EXISTS cascade_delete_dependents_${table.toLowerCase()}_trigger ON ${table};
          DROP FUNCTION IF EXISTS cascade_delete_dependents_${table.toLowerCase()};
        `);
      }

      await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS cascade_delete_dependents;`);

      console.log('Triggers y funciones de eliminación en cascada eliminados correctamente.');
    } catch (error) {
      console.error('Error al eliminar los triggers de eliminación en cascada:', error);
      throw error;
    }
  },
};