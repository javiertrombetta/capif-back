'use strict';

import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.createTable('Rol', {
      id_rol: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoEstado', {
      id_tipo_estado: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Estado', {
      id_estado: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      tipo_estado_id: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoEstado',
          key: 'id_tipo_estado',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoPersona', {
      id_tipo_persona: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Usuario', {
      id_usuario: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: {
            args: [2, 100],
            msg: 'El apellido debe tener entre 2 y 100 caracteres.',
          },
          is: {
            args: /^[A-Za-zÀ-ÿ\s]+$/,
            msg: 'El apellido solo debe contener letras y espacios.',
          },
        },
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: {
            args: [2, 100],
            msg: 'El apellido debe tener entre 2 y 100 caracteres.',
          },
          is: {
            args: /^[A-Za-zÀ-ÿ\s]+$/,
            msg: 'El apellido solo debe contener letras y espacios.',
          },
        },
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
        type: DataTypes.UUID,
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
        type: DataTypes.UUID,
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
        type: DataTypes.UUID,
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
      codigo_postal: {
        type: DataTypes.STRING(20),
        allowNull: false,        
      },
      telefono: {
        type: DataTypes.STRING(50),
      },
      isRegistro_pendiente: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      email_verification_token: {
        type: DataTypes.STRING(256),
        allowNull: true,
      },
      email_verification_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reset_password_token: {
        type: DataTypes.STRING(256),
        allowNull: true,
      },
      reset_password_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isHabilitado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      intentos_fallidos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoCompania', {
      id_tipo_compania: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Compania', {
      id_compania: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
        type: DataTypes.UUID,
        references: {
          model: 'TipoCompania',
          key: 'id_tipo_compania',
        },
        onDelete: 'CASCADE',
      },
      estado_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('UsuarioAsignado', {
      id_usuario_asignado: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
        onDelete: 'CASCADE',
      },
      id_compania: {
        type: DataTypes.UUID,
        references: {
          model: 'Compania',
          key: 'id_compania',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoRepertorio', {
      id_tipo_repertorio: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Repertorio', {
      id_repertorio: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      titulo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      id_tipo_repertorio: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoRepertorio',
          key: 'id_tipo_repertorio',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      estado_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoFonograma', {
      id_tipo_fonograma: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Fonograma', {
      id_fonograma: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_repertorio: {
        type: DataTypes.UUID,
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
      id_tipo_fonograma: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoFonograma',
          key: 'id_tipo_fonograma',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      estado_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoISRC', {
      id_tipo_isrc: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });


    await queryInterface.createTable('ISRC', {
      id_isrc: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_fonograma: {
        type: DataTypes.UUID,
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
      id_tipo_isrc: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoISRC',
          key: 'id_tipo_isrc',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addColumn('Fonograma', 'id_isrc', {
      type: DataTypes.UUID,
      references: {
        model: 'ISRC',
        key: 'id_isrc',
      },
      onDelete: 'SET NULL',
    });

    await queryInterface.createTable('TipoConflicto', {
      id_tipo_conflicto: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Conflicto', {
      id_conflicto: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_fonograma: {
        type: DataTypes.UUID,
        references: {
          model: 'Fonograma',
          key: 'id_fonograma',
        },
        onDelete: 'CASCADE',
      },
      id_tipo_conflicto: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoConflicto',
          key: 'id_tipo_conflicto',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      estado_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
      fecha_resolucion: {
        type: DataTypes.DATE,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('ComentarioConflicto', {
      id_comentario: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_conflicto: {
        type: DataTypes.UUID,
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Consulta', {
      id_consulta: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
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
      estado_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoTramite', {
      id_tipo_tramite: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Tramite', {
      id_tramite: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      id_tipo_tramite: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoTramite',
          key: 'id_tipo_tramite',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      estado_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Estado',
          key: 'id_estado',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoDocumento', {
      id_tipo_documento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });


    await queryInterface.createTable('Documento', {
      id_documento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_tramite: {
        type: DataTypes.UUID,
        references: {
          model: 'Tramite',
          key: 'id_tramite',
        },
      },
      nombre_documento: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      id_tipo_documento: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoDocumento',
          key: 'id_tipo_documento',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      ruta_documento: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('AltaMasivaTemp', {
      id_temporal: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      id_repertorio: {
        type: DataTypes.UUID,
        references: {
          model: 'Repertorio',
          key: 'id_repertorio',
        },
      },
      procesado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoReporte', {
      id_tipo_reporte: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Reporte', {
      id_reporte: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      id_tipo_reporte: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoReporte',
          key: 'id_tipo_reporte',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      ruta_archivo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoMetodoPago', {
      id_tipo_metodo_pago: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Pago', {
      id_pago: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
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
      id_tipo_metodo_pago: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoMetodoPago',
          key: 'id_tipo_metodo_pago',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      referencia: {
        type: DataTypes.STRING(100),
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('CuentaCorriente', {
      id_cuenta_corriente: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      saldo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoArchivo', {
      id_tipo_archivo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Archivo', {
      id_archivo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      nombre_archivo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      id_tipo_archivo: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoArchivo',
          key: 'id_tipo_archivo',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      ruta_archivo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Sesion', {
      id_sesion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoActividad', {
      id_tipo_actividad: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoNavegador', {
      id_tipo_navegador: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });


    await queryInterface.createTable('LogActividad', {
      id_log: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
      },
      id_tipo_actividad: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoActividad',
          key: 'id_tipo_actividad',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      ip_origen: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      id_tipo_navegador: {
        type: DataTypes.UUID,
        references: {
          model: 'TipoNavegador',
          key: 'id_tipo_navegador',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('AuditoriaCambio', {
      id_auditoria: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.UUID,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('ErroresInsercion', {
      id_error: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Regla', {
      id_regla: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      isActivo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TitularFonograma', {
      id_titular_fonograma: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_fonograma: {
        type: DataTypes.UUID,
        references: {
          model: 'Fonograma',
          key: 'id_fonograma',
        },
        onDelete: 'CASCADE',
      },
      id_titular: {
        type: DataTypes.UUID,
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('Involucrados', {
      id_involucrado: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_conflicto: {
        type: DataTypes.UUID,
        references: {
          model: 'Conflicto',
          key: 'id_conflicto',
        },
        onDelete: 'CASCADE',
      },
      id_titular: {
        type: DataTypes.UUID,
        references: {
          model: 'Compania',
          key: 'id_compania',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('TipoDecision', {
      id_tipo_decision: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('DecisionInvolucrados', {
      id_decision: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_involucrado: {
        type: DataTypes.UUID,
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('PostulacionPremio', {
      id_postulacion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_compania: {
        type: DataTypes.UUID,
        references: {
          model: 'Compania',
          key: 'id_compania',
        },
        onDelete: 'CASCADE',
      },
      id_usuario: {
        type: DataTypes.UUID,
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface: QueryInterface, _sequelize: Sequelize) => {
    await queryInterface.dropTable('PostulacionPremio');
    await queryInterface.dropTable('DecisionInvolucrados');
    await queryInterface.dropTable('TipoDecision');
    await queryInterface.dropTable('Involucrados');
    await queryInterface.dropTable('TitularFonograma');
    await queryInterface.dropTable('Regla');
    await queryInterface.dropTable('ErroresInsercion');
    await queryInterface.dropTable('AuditoriaCambio');
    await queryInterface.dropTable('LogActividad');
    await queryInterface.dropTable('TipoNavegador');
    await queryInterface.dropTable('TipoActividad');
    await queryInterface.dropTable('Sesion');
    await queryInterface.dropTable('Archivo');
    await queryInterface.dropTable('TipoArchivo');
    await queryInterface.dropTable('CuentaCorriente');
    await queryInterface.dropTable('Pago');
    await queryInterface.dropTable('TipoMetodoPago');
    await queryInterface.dropTable('Reporte');
    await queryInterface.dropTable('TipoReporte');
    await queryInterface.dropTable('AltaMasivaTemp');
    await queryInterface.dropTable('Documento');
    await queryInterface.dropTable('TipoDocumento');
    await queryInterface.dropTable('Tramite');
    await queryInterface.dropTable('TipoTramite');
    await queryInterface.dropTable('Consulta');
    await queryInterface.dropTable('ComentarioConflicto');
    await queryInterface.dropTable('Conflicto');
    await queryInterface.dropTable('TipoConflicto');
    await queryInterface.removeColumn('Fonograma', 'id_isrc');
    await queryInterface.dropTable('ISRC');
    await queryInterface.dropTable('TipoISRC');
    await queryInterface.dropTable('Fonograma');
    await queryInterface.dropTable('TipoFonograma');
    await queryInterface.dropTable('Repertorio');
    await queryInterface.dropTable('TipoRepertorio');
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