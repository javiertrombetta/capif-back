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
    },
    required: ['email', 'password'],
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
      nombre: {
        type: 'string',
        description: 'Nombre del usuario',
        example: 'Ana',
      },
      apellido: {
        type: 'string',
        description: 'Apellido del usuario',
        example: 'García',
      },
      telefono: {
        type: 'string',
        description: 'Número de teléfono del usuario (opcional)',
        example: '00541112345678',
        nullable: true,
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
  CompleteProfile: {
    title: 'Autenticación - Completar Perfil',
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        description: 'Nombre del usuario',
        example: 'Juan',
        minLength: 2,
        maxLength: 255,
      },
      apellido: {
        type: 'string',
        description: 'Apellido del usuario',
        example: 'Pérez',
        minLength: 2,
        maxLength: 255,
      },
      telefono: {
        type: 'string',
        description: 'Número de teléfono del usuario (opcional)',
        example: '00541112345678',
        nullable: true,
      },
    },
    required: ['nombre', 'apellido'],
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
      id_usuario: {
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
    required: ['id_usuario', 'isBlocked'],
  },
  ChangeUserRole: {
    title: 'Usuarios - Cambiar Rol de Usuario',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario cuyo rol será cambiado',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      newRole: {
        type: 'string',
        description: 'Nuevo rol que se asignará al usuario',
        example: 'admin_secundario',
      },
    },
    required: ['id_usuario', 'newRole'],
  },
  GetUsers: {
    title: 'Usuarios - Obtener Usuarios según Filtros',
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
      nombre: {
        type: 'string',
        description: 'Nombre del usuario',
        example: 'Ana',
      },
      apellido: {
        type: 'string',
        description: 'Apellido del usuario',
        example: 'García',
      },
      telefono: {
        type: 'string',
        description: 'Número de teléfono del usuario (opcional)',
        example: '00541112345678',
        nullable: true,
      },
      rol: {
        type: 'string',
        enum: ['admin_principal', 'admin_secundario'],
        description: 'Rol del administrador a crear',
        example: 'admin_principal',
      },     
    },
    required: ['email', 'nombre', 'apellido', 'rol'],
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
    },
    required: ['id_usuario'],
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
      comentario: {
        type: 'string',
        description: 'Motivo del rechazo de la solicitud.',
        example: 'La documentación proporcionada es incompleta.',
      },
    },
    required: ['id_usuario', 'comentario'],
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
      productoraData: {
        type: 'object',
        description: 'Datos relacionados con la productora.',
        properties: {
          tipo_persona: {
            type: 'string',
            enum: ['FISICA', 'JURIDICA'],
            description: 'Tipo de persona de la productora.',
            example: 'FISICA',
          },
          nombre_productora: {
            type: 'string',
            description: 'Nombre de la productora.',
            example: 'Productora Ejemplo',
          },
          cuit_cuil: {
            type: 'string',
            description: 'CUIT o CUIL de la productora.',
            example: '30-12345678-9',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico de la productora.',
            example: 'productora@ejemplo.com',
          },
          calle: {
            type: 'string',
            description: 'Calle donde se encuentra la productora.',
            example: 'Av. Siempre Viva',
          },
          numero: {
            type: 'string',
            description: 'Número de la dirección.',
            example: '123',
          },
          ciudad: {
            type: 'string',
            description: 'Ciudad donde se encuentra la productora.',
            example: 'Buenos Aires',
          },
          localidad: {
            type: 'string',
            description: 'Localidad donde se encuentra la productora.',
            example: 'Palermo',
          },
          provincia: {
            type: 'string',
            description: 'Provincia donde se encuentra la productora.',
            example: 'Buenos Aires',
          },
          codigo_postal: {
            type: 'string',
            description: 'Código postal de la productora.',
            example: '1425',
          },
          telefono: {
            type: 'string',
            description: 'Teléfono de contacto de la productora.',
            example: '00541112345678',
          },
          nacionalidad: {
            type: 'string',
            description: 'Nacionalidad de la productora.',
            example: 'Argentina',
          },
          alias_cbu: {
            type: 'string',
            description: 'Alias del CBU de la productora.',
            example: 'AliasCBUEjemplo',
          },
          cbu: {
            type: 'string',
            description: 'CBU de la productora.',
            example: '1234567890123456789012',
          },
          denominacion_sello: {
            type: 'string',
            description: 'Denominación del sello de la productora (opcional).',
            example: 'Sello Ejemplo',
            nullable: true,
          },
          datos_adicionales: {
            type: 'string',
            description: 'Datos adicionales sobre la productora (opcional).',
            example: 'Productora especializada en música.',
            nullable: true,
          },
          // Campos específicos para persona física
          nombres: {
            type: 'string',
            description: 'Nombres del representante en caso de persona física.',
            example: 'Juan',
            nullable: true,
          },
          apellidos: {
            type: 'string',
            description: 'Apellidos del representante en caso de persona física.',
            example: 'Pérez',
            nullable: true,
          },
          // Campos específicos para persona jurídica
          razon_social: {
            type: 'string',
            description: 'Razón social en caso de persona jurídica.',
            example: 'Empresa S.A.',
            nullable: true,
          },
          apellidos_representante: {
            type: 'string',
            description: 'Apellidos del representante legal en caso de persona jurídica.',
            example: 'García',
            nullable: true,
          },
          nombres_representante: {
            type: 'string',
            description: 'Nombres del representante legal en caso de persona jurídica.',
            example: 'Ana',
            nullable: true,
          },
          cuit_representante: {
            type: 'string',
            description: 'CUIT del representante legal en caso de persona jurídica.',
            example: '20-12345678-5',
            nullable: true,
          },
        },
        required: [
          'tipo_persona',
          'nombre_productora',
          'cuit_cuil',
          'email',
          'calle',
          'numero',
          'ciudad',
          'localidad',
          'provincia',
          'codigo_postal',
          'telefono',
          'nacionalidad',
          'alias_cbu',
          'cbu',
        ],
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
      nombre: {
        type: 'string',
        description: 'Nombre del usuario que envía la solicitud.',
        example: 'Juan',
      },
      apellido: {
        type: 'string',
        description: 'Apellido del usuario que envía la solicitud.',
        example: 'Pérez',
      },
      telefono: {
        type: 'string',
        description: 'Teléfono del usuario que envía la solicitud.',
        example: '+54 11 1234-5678',
      },
    },
    required: [
      'id_usuario',
      'productoraData',
      'documentos',
      'nombre',
      'apellido',
      'telefono',
    ],
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
      productoraData: {
        type: 'object',
        description: 'Datos relacionados con la productora.',
        properties: {
          tipo_persona: {
            type: 'string',
            enum: ['FISICA', 'JURIDICA'],
            description: 'Tipo de persona de la productora.',
            example: 'FISICA',
          },
          nombre_productora: {
            type: 'string',
            description: 'Nombre de la productora.',
            example: 'Productora Ejemplo',
          },
          cuit_cuil: {
            type: 'string',
            description: 'CUIT o CUIL de la productora.',
            example: '30-12345678-9',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico de la productora.',
            example: 'productora@ejemplo.com',
          },
          calle: {
            type: 'string',
            description: 'Calle donde se encuentra la productora.',
            example: 'Av. Siempre Viva',
          },
          numero: {
            type: 'string',
            description: 'Número de la dirección.',
            example: '123',
          },
          ciudad: {
            type: 'string',
            description: 'Ciudad donde se encuentra la productora.',
            example: 'Buenos Aires',
          },
          localidad: {
            type: 'string',
            description: 'Localidad donde se encuentra la productora.',
            example: 'Palermo',
          },
          provincia: {
            type: 'string',
            description: 'Provincia donde se encuentra la productora.',
            example: 'Buenos Aires',
          },
          codigo_postal: {
            type: 'string',
            description: 'Código postal de la productora.',
            example: '1425',
          },
          telefono: {
            type: 'string',
            description: 'Teléfono de contacto de la productora.',
            example: '00541112345678',
          },
          nacionalidad: {
            type: 'string',
            description: 'Nacionalidad de la productora.',
            example: 'Argentina',
          },
          alias_cbu: {
            type: 'string',
            description: 'Alias del CBU de la productora.',
            example: 'AliasCBUEjemplo',
          },
          cbu: {
            type: 'string',
            description: 'CBU de la productora.',
            example: '1234567890123456789012',
          },
          denominacion_sello: {
            type: 'string',
            description: 'Denominación del sello de la productora (opcional).',
            example: 'Sello Ejemplo',
            nullable: true,
          },
          datos_adicionales: {
            type: 'string',
            description: 'Datos adicionales sobre la productora (opcional).',
            example: 'Productora especializada en música.',
            nullable: true,
          },
          // Campos específicos para persona física
          nombres: {
            type: 'string',
            description: 'Nombres del representante en caso de persona física.',
            example: 'Juan',
            nullable: true,
          },
          apellidos: {
            type: 'string',
            description: 'Apellidos del representante en caso de persona física.',
            example: 'Pérez',
            nullable: true,
          },
          // Campos específicos para persona jurídica
          razon_social: {
            type: 'string',
            description: 'Razón social en caso de persona jurídica.',
            example: 'Empresa S.A.',
            nullable: true,
          },
          apellidos_representante: {
            type: 'string',
            description: 'Apellidos del representante legal en caso de persona jurídica.',
            example: 'García',
            nullable: true,
          },
          nombres_representante: {
            type: 'string',
            description: 'Nombres del representante legal en caso de persona jurídica.',
            example: 'Ana',
            nullable: true,
          },
          cuit_representante: {
            type: 'string',
            description: 'CUIT del representante legal en caso de persona jurídica.',
            example: '20-12345678-5',
            nullable: true,
          },
        },
        additionalProperties: false,
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
          additionalProperties: false,
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
      datosUsuario: {
        type: 'object',
        description: 'Datos que serán actualizados del usuario.',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Nuevo correo electrónico del usuario (opcional).',
            example: 'nuevo.correo@dominio.com',
          },
          nombres: {
            type: 'string',
            description: 'Nuevo nombre del usuario (opcional).',
            example: 'Juan',
          },
          apellidos: {
            type: 'string',
            description: 'Nuevo apellido del usuario (opcional).',
            example: 'Pérez',
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
        },
        additionalProperties: false,
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
      roleName: {
        type: 'string',
        description: 'Nombre del rol asociado a las vistas que se asignarán al usuario.',
        example: 'admin_principal',
      },
    },
    required: ['id_usuario', 'roleName'],
  },
  ToggleUserViewStatus: {
    title: 'Usuarios - Cambiar estado de vistas',
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
        description: 'Lista de vistas con sus estados a actualizar.',
        items: {
          type: 'object',
          properties: {
            nombre_vista: {
              type: 'string',
              description: 'Nombre de la vista.',
              example: 'Usuarios',
            },
            is_habilitado: {
              type: 'boolean',
              description: 'Estado de habilitación de la vista.',
              example: true,
            },
          },
          required: ['nombre_vista', 'is_habilitado'],
        },
      },
    },
    required: ['id_usuario', 'vistas'],
  },
};

