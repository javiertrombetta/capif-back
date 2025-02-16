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
  DeleteRelationshipBody: {
    type: "object",
    properties: {
      productoraId: {
        type: "string",
        format: "uuid",
        description: "UUID de la productora a la que se eliminará la relación. Solo requerido para administradores.",
      },
    },
    required: [],
    description: "Body opcional. Solo los administradores deben proporcionar `productoraId`.",
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
    title: "Productoras - Obtener Todos los ISRCs",
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "Mensaje de estado de la respuesta.",
        example: "ISRCs obtenidos exitosamente",
      },
      total: {
        type: "integer",
        description: "Número total de ISRCs en la base de datos.",
        example: "100"
      },
      page: {
        type: "integer",
        description: "Número de página actual.",
        example: "1"
      },
      limit: {
        type: "integer",
        description: "Número de resultados por página.",
        example: "10"
      },
      isrcs: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID del ISRC.",
              example: "123e4567-e89b-12d3-a456-426614174001"
            },
            codigo: {
              type: "string",
              description: "Código ISRC.",
              example: "AR1232512345"
            },
            productora_id: {
              type: "string",
              format: "uuid",
              description: "ID de la productora asociada.",
              example: "123e4567-e89b-12d3-a456-426614174000"
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación del ISRC.",
              example: "2024-02-12T10:00:00.000Z"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Última fecha de actualización del ISRC.",
              example: "2024-02-12T10:00:00.000Z"
            }
          }
        }
      }
    }
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
      message: {
        type: "string",
        description: "Mensaje de estado de la respuesta.",
        example: "Postulaciones obtenidas exitosamente."
      },
      total: {
        type: "integer",
        description: "Número total de postulaciones en la base de datos.",
        example: 100
      },
      page: {
        type: "integer",
        description: "Número de página actual.",
        example: 1
      },
      limit: {
        type: "integer",
        description: "Número de resultados por página.",
        example: 10
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
              example: "987e6543-e21b-11d3-b456-426614174000"
            },
            nombre_premio: {
              type: "string",
              description: "Nombre del premio o postulación.",
              example: "Mejor Álbum del Año"
            },
            fecha_asignacion: {
              type: "string",
              format: "date-time",
              description: "Fecha en que se realizó la asignación del premio.",
              example: "2023-01-15T10:00:00Z"
            },
            productora: {
              type: "object",
              properties: {
                id_productora: {
                  type: "string",
                  format: "uuid",
                  description: "ID de la productora.",
                  example: "123e4567-e89b-12d3-a456-426614174000"
                },
                nombre_productora: {
                  type: "string",
                  description: "Nombre de la productora asociada.",
                  example: "Productora Ejemplo"
                }
              }
            }
          }
        }
      }
    }
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
        productora: {
            type: "object",
            properties: {
                usuarioPrincipal: {
                    type: "object",
                    description: "Información del usuario principal asociado a la productora.",
                    properties: {
                        id_usuario: {
                            type: "string",
                            format: "uuid",
                            description: "ID único del usuario principal.",
                            example: "2c04a4fa-a049-48e5-8767-a6aba5b746d4",
                        },
                        nombre: {
                            type: "string",
                            description: "Nombre del usuario principal.",
                            example: "Juan",
                        },
                        apellido: {
                            type: "string",
                            description: "Apellido del usuario principal.",
                            example: "Pérez",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "Correo electrónico del usuario principal.",
                            example: "juanperez@dominio.com",
                        },
                    },
                },
                id_productora: {
                    type: "string",
                    format: "uuid",
                    description: "ID único de la productora.",
                    example: "b2e9c0d5-67f5-4dd0-84e3-261853bc7ba2",
                },
                nombre_productora: {
                    type: "string",
                    description: "Nombre de la productora.",
                    example: "Productora Ejemplo",
                },
                tipo_persona: {
                    type: "string",
                    enum: ["FISICA", "JURIDICA"],
                    description: "Tipo de persona jurídica de la productora.",
                    example: "FISICA",
                },
                cuit_cuil: {
                    type: "string",
                    description: "Número de CUIT o CUIL de la productora.",
                    example: "30123456789",
                },
                email: {
                    type: "string",
                    format: "email",
                    description: "Correo electrónico de la productora.",
                    example: "productora@ejemplo.com",
                },
                direccion: {
                    type: "string",
                    description: "Dirección de la productora.",
                    example: "Av. Siempre Viva 123, Palermo, Buenos Aires, 1425",
                },
                telefono: {
                    type: "string",
                    description: "Teléfono de contacto de la productora.",
                    example: "+54 11 1234-5678",
                },
                nacionalidad: {
                    type: "string",
                    description: "Nacionalidad de la productora.",
                    example: "Argentina",
                },
                alias_cbu: {
                    type: "string",
                    description: "Alias del CBU de la productora.",
                    example: "AliasCBUEjemplo",
                },
                cbu: {
                    type: "string",
                    description: "CBU de la productora.",
                    example: "1234567890123456789012",
                },
                cantidad_fonogramas: {
                    type: "integer",
                    description: "Cantidad de fonogramas asociados a la productora.",
                    example: 0,
                },
                denominacion_sello: {
                    type: "string",
                    description: "Denominación del sello de la productora.",
                    example: "Sello Ejemplo",
                },
                datos_adicionales: {
                    type: "string",
                    description: "Información adicional sobre la productora.",
                    example: "Productora especializada en música.",
                },
                fecha_alta: {
                    type: "string",
                    format: "date-time",
                    description: "Fecha en que la productora fue autorizada.",
                    example: "2025-02-05T13:29:51.610Z",
                    nullable: true,
                },
                fecha_ultimo_fonograma: {
                    type: "string",
                    format: "date-time",
                    description: "Fecha del último fonograma registrado.",
                    example: null,
                    nullable: true,
                },
                nombres: {
                    type: "string",
                    description: "Nombre del titular de la productora (si es persona física).",
                    example: "Juan",
                    nullable: true,
                },
                apellidos: {
                    type: "string",
                    description: "Apellido del titular de la productora (si es persona física).",
                    example: "Pérez",
                    nullable: true,
                },
                razon_social: {
                    type: "string",
                    description: "Razón social de la empresa (si es persona jurídica).",
                    example: "Empresa S.A.",
                    nullable: true,
                },
                apellidos_representante: {
                    type: "string",
                    description: "Apellido del representante legal (si es persona jurídica).",
                    example: "García",
                    nullable: true,
                },
                nombres_representante: {
                    type: "string",
                    description: "Nombre del representante legal (si es persona jurídica).",
                    example: "Ana",
                    nullable: true,
                },
                cuit_representante: {
                    type: "string",
                    description: "CUIT del representante legal (si es persona jurídica).",
                    example: "20123456785",
                    nullable: true,
                },
                codigosDeLaProductora: {
                    type: "array",
                    description: "Lista de códigos ISRC asociados a la productora.",
                    items: {
                        type: "object",
                        properties: {
                            tipo: {
                                type: "string",
                                description: "Tipo de código ISRC (AUDIO, VIDEO, etc.).",
                                example: "AUDIO",
                            },
                            codigo_productora: {
                                type: "string",
                                description: "Código ISRC asociado a la productora.",
                                example: "AAC",
                            },
                        },
                        example: [
                            {
                                tipo: "AUDIO",
                                codigo_productora: "AAC"
                            },
                            {
                                tipo: "VIDEO",
                                codigo_productora: "AAD"
                            }
                        ]
                    },
                },
                createdAt: {
                    type: "string",
                    format: "date-time",
                    description: "Fecha de creación del registro en el sistema.",
                    example: "2025-02-05T13:25:19.689Z",
                },
                updatedAt: {
                    type: "string",
                    format: "date-time",
                    description: "Fecha de la última actualización del registro.",
                    example: "2025-02-05T13:29:51.610Z",
                },
            },
        },
    },
  },
  GetAllProductoras: {
    title: "Productoras - Obtener Todas las Productoras",
    type: "object",
    properties: {
        total: {
            type: "integer",
            example: 25,
            description: "Número total de productoras encontradas.",
        },
        totalPages: {
            type: "integer",
            example: 5,
            description: "Cantidad total de páginas disponibles.",
        },
        currentPage: {
            type: "integer",
            example: 1,
            description: "Página actual de la respuesta.",
        },
        data: {
            type: "array",
            description: "Lista de productoras en la página actual.",
            items: {
                type: "object",
                properties: {
                    id_productora: {
                        type: "string",
                        format: "uuid",
                        description: "ID único de la productora.",
                        example: "b2e9c0d5-67f5-4dd0-84e3-261853bc7ba2",
                    },
                    nombre_productora: {
                        type: "string",
                        description: "Nombre de la productora.",
                        example: "Productora Ejemplo",
                    },
                    tipo_persona: {
                        type: "string",
                        enum: ["FISICA", "JURIDICA"],
                        description: "Tipo de persona jurídica de la productora.",
                        example: "JURIDICA",
                    },
                    cuit_cuil: {
                        type: "string",
                        description: "Número de CUIT o CUIL de la productora.",
                        example: "30123456789",
                    },
                    email: {
                        type: "string",
                        format: "email",
                        description: "Correo electrónico de la productora.",
                        example: "productora@ejemplo.com",
                    },
                    direccion: {
                        type: "string",
                        description: "Dirección de la productora.",
                        example: "Av. Siempre Viva 123, Palermo, Buenos Aires, 1425",
                    },
                    telefono: {
                        type: "string",
                        description: "Teléfono de contacto de la productora.",
                        example: "+54 11 1234-5678",
                    },
                    nacionalidad: {
                        type: "string",
                        description: "Nacionalidad de la productora.",
                        example: "Argentina",
                    },
                    alias_cbu: {
                        type: "string",
                        description: "Alias del CBU de la productora.",
                        example: "AliasCBUEjemplo",
                    },
                    cbu: {
                        type: "string",
                        description: "CBU de la productora.",
                        example: "1234567890123456789012",
                    },
                    cantidad_fonogramas: {
                        type: "integer",
                        description: "Cantidad de fonogramas asociados a la productora.",
                        example: 0,
                    },
                    estado: {
                        type: "string",
                        enum: ["Autorizada", "Pendiente"],
                        description: "Estado de la productora basado en su fecha de alta.",
                        example: "Autorizada",
                    },
                    usuarioPrincipal: {
                        type: "string",
                        format: "uuid",
                        description: "ID del usuario principal asociado a la productora.",
                        example: "2c04a4fa-a049-48e5-8767-a6aba5b746d4",
                        nullable: true,
                    },
                    documentos: {
                        type: "array",
                        description: "Lista de documentos asociados a la productora.",
                        items: {
                            type: "object",
                            properties: {
                                nombre: {
                                    type: "string",
                                    description: "Tipo de documento.",
                                    example: "contrato_social",
                                },
                                ruta: {
                                    type: "string",
                                    format: "uri",
                                    description: "URL del documento.",
                                    example: "https://example.com/documentos/contrato_social.pdf",
                                },
                            },
                        },
                    },
                    codigosDeLaProductora: {
                        type: "array",
                        description: "Lista de códigos ISRC asociados a la productora.",
                        items: {
                            type: "object",
                            properties: {
                                tipo: {
                                    type: "string",
                                    description: "Tipo de código ISRC (AUDIO, VIDEO, etc.).",
                                    example: "AUDIO",
                                },
                                codigo_productora: {
                                    type: "string",
                                    description: "Código ISRC asociado a la productora.",
                                    example: "AAC",
                                },
                            },
                            example: [
                                {
                                    tipo: "AUDIO",
                                    codigo_productora: "AAC"
                                },
                                {
                                    tipo: "VIDEO",
                                    codigo_productora: "AAD"
                                }
                            ]
                        }
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                        description: "Fecha de creación del registro en el sistema.",
                        example: "2025-02-05T13:25:19.689Z",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                        description: "Fecha de la última actualización del registro.",
                        example: "2025-02-05T13:29:51.610Z",
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
        tipo_persona: {
            type: "string",
            enum: ["FISICA", "JURIDICA"],
            description: "Tipo de persona jurídica de la productora.",
            example: "FISICA",
        },
        cuit_cuil: {
            type: "string",
            description: "CUIT o CUIL de la productora.",
            example: "30123456789",
        },
        email: {
            type: "string",
            format: "email",
            description: "Correo electrónico de la productora.",
            example: "productora@ejemplo.com",
        },
        calle: {
            type: "string",
            description: "Nombre de la calle de la dirección de la productora.",
            example: "Av. Siempre Viva",
        },
        numero: {
            type: "string",
            description: "Número de la dirección de la productora.",
            example: "123",
        },
        ciudad: {
            type: "string",
            description: "Ciudad donde se encuentra la productora.",
            example: "Buenos Aires",
        },
        localidad: {
            type: "string",
            description: "Localidad donde se encuentra la productora.",
            example: "Palermo",
        },
        provincia: {
            type: "string",
            description: "Provincia donde se encuentra la productora.",
            example: "Buenos Aires",
        },
        codigo_postal: {
            type: "string",
            description: "Código postal de la productora.",
            example: "1425",
        },
        telefono: {
            type: "string",
            description: "Teléfono de contacto de la productora.",
            example: "+54 11 1234-5678",
        },
        nacionalidad: {
            type: "string",
            description: "Nacionalidad de la productora.",
            example: "Argentina",
        },
        alias_cbu: {
            type: "string",
            description: "Alias del CBU de la productora.",
            example: "AliasCBUEjemplo",
        },
        cbu: {
            type: "string",
            description: "CBU de la productora.",
            example: "1234567890123456789012",
        },
        denominacion_sello: {
            type: "string",
            description: "Denominación del sello de la productora.",
            example: "Sello Ejemplo",
            nullable: true,
        },
        datos_adicionales: {
            type: "string",
            description: "Información adicional sobre la productora.",
            example: "Productora especializada en música.",
            nullable: true,
        }
    },
    allOf: [
        {
            $ref: "#/components/schemas/ProductoraBase"
        },
        {
            oneOf: [
                {
                    $ref: "#/components/schemas/ProductoraFisica"
                },
                {
                    $ref: "#/components/schemas/ProductoraJuridica"
                }
            ]
        }
    ]
},

ProductoraBase: {
    type: "object",
    description: "Datos básicos que toda productora debe incluir.",
    required: [
        "nombre_productora",
        "tipo_persona",
        "cuit_cuil",
        "email",
        "calle",
        "numero",
        "ciudad",
        "localidad",
        "provincia",
        "codigo_postal",
        "telefono",
        "nacionalidad",
        "alias_cbu",
        "cbu"
    ]
},

ProductoraFisica: {
    type: "object",
    description: "Datos requeridos si la productora es una Persona Física.",
    properties: {
        nombres: {
            type: "string",
            description: "Nombre del titular de la productora (si es persona física).",
            example: "Juan",
        },
        apellidos: {
            type: "string",
            description: "Apellido del titular de la productora (si es persona física).",
            example: "Pérez",
        }
    },
    required: ["nombres", "apellidos"]
},

ProductoraJuridica: {
    type: "object",
    description: "Datos requeridos si la productora es una Persona Jurídica.",
    properties: {
        razon_social: {
            type: "string",
            description: "Razón social de la empresa (si es persona jurídica).",
            example: "Empresa S.A.",
        },
        apellidos_representante: {
            type: "string",
            description: "Apellido del representante legal (si es persona jurídica).",
            example: "García",
        },
        nombres_representante: {
            type: "string",
            description: "Nombre del representante legal (si es persona jurídica).",
            example: "Ana",
        },
        cuit_representante: {
            type: "string",
            description: "CUIT del representante legal (si es persona jurídica).",
            example: "20123456785",
        }
    },
    required: ["razon_social", "apellidos_representante", "nombres_representante", "cuit_representante"]
  },  
  UpdateProductora: {
    title: "Productoras - Actualizar Productora",
    type: "object",
    properties: {
      nombre_productora: {
        type: "string",
        description: "Nombre actualizado de la productora.",
        example: "Productora Actualizada"
      },
      tipo_persona: {
        type: "string",
        enum: ["FISICA", "JURIDICA"],
        description: "Tipo de persona: FISICA o JURIDICA.",
        example: "JURIDICA"
      },
      cuit_cuil: {
        type: "string",
        pattern: "^[0-9]{11}$",
        description: "CUIT o CUIL actualizado de la productora.",
        example: "30876543212"
      },
      email: {
        type: "string",
        format: "email",
        description: "Correo electrónico actualizado de la productora.",
        example: "actualizado@productora.com"
      },
      calle: {
        type: "string",
        description: "Calle de la dirección de la productora.",
        example: "Av. Siempre Viva"
      },
      numero: {
        type: "string",
        description: "Número de la dirección de la productora.",
        example: "456"
      },
      ciudad: {
        type: "string",
        description: "Ciudad de la productora.",
        example: "Buenos Aires"
      },
      localidad: {
        type: "string",
        description: "Localidad de la productora.",
        example: "Palermo"
      },
      provincia: {
        type: "string",
        description: "Provincia de la productora.",
        example: "Buenos Aires"
      },
      codigo_postal: {
        type: "string",
        description: "Código postal de la productora.",
        example: "C1425"
      },
      telefono: {
        type: "string",
        description: "Teléfono actualizado de la productora.",
        example: "+54 11 9876-5432"
      },
      nacionalidad: {
        type: "string",
        description: "Nacionalidad de la productora.",
        example: "Argentina"
      },
      alias_cbu: {
        type: "string",
        description: "Alias CBU actualizado de la productora.",
        example: "miempresa.alias"
      },
      cbu: {
        type: "string",
        pattern: "^[0-9]{22}$",
        description: "CBU actualizado de la productora.",
        example: "2850590940090418135271"
      },
      denominacion_sello: {
        type: "string",
        nullable: true,
        description: "Denominación del sello si corresponde.",
        example: "Sello Actualizado"
      },
      datos_adicionales: {
        type: "string",
        nullable: true,
        description: "Datos adicionales de la productora.",
        example: "Empresa líder en distribución musical."
      },
      nombres: {
        type: "string",
        nullable: true,
        description: "Nombres si la productora es una persona física.",
        example: "Juan Carlos"
      },
      apellidos: {
        type: "string",
        nullable: true,
        description: "Apellidos si la productora es una persona física.",
        example: "Pérez"
      },
      razon_social: {
        type: "string",
        nullable: true,
        description: "Razón social si la productora es una persona jurídica.",
        example: "Productora S.A."
      },
      apellidos_representante: {
        type: "string",
        nullable: true,
        description: "Apellidos del representante si es persona jurídica.",
        example: "González"
      },
      nombres_representante: {
        type: "string",
        nullable: true,
        description: "Nombres del representante si es persona jurídica.",
        example: "Carlos Alberto"
      },
      cuit_representante: {
        type: "string",
        nullable: true,
        pattern: "^[0-9]{11}$",
        description: "CUIT del representante si es persona jurídica.",
        example: "20345678901"
      }
    },
    required: ["nombre_productora", "tipo_persona", "cuit_cuil", "email", "calle", "numero", "ciudad", "localidad", "provincia", "codigo_postal", "telefono", "nacionalidad", "alias_cbu", "cbu"]
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