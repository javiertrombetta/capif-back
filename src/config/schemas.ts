export const archivoSchemas = {
  ArchivoCreate: {
    title: 'Archivo - Crear',
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        description: 'Nombre del archivo',
        example: 'archivo_ejemplo.pdf',
      },
      tipo: {
        type: 'string',
        description: 'Tipo de archivo',
        example: 'pdf',
      },
      ruta: {
        type: 'string',
        description: 'Ruta del archivo en el servidor',
        example: '/uploads/archivo_ejemplo.pdf',
      },
    },
    required: ['nombre', 'tipo', 'ruta'],
  },
  ArchivoUpdate: {
    title: 'Archivo - Actualizar',
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        description: 'Nombre actualizado del archivo',
        example: 'archivo_actualizado.pdf',
      },
      tipo: {
        type: 'string',
        description: 'Tipo actualizado del archivo',
        example: 'pdf',
      },
    },
  },
  Archivo: {
    title: 'Archivo (modelo)',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID del archivo',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      nombre: {
        type: 'string',
        description: 'Nombre del archivo',
        example: 'archivo_final.pdf',
      },
      tipo: {
        type: 'string',
        description: 'Tipo de archivo',
        example: 'pdf',
      },
      ruta: {
        type: 'string',
        description: 'Ruta del archivo en el servidor',
        example: '/uploads/archivo_final.pdf',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de creación del archivo',
        example: '2023-09-30T12:34:56Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de actualización del archivo',
        example: '2023-10-01T12:34:56Z',
      },
    },
  },
};

export const authSchemas = {
  Login: {
    title: 'Autenticación - Login',
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico del usuario',
        example: 'usuario@example.com',
      },
      password: {
        type: 'string',
        description: 'Contraseña del usuario',
        example: 'password123',
      },
    },
    required: ['email', 'password'],
  },
  Register: {
    title: 'Autenticación - Registro de Usuario',
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico del nuevo usuario',
        example: 'usuario@example.com',
      },
      password: {
        type: 'string',
        description: 'Contraseña del nuevo usuario',
        example: 'ClaveSegura123!',
      },
      nombre: {
        type: 'string',
        description: 'Nombre del usuario',
        example: 'Juan',
      },
      apellido: {
        type: 'string',
        description: 'Apellido del usuario',
        example: 'Pérez',
      },
      cuit: {
        type: 'string',
        description: 'CUIT del usuario',
        example: '20123456789',
      },
      tipo_persona_descripcion: {
        type: 'string',
        description: 'Tipo de Entidad',
        example: 'Persona Física',
      },
      domicilio: {
        type: 'string',
        description: 'Domicilio del usuario',
        example: 'Calle Falsa 123',
      },
      ciudad: {
        type: 'string',
        description: 'Ciudad del usuario',
        example: 'Buenos Aires',
      },
      provincia: {
        type: 'string',
        description: 'Provincia del usuario',
        example: 'Buenos Aires',
      },
      pais: {
        type: 'string',
        description: 'País del usuario',
        example: 'Argentina',
      },
      codigo_postal: {
        type: 'string',
        description: 'Código postal del usuario',
        example: '1414',
      },
      telefono: {
        type: 'string',
        description: 'Teléfono del usuario',
        example: '+54 9 11 1234-5678',
      },
    },
    required: [
      'email',
      'password',
      'nombre',
      'apellido',
      'cuit',
      'tipo_persona_id',
      'domicilio',
      'ciudad',
      'provincia',
      'pais',
      'codigo_postal',
      'telefono',
    ],
  },
  RecoverPassword: {
    title: 'Autenticación - Mail de recuperación de clave (envío)',
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Correo electrónico para recuperar la contraseña',
        example: 'usuario@example.com',
      },
    },
    required: ['email'],
  },
  ResetPassword: {
    title: 'Autenticación - Mail de recuperación de clave (confirmación por token recibido)',
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
        example: 'newPassword123!',
      },
    },
    required: ['token', 'newPassword'],
  },
  AuthorizeUser: {
    title: 'Autenticación - Autorizar a un usuario nuevo',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'ID del usuario a autorizar',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      role: {
        type: 'string',
        description: 'Nuevo rol del usuario',
        example: 'admin',
      },
    },
    required: ['userId', 'role'],
  },
  BlockUser: {
    title: 'Autenticación - Bloquear a un usuario existente',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'ID del usuario a bloquear o desbloquear',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      status: {
        type: 'boolean',
        description: 'Estado del usuario (bloqueado o desbloqueado)',
        example: true,
      },
    },
    required: ['userId', 'status'],
  },
  ChangeRole: {
    title: 'Autenticación - Cambiarle el rol a un usuario',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'ID del usuario cuyo rol será cambiado',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      newRole: {
        type: 'string',
        description: 'Nuevo rol del usuario',
        example: 'admin',
      },
    },
    required: ['userId', 'newRole'],
  },
  ChangePassword: {
    title: 'Autenticación - Cambio de clave',
    type: 'object',
    properties: {
      oldPassword: {
        type: 'string',
        description: 'Contraseña actual del usuario',
        example: 'oldPassword123',
      },
      newPassword: {
        type: 'string',
        description: 'Nueva contraseña del usuario',
        example: 'newSecurePassword!',
      },
    },
    required: ['oldPassword', 'newPassword'],
  },
  DeleteUser: {
    title: 'Autenticación - Borrar un usuario',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'ID del usuario a eliminar',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
    required: ['userId'],
  },
};

export const conflictoSchemas = {
  ConflictoCreate: {
    title: 'Conflicto - Crear',
    type: 'object',
    properties: {
      id_fonograma: {
        type: 'string',
        description: 'ID del fonograma asociado al conflicto',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      tipo_conflicto: {
        type: 'string',
        description: 'Tipo de conflicto (ej. titularidad, derechos)',
        example: 'titularidad',
      },
      descripcion: {
        type: 'string',
        description: 'Descripción detallada del conflicto',
        example: 'El usuario reclama derechos sobre la obra.',
      },
    },
    required: ['id_fonograma', 'tipo_conflicto', 'descripcion'],
  },
  Comentario: {
    title: 'Conflicto - Agregar comentario',
    type: 'object',
    properties: {
      comentario: {
        type: 'string',
        description: 'Comentario sobre el conflicto',
        example: 'Se resolvió con acuerdo entre las partes.',
      },
    },
    required: ['comentario'],
  },
  Decision: {
    title: 'Conflicto - Aplicar decisión',
    type: 'object',
    properties: {
      decision: {
        type: 'string',
        description: 'Decisión tomada por el involucrado',
        example: 'Aceptar propuesta de resolución',
      },
      fecha_decision: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de la decisión',
        example: '2024-10-14T12:34:56Z',
      },
    },
    required: ['decision', 'fecha_decision'],
  },
  Conflicto: {
    title: 'Conflicto (modelo)',
    type: 'object',
    properties: {
      id_conflicto: {
        type: 'string',
        description: 'ID del conflicto',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      id_fonograma: {
        type: 'string',
        description: 'ID del fonograma asociado',
      },
      tipo_conflicto: {
        type: 'string',
        description: 'Tipo de conflicto',
      },
      descripcion: {
        type: 'string',
        description: 'Descripción del conflicto',
      },
      estado: {
        type: 'string',
        description: 'Estado actual del conflicto',
        example: 'pendiente',
      },
      fecha_resolucion: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de resolución (si aplica)',
        example: '2024-10-21T15:00:00Z',
      },
    },
  },
};

export const consultaSchemas = {
  ConsultaCreate: {
    title: 'Consulta - Crear',
    type: 'object',
    properties: {
      asunto: {
        type: 'string',
        description: 'Asunto de la consulta',
        example: 'Consulta sobre derechos de reproducción',
      },
      mensaje: {
        type: 'string',
        description: 'Mensaje detallado de la consulta',
        example: 'Me gustaría saber más sobre los derechos de reproducción para fonogramas.',
      },
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario que realiza la consulta',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      estado_id: {
        type: 'string',
        format: 'uuid',
        description: 'ID del estado inicial de la consulta',
        example: '123e4567-e89b-12d3-a456-426614174111',
      },
    },
    required: ['asunto', 'id_usuario', 'estado_id'],
  },

  ConsultaUpdate: {
    title: 'Consulta - Actualizar',
    type: 'object',
    properties: {
      asunto: {
        type: 'string',
        description: 'Asunto actualizado de la consulta',
        example: 'Actualización del asunto de la consulta',
      },
      mensaje: {
        type: 'string',
        description: 'Mensaje actualizado de la consulta',
        example: 'Información adicional sobre los derechos de reproducción.',
      },
      estado_id: {
        type: 'string',
        format: 'uuid',
        description: 'ID del nuevo estado de la consulta',
        example: '123e4567-e89b-12d3-a456-426614174222',
      },
    },
  },

  Consulta: {
    title: 'Consulta (modelo)',
    type: 'object',
    properties: {
      id_consulta: {
        type: 'string',
        format: 'uuid',
        description: 'ID de la consulta',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      asunto: {
        type: 'string',
        description: 'Asunto de la consulta',
        example: 'Consulta sobre derechos de reproducción',
      },
      mensaje: {
        type: 'string',
        description: 'Mensaje detallado de la consulta',
        example: 'Me gustaría saber más sobre los derechos de reproducción para fonogramas.',
      },
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario que realizó la consulta',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      estado: {
        type: 'object',
        properties: {
          id_estado: {
            type: 'string',
            format: 'uuid',
            description: 'ID del estado actual de la consulta',
            example: '123e4567-e89b-12d3-a456-426614174111',
          },
          descripcion: {
            type: 'string',
            description: 'Descripción del estado actual',
            example: 'Pendiente',
          },
        },
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de creación de la consulta',
        example: '2024-10-14T10:30:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de última actualización de la consulta',
        example: '2024-10-15T14:00:00Z',
      },
    },
  },
};

export const cuentaCorrienteSchemas = {
  CuentaCorrienteCreate: {
    title: 'CuentaCorriente - Crear',
    type: 'object',
    properties: {
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario asociado a la cuenta corriente',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      saldo: {
        type: 'number',
        description: 'Saldo inicial de la cuenta corriente',
        example: 1000.5,
      },
    },
    required: ['id_usuario', 'saldo'],
  },

  UpdateSaldo: {
    title: 'CuentaCorriente - Actualizar',
    type: 'object',
    properties: {
      nuevoSaldo: {
        type: 'number',
        description: 'Nuevo saldo para la cuenta corriente',
        example: 1500.75,
      },
    },
    required: ['nuevoSaldo'],
  },

  CuentaCorriente: {
    title: 'CuentaCorriente (modelo)',
    type: 'object',
    properties: {
      id_cuenta_corriente: {
        type: 'string',
        format: 'uuid',
        description: 'ID de la cuenta corriente',
        example: '123e4567-e89b-12d3-a456-426614174555',
      },
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario asociado a la cuenta corriente',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      saldo: {
        type: 'number',
        description: 'Saldo actual de la cuenta corriente',
        example: 5000.0,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de creación de la cuenta corriente',
        example: '2024-10-14T10:30:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de última actualización de la cuenta corriente',
        example: '2024-10-15T14:00:00Z',
      },
    },
  },

  Pago: {
    title: 'CuentaCorriente - Pago (modelo)',
    type: 'object',
    properties: {
      id_pago: {
        type: 'string',
        format: 'uuid',
        description: 'ID del pago realizado',
        example: '123e4567-e89b-12d3-a456-426614174777',
      },
      id_usuario: {
        type: 'string',
        format: 'uuid',
        description: 'ID del usuario que realizó el pago',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      monto: {
        type: 'number',
        description: 'Monto del pago realizado',
        example: 200.0,
      },
      fecha_pago: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha en que se realizó el pago',
        example: '2024-10-13T09:45:00Z',
      },
      id_tipo_metodo_pago: {
        type: 'string',
        format: 'uuid',
        description: 'ID del método de pago utilizado',
        example: '123e4567-e89b-12d3-a456-426614174888',
      },
      referencia: {
        type: 'string',
        description: 'Referencia del pago',
        example: 'Pago mensual de suscripción',
      },
      tipoMetodoPago: {
        type: 'object',
        properties: {
          id_tipo_metodo_pago: {
            type: 'string',
            format: 'uuid',
            description: 'ID del tipo de método de pago',
            example: '123e4567-e89b-12d3-a456-426614174888',
          },
          descripcion: {
            type: 'string',
            description: 'Descripción del método de pago',
            example: 'Tarjeta de crédito',
          },
        },
      },
    },
  },
};

export const dbSchemas = {
  RegistroCreate: {
    title: 'DB - Crear',
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        description: 'Nombre del registro',
        example: 'TipoActividad',
      },
      descripcion: {
        type: 'string',
        description: 'Descripción del registro',
        example: 'Actividad de prueba',
      },
    },
    required: ['nombre', 'descripcion'],
  },

  RegistroUpdate: {
    title: 'DB - Actualizar',
    type: 'object',
    properties: {
      descripcion: {
        type: 'string',
        description: 'Nueva descripción del registro',
        example: 'Actividad modificada',
      },
    },
    required: ['descripcion'],
  },

  Registro: {
    title: 'DB - Registro (modelo)',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'ID único del registro',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      nombre: {
        type: 'string',
        description: 'Nombre del registro',
        example: 'TipoActividad',
      },
      descripcion: {
        type: 'string',
        description: 'Descripción del registro',
        example: 'Actividad de prueba',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de creación',
        example: '2024-10-14T10:30:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Fecha de última actualización',
        example: '2024-10-15T14:00:00Z',
      },
    },
  },
};

