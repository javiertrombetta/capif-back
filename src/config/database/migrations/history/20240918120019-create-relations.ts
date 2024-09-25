'use strict';
import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Rol <-> Usuario
    await queryInterface.addConstraint('Usuario', {
      fields: ['rol_id'],
      type: 'foreign key',
      name: 'fk_usuario_rol',
      references: {
        table: 'Rol',
        field: 'id_rol',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // TipoEstado <-> Estado
    await queryInterface.addConstraint('Estado', {
      fields: ['tipo_estado_id'],
      type: 'foreign key',
      name: 'fk_estado_tipo_estado',
      references: {
        table: 'TipoEstado',
        field: 'id_tipo_estado',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Estado <-> Usuario
    await queryInterface.addConstraint('Usuario', {
      fields: ['estado_id'],
      type: 'foreign key',
      name: 'fk_usuario_estado',
      references: {
        table: 'Estado',
        field: 'id_estado',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // TipoPersona <-> Usuario
    await queryInterface.addConstraint('Usuario', {
      fields: ['tipo_persona_id'],
      type: 'foreign key',
      name: 'fk_usuario_tipo_persona',
      references: {
        table: 'TipoPersona',
        field: 'id_tipo_persona',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // TipoCompania <-> Compania
    await queryInterface.addConstraint('Compania', {
      fields: ['tipo_compania_id'],
      type: 'foreign key',
      name: 'fk_compania_tipo_compania',
      references: {
        table: 'TipoCompania',
        field: 'id_tipo_compania',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Estado <-> Compania
    await queryInterface.addConstraint('Compania', {
      fields: ['estado_id'],
      type: 'foreign key',
      name: 'fk_compania_estado',
      references: {
        table: 'Estado',
        field: 'id_estado',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> UsuarioAsignado
    await queryInterface.addConstraint('UsuarioAsignado', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_usuarioasignado_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Compania <-> UsuarioAsignado
    await queryInterface.addConstraint('UsuarioAsignado', {
      fields: ['id_compania'],
      type: 'foreign key',
      name: 'fk_usuarioasignado_compania',
      references: {
        table: 'Compania',
        field: 'id_compania',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> Repertorio
    await queryInterface.addConstraint('Repertorio', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_repertorio_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Repertorio <-> Fonograma
    await queryInterface.addConstraint('Fonograma', {
      fields: ['id_repertorio'],
      type: 'foreign key',
      name: 'fk_fonograma_repertorio',
      references: {
        table: 'Repertorio',
        field: 'id_repertorio',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Fonograma <-> ISRC
    await queryInterface.addConstraint('ISRC', {
      fields: ['id_fonograma'],
      type: 'foreign key',
      name: 'fk_isrc_fonograma',
      references: {
        table: 'Fonograma',
        field: 'id_fonograma',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Fonograma <-> Conflicto
    await queryInterface.addConstraint('Conflicto', {
      fields: ['id_fonograma'],
      type: 'foreign key',
      name: 'fk_conflicto_fonograma',
      references: {
        table: 'Fonograma',
        field: 'id_fonograma',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Conflicto <-> ComentarioConflicto
    await queryInterface.addConstraint('ComentarioConflicto', {
      fields: ['id_conflicto'],
      type: 'foreign key',
      name: 'fk_comentarioconflicto_conflicto',
      references: {
        table: 'Conflicto',
        field: 'id_conflicto',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> Consulta
    await queryInterface.addConstraint('Consulta', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_consulta_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> Tramite
    await queryInterface.addConstraint('Tramite', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_tramite_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Tramite <-> Documento
    await queryInterface.addConstraint('Documento', {
      fields: ['id_tramite'],
      type: 'foreign key',
      name: 'fk_documento_tramite',
      references: {
        table: 'Tramite',
        field: 'id_tramite',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> AltaMasivaTemp
    await queryInterface.addConstraint('AltaMasivaTemp', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_altamasivatemp_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Repertorio <-> AltaMasivaTemp
    await queryInterface.addConstraint('AltaMasivaTemp', {
      fields: ['id_repertorio'],
      type: 'foreign key',
      name: 'fk_altamasivatemp_repertorio',
      references: {
        table: 'Repertorio',
        field: 'id_repertorio',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> Reporte
    await queryInterface.addConstraint('Reporte', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_reporte_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> Pago
    await queryInterface.addConstraint('Pago', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_pago_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> CuentaCorriente
    await queryInterface.addConstraint('CuentaCorriente', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_cuentacorriente_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> Archivo
    await queryInterface.addConstraint('Archivo', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_archivo_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> Sesion
    await queryInterface.addConstraint('Sesion', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_sesion_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> LogActividad
    await queryInterface.addConstraint('LogActividad', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_logactividad_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> AuditoriaCambio
    await queryInterface.addConstraint('AuditoriaCambio', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_auditoriacambio_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> ErroresInsercion
    await queryInterface.addConstraint('ErroresInsercion', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_erroresinsercion_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Fonograma <-> TitularFonograma
    await queryInterface.addConstraint('TitularFonograma', {
      fields: ['id_fonograma'],
      type: 'foreign key',
      name: 'fk_titularfonograma_fonograma',
      references: {
        table: 'Fonograma',
        field: 'id_fonograma',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Compania <-> TitularFonograma
    await queryInterface.addConstraint('TitularFonograma', {
      fields: ['id_titular'],
      type: 'foreign key',
      name: 'fk_titularfonograma_compania',
      references: {
        table: 'Compania',
        field: 'id_compania',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Conflicto <-> Involucrados
    await queryInterface.addConstraint('Involucrados', {
      fields: ['id_conflicto'],
      type: 'foreign key',
      name: 'fk_involucrados_conflicto',
      references: {
        table: 'Conflicto',
        field: 'id_conflicto',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Compania <-> Involucrados
    await queryInterface.addConstraint('Involucrados', {
      fields: ['id_titular'],
      type: 'foreign key',
      name: 'fk_involucrados_compania',
      references: {
        table: 'Compania',
        field: 'id_compania',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Involucrados <-> DecisionInvolucrados
    await queryInterface.addConstraint('DecisionInvolucrados', {
      fields: ['id_involucrado'],
      type: 'foreign key',
      name: 'fk_decisioninvolucrados_involucrados',
      references: {
        table: 'Involucrados',
        field: 'id_involucrado',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Compania <-> PostulacionPremio
    await queryInterface.addConstraint('PostulacionPremio', {
      fields: ['id_compania'],
      type: 'foreign key',
      name: 'fk_postulacionpremio_compania',
      references: {
        table: 'Compania',
        field: 'id_compania',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Usuario <-> PostulacionPremio
    await queryInterface.addConstraint('PostulacionPremio', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_postulacionpremio_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Estado <-> Tramite
    await queryInterface.addConstraint('Tramite', {
      fields: ['estado_id'],
      type: 'foreign key',
      name: 'fk_tramite_estado',
      references: {
        table: 'Estado',
        field: 'id_estado',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint('Usuario', 'fk_usuario_rol');
    await queryInterface.removeConstraint('Usuario', 'fk_usuario_estado');
    await queryInterface.removeConstraint('Estado', 'fk_estado_tipo_estado');
    await queryInterface.removeConstraint('Usuario', 'fk_usuario_tipo_persona');
    await queryInterface.removeConstraint('Compania', 'fk_compania_tipo_compania');
    await queryInterface.removeConstraint('Compania', 'fk_compania_estado');
    await queryInterface.removeConstraint('UsuarioAsignado', 'fk_usuarioasignado_usuario');
    await queryInterface.removeConstraint('UsuarioAsignado', 'fk_usuarioasignado_compania');
    await queryInterface.removeConstraint('Repertorio', 'fk_repertorio_usuario');
    await queryInterface.removeConstraint('Fonograma', 'fk_fonograma_repertorio');
    await queryInterface.removeConstraint('ISRC', 'fk_isrc_fonograma');
    await queryInterface.removeConstraint('Conflicto', 'fk_conflicto_fonograma');
    await queryInterface.removeConstraint(
      'ComentarioConflicto',
      'fk_comentarioconflicto_conflicto'
    );
    await queryInterface.removeConstraint('Consulta', 'fk_consulta_usuario');
    await queryInterface.removeConstraint('Tramite', 'fk_tramite_usuario');
    await queryInterface.removeConstraint('Documento', 'fk_documento_tramite');
    await queryInterface.removeConstraint('AltaMasivaTemp', 'fk_altamasivatemp_usuario');
    await queryInterface.removeConstraint('AltaMasivaTemp', 'fk_altamasivatemp_repertorio');
    await queryInterface.removeConstraint('Reporte', 'fk_reporte_usuario');
    await queryInterface.removeConstraint('Pago', 'fk_pago_usuario');
    await queryInterface.removeConstraint('CuentaCorriente', 'fk_cuentacorriente_usuario');
    await queryInterface.removeConstraint('Archivo', 'fk_archivo_usuario');
    await queryInterface.removeConstraint('Sesion', 'fk_sesion_usuario');
    await queryInterface.removeConstraint('LogActividad', 'fk_logactividad_usuario');
    await queryInterface.removeConstraint('AuditoriaCambio', 'fk_auditoriacambio_usuario');
    await queryInterface.removeConstraint('ErroresInsercion', 'fk_erroresinsercion_usuario');
    await queryInterface.removeConstraint('TitularFonograma', 'fk_titularfonograma_fonograma');
    await queryInterface.removeConstraint('TitularFonograma', 'fk_titularfonograma_compania');
    await queryInterface.removeConstraint('Involucrados', 'fk_involucrados_conflicto');
    await queryInterface.removeConstraint('Involucrados', 'fk_involucrados_compania');
    await queryInterface.removeConstraint(
      'DecisionInvolucrados',
      'fk_decisioninvolucrados_involucrados'
    );
    await queryInterface.removeConstraint('PostulacionPremio', 'fk_postulacionpremio_compania');
    await queryInterface.removeConstraint('PostulacionPremio', 'fk_postulacionpremio_usuario');
    await queryInterface.removeConstraint('Tramite', 'fk_tramite_estado');
  },
};
