'use strict';

import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {    
    await queryInterface.createTable('Rol', {
      id_rol: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    });
      

    await queryInterface.createTable('TipoEstado', {
      id_tipo_estado: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    });

    await queryInterface.createTable('Estado', {
      id_estado: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      tipo_estado_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'TipoEstado',
          key: 'id_tipo_estado',
        },
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.createTable('TipoPersona', {
      id_tipo_persona: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    });

    await queryInterface.createTable('Usuario', {
      id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          is: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        },
      },
      clave: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      rol_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Rol',
          key: 'id_rol',
        },
        onDelete: 'CASCADE',
      },
      fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      estado_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
      cuit: {
        type: DataTypes.CHAR(11),
        allowNull: false,
        unique: true,
        validate: {
          is: /^[0-9]{11}$/,
        },
      },
      tipo_persona_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'TipoPersona',
          key: 'id_tipo_persona',
        },
        onDelete: 'CASCADE',
      },
      domicilio: {
        type: DataTypes.STRING(200),
      },
      ciudad: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      provincia: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      pais: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING(50),
      },
      registro_pendiente: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    });    

    await queryInterface.createTable('TipoCompania', {
      id_tipo_compania: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    });

    await queryInterface.createTable('Compania', {
      id_compania: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre_compania: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      direccion: {
        type: DataTypes.STRING(200),
      },
      telefono: {
        type: DataTypes.STRING(50),
      },
      email: {
        type: DataTypes.STRING(150),
        unique: true,
        validate: {
          is: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        },
      },
      cuit: {
        type: DataTypes.CHAR(11),
        allowNull: false,
        unique: true,
      },
      tipo_compania_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'TipoCompania',
          key: 'id_tipo_compania',
        },
        onDelete: 'CASCADE',
      },
      estado_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
    });

    await queryInterface.createTable('UsuarioAsignado', {
      id_usuario_asignado: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
        onDelete: 'CASCADE',
      },
      id_compania: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Compania',
          key: 'id_compania',
        },
        onDelete: 'CASCADE',
      },
      fecha_asignacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Repertorio', {
      id_repertorio: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      titulo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      tipo: {
        type: DataTypes.STRING(50),
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });    
    
    await queryInterface.createTable('Fonograma', {
      id_fonograma: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_repertorio: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Repertorio',
          key: 'id_repertorio',
        },
        onDelete: 'CASCADE',
      },
      titulo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      artista: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },      
      duracion: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      fecha_lanzamiento: {
        type: DataTypes.DATE,
      },
      tipo: {
        type: DataTypes.STRING(50),
      },
      estado_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
    });

    await queryInterface.createTable('ISRC', {
      id_isrc: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_fonograma: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Fonograma',
          key: 'id_fonograma',
        },
        onDelete: 'CASCADE',
      },
      codigo_isrc: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          is: /^[A-Z]{2}[0-9A-Z]{3}[0-9]{2}[0-9]{5}$/,
        },
      },
      tipo: {
        type: DataTypes.ENUM('audio', 'video'),
        allowNull: false,
      },
    });

    await queryInterface.addColumn('Fonograma', 'id_isrc', {
      type: DataTypes.INTEGER,
      references: {
        model: 'ISRC',
        key: 'id_isrc',
      },
      onDelete: 'SET NULL',
    });

    await queryInterface.createTable('Conflicto', {
      id_conflicto: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_fonograma: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Fonograma',
          key: 'id_fonograma',
        },
        onDelete: 'CASCADE',
      },
      tipo_conflicto: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      estado_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      fecha_resolucion: {
        type: DataTypes.DATE,
      },
    });

    await queryInterface.createTable('ComentarioConflicto', {
      id_comentario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_conflicto: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Conflicto',
          key: 'id_conflicto',
        },
        onDelete: 'CASCADE',
      },
      comentario: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Consulta', {
      id_consulta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      asunto: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      mensaje: {
        type: DataTypes.TEXT,
      },
      fecha_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      estado_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
    });

    await queryInterface.createTable('Tramite', {
      id_tramite: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      tipo_tramite: {
        type: DataTypes.STRING(100),
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      estado_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
    });

    await queryInterface.createTable('Documento', {
      id_documento: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_tramite: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Tramite',
          key: 'id_tramite',
        },
      },
      nombre_documento: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      tipo_documento: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      ruta_documento: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fecha_subida: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });    

    await queryInterface.createTable('AltaMasivaTemp', {
      id_temporal: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      id_repertorio: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Repertorio',
          key: 'id_repertorio',
        },
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      procesado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    });

    await queryInterface.createTable('Reporte', {
      id_reporte: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      tipo_reporte: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      fecha_generacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      ruta_archivo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    });

    await queryInterface.createTable('Pago', {
      id_pago: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      fecha_pago: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      metodo_pago: {
        type: DataTypes.STRING(50),
      },
      referencia: {
        type: DataTypes.STRING(100),
      },
    });

    await queryInterface.createTable('CuentaCorriente', {
      id_cuenta_corriente: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      saldo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Archivo', {
      id_archivo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      nombre_archivo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      tipo_archivo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      ruta_archivo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fecha_subida: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });    

    await queryInterface.createTable('Sesion', {
      id_sesion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      fecha_fin: {
        type: DataTypes.DATE,
      },
      ip: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    });

    await queryInterface.createTable('LogActividad', {
      id_log: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      actividad: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      ip_origen: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      navegador: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    });

    await queryInterface.createTable('AuditoriaCambio', {
      id_auditoria: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      tabla_afectada: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      operacion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    });

    await queryInterface.createTable('ErroresInsercion', {
      id_error: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tabla_afectada: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descripcion_error: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fecha_error: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Regla', {
      id_regla: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    });

    await queryInterface.createTable('TitularFonograma', {
      id_titular_fonograma: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_fonograma: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Fonograma',
          key: 'id_fonograma',
        },
        onDelete: 'CASCADE',
      },
      id_titular: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Compania',
          key: 'id_compania',
        },
        onDelete: 'CASCADE',
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      fecha_hasta: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      porcentaje_titularidad: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100.0,
      },
    });

    await queryInterface.createTable('Involucrados', {
      id_involucrado: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_conflicto: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Conflicto',
          key: 'id_conflicto',
        },
        onDelete: 'CASCADE',
      },
      id_titular: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Compania',
          key: 'id_compania',
        },
        onDelete: 'CASCADE',
      },      
    });

    await queryInterface.createTable('DecisionInvolucrados', {
      id_decision: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_involucrado: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Involucrados',
          key: 'id_involucrado',
        },
        onDelete: 'CASCADE',
      },
      decision: {
        type: DataTypes.ENUM('aceptado', 'rechazado'),
        allowNull: true,
      },
      fecha_decision: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    await queryInterface.createTable('PostulacionPremio', {
      id_postulacion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_compania: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Compania',
          key: 'id_compania',
        },
        onDelete: 'CASCADE',
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
        onDelete: 'CASCADE',
      },
      codigo_postulacion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      fecha_asignacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface: QueryInterface, _sequelize: Sequelize) => {
    await queryInterface.dropTable('PostulacionPremio');
    await queryInterface.dropTable('DecisionInvolucrados');
    await queryInterface.dropTable('Involucrados');
    await queryInterface.dropTable('TitularFonograma');
    await queryInterface.dropTable('Regla');
    await queryInterface.dropTable('ErroresInsercion');
    await queryInterface.dropTable('AuditoriaCambio');
    await queryInterface.dropTable('LogActividad');
    await queryInterface.dropTable('Sesion'); 
    await queryInterface.dropTable('Archivo');
    await queryInterface.dropTable('CuentaCorriente');
    await queryInterface.dropTable('Pago');
    await queryInterface.dropTable('Reporte');
    await queryInterface.dropTable('AltaMasivaTemp');     
    await queryInterface.dropTable('Documento');
    await queryInterface.dropTable('Tramite');
    await queryInterface.dropTable('Consulta');
    await queryInterface.dropTable('ComentarioConflicto');
    await queryInterface.dropTable('Conflicto');
    await queryInterface.dropTable('ISRC');
    await queryInterface.dropTable('Fonograma');
    await queryInterface.dropTable('Repertorio'); 
    await queryInterface.dropTable('UsuarioAsignado');
    await queryInterface.dropTable('Compania');  
    await queryInterface.dropTable('TipoCompania');
    await queryInterface.dropTable('Usuario');
    await queryInterface.dropTable('TipoPersona');
    await queryInterface.dropTable('Estado');
    await queryInterface.dropTable('TipoEstado');
    await queryInterface.dropTable('Rol');
  },
};
