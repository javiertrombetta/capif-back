export const authSchemas = {
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
    },
    required: ['email', 'nombre', 'apellido', 'rol'],
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
  RejectApplication: {
    title: 'Usuarios - Rechazar Solicitud de Aplicación',
    type: 'object',
    properties: {
      comentario: {
        type: 'string',
        description: 'Motivo del rechazo de la solicitud.',
        example: 'La documentación proporcionada es incompleta.',
      },
    },
    required: ['comentario'],
  },
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
  SendApplication: {
    title: 'Usuarios - Enviar Solicitud de Aplicación',
    type: 'object',
    properties: {
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
            example: '30123456789',
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
            example: '20123456785',
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
      'productoraData',  
      'nombre',
      'apellido',
      'telefono',
    ],
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
};

export const userSchemas = {
  ChangePassword: {
    title: 'Autenticación - Cambio de Contraseña',
    type: 'object',
    properties: {
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
    required: ['newPassword', 'confirmPassword'],
  },
  BlockOrUnblockUser: {
    title: 'Usuarios - Bloquear o Desbloquear Usuario',
    type: 'object',
    properties: {
      isBlocked: {
        type: 'boolean',
        description: 'Estado del bloqueo. `true` para bloquear y `false` para desbloquear.',
        example: true,
      },
    },
    required: ['isBlocked'],
  },  
  UpdateUser: {
    title: 'Usuarios - Actualizar Usuario',
    type: 'object',
    properties: {
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
          nombre: {
            type: 'string',
            description: 'Nuevo nombre del usuario (opcional).',
            example: 'Juan',
          },
          apellido: {
            type: 'string',
            description: 'Nuevo apellido del usuario (opcional).',
            example: 'Pérez',
          },
          telefono: {
            type: 'string',
            description: 'Nuevo número de teléfono del usuario (opcional).',
            example: '+54 11 9876-5432',
          },
        },
        additionalProperties: false,
      },
    },
  },
  UpdateUserViews: {
    title: 'Usuarios - Actualizar Vistas',
    type: 'object',
    properties: { 
      roleName: {
        type: 'string',
        description: 'Nombre del rol asociado a las vistas que se asignarán al usuario.',
        example: 'admin_principal',
      },
    },
    required: ['roleName'],
  },
  ToggleUserViewStatus: {
    title: 'Usuarios - Cambiar estado de vistas',
    type: 'object',
    properties: {
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
    required: ['vistas'],
  },
};

export const producersSchemas = {
  GetDocumentoById: {
    title: "Productoras - Obtener Documento por ID",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID de la productora.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      docId: {
        type: "string",
        format: "uuid",
        description: "ID del documento asociado a la productora.",
        example: "987e6543-e21b-11d3-b456-426614174000",
      },
    },
  },
  GetAllDocumentos: {
    title: "Productoras - Obtener Todos los Documentos",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID de la productora.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
  },
  CreateDocumento: {
    title: "Productoras - Crear Documento",
    type: "object",
    properties: {
      tipoDocumento: {
        type: "string",
        description: "Tipo de documento que se está subiendo.",
        example: "dni_persona_fisica",
        enum: [
          "dni_persona_fisica",
          "dni_representante_legal",
          "comprobante_ISRC",
          "contrato_social",
        ],
      },
      cuit: {
        type: "string",
        description: "CUIT de la productora asociada al documento.",
        example: "30123456789",
      },
    },
    required: ["tipoDocumento", "cuit"],
  },
  UpdateDocumento: {
    title: "Productoras - Actualizar Documento",
    type: "object",
    properties: {
      nombre_documento: {
        type: "string",
        description: "Nombre del documento.",
        example: "contrato_actualizado.pdf",
      },
      ruta_archivo_documento: {
        type: "string",
        description: "Ruta del archivo actualizado.",
        example: "/uploads/contrato_actualizado.pdf",
      },
    },
    required: ["nombre_documento", "ruta_archivo_documento"],
  },
  DeleteDocumento: {
    title: "Productoras - Eliminar Documento",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID de la productora.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      docId: {
        type: "string",
        format: "uuid",
        description: "ID del documento asociado a la productora.",
        example: "987e6543-e21b-11d3-b456-426614174000",
      },
    },
  },
  DeleteAllDocumentos: {
    title: "Productoras - Eliminar Todos los Documentos",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID de la productora.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
  },
  GetISRCById: {
    title: "Productoras - Obtener ISRC",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID de la productora.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
  },
  GetAllISRCs: {
    title: "Productoras - Obtener Todos los ISRC",
    type: "object",
    properties: {
      isrcs: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID del ISRC.",
              example: "123e4567-e89b-12d3-a456-426614174001",
            },
            codigo: {
              type: "string",
              description: "Código ISRC.",
              example: "US-123-21-12345",
            },
            productora_id: {
              type: "string",
              format: "uuid",
              description: "ID de la productora asociada.",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
          },
        },
      },
    },
  },
  CreateISRC: {
    title: "Productoras - Crear ISRC",
    type: "object",
    properties: {
      codigo_productora: {
        type: "string",
        description: "Código ISRC asociado a la productora.",
        example: "US-123-21-12345",
      },
      descripcion: {
        type: "string",
        description: "Descripción adicional para el ISRC (opcional).",
        example: "Código ISRC para el álbum 2023.",
      },
    },
    required: ["codigo_productora"],
  },
  UpdateISRC: {
    title: "Productoras - Actualizar ISRC",
    type: "object",
    properties: {
      id_productora_isrc: {
        type: "string",
        format: "uuid",
        description: "ID único del ISRC que se actualizará.",
        example: "123e4567-e89b-12d3-a456-426614174001",
      },
      codigo_productora: {
        type: "string",
        description: "Nuevo código ISRC.",
        example: "US-123-21-54321",
      },
      descripcion: {
        type: "string",
        description: "Descripción actualizada para el ISRC (opcional).",
        example: "Código ISRC actualizado para el álbum 2024.",
      },
    },
    required: ["id_productora_isrc", "codigo_productora"],
  },
  DeleteISRC: {
    title: "Productoras - Eliminar ISRCs",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID de la productora cuyos ISRCs serán eliminados.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
  },
  GetPostulacionesById: {
    title: "Productoras - Obtener Postulaciones",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID de la productora.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      postulaciones: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id_premio: {
              type: "string",
              format: "uuid",
              description: "ID del premio o postulación.",
              example: "987e6543-e21b-11d3-b456-426614174000",
            },
            nombre_premio: {
              type: "string",
              description: "Nombre del premio o postulación.",
              example: "Mejor Álbum del Año",
            },
            fecha_postulacion: {
              type: "string",
              format: "date-time",
              description: "Fecha en la que se realizó la postulación.",
              example: "2023-01-15T10:00:00Z",
            },
          },
        },
      },
    },
  },
  GetAllPostulaciones: {
    title: "Productoras - Obtener Todas las Postulaciones",
    type: "object",
    properties: {
      postulaciones: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id_premio: {
              type: "string",
              format: "uuid",
              description: "ID del premio o postulación.",
              example: "987e6543-e21b-11d3-b456-426614174000",
            },
            nombre_premio: {
              type: "string",
              description: "Nombre del premio o postulación.",
              example: "Mejor Álbum del Año",
            },
            fecha_asignacion: {
              type: "string",
              format: "date-time",
              description: "Fecha en que se realizó la asignación del premio.",
              example: "2023-01-15T10:00:00Z",
            },
            productora: {
              type: "object",
              properties: {
                id_productora: {
                  type: "string",
                  format: "uuid",
                  description: "ID de la productora.",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
                nombre_productora: {
                  type: "string",
                  description: "Nombre de la productora asociada.",
                  example: "Productora Ejemplo",
                },
              },
            },
          },
        },
      },
    },
  },
  CreatePostulaciones: {
    title: "Productoras - Crear Postulaciones Masivamente",
    type: "object",
    properties: {
      startDate: {
        type: "string",
        format: "date-time",
        description: "Fecha de inicio para el filtro de creación de postulaciones.",
        example: "2023-01-01T00:00:00Z",
      },
      endDate: {
        type: "string",
        format: "date-time",
        description: "Fecha de fin para el filtro de creación de postulaciones.",
        example: "2023-12-31T23:59:59Z",
      },
    },
    required: ["startDate", "endDate"],
  },
  UpdatePostulacion: {
    title: "Productoras - Actualizar Postulación",
    type: "object",
    properties: {
      id_premio: {
        type: "string",
        format: "uuid",
        description: "ID único de la postulación que se actualizará.",
        example: "987e6543-e21b-11d3-b456-426614174000",
      },
      nombre_premio: {
        type: "string",
        description: "Nuevo nombre del premio o postulación.",
        example: "Mejor Álbum del Año - Actualizado",
      },
      fecha_asignacion: {
        type: "string",
        format: "date-time",
        description: "Fecha actualizada de asignación del premio.",
        example: "2024-01-15T10:00:00Z",
      },
    },
    required: ["id_premio", "nombre_premio"],
  },
  DeletePostulacion: {
    title: "Productoras - Eliminar Postulaciones",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID de la productora cuyos postulaciones serán eliminadas.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
  },
  DeleteAllPostulaciones: {
    title: "Productoras - Eliminar Todas las Postulaciones",
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "Mensaje de éxito.",
        example: "Todas las postulaciones eliminadas exitosamente.",
      },
    },
  },
  GetProductoraById: {
    title: "Productoras - Obtener Productora por ID",
    type: "object",
    properties: {
      id_productora: {
        type: "string",
        format: "uuid",
        description: "ID único de la productora.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      nombre_productora: {
        type: "string",
        description: "Nombre de la productora.",
        example: "Productora Ejemplo",
      },
      direccion: {
        type: "string",
        description: "Dirección de la productora.",
        example: "Av. Siempre Viva 123",
      },
      telefono: {
        type: "string",
        description: "Teléfono de contacto de la productora.",
        example: "+54 11 1234-5678",
      },
      email: {
        type: "string",
        format: "email",
        description: "Correo electrónico de la productora.",
        example: "contacto@productora.com",
      },
    },
  },
  GetAllProductoras: {
    title: "Productoras - Obtener Todas las Productoras",
    type: "object",
    properties: {
      productoras: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id_productora: {
              type: "string",
              format: "uuid",
              description: "ID único de la productora.",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            nombre_productora: {
              type: "string",
              description: "Nombre de la productora.",
              example: "Productora Ejemplo",
            },
            direccion: {
              type: "string",
              description: "Dirección de la productora.",
              example: "Av. Siempre Viva 123",
            },
            telefono: {
              type: "string",
              description: "Teléfono de contacto de la productora.",
              example: "+54 11 1234-5678",
            },
            email: {
              type: "string",
              format: "email",
              description: "Correo electrónico de la productora.",
              example: "contacto@productora.com",
            },
            codigosDeLaProductora: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id_productora_isrc: {
                    type: "string",
                    format: "uuid",
                    description: "ID del ISRC asociado a la productora.",
                    example: "123e4567-e89b-12d3-a456-426614174001",
                  },
                  codigo_isrc: {
                    type: "string",
                    description: "Código ISRC.",
                    example: "US-123-21-12345",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  CreateProductora: {
    title: "Productoras - Crear Productora",
    type: "object",
    properties: {
      nombre_productora: {
        type: "string",
        description: "Nombre de la nueva productora.",
        example: "Productora Ejemplo",
      },
      direccion: {
        type: "string",
        description: "Dirección de la productora.",
        example: "Av. Siempre Viva 123",
      },
      telefono: {
        type: "string",
        description: "Teléfono de contacto de la productora.",
        example: "+54 11 1234-5678",
      },
      email: {
        type: "string",
        format: "email",
        description: "Correo electrónico de la productora.",
        example: "contacto@productora.com",
      },
      cuit_cuil: {
        type: "string",
        description: "CUIT o CUIL de la productora.",
        example: "30-12345678-9",
      },
    },
    required: ["nombre_productora", "direccion", "telefono", "email", "cuit_cuil"],
  },
  UpdateProductora: {
    title: "Productoras - Actualizar Productora",
    type: "object",
    properties: {
      nombre_productora: {
        type: "string",
        description: "Nombre actualizado de la productora.",
        example: "Productora Actualizada",
      },
      direccion: {
        type: "string",
        description: "Dirección actualizada de la productora.",
        example: "Av. Siempre Viva 456",
      },
      telefono: {
        type: "string",
        description: "Teléfono actualizado de la productora.",
        example: "+54 11 9876-5432",
      },
      email: {
        type: "string",
        format: "email",
        description: "Correo electrónico actualizado de la productora.",
        example: "actualizado@productora.com",
      },
      cuit_cuil: {
        type: "string",
        description: "CUIT o CUIL actualizado de la productora.",
        example: "30-87654321-2",
      },
    },
    required: ["nombre_productora", "direccion", "telefono", "email", "cuit_cuil"],
  },
  DeleteProductora: {
    title: "Productoras - Eliminar Productora",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID único de la productora a eliminar.",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      message: {
        type: "string",
        description: "Mensaje de confirmación de eliminación.",
        example: "Productora eliminada exitosamente.",
      },
    },
  },
};

export const repertoiresSchemas = {

  
}

export const conflictsSchemas = {

  
}

export const cashflowSchemas = {

  
}

export const auditsSchemas = {

  
}