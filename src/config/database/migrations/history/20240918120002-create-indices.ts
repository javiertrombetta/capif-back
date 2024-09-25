'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    try {
      await queryInterface.addIndex('Estado', ['tipo_estado_id'], {
        name: 'idx_estado_tipo_estado_id',
      });

      await queryInterface.addIndex('Usuario', ['email'], {
        unique: true,
        name: 'idx_usuario_email',
      });
      await queryInterface.addIndex('Usuario', ['cuit'], {
        unique: true,
        name: 'idx_usuario_cuit',
      });
      await queryInterface.addIndex('Usuario', ['rol_id'], { name: 'idx_usuario_rol_id' });
      await queryInterface.addIndex('Usuario', ['estado_id'], { name: 'idx_usuario_estado_id' });

      await queryInterface.addIndex('Usuario', ['tipo_persona_id'], {
        name: 'idx_usuario_tipo_persona_id',
      });

      await queryInterface.addIndex('Compania', ['email'], {
        unique: true,
        name: 'idx_compania_email',
      });
      await queryInterface.addIndex('Compania', ['cuit'], {
        unique: true,
        name: 'idx_compania_cuit',
      });
      await queryInterface.addIndex('Compania', ['tipo_compania_id'], {
        name: 'idx_compania_tipo_compania_id',
      });
      await queryInterface.addIndex('Compania', ['estado_id'], { name: 'idx_compania_estado_id' });
   
      await queryInterface.addIndex('UsuarioAsignado', ['id_usuario'], {
        name: 'idx_usuario_asignado_id_usuario',
      });
      await queryInterface.addIndex('UsuarioAsignado', ['id_compania'], {
        name: 'idx_usuario_asignado_id_compania',
      });

      await queryInterface.addIndex('Repertorio', ['id_usuario'], {
        name: 'idx_repertorio_id_usuario',
      });
  
      await queryInterface.addIndex('Fonograma', ['id_repertorio'], {
        name: 'idx_fonograma_id_repertorio',
      });
      await queryInterface.addIndex('Fonograma', ['estado_id'], {
        name: 'idx_fonograma_estado_id',
      });

      await queryInterface.addIndex('ISRC', ['codigo_isrc'], {
        unique: true,
        name: 'idx_isrc_codigo_isrc',
      });

      await queryInterface.addIndex('Conflicto', ['id_fonograma'], {
        name: 'idx_conflicto_id_fonograma',
      });
      await queryInterface.addIndex('Conflicto', ['estado_id'], {
        name: 'idx_conflicto_estado_id',
      });

      await queryInterface.addIndex('ComentarioConflicto', ['id_conflicto'], {
        name: 'idx_comentario_conflicto_id_conflicto',
      });

      await queryInterface.addIndex('Consulta', ['id_usuario'], {
        name: 'idx_consulta_id_usuario',
      });
      await queryInterface.addIndex('Consulta', ['estado_id'], { name: 'idx_consulta_estado_id' });

      await queryInterface.addIndex('Tramite', ['id_usuario'], { name: 'idx_tramite_id_usuario' });
      await queryInterface.addIndex('Tramite', ['estado_id'], { name: 'idx_tramite_estado_id' });

      await queryInterface.addIndex('Documento', ['id_tramite'], {
        name: 'idx_documento_id_tramite',
      });

      await queryInterface.addIndex('AltaMasivaTemp', ['id_usuario'], {
        name: 'idx_alta_masiva_temp_id_usuario',
      });
      await queryInterface.addIndex('AltaMasivaTemp', ['id_repertorio'], {
        name: 'idx_alta_masiva_temp_id_repertorio',
      });

      await queryInterface.addIndex('Reporte', ['id_usuario'], { name: 'idx_reporte_id_usuario' });

      await queryInterface.addIndex('Pago', ['id_usuario'], { name: 'idx_pago_id_usuario' });

      await queryInterface.addIndex('CuentaCorriente', ['id_usuario'], {
        name: 'idx_cuenta_corriente_id_usuario',
      });
 
      await queryInterface.addIndex('Archivo', ['id_usuario'], { name: 'idx_archivo_id_usuario' });
  
      await queryInterface.addIndex('Sesion', ['id_usuario'], { name: 'idx_sesion_id_usuario' });
  
      await queryInterface.addIndex('LogActividad', ['id_usuario'], {
        name: 'idx_log_actividad_id_usuario',
      });
   
      await queryInterface.addIndex('AuditoriaCambio', ['id_usuario'], {
        name: 'idx_auditoria_cambio_id_usuario',
      });

      await queryInterface.addIndex('TitularFonograma', ['id_fonograma'], {
        name: 'idx_titular_fonograma_id_fonograma',
      });
      await queryInterface.addIndex('TitularFonograma', ['id_titular'], {
        name: 'idx_titular_fonograma_id_titular',
      });

      await queryInterface.addIndex('Involucrados', ['id_conflicto'], {
        name: 'idx_involucrados_id_conflicto',
      });
      await queryInterface.addIndex('Involucrados', ['id_titular'], {
        name: 'idx_involucrados_id_titular',
      });

      await queryInterface.addIndex('DecisionInvolucrados', ['id_involucrado'], {
        name: 'idx_decision_involucrados_id_involucrado',
      });
 
      await queryInterface.addIndex('PostulacionPremio', ['id_compania'], {
        name: 'idx_postulacion_premio_id_compania',
      });
      await queryInterface.addIndex('PostulacionPremio', ['id_usuario'], {
        name: 'idx_postulacion_premio_id_usuario',
      });

      console.log('Índices creados correctamente.');
    } catch (error) {
      console.error('Error en la creación de índices:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _sequelize: Sequelize) => {
    try {
      await queryInterface.removeIndex('Estado', 'idx_estado_tipo_estado_id');

      await queryInterface.removeIndex('Usuario', 'idx_usuario_email');
      await queryInterface.removeIndex('Usuario', 'idx_usuario_cuit');
      await queryInterface.removeIndex('Usuario', 'idx_usuario_rol_id');
      await queryInterface.removeIndex('Usuario', 'idx_usuario_estado_id');
      await queryInterface.removeIndex('Usuario', 'idx_usuario_tipo_persona_id');

      await queryInterface.removeIndex('Compania', 'idx_compania_email');
      await queryInterface.removeIndex('Compania', 'idx_compania_cuit');
      await queryInterface.removeIndex('Compania', 'idx_compania_tipo_compania_id');
      await queryInterface.removeIndex('Compania', 'idx_compania_estado_id');

      await queryInterface.removeIndex('UsuarioAsignado', 'idx_usuario_asignado_id_usuario');
      await queryInterface.removeIndex('UsuarioAsignado', 'idx_usuario_asignado_id_compania');
 
      await queryInterface.removeIndex('Repertorio', 'idx_repertorio_id_usuario');

      await queryInterface.removeIndex('Fonograma', 'idx_fonograma_id_repertorio');
      await queryInterface.removeIndex('Fonograma', 'idx_fonograma_estado_id');

      await queryInterface.removeIndex('ISRC', 'idx_isrc_codigo_isrc');

      await queryInterface.removeIndex('Conflicto', 'idx_conflicto_id_fonograma');
      await queryInterface.removeIndex('Conflicto', 'idx_conflicto_estado_id');

      await queryInterface.removeIndex(
        'ComentarioConflicto',
        'idx_comentario_conflicto_id_conflicto'
      );

      await queryInterface.removeIndex('Consulta', 'idx_consulta_id_usuario');
      await queryInterface.removeIndex('Consulta', 'idx_consulta_estado_id');

      await queryInterface.removeIndex('Tramite', 'idx_tramite_id_usuario');
      await queryInterface.removeIndex('Tramite', 'idx_tramite_estado_id');

      await queryInterface.removeIndex('Documento', 'idx_documento_id_tramite');

      await queryInterface.removeIndex('AltaMasivaTemp', 'idx_alta_masiva_temp_id_usuario');
      await queryInterface.removeIndex('AltaMasivaTemp', 'idx_alta_masiva_temp_id_repertorio');

      await queryInterface.removeIndex('Reporte', 'idx_reporte_id_usuario');

      await queryInterface.removeIndex('Pago', 'idx_pago_id_usuario');

      await queryInterface.removeIndex('CuentaCorriente', 'idx_cuenta_corriente_id_usuario');

      await queryInterface.removeIndex('Archivo', 'idx_archivo_id_usuario');

      await queryInterface.removeIndex('Sesion', 'idx_sesion_id_usuario');

      await queryInterface.removeIndex('LogActividad', 'idx_log_actividad_id_usuario');

      await queryInterface.removeIndex('AuditoriaCambio', 'idx_auditoria_cambio_id_usuario');

      await queryInterface.removeIndex('TitularFonograma', 'idx_titular_fonograma_id_fonograma');
      await queryInterface.removeIndex('TitularFonograma', 'idx_titular_fonograma_id_titular');

      await queryInterface.removeIndex('Involucrados', 'idx_involucrados_id_conflicto');
      await queryInterface.removeIndex('Involucrados', 'idx_involucrados_id_titular');

      await queryInterface.removeIndex(
        'DecisionInvolucrados',
        'idx_decision_involucrados_id_involucrado'
      );

      await queryInterface.removeIndex('PostulacionPremio', 'idx_postulacion_premio_id_compania');
      await queryInterface.removeIndex('PostulacionPremio', 'idx_postulacion_premio_id_usuario');

      console.log('Índices eliminados correctamente.');
    } catch (error) {
      console.error('Error al eliminar los índices:', error);
      throw error;
    }
  },
};