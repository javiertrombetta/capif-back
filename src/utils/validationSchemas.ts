import Joi from 'joi';
import { VALIDATION_AUTH } from '../utils/messages';

export const uuidSchema = Joi.string()
  .guid({ version: ['uuidv4'] })
  .required()
  .messages({
    'string.guid': '{#label} debe ser un UUID válido.',
    'any.required': '{#label} es obligatorio.',
  });

//  start of authRoutes

export const registerPrimarySchema = Joi.object({
  email: Joi.string().email().required().messages(VALIDATION_AUTH.email),
  password: Joi.string().min(8).required().messages(VALIDATION_AUTH.password),
});

export const registerSecondarySchema = Joi.object({
  email: Joi.string().email().required().messages(VALIDATION_AUTH.email),
  nombre: Joi.string()
    .min(3)
    .max(100)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages(VALIDATION_AUTH.nombre),
  apellido: Joi.string()
    .min(3)
    .max(100)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages(VALIDATION_AUTH.apellido),
  telefono: Joi.string()
    .max(50)
    .regex(/^[0-9\-+() ]+$/)
    .allow(null, '')
    .messages(VALIDATION_AUTH.telefono),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages(VALIDATION_AUTH.email),
  password: Joi.string().min(8).required().messages(VALIDATION_AUTH.password),
});

export const selectProductoraSchema = Joi.object({
  productoraId: uuidSchema,
});

export const requestPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages(VALIDATION_AUTH.email),
});

export const validateEmailSchema = Joi.object({
  token: Joi.string().required().messages(VALIDATION_AUTH.token),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages(VALIDATION_AUTH.token),
  newPassword: Joi.string().min(8).required().messages(VALIDATION_AUTH.newPassword),
});


//  end of authRoutes

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// strart of usersRoutes

export const availableDisableSchema = Joi.object({
  usuarioId: uuidSchema,  
});

// Schema for blocking/unblocking a user
// Validación del path
export const blockOrUnblockParamsSchema = Joi.object({
  usuarioId: uuidSchema,
});

// Validación del body
export const blockOrUnblockBodySchema = Joi.object({
  isBlocked: Joi.boolean().required().messages({
    'any.required': '{#label} es obligatorio.',
    'boolean.base': '{#label} debe ser un valor booleano.',
  }),
});

// Schema para filtros en query
export const getUsuariosQuerySchema = Joi.object({
  usuarioId: uuidSchema.optional(),
  email: Joi.string().optional(),
  nombre: Joi.string().optional(),
  apellido: Joi.string().optional(),
  estado: Joi.string()
    .valid(
      "DEPURAR",
      "NUEVO",
      "CONFIRMADO",
      "PENDIENTE",
      "ENVIADO",
      "HABILITADO",
      "DESHABILITADO"
    )
    .optional()
    .messages({
      "any.only": "El estado debe ser uno de los valores permitidos.",
    }),
  rolId: Joi.string().uuid().optional().messages({
    "string.uuid": "El rolId debe ser un UUID válido.",
  }),
  rolNombre: Joi.string().optional(),
  productoraId: Joi.string().uuid().optional().messages({
    "string.uuid": "El productoraId debe ser un UUID válido.",
  }),
  productoraNombre: Joi.string().optional(),
  limit: Joi.number().integer().min(1).optional().messages({
    "number.min": "El límite debe ser al menos 1.",
  }),
  offset: Joi.number().integer().min(0).optional().messages({
    "number.min": "El offset debe ser 0 o mayor.",
  }),
}).options({ allowUnknown: false });

// Schema for creating an admin user
export const createAdminSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '{#label} debe ser un correo electrónico válido.',
    'any.required': '{#label} es obligatorio.',
  }),
  nombre: Joi.string()
    .min(3)
    .max(100)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages(VALIDATION_AUTH.nombre),
  apellido: Joi.string()
    .min(3)
    .max(100)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages(VALIDATION_AUTH.apellido),
  telefono: Joi.string()
    .max(50)
    .regex(/^[0-9\-+() ]+$/)
    .allow(null, '')
    .messages(VALIDATION_AUTH.telefono),  
});

// Schema for getting pending registrations
export const getRegistrosPendientesSchema = Joi.object({
  usuarioId: uuidSchema.optional(),
});

// Schema for approving an application
export const approveApplicationSchema = Joi.object({
  usuarioId: uuidSchema,
});

// Schema for rejecting an application usuarioId
// Params
export const rejectApplicationParamsSchema = Joi.object({
  usuarioId: Joi.string().uuid().required().messages({
    'string.uuid': 'El ID del usuario debe ser un UUID válido.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
});

// Body
export const rejectApplicationBodySchema = Joi.object({
  comentario: Joi.string().min(5).required().messages({
    'string.min': 'El comentario debe tener al menos 5 caracteres.',
    'any.required': 'El comentario es obligatorio.',
  }),
});

// Document Schema (Optional)
const documentSchema = Joi.object({
  nombre_documento: Joi.string().required().messages({
    'any.required': 'El campo nombre_documento es obligatorio.',
  }),
  ruta_archivo_documento: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'El campo ruta_archivo_documento debe ser una URI válida.',
      'any.required': 'El campo ruta_archivo_documento es obligatorio.',
    }),
});

// Productora Data Schema
const productoraDataSchema = Joi.object({
  id_productora: uuidSchema.optional().messages({
    'string.guid': 'El campo id_productora debe ser un UUID válido.',
  }),
  tipo_persona: Joi.string()
    .valid('FISICA', 'JURIDICA')
    .required()
    .messages({
      'any.required': 'El campo tipo_persona es obligatorio.',
      'any.only': 'El campo tipo_persona debe ser "FISICA" o "JURIDICA".',
    }),
  nombre_productora: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'any.required': 'El campo nombre_productora es obligatorio.',
      'string.min': 'El campo nombre_productora debe tener al menos 3 caracteres.',
      'string.max': 'El campo nombre_productora no debe exceder los 255 caracteres.',
    }),
  cuit_cuil: Joi.string()
    .length(11)
    .required()
    .messages({
      'any.required': 'El campo cuit_cuil es obligatorio.',
      'string.length': 'El campo cuit_cuil debe tener exactamente 11 caracteres.',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'El campo email es obligatorio.',
      'string.email': 'El campo email debe ser un correo electrónico válido.',
    }),
  calle: Joi.string().required().messages({
    'any.required': 'El campo calle es obligatorio.',
  }),
  numero: Joi.string().required().messages({
    'any.required': 'El campo numero es obligatorio.',
  }),
  ciudad: Joi.string().required().messages({
    'any.required': 'El campo ciudad es obligatorio.',
  }),
  localidad: Joi.string().required().messages({
    'any.required': 'El campo localidad es obligatorio.',
  }),
  provincia: Joi.string().required().messages({
    'any.required': 'El campo provincia es obligatorio.',
  }),
  codigo_postal: Joi.string().required().messages({
    'any.required': 'El campo codigo_postal es obligatorio.',
  }),
  telefono: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'any.required': 'El campo telefono es obligatorio.',
      'string.pattern.base': 'El campo telefono debe contener solo números.',
    }),
  nacionalidad: Joi.string().required().messages({
    'any.required': 'El campo nacionalidad es obligatorio.',
  }),
  alias_cbu: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'any.required': 'El campo alias_cbu es obligatorio.',
      'string.min': 'El campo alias_cbu debe tener al menos 6 caracteres.',
      'string.max': 'El campo alias_cbu no debe exceder los 20 caracteres.',
    }),
  cbu: Joi.string()
    .length(22)
    .required()
    .messages({
      'any.required': 'El campo cbu es obligatorio.',
      'string.length': 'El campo cbu debe tener exactamente 22 caracteres.',
    }),
  denominacion_sello: Joi.string().optional().messages({
    'string.base': 'El campo denominacion_sello debe ser un texto.',
  }),
  datos_adicionales: Joi.string().optional().messages({
    'string.base': 'El campo datos_adicionales debe ser un texto.',
  }),
  nombres: Joi.string().optional().messages({
    'string.base': 'El campo nombres debe ser un texto.',
  }),
  apellidos: Joi.string().optional().messages({
    'string.base': 'El campo apellidos debe ser un texto.',
  }),
  razon_social: Joi.string().optional().messages({
    'string.base': 'El campo razon_social debe ser un texto.',
  }),
  nombres_representante: Joi.string().optional().messages({
    'string.base': 'El campo nombres_representante debe ser un texto.',
  }),
  apellidos_representante: Joi.string().optional().messages({
    'string.base': 'El campo apellidos_representante debe ser un texto.',
  }),
  cuit_representante: Joi.string()
    .length(11)
    .optional()
    .messages({
      'string.length': 'El campo cuit_representante debe tener exactamente 11 caracteres.',
    }),
}).required().messages({
  'object.base': 'El campo productoraData debe ser un objeto.',
  'any.required': 'El campo productoraData es obligatorio.',
});

// Main Schema for sendApplication
export const sendApplicationSchema = Joi.object({
  productoraData: productoraDataSchema,

  nombre: Joi.string().min(3).max(255).required().messages({
    'any.required': 'El campo nombre es obligatorio.',
    'string.min': 'El campo nombre debe tener al menos 3 caracteres.',
    'string.max': 'El campo nombre no debe exceder los 255 caracteres.',
  }),

  apellido: Joi.string().min(3).max(255).required().messages({
    'any.required': 'El campo apellido es obligatorio.',
    'string.min': 'El campo apellido debe tener al menos 3 caracteres.',
    'string.max': 'El campo apellido no debe exceder los 255 caracteres.',
  }),

  telefono: Joi.string().pattern(/^[0-9]+$/).required().messages({
    'any.required': 'El campo telefono es obligatorio.',
    'string.pattern.base': 'El campo telefono debe contener solo números.',
  }),
});

// Schema for updating a user's details
//Params
export const updateUserParamsSchema = Joi.object({
  usuarioId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.uuid": "El usuarioId debe ser un UUID válido.",
      "any.required": "El usuarioId es obligatorio.",
    }),
});

//Body
export const updateUserBodySchema = Joi.object({
  datosUsuario: Joi.object({
    email: Joi.string()
      .email()
      .optional()
      .messages({
        "string.email": "El campo email debe ser un correo electrónico válido.",
      }),
    nombre: Joi.string()
      .min(3)
      .max(255)
      .optional()
      .messages({
        "string.min": "El campo nombre debe tener al menos 3 caracteres.",
        "string.max": "El campo nombre no debe exceder los 255 caracteres.",
      }),
    apellido: Joi.string()
      .min(3)
      .max(255)
      .optional()
      .messages({
        "string.min": "El campo apellido debe tener al menos 3 caracteres.",
        "string.max": "El campo apellido no debe exceder los 255 caracteres.",
      }),
    telefono: Joi.string()
      .pattern(/^[0-9\-+() ]{7,20}$/)
      .optional()
      .messages({
        "string.pattern.base": "El campo telefono debe ser un número válido entre 7 y 20 caracteres.",
      }),
  })
    .required()
    .messages({
      "object.base": "El campo datosUsuario debe ser un objeto.",
      "any.required": "El campo datosUsuario es obligatorio.",
    }),
});

// Schema for deleting a user
export const deleteUserSchema = Joi.object({
  usuarioId: uuidSchema
}).required().messages({
  'object.base': 'Los datos proporcionados deben ser un objeto válido.',
  'any.required': 'Los datos para eliminar un usuario son obligatorios.',
});

// Schema for updating user's views
// Params
export const updateUserViewsParamsSchema = Joi.object({
  usuarioId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.uuid": "El usuarioId debe ser un UUID válido.",
      "any.required": "El usuarioId es obligatorio.",
    }),
});

// Body
export const updateUserViewsBodySchema = Joi.object({
  roleName: Joi.string()
    .required()
    .messages({
      "string.base": "El nombre del rol debe ser un string.",
      "any.required": "El nombre del rol es obligatorio.",
    }),
});

// Schema for getting user's views
export const getVistasByUsuarioSchema = Joi.object({
  usuarioId: uuidSchema
});

// Schema for updating status of user's views
// Params
export const toggleUserViewStatusParamsSchema = Joi.object({
  usuarioId: uuidSchema
});

//Body
export const toggleUserViewStatusBodySchema = Joi.object({
  vistas: Joi.array()
    .items(
      Joi.object({
        nombre_vista: Joi.string()
          .required()
          .messages({
            "any.required": "El campo nombre_vista es obligatorio.",
            "string.base": "El campo nombre_vista debe ser una cadena.",
          }),
        is_habilitado: Joi.boolean()
          .required()
          .messages({
            "any.required": "El campo is_habilitado es obligatorio.",
            "boolean.base": "El campo is_habilitado debe ser un valor booleano.",
          }),
      }).messages({
        "object.base": "Cada elemento en el campo vistas debe ser un objeto válido.",
      })
    )
    .required()
    .messages({
      "array.base": "El campo vistas debe ser un arreglo.",
      "any.required": "El campo vistas es obligatorio.",
    }),
});

export const deleteApplicationSchema = Joi.object({
  usuarioId: uuidSchema
});

export const changePasswordParamsSchema = Joi.object({
  usuarioId: uuidSchema
});

export const changePasswordBodySchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.min": "La nueva contraseña debe tener al menos 8 caracteres.",
      "any.required": "La nueva contraseña es obligatoria.",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "La confirmación de contraseña debe coincidir con la nueva contraseña.",
      "any.required": "La confirmación de contraseña es obligatoria.",
    }),
});


//  end of usersRoutes

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// strart of producersRoutes

export const getDocumentoByIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
  docId: Joi.string().uuid().required().messages({
    "string.base": "El ID del documento debe ser un texto.",
    "string.empty": "El ID del documento no puede estar vacío.",
    "string.uuid": "El ID del documento debe ser un UUID válido.",
    "any.required": "El ID del documento es obligatorio.",
  }),
});

export const getAllDocumentosSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getDocumentosMetadataSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

// export const createDocumentoSchema = Joi.object({
//   tipoDocumento: Joi.string()
//     .valid(
//       "dni_persona_fisica",
//       "dni_representante_legal",
//       "comprobante_ISRC",
//       "contrato_social"
//     )
//     .required()
//     .messages({
//       "string.base": "El tipo de documento debe ser un texto.",
//       "string.empty": "El tipo de documento no puede estar vacío.",
//       "any.only": "El tipo de documento debe ser uno de los siguientes: dni_persona_fisica, dni_representante_legal, comprobante_ISRC, contrato_social.",
//       "any.required": "El tipo de documento es obligatorio.",
//     }),
// });

export const documentoParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
  docId: Joi.string().uuid().required().messages({
    "string.base": "El ID del documento debe ser un texto.",
    "string.empty": "El ID del documento no puede estar vacío.",
    "string.uuid": "El ID del documento debe ser un UUID válido.",
    "any.required": "El ID del documento es obligatorio.",
  }),
});

export const updateDocumentoSchema = Joi.object({
  nombre_documento: Joi.string().required().messages({
    "string.base": "El nombre del documento debe ser un texto.",
    "string.empty": "El nombre del documento no puede estar vacío.",
    "any.required": "El nombre del documento es obligatorio.",
  }),
  ruta_archivo_documento: Joi.string().required().messages({
    "string.base": "La ruta del archivo debe ser un texto.",
    "string.empty": "La ruta del archivo no puede estar vacía.",
    "any.required": "La ruta del archivo es obligatoria.",
  }),
});

export const deleteAllDocumentosSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getISRCByIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const createISRCBodySchema = Joi.object({
  codigo_productora: Joi.string().required().messages({
    "string.base": "El código ISRC debe ser un texto.",
    "string.empty": "El código ISRC no puede estar vacío.",
    "any.required": "El código ISRC es obligatorio.",
  }),
  descripcion: Joi.string().allow("").optional().messages({
    "string.base": "La descripción debe ser un texto.",
  }),
});

export const createISRCParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const updateISRCBodySchema = Joi.object({
  id_productora_isrc: Joi.string().uuid().required().messages({
    "string.base": "El ID del ISRC debe ser un texto.",
    "string.empty": "El ID del ISRC no puede estar vacío.",
    "string.uuid": "El ID del ISRC debe ser un UUID válido.",
    "any.required": "El ID del ISRC es obligatorio.",
  }),
  codigo_productora: Joi.string().required().messages({
    "string.base": "El código ISRC debe ser un texto.",
    "string.empty": "El código ISRC no puede estar vacío.",
    "any.required": "El código ISRC es obligatorio.",
  }),
  descripcion: Joi.string().allow("").optional().messages({
    "string.base": "La descripción debe ser un texto.",
  }),
});

export const updateISRCParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const deleteISRCParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getPostulacionesByIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getAllPostulacionesQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional().messages({
    "date.base": "La fecha de inicio debe ser válida.",
    "date.format": "La fecha de inicio debe estar en formato ISO.",
  }),
  endDate: Joi.date().iso().optional().messages({
    "date.base": "La fecha de fin debe ser válida.",
    "date.format": "La fecha de fin debe estar en formato ISO.",
  }),
  productoraName: Joi.string().optional().messages({
    "string.base": "El nombre de la productora debe ser un texto.",
  }),
});

export const createPostulacionesQuerySchema = Joi.object({
  startDate: Joi.date().iso().required().messages({
    "date.base": "La fecha de inicio debe ser válida.",
    "date.format": "La fecha de inicio debe estar en formato ISO.",
    "any.required": "La fecha de inicio es obligatoria.",
  }),
  endDate: Joi.date().iso().required().messages({
    "date.base": "La fecha de fin debe ser válida.",
    "date.format": "La fecha de fin debe estar en formato ISO.",
    "any.required": "La fecha de fin es obligatoria.",
  }),
});

export const updatePostulacionBodySchema = Joi.object({
  id_premio: Joi.string().uuid().required().messages({
    "string.base": "El ID de la postulación debe ser un texto.",
    "string.empty": "El ID de la postulación no puede estar vacío.",
    "string.uuid": "El ID de la postulación debe ser un UUID válido.",
    "any.required": "El ID de la postulación es obligatorio.",
  }),
  nombre_premio: Joi.string().required().messages({
    "string.base": "El nombre del premio debe ser un texto.",
    "string.empty": "El nombre del premio no puede estar vacío.",
    "any.required": "El nombre del premio es obligatorio.",
  }),
  fecha_asignacion: Joi.date().iso().optional().messages({
    "date.base": "La fecha de asignación debe ser válida.",
    "date.format": "La fecha de asignación debe estar en formato ISO.",
  }),
});

export const updatePostulacionParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const deletePostulacionParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getProductoraByIdParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const createProductoraBodySchema = Joi.object({
  nombre_productora: Joi.string().required().messages({
    "string.base": "El nombre de la productora debe ser un texto.",
    "string.empty": "El nombre de la productora no puede estar vacío.",
    "any.required": "El nombre de la productora es obligatorio.",
  }),
  direccion: Joi.string().required().messages({
    "string.base": "La dirección debe ser un texto.",
    "string.empty": "La dirección no puede estar vacía.",
    "any.required": "La dirección es obligatoria.",
  }),
  telefono: Joi.string()
    .pattern(/^\+?[0-9\s\-]+$/)
    .required()
    .messages({
      "string.base": "El teléfono debe ser un texto.",
      "string.empty": "El teléfono no puede estar vacío.",
      "string.pattern.base": "El teléfono tiene un formato inválido.",
      "any.required": "El teléfono es obligatorio.",
    }),
  email: Joi.string().email().required().messages({
    "string.base": "El correo electrónico debe ser un texto.",
    "string.empty": "El correo electrónico no puede estar vacío.",
    "string.email": "El correo electrónico tiene un formato inválido.",
    "any.required": "El correo electrónico es obligatorio.",
  }),
  cuit_cuil: Joi.string()
    .pattern(/^\d{2}-\d{8}-\d{1}$/)
    .required()
    .messages({
      "string.base": "El CUIT/CUIL debe ser un texto.",
      "string.empty": "El CUIT/CUIL no puede estar vacío.",
      "string.pattern.base": "El CUIT/CUIL tiene un formato inválido.",
      "any.required": "El CUIT/CUIL es obligatorio.",
    }),
});

export const updateProductoraBodySchema = Joi.object({
  nombre_productora: Joi.string().required().messages({
    "string.base": "El nombre de la productora debe ser un texto.",
    "string.empty": "El nombre de la productora no puede estar vacío.",
    "any.required": "El nombre de la productora es obligatorio.",
  }),
  direccion: Joi.string().required().messages({
    "string.base": "La dirección debe ser un texto.",
    "string.empty": "La dirección no puede estar vacía.",
    "any.required": "La dirección es obligatoria.",
  }),
  telefono: Joi.string()
    .pattern(/^\+?[0-9\s\-]+$/)
    .required()
    .messages({
      "string.base": "El teléfono debe ser un texto.",
      "string.empty": "El teléfono no puede estar vacío.",
      "string.pattern.base": "El teléfono tiene un formato inválido.",
      "any.required": "El teléfono es obligatorio.",
    }),
  email: Joi.string().email().required().messages({
    "string.base": "El correo electrónico debe ser un texto.",
    "string.empty": "El correo electrónico no puede estar vacío.",
    "string.email": "El correo electrónico tiene un formato inválido.",
    "any.required": "El correo electrónico es obligatorio.",
  }),
  cuit_cuil: Joi.string()
    .pattern(/^\d{2}-\d{8}-\d{1}$/)
    .required()
    .messages({
      "string.base": "El CUIT/CUIL debe ser un texto.",
      "string.empty": "El CUIT/CUIL no puede estar vacío.",
      "string.pattern.base": "El CUIT/CUIL tiene un formato inválido.",
      "any.required": "El CUIT/CUIL es obligatorio.",
    }),
});

export const updateProductoraParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const deleteProductoraParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});