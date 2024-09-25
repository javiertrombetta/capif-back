'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Registrar actividad de los usuarios
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION registrar_actividad(id_usuario_param INTEGER, actividad_param TEXT, ip_param TEXT)
        RETURNS VOID AS $$
        BEGIN
          INSERT INTO LogActividad (id_usuario, actividad, fecha, ip_origen, navegador)
          VALUES (id_usuario_param, actividad_param, NOW(), ip_param, 'NavegadorDesconocido');
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Triggers para registrar actividad en las tablas clave
      const activityTriggers = [
        { table: 'Usuario', actividad: 'Modificación de Usuario' },
        { table: 'Compania', actividad: 'Modificación de Compañía' },
        { table: 'Fonograma', actividad: 'Modificación de Fonograma' },
        { table: 'ISRC', actividad: 'Modificación de ISRC' },
        { table: 'Conflicto', actividad: 'Modificación de Conflicto' },
        { table: 'ComentarioConflicto', actividad: 'Comentario sobre Conflicto' },
        { table: 'Consulta', actividad: 'Consulta realizada' },
        { table: 'Tramite', actividad: 'Modificación de Trámite' },
        { table: 'Documento', actividad: 'Subida de Documento' },
        { table: 'AltaMasivaTemp', actividad: 'Alta Masiva' },
        { table: 'Reporte', actividad: 'Generación de Reporte' },
        { table: 'Pago', actividad: 'Registro de Pago' },
        { table: 'CuentaCorriente', actividad: 'Actualización de Saldo' },
        { table: 'Sesion', actividad: 'Inicio de Sesión' },
        { table: 'Archivo', actividad: 'Subida de Archivo' },
        { table: 'LogActividad', actividad: 'Registro de Actividad' },
        { table: 'AuditoriaCambio', actividad: 'Cambio Auditoría' },
        { table: 'ErroresInsercion', actividad: 'Error de Inserción' },
        { table: 'Regla', actividad: 'Modificación de Regla' },
        { table: 'TitularFonograma', actividad: 'Modificación de Titularidad' },
        { table: 'Involucrados', actividad: 'Modificación de Involucrados' },
        { table: 'DecisionInvolucrados', actividad: 'Decisión sobre Involucrados' },
        { table: 'PostulacionPremio', actividad: 'Postulación a Premio' },
        { table: 'Rol', actividad: 'Modificación de Rol' },
        { table: 'Estado', actividad: 'Modificación de Estado' },
        { table: 'TipoPersona', actividad: 'Modificación de Tipo de Persona' },
        { table: 'TipoEstado', actividad: 'Modificación de Tipo de Estado' },
        { table: 'TipoCompania', actividad: 'Modificación de Tipo de Compañía' },
      ];

      for (const trigger of activityTriggers) {
        await queryInterface.sequelize.query(`
          CREATE TRIGGER registrar_actividad_${trigger.table.toLowerCase()}_trigger
          AFTER INSERT OR UPDATE OR DELETE ON ${trigger.table}
          FOR EACH ROW EXECUTE FUNCTION registrar_actividad(NEW.id_usuario, '${
            trigger.actividad
          }', '127.0.0.1');
        `);
      }

      console.log('Triggers para registrar actividad en las 30 tablas creados correctamente.');
    } catch (error) {
      console.error('Error en la creación de triggers de registro de actividad:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      const activityTriggers = [
        'Usuario',
        'Compania',
        'Fonograma',
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
        'Sesion',
        'Archivo',
        'LogActividad',
        'AuditoriaCambio',
        'ErroresInsercion',
        'Regla',
        'TitularFonograma',
        'Involucrados',
        'DecisionInvolucrados',
        'PostulacionPremio',
        'Rol',
        'Estado',
        'TipoPersona',
        'TipoEstado',
        'TipoCompania',
      ];

      for (const table of activityTriggers) {
        await queryInterface.sequelize.query(`
          DROP TRIGGER IF EXISTS registrar_actividad_${table.toLowerCase()}_trigger ON ${table};
        `);
      }

      await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS registrar_actividad;`);

      console.log('Triggers y función de registro de actividad eliminados correctamente.');
    } catch (error) {
      console.error('Error al eliminar los triggers de registro de actividad:', error);
      throw error;
    }
  },
};
