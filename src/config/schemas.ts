export const authSchemas = {
  RegisterPrimary: {
    title: 'Autenticación - Registro de Usuario Principal',
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico del nuevo usuario',
        example: 'usuario@dominio.com',
      },
      password: {
        type: 'string',
        description: 'Contraseña del nuevo usuario',
        example: 'ClaveSegura123!',
      },
      nombres_y_apellidos: {
        type: 'string',
        description: 'Nombre y apellido del usuario',
        example: 'Juan Pérez',
      },
      telefono: {
        type: 'string',
        description: 'Número de teléfono del usuario',
        example: '+54 11 1234-5678',
      },
    },
    required: ['email', 'password', 'nombres_y_apellidos'],
  },
  RegisterSecondary: {
    title: 'Autenticación - Registro de Usuario Secundario',
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico del nuevo usuario',
        example: 'usuario@dominio.com',
      },
      nombres_y_apellidos: {
        type: 'string',
        description: 'Nombre y apellido del usuario',
        example: 'Ana García',
      },
      telefono: {
        type: 'string',
        description: 'Número de teléfono del usuario',
        example: '+54 11 8765-4321',
      },
    },
    required: ['email', 'nombres_y_apellidos'],
  },
  Login: {
    title: 'Autenticación - Login',
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico del usuario',
        example: 'usuario@dominio.com',
      },
      password: {
        type: 'string',
        description: 'Contraseña del usuario',
        example: 'password123',
      },
    },
    required: ['email', 'password'],
  },
  SelectProductora: {
    title: 'Autenticación - Seleccionar Productora Activa',
    type: 'object',
    properties: {
      productoraId: {
        type: 'string',
        format: 'uuid',
        description: 'ID de la productora activa',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
    required: ['productoraId'],
  },
  RequestPassword: {
    title: 'Autenticación - Solicitar Restablecimiento de Contraseña',
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico para recuperar la contraseña',
        example: 'usuario@dominio.com',
      },
    },
    required: ['email'],
  },
  ValidateEmail: {
    title: 'Autenticación - Validar Correo Electrónico',
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'Token para validar el correo',
        example: '12345abcde',
      },
    },
    required: ['token'],
  },
  ResetPassword: {
    title: 'Autenticación - Restablecer Contraseña',
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'Token para restablecer la contraseña',
        example: 'abc123token',
      },
      newPassword: {
        type: 'string',
        description: 'Nueva contraseña',
        example: 'NuevaClave123!',
      },
    },
    required: ['token', 'newPassword'],
  },
  ChangePassword: {
    title: 'Autenticación - Cambio de Contraseña',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario que cambiará su clave',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      newPassword: {
        type: 'string',
        description: 'Nueva contraseña para este usuario',
        example: 'CambioDeClave123!',
      },
      confirmPassword: {
        type: 'string',
        description: 'Confirmación de la nueva contraseña',
        example: 'CambioDeClave123!',
      },
    },
    required: ['id_usuario', 'newPassword', 'confirmPassword'],
  },
};

export const userSchemas = {
  User: {
    title: 'Usuario',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID único del usuario.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico del usuario.',
        example: 'usuario@dominio.com',
      },
      nombres_y_apellidos: {
        type: 'string',
        description: 'Nombre completo del usuario.',
        example: 'Juan Pérez',
      },
      telefono: {
        type: 'string',
        description: 'Número de teléfono del usuario.',
        example: '+54 11 1234-5678',
      },
      estado: {
        type: 'string',
        enum: ['HABILITADO', 'DESHABILITADO', 'PENDIENTE', 'NUEVO'],
        description: 'Estado del usuario.',
        example: 'HABILITADO',
      },
      rol: {
        type: 'string',
        description: 'Rol asignado al usuario.',
        example: 'admin_principal',
      },
      fecha_creacion: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha en la que el usuario fue creado.',
        example: '2024-01-01T12:00:00Z',
      },
      fecha_actualizacion: {
        type: 'string',
        format: 'date-time',
        description: 'Última fecha de actualización del usuario.',
        example: '2024-01-02T15:00:00Z',
      },
    },
    required: ['id_usuario', 'email', 'nombres_y_apellidos', 'estado', 'rol'],
  },
  AvailableDisableUser: {
    title: 'Autenticación - Habilitar o Deshabilitar Usuario',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario que se desea habilitar o deshabilitar',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
    required: ['id_usuario'],
  },
  BlockOrUnblockUser: {
    title: 'Usuarios - Bloquear o Desbloquear Usuario',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario que se desea bloquear o desbloquear',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      isBlocked: {
        type: 'boolean',
        description: 'Estado del bloqueo. `true` para bloquear y `false` para desbloquear.',
        example: true,
      },
    },
    required: ['userId', 'isBlocked'],
  },
  ChangeUserRole: {
    title: 'Usuarios - Cambiar Rol de Usuario',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario cuyo rol será cambiado',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      productoraId: {
        type: 'string',
        format: 'uuid',
        description: 'ID de la productora asociada (si aplica)',
        example: '456e7890-e12f-34g5-h678-910ijklmnopq',
      },
      newRole: {
        type: 'string',
        description: 'Nuevo rol que se asignará al usuario',
        example: 'admin_secundario',
      },
    },
    required: ['userId', 'newRole'],
  },
  CreateAdminUser: {
    title: 'Usuarios - Crear Usuario Administrador',
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico del administrador a crear',
        example: 'admin@domain.com',
      },
      nombres_y_apellidos: {
        type: 'string',
        description: 'Nombre completo del administrador',
        example: 'Juan Pérez',
      },
      telefono: {
        type: 'string',
        description: 'Número de teléfono del administrador (opcional)',
        example: '+54 11 1234-5678',
      },
      rol: {
        type: 'string',
        enum: ['admin_principal', 'admin_secundario'],
        description: 'Rol del administrador a crear',
        example: 'admin_principal',
      },
      estado: {
        type: 'string',
        enum: ['HABILITADO', 'DESHABILITADO'],
        description: 'Estado inicial del administrador',
        example: 'HABILITADO',
      },
    },
    required: ['email', 'nombres_y_apellidos', 'rol', 'estado'],
  },
  GetRegistroPendiente: {
    title: 'Usuarios - Obtener Registro Pendiente',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario del cual se obtendrán los datos del registro pendiente',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
    required: ['id_usuario'],
  },
  ApproveApplication: {
    title: 'Usuarios - Aprobar Solicitud de Aplicación',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario cuya aplicación será aprobada.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      nombre_productora: {
        type: 'string',
        description: 'Nombre de la productora asociada al usuario.',
        example: 'Productora Ejemplo S.A.',
      },
      cuit_productora: {
        type: 'string',
        description: 'CUIT de la productora.',
        example: '20-12345678-9',
      },
      cbu_productora: {
        type: 'string',
        description: 'CBU de la productora.',
        example: '0123456789012345678901',
      },
      alias_cbu_productora: {
        type: 'string',
        description: 'Alias del CBU de la productora.',
        example: 'mi.alias.cbu',
      },
    },
    required: ['id_usuario', 'nombre_productora', 'cuit_productora', 'cbu_productora', 'alias_cbu_productora'],
  },
  RejectApplication: {
    title: 'Usuarios - Rechazar Solicitud de Aplicación',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario cuya solicitud de aplicación será rechazada.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      motivo_rechazo: {
        type: 'string',
        description: 'Motivo del rechazo de la solicitud.',
        example: 'La documentación proporcionada es incompleta.',
      },
    },
    required: ['id_usuario', 'motivo_rechazo'],
  },
  SendApplication: {
    title: 'Usuarios - Enviar Solicitud de Aplicación',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario que envía la solicitud de aplicación.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      datosFisica: {
        type: 'object',
        description: 'Datos relacionados con la persona física (opcional).',
        properties: {
          nombre: {
            type: 'string',
            description: 'Nombre de la persona física.',
            example: 'Juan Pérez',
          },
          dni: {
            type: 'string',
            description: 'Documento Nacional de Identidad (DNI) de la persona física.',
            example: '12345678',
          },
          fecha_nacimiento: {
            type: 'string',
            format: 'date',
            description: 'Fecha de nacimiento de la persona física.',
            example: '1980-01-01',
          },
        },
        required: ['nombre', 'dni', 'fecha_nacimiento'],
      },
      datosJuridica: {
        type: 'object',
        description: 'Datos relacionados con la persona jurídica (opcional).',
        properties: {
          razon_social: {
            type: 'string',
            description: 'Razón social de la persona jurídica.',
            example: 'Empresa S.A.',
          },
          cuit: {
            type: 'string',
            description: 'CUIT de la persona jurídica.',
            example: '30-12345678-9',
          },
          direccion: {
            type: 'string',
            description: 'Dirección de la persona jurídica.',
            example: 'Av. Siempre Viva 123',
          },
        },
        required: ['razon_social', 'cuit', 'direccion'],
      },
      documentos: {
        type: 'array',
        description: 'Lista de documentos asociados a la solicitud.',
        items: {
          type: 'object',
          properties: {
            nombre_documento: {
              type: 'string',
              description: 'Nombre del tipo de documento.',
              example: 'dni_persona_fisica',
            },
            ruta_archivo_documento: {
              type: 'string',
              description: 'Ruta del archivo del documento.',
              example: '/uploads/documento.pdf',
            },
          },
          required: ['nombre_documento', 'ruta_archivo_documento'],
        },
      },
    },
    required: ['id_usuario'],
  },
  UpdateApplication: {
    title: 'Usuarios - Actualizar Aplicación',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario cuya solicitud de aplicación será actualizada.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      datosFisica: {
        type: 'object',
        description: 'Datos relacionados con la persona física (opcional).',
        properties: {
          nombre: {
            type: 'string',
            description: 'Nombre de la persona física.',
            example: 'Juan Pérez',
          },
          dni: {
            type: 'string',
            description: 'Documento Nacional de Identidad (DNI) de la persona física.',
            example: '12345678',
          },
          fecha_nacimiento: {
            type: 'string',
            format: 'date',
            description: 'Fecha de nacimiento de la persona física.',
            example: '1980-01-01',
          },
        },
      },
      datosJuridica: {
        type: 'object',
        description: 'Datos relacionados con la persona jurídica (opcional).',
        properties: {
          razon_social: {
            type: 'string',
            description: 'Razón social de la persona jurídica.',
            example: 'Empresa S.A.',
          },
          cuit: {
            type: 'string',
            description: 'CUIT de la persona jurídica.',
            example: '30-12345678-9',
          },
          direccion: {
            type: 'string',
            description: 'Dirección de la persona jurídica.',
            example: 'Av. Siempre Viva 123',
          },
        },
      },
      documentos: {
        type: 'array',
        description: 'Lista de documentos asociados a la solicitud.',
        items: {
          type: 'object',
          properties: {
            tipo_documento_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID del tipo de documento.',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            ruta_archivo_documento: {
              type: 'string',
              description: 'Ruta del archivo del documento.',
              example: '/uploads/documento.pdf',
            },
          },
        },
      },
    },
    required: ['id_usuario'],
  },
  UpdateUser: {
    title: 'Usuarios - Actualizar Usuario',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario que será actualizado.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Nuevo correo electrónico del usuario (opcional).',
        example: 'nuevo.correo@dominio.com',
      },
      nombres_y_apellidos: {
        type: 'string',
        description: 'Nuevo nombre completo del usuario (opcional).',
        example: 'Juan Pérez Actualizado',
      },
      telefono: {
        type: 'string',
        description: 'Nuevo número de teléfono del usuario (opcional).',
        example: '+54 11 9876-5432',
      },
      estado: {
        type: 'string',
        enum: ['HABILITADO', 'DESHABILITADO', 'PENDIENTE'],
        description: 'Nuevo estado del usuario (opcional).',
        example: 'HABILITADO',
      },
      rol: {
        type: 'string',
        description: 'Nuevo rol asignado al usuario (opcional).',
        example: 'admin_secundario',
      },
    },
    required: ['id_usuario'],
  },
  DeleteUser: {
    title: 'Usuarios - Eliminar Usuario',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario que se desea eliminar.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
    required: ['id_usuario'],
  },
  UpdateUserViews: {
    title: 'Usuarios - Actualizar Vistas',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario cuyas vistas serán actualizadas.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      vistas: {
        type: 'array',
        description: 'Lista de IDs de vistas que se asignarán al usuario.',
        items: {
          type: 'string',
          format: 'uuid',
          description: 'ID de la vista.',
          example: '123e4567-e89b-12d3-a456-426614174001',
        },
      },
    },
    required: ['id_usuario', 'vistas'],
  },
  ToggleUserViewStatus: {
    title: 'Usuarios - Cambiar Estado de Vistas',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario cuyas vistas serán modificadas.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      vistas: {
        type: 'array',
        description: 'Lista de vistas con su estado de habilitación.',
        items: {
          type: 'object',
          properties: {
            id_vista: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la vista.',
              example: '123e4567-e89b-12d3-a456-426614174001',
            },
            is_habilitado: {
              type: 'boolean',
              description: 'Estado de habilitación de la vista.',
              example: true,
            },
          },
          required: ['id_vista', 'is_habilitado'],
        },
      },
    },
    required: ['id_usuario', 'vistas'],
  },
};

