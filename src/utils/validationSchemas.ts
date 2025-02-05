import Joi from 'joi';
import { VALIDATION_AUTH } from '../utils/messages';

// Esquema base para UUID
export const uuidSchema = Joi.string()
  .guid({ version: ['uuidv4'] })
  .required()
  .messages({
    'string.guid': '{#label} debe ser un UUID válido.',
    'any.required': '{#label} es obligatorio.',
  });

// Esquema base para Productora
export const productoraBaseSchema = Joi.object({
  id_productora: Joi.string().guid().optional().messages({
    "string.guid": "El campo id_productora debe ser un UUID válido.",
  }),
  nombre_productora: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.base": "El nombre de la productora debe ser un texto.",
      "string.empty": "El nombre de la productora no puede estar vacío.",
      "string.min": "El nombre de la productora debe tener al menos 3 caracteres.",
      "string.max": "El nombre de la productora no puede exceder los 255 caracteres.",
      "any.required": "El nombre de la productora es obligatorio.",
    }),
  tipo_persona: Joi.string()
    .valid("FISICA", "JURIDICA")
    .required()
    .messages({
      "any.only": "El tipo de persona debe ser FISICA o JURIDICA.",
      "any.required": "El tipo de persona es obligatorio.",
    }),
  cuit_cuil: Joi.string()
    .length(11)
    .required()
    .messages({
      "string.base": "El CUIT/CUIL debe ser un texto.",
      "string.empty": "El CUIT/CUIL no puede estar vacío.",
      "string.length": "El CUIT/CUIL debe tener exactamente 11 caracteres.",
      "any.required": "El CUIT/CUIL es obligatorio.",
    }),
  email: Joi.string().email().required().messages({
    "string.base": "El correo electrónico debe ser un texto.",
    "string.empty": "El correo electrónico no puede estar vacío.",
    "string.email": "El correo electrónico tiene un formato inválido.",
    "any.required": "El correo electrónico es obligatorio.",
  }),
  calle: Joi.string().required().messages({
    "string.base": "La calle debe ser un texto.",
    "string.empty": "La calle no puede estar vacía.",
    "any.required": "La calle es obligatoria.",
  }),
  numero: Joi.string().required().messages({
    "string.base": "El número debe ser un texto.",
    "string.empty": "El número no puede estar vacío.",
    "any.required": "El número es obligatorio.",
  }),
  ciudad: Joi.string().required().messages({
    "string.base": "La ciudad debe ser un texto.",
    "string.empty": "La ciudad no puede estar vacía.",
    "any.required": "La ciudad es obligatoria.",
  }),
  localidad: Joi.string().required().messages({
    "string.base": "La localidad debe ser un texto.",
    "string.empty": "La localidad no puede estar vacía.",
    "any.required": "La localidad es obligatoria.",
  }),
  provincia: Joi.string().required().messages({
    "string.base": "La provincia debe ser un texto.",
    "string.empty": "La provincia no puede estar vacía.",
    "any.required": "La provincia es obligatoria.",
  }),
  codigo_postal: Joi.string().required().messages({
    "string.base": "El código postal debe ser un texto.",
    "string.empty": "El código postal no puede estar vacío.",
    "any.required": "El código postal es obligatorio.",
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
  nacionalidad: Joi.string().required().messages({
    "string.base": "La nacionalidad debe ser un texto.",
    "string.empty": "La nacionalidad no puede estar vacía.",
    "any.required": "La nacionalidad es obligatoria.",
  }),
  alias_cbu: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      "string.base": "El Alias CBU debe ser un texto.",
      "string.empty": "El Alias CBU no puede estar vacío.",
      "string.min": "El Alias CBU debe tener al menos 6 caracteres.",
      "string.max": "El Alias CBU no puede exceder los 20 caracteres.",
      "any.required": "El Alias CBU es obligatorio.",
    }),
  cbu: Joi.string()
    .length(22)
    .required()
    .messages({
      "string.base": "El CBU debe ser un texto.",
      "string.empty": "El CBU no puede estar vacío.",
      "string.length": "El CBU debe tener exactamente 22 caracteres.",
      "any.required": "El CBU es obligatorio.",
    }),
  denominacion_sello: Joi.string().optional().messages({
    "string.base": "La denominación del sello debe ser un texto.",
  }),
  datos_adicionales: Joi.string().optional().messages({
    "string.base": "Los datos adicionales deben ser un texto.",
  }),
});

// Validaciones condicionales para FISICA o JURIDICA
export const createProductoraSchema = productoraBaseSchema.when("tipo_persona", {
  is: "FISICA",
  then: Joi.object({
    nombres: Joi.string().required().messages({
      "string.base": "El nombre debe ser un texto.",
      "string.empty": "El nombre no puede estar vacío.",
      "any.required": "El nombre es obligatorio para personas físicas.",
    }),
    apellidos: Joi.string().required().messages({
      "string.base": "El apellido debe ser un texto.",
      "string.empty": "El apellido no puede estar vacío.",
      "any.required": "El apellido es obligatorio para personas físicas.",
    }),
  }),
  otherwise: Joi.object({
    razon_social: Joi.string().required().messages({
      "string.base": "La razón social debe ser un texto.",
      "string.empty": "La razón social no puede estar vacía.",
      "any.required": "La razón social es obligatoria para personas jurídicas.",
    }),
    nombres_representante: Joi.string().required().messages({
      "string.base": "El nombre del representante debe ser un texto.",
      "string.empty": "El nombre del representante no puede estar vacío.",
      "any.required": "El nombre del representante es obligatorio para personas jurídicas.",
    }),
    apellidos_representante: Joi.string().required().messages({
      "string.base": "El apellido del representante debe ser un texto.",
      "string.empty": "El apellido del representante no puede estar vacío.",
      "any.required": "El apellido del representante es obligatorio para personas jurídicas.",
    }),
    cuit_representante: Joi.string()
      .length(11)
      .required()
      .messages({
        "string.base": "El CUIT del representante debe ser un texto.",
        "string.empty": "El CUIT del representante no puede estar vacío.",
        "string.length": "El CUIT del representante debe tener exactamente 11 caracteres.",
        "any.required": "El CUIT del representante es obligatorio para personas jurídicas.",
      }),
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
  usuarioId: uuidSchema.messages({
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

// Main Schema for sendApplication
export const sendApplicationSchema = Joi.object({
  productoraData: productoraBaseSchema.required().messages({
    'any.required': 'El campo productoraData es obligatorio.',
  }),

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
  usuarioId: uuidSchema.messages({
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
  usuarioId: uuidSchema.messages({
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
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
  docId: uuidSchema.messages({
    "string.base": "El ID del documento debe ser un texto.",
    "string.empty": "El ID del documento no puede estar vacío.",
    "string.uuid": "El ID del documento debe ser un UUID válido.",
    "any.required": "El ID del documento es obligatorio.",
  }),
});

export const getAllDocumentosSchema = Joi.object({
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getDocumentosMetadataSchema = Joi.object({
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const documentoParamsSchema = Joi.object({
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
  docId: uuidSchema.messages({
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
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getISRCByIdSchema = Joi.object({
  id: uuidSchema.messages({
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
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const updateISRCBodySchema = Joi.object({
  id_productora_isrc: uuidSchema.messages({
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
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const deleteISRCParamsSchema = Joi.object({
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getPostulacionesByIdSchema = Joi.object({
  id: uuidSchema.messages({
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
  id_premio: uuidSchema.messages({
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
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const deletePostulacionParamsSchema = Joi.object({
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getProductoraByIdParamsSchema = Joi.object({
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const getProductorasQuerySchema = Joi.object({
  nombre: Joi.string()
    .min(1)
    .max(255)
    .regex(/^[A-Za-zÀ-ÿ0-9\s]+$/)
    .optional()
    .messages({
      "string.base": "El nombre debe ser un texto válido.",
      "string.min": "El nombre debe tener al menos 1 carácter.",
      "string.max": "El nombre no puede superar los 255 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras, números y espacios.",
    }),
  cuit: Joi.string()
    .length(11)
    .regex(/^\d+$/)
    .optional()
    .messages({
      "string.base": "El CUIT debe ser un texto válido.",
      "string.length": "El CUIT debe tener exactamente 11 dígitos.",
      "string.pattern.base": "El CUIT solo puede contener números.",
    }),
  estado: Joi.string()
    .valid("Autorizada", "Pendiente")
    .optional()
    .messages({
      "any.only": "El estado debe ser 'Autorizada' o 'Pendiente'.",
    }),
});

export const createProductoraBodySchema = productoraBaseSchema.keys({
  // id_productora no puede ser modificado
  id_productora: Joi.forbidden().messages({
    "any.unknown": "No está permitido cargar un ID de productora.",
  }),

  tipo_persona: Joi.string()
    .valid("FISICA", "JURIDICA")
    .required()
    .messages({
      "any.only": "El tipo de persona debe ser FISICA o JURIDICA.",
      "any.required": "El tipo de persona es obligatorio.",
    }),

  // Validaciones condicionales según tipo_persona
  nombres: Joi.when("tipo_persona", {
    is: "FISICA",
    then: Joi.string().trim().required().messages({
      "string.empty": "El nombre es obligatorio si el tipo de persona es FISICA.",
      "any.required": "El nombre es obligatorio si el tipo de persona es FISICA.",
    }),
    otherwise: Joi.forbidden(),
  }),

  apellidos: Joi.when("tipo_persona", {
    is: "FISICA",
    then: Joi.string().trim().required().messages({
      "string.empty": "El apellido es obligatorio si el tipo de persona es FISICA.",
      "any.required": "El apellido es obligatorio si el tipo de persona es FISICA.",
    }),
    otherwise: Joi.forbidden(),
  }),

  razon_social: Joi.when("tipo_persona", {
    is: "JURIDICA",
    then: Joi.string().trim().required().messages({
      "string.empty": "La razón social es obligatoria si el tipo de persona es JURIDICA.",
      "any.required": "La razón social es obligatoria si el tipo de persona es JURIDICA.",
    }),
    otherwise: Joi.forbidden(),
  }),

  nombres_representante: Joi.when("tipo_persona", {
    is: "JURIDICA",
    then: Joi.string().trim().required().messages({
      "string.empty": "El nombre del representante es obligatorio si el tipo de persona es JURIDICA.",
      "any.required": "El nombre del representante es obligatorio si el tipo de persona es JURIDICA.",
    }),
    otherwise: Joi.forbidden(),
  }),

  apellidos_representante: Joi.when("tipo_persona", {
    is: "JURIDICA",
    then: Joi.string().trim().required().messages({
      "string.empty": "El apellido del representante es obligatorio si el tipo de persona es JURIDICA.",
      "any.required": "El apellido del representante es obligatorio si el tipo de persona es JURIDICA.",
    }),
    otherwise: Joi.forbidden(),
  }),

  cuit_representante: Joi.when("tipo_persona", {
    is: "JURIDICA",
    then: Joi.string()
      .trim()
      .length(11)
      .required()
      .messages({
        "string.empty": "El CUIT del representante es obligatorio si el tipo de persona es JURIDICA.",
        "string.length": "El CUIT del representante debe tener exactamente 11 caracteres.",
        "any.required": "El CUIT del representante es obligatorio si el tipo de persona es JURIDICA.",
      }),
    otherwise: Joi.forbidden(),
  }),
});

export const updateProductoraBodySchema = productoraBaseSchema.keys({

    // id_productora no puede ser modificado
    id_productora: Joi.forbidden().messages({
      "any.unknown": "No está permitido modificar el ID de la productora.",
    }),

    // Validaciones condicionales según tipo_persona
    nombres: Joi.when('tipo_persona', {
      is: 'FISICA',
      then: Joi.string().trim().required().messages({
        "string.empty": "El nombre es obligatorio si el tipo de persona es FISICA.",
        "any.required": "El nombre es obligatorio si el tipo de persona es FISICA.",
      }),
      otherwise: Joi.forbidden(),
    }),

    apellidos: Joi.when('tipo_persona', {
      is: 'FISICA',
      then: Joi.string().trim().required().messages({
        "string.empty": "El apellido es obligatorio si el tipo de persona es FISICA.",
        "any.required": "El apellido es obligatorio si el tipo de persona es FISICA.",
      }),
      otherwise: Joi.forbidden(),
    }),

    razon_social: Joi.when('tipo_persona', {
      is: 'JURIDICA',
      then: Joi.string().trim().required().messages({
        "string.empty": "La razón social es obligatoria si el tipo de persona es JURIDICA.",
        "any.required": "La razón social es obligatoria si el tipo de persona es JURIDICA.",
      }),
      otherwise: Joi.forbidden(),
    }),

    nombres_representante: Joi.when('tipo_persona', {
      is: 'JURIDICA',
      then: Joi.string().trim().required().messages({
        "string.empty": "El nombre del representante es obligatorio si el tipo de persona es JURIDICA.",
        "any.required": "El nombre del representante es obligatorio si el tipo de persona es JURIDICA.",
      }),
      otherwise: Joi.forbidden(),
    }),

    apellidos_representante: Joi.when('tipo_persona', {
      is: 'JURIDICA',
      then: Joi.string().trim().required().messages({
        "string.empty": "El apellido del representante es obligatorio si el tipo de persona es JURIDICA.",
        "any.required": "El apellido del representante es obligatorio si el tipo de persona es JURIDICA.",
      }),
      otherwise: Joi.forbidden(),
    }),

    cuit_representante: Joi.when('tipo_persona', {
      is: 'JURIDICA',
      then: Joi.string()
        .length(11)
        .required()
        .messages({
          "string.empty": "El CUIT del representante es obligatorio si el tipo de persona es JURIDICA.",
          "string.length": "El CUIT del representante debe tener exactamente 11 caracteres.",
          "any.required": "El CUIT del representante es obligatorio si el tipo de persona es JURIDICA.",
        }),
      otherwise: Joi.forbidden(),
    }),
  })
  .fork(
    [
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
      "cbu",
    ],
    (schema) => schema.required()
  );

export const updateProductoraParamsSchema = Joi.object({
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

export const deleteProductoraParamsSchema = Joi.object({
  id: uuidSchema.messages({
    "string.base": "El ID de la productora debe ser un texto.",
    "string.empty": "El ID de la productora no puede estar vacío.",
    "string.uuid": "El ID de la productora debe ser un UUID válido.",
    "any.required": "El ID de la productora es obligatorio.",
  }),
});

//  end of producersRoutes

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// strart of repertoiresRoutes

export const enviarFonogramaBodySchema = Joi.object({
  fonograma_ids: Joi.array()
    .items(uuidSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "El campo 'fonograma_ids' debe ser un array de UUIDs.",
      "array.min": "Debe haber al menos un 'fonograma_id' en la solicitud.",
      "any.required": "El campo 'fonograma_ids' es obligatorio.",
    }),
});

export const cambiarEstadoEnvioFonogramaParamsSchema = Joi.object({
  id: uuidSchema.messages({
    "string.base": "El ID del fonograma debe ser un string.",
    "string.guid": "El ID del fonograma debe ser un UUID válido.",
    "any.required": "El ID del fonograma es obligatorio.",
  }),
  sendId: uuidSchema.messages({
    "string.base": "El ID del envío debe ser un string.",
    "string.guid": "El ID del envío debe ser un UUID válido.",
    "any.required": "El ID del envío es obligatorio.",
  }),
});

export const cambiarEstadoEnvioFonogramaBodySchema = Joi.object({
  nuevoEstado: Joi.string()
    .valid('RECHAZADO POR VERICAST', 'ERROR EN EL ENVIO')
    .required()
    .messages({
      "string.base": "El estado debe ser un string.",
      "any.only": "El estado debe ser 'RECHAZADO POR VERICAST' o 'ERROR EN EL ENVIO'.",
      "any.required": "El estado es obligatorio.",
    }),
  comentario: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      "string.base": "El comentario debe ser un string.",
    }),
});

export const getEnviosByFonogramaParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El ID del fonograma debe ser un string.",
      "string.guid": "El ID del fonograma debe ser un UUID válido.",
      "any.required": "El ID del fonograma es obligatorio.",
    }),
});

export const getNovedadesFonogramaQuerySchema = Joi.object({
  operacion: Joi.alternatives().try(
    Joi.string().valid("ALTA", "DATOS", "ARCHIVO", "TERRITORIO", "PARTICIPACION", "BAJA"),
    Joi.array().items(Joi.string().valid("ALTA", "DATOS", "ARCHIVO", "TERRITORIO", "PARTICIPACION", "BAJA"))
  ).messages({
    "string.base": "El campo 'operacion' debe ser una cadena de texto.",
    "any.only": "Operación inválida. Valores permitidos: ALTA, DATOS, ARCHIVO, TERRITORIO, PARTICIPACION, BAJA.",
  }),
  isProcesado: Joi.boolean().messages({
    "boolean.base": "El campo 'isProcesado' debe ser un valor booleano (true o false).",
  }),
});

export const addArchivoToFonogramaParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
});

export const getArchivoByFonogramaParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
});

export const addParticipacionToFonogramaParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
});

export const addParticipacionToFonogramaBodySchema = Joi.object({
  participaciones: Joi.array()
    .items(
      Joi.object({
        cuit: Joi.string()
          .pattern(/^\d{11}$/)
          .required()
          .messages({
            "string.pattern.base": "El 'cuit' debe contener 11 dígitos numéricos.",
            "any.required": "El campo 'cuit' es obligatorio.",
          }),
        porcentaje_participacion: Joi.number()
          .min(0)
          .max(100)
          .required()
          .messages({
            "number.base": "El 'porcentaje_participacion' debe ser un número.",
            "number.min": "El 'porcentaje_participacion' no puede ser menor a 0.",
            "number.max": "El 'porcentaje_participacion' no puede ser mayor a 100.",
            "any.required": "El campo 'porcentaje_participacion' es obligatorio.",
          }),
        fecha_inicio: Joi.date().iso().required().messages({
          "date.base": "El campo 'fecha_inicio' debe ser una fecha válida en formato ISO.",
          "any.required": "El campo 'fecha_inicio' es obligatorio.",
        }),
        fecha_hasta: Joi.date()
          .iso()
          .greater(Joi.ref("fecha_inicio"))
          .messages({
            "date.base": "El campo 'fecha_hasta' debe ser una fecha válida en formato ISO.",
            "date.greater": "El campo 'fecha_hasta' debe ser posterior a 'fecha_inicio'.",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "El campo 'participaciones' debe ser un array de objetos.",
      "array.min": "Debe haber al menos una participación.",
      "any.required": "El campo 'participaciones' es obligatorio.",
    }),
});

export const listParticipacionesParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
});

export const listParticipacionesQuerySchema = Joi.object({
  fecha_inicio: Joi.date().iso().messages({
    "date.base": "El campo 'fecha_inicio' debe ser una fecha válida en formato ISO.",
  }),
  fecha_hasta: Joi.date()
    .iso()
    .greater(Joi.ref("fecha_inicio"))
    .messages({
      "date.base": "El campo 'fecha_hasta' debe ser una fecha válida en formato ISO.",
      "date.greater": "El campo 'fecha_hasta' debe ser posterior a 'fecha_inicio'.",
    }),
});

export const updateParticipacionParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
  shareId: uuidSchema.messages({
      "string.base": "El parámetro 'shareId' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'shareId' debe ser un UUID válido.",
      "any.required": "El parámetro 'shareId' es obligatorio.",
    }),
});

export const updateParticipacionBodySchema = Joi.object({
  porcentaje_participacion: Joi.number()
    .min(0)
    .max(100)
    .required()
    .messages({
      "number.base": "El 'porcentaje_participacion' debe ser un número.",
      "number.min": "El 'porcentaje_participacion' no puede ser menor a 0.",
      "number.max": "El 'porcentaje_participacion' no puede ser mayor a 100.",
      "any.required": "El campo 'porcentaje_participacion' es obligatorio.",
    }),
  fecha_participacion_inicio: Joi.date().iso().required().messages({
    "date.base": "El campo 'fecha_participacion_inicio' debe ser una fecha válida en formato ISO.",
    "any.required": "El campo 'fecha_participacion_inicio' es obligatorio.",
  }),
  fecha_participacion_hasta: Joi.date()
    .iso()
    .greater(Joi.ref("fecha_participacion_inicio"))
    .required()
    .messages({
      "date.base": "El campo 'fecha_participacion_hasta' debe ser una fecha válida en formato ISO.",
      "date.greater": "El campo 'fecha_participacion_hasta' debe ser posterior a 'fecha_participacion_inicio'.",
      "any.required": "El campo 'fecha_participacion_hasta' es obligatorio.",
    }),
});

export const deleteParticipacionParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
  shareId: uuidSchema.messages({
      "string.base": "El parámetro 'shareId' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'shareId' debe ser un UUID válido.",
      "any.required": "El parámetro 'shareId' es obligatorio.",
    }),
});

export const addTerritorioToFonogramaParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
});

export const addTerritorioToFonogramaBodySchema = Joi.object({
  codigo_iso: Joi.string()
    .length(2)
    .uppercase()
    .required()
    .messages({
      "string.base": "El campo 'codigo_iso' debe ser una cadena de texto.",
      "string.length": "El campo 'codigo_iso' debe tener exactamente 2 caracteres.",
      "string.uppercase": "El campo 'codigo_iso' debe estar en mayúsculas.",
      "any.required": "El campo 'codigo_iso' es obligatorio.",
    }),
  is_activo: Joi.boolean().messages({
    "boolean.base": "El campo 'is_activo' debe ser un valor booleano (true o false).",
  }),
});

export const listTerritoriosParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
});

export const updateTerritorioParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
  territoryId: uuidSchema.messages({
      "string.base": "El parámetro 'territoryId' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'territoryId' debe ser un UUID válido.",
      "any.required": "El parámetro 'territoryId' es obligatorio.",
    }),
});

export const updateTerritorioBodySchema = Joi.object({
  is_activo: Joi.boolean()
    .required()
    .messages({
      "boolean.base": "El campo 'is_activo' debe ser un valor booleano (true o false).",
      "any.required": "El campo 'is_activo' es obligatorio.",
    }),
});

export const deleteTerritorioParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
  territoryId: uuidSchema.messages({
      "string.base": "El parámetro 'territoryId' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'territoryId' debe ser un UUID válido.",
      "any.required": "El parámetro 'territoryId' es obligatorio.",
    }),
});

export const validateISRCBodySchema = Joi.object({
  isrc: Joi.string()
    .length(12)
    .pattern(/^AR\d{10}$/)
    .required()
    .messages({
      "string.base": "El campo 'isrc' debe ser una cadena de texto.",
      "string.length": "El 'isrc' debe tener exactamente 12 caracteres.",
      "string.pattern.base": "El 'isrc' debe comenzar con 'AR' seguido de 10 dígitos numéricos.",
      "any.required": "El campo 'isrc' es obligatorio.",
    }),
});

export const createFonogramaBodySchema = Joi.object({
  productora_id: uuidSchema.messages({
      "string.base": "El campo 'productora_id' debe ser una cadena de texto.",
      "string.uuid": "El campo 'productora_id' debe ser un UUID válido.",
      "any.required": "El campo 'productora_id' es obligatorio.",
    }),
  titulo: Joi.string().min(1).required().messages({
    "string.base": "El campo 'titulo' debe ser una cadena de texto.",
    "string.min": "El campo 'titulo' no puede estar vacío.",
    "any.required": "El campo 'titulo' es obligatorio.",
  }),
  artista: Joi.string().min(1).required().messages({
    "string.base": "El campo 'artista' debe ser una cadena de texto.",
    "string.min": "El campo 'artista' no puede estar vacío.",
    "any.required": "El campo 'artista' es obligatorio.",
  }),
  album: Joi.string().allow(null, "").messages({
    "string.base": "El campo 'album' debe ser una cadena de texto.",
  }),
  duracion: Joi.number().min(1).required().messages({
    "number.base": "El campo 'duracion' debe ser un número.",
    "number.min": "El campo 'duracion' debe ser mayor a 0.",
    "any.required": "El campo 'duracion' es obligatorio.",
  }),
  anio_lanzamiento: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      "number.base": "El campo 'anio_lanzamiento' debe ser un número entero.",
      "number.min": "El campo 'anio_lanzamiento' no puede ser menor a 1900.",
      "number.max": `El campo 'anio_lanzamiento' no puede ser mayor al año actual (${new Date().getFullYear()}).`,
      "any.required": "El campo 'anio_lanzamiento' es obligatorio.",
    }),
  sello_discografico: Joi.string().allow(null, "").messages({
    "string.base": "El campo 'sello_discografico' debe ser una cadena de texto.",
  }),
  codigo_designacion: Joi.string()
    .length(5)
    .required()
    .messages({
      "string.base": "El campo 'codigo_designacion' debe ser una cadena de texto.",
      "string.length": "El campo 'codigo_designacion' debe tener exactamente 5 caracteres.",
      "any.required": "El campo 'codigo_designacion' es obligatorio.",
    }),
  participaciones: Joi.array()
    .items(
      Joi.object({
        cuit: Joi.string()
          .pattern(/^\d{11}$/)
          .required()
          .messages({
            "string.pattern.base": "El campo 'cuit' debe contener 11 dígitos numéricos.",
            "any.required": "El campo 'cuit' es obligatorio.",
          }),
        porcentaje_participacion: Joi.number()
          .min(0)
          .max(100)
          .required()
          .messages({
            "number.base": "El 'porcentaje_participacion' debe ser un número.",
            "number.min": "El 'porcentaje_participacion' no puede ser menor a 0.",
            "number.max": "El 'porcentaje_participacion' no puede ser mayor a 100.",
            "any.required": "El campo 'porcentaje_participacion' es obligatorio.",
          }),
        fecha_inicio: Joi.date().iso().required().messages({
          "date.base": "El campo 'fecha_inicio' debe ser una fecha válida en formato ISO.",
          "any.required": "El campo 'fecha_inicio' es obligatorio.",
        }),
        fecha_hasta: Joi.date()
          .iso()
          .greater(Joi.ref("fecha_inicio"))
          .messages({
            "date.base": "El campo 'fecha_hasta' debe ser una fecha válida en formato ISO.",
            "date.greater": "El campo 'fecha_hasta' debe ser posterior a 'fecha_inicio'.",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "El campo 'participaciones' debe ser un array de objetos.",
      "array.min": "Debe haber al menos una participación.",
      "any.required": "El campo 'participaciones' es obligatorio.",
    }),
  territorios: Joi.array()
    .items(Joi.string().length(2).uppercase())
    .min(1)
    .required()
    .messages({
      "array.base": "El campo 'territorios' debe ser un array de códigos ISO de 2 letras.",
      "array.min": "Debe haber al menos un territorio activo.",
      "string.length": "Cada código de territorio debe tener exactamente 2 caracteres.",
      "string.uppercase": "Los códigos de territorio deben estar en mayúsculas.",
      "any.required": "El campo 'territorios' es obligatorio.",
    }),
});

export const getFonogramaByIdParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
});

export const listFonogramasQuerySchema = Joi.object({
  search: Joi.string()
    .allow("")
    .messages({
      "string.base": "El parámetro 'search' debe ser una cadena de texto.",
    }),
});

export const updateFonogramaParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
});

export const updateFonogramaBodySchema = Joi.object({
  titulo: Joi.string().min(1).messages({
    "string.base": "El campo 'titulo' debe ser una cadena de texto.",
    "string.min": "El campo 'titulo' no puede estar vacío.",
  }),
  artista: Joi.string().min(1).messages({
    "string.base": "El campo 'artista' debe ser una cadena de texto.",
    "string.min": "El campo 'artista' no puede estar vacío.",
  }),
  album: Joi.string().allow(null, "").messages({
    "string.base": "El campo 'album' debe ser una cadena de texto.",
  }),
  duracion: Joi.number().min(1).messages({
    "number.base": "El campo 'duracion' debe ser un número.",
    "number.min": "El campo 'duracion' debe ser mayor a 0.",
  }),
  anio_lanzamiento: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .messages({
      "number.base": "El campo 'anio_lanzamiento' debe ser un número entero.",
      "number.min": "El campo 'anio_lanzamiento' no puede ser menor a 1900.",
      "number.max": `El campo 'anio_lanzamiento' no puede ser mayor al año actual (${new Date().getFullYear()}).`,
    }),
  sello_discografico: Joi.string().allow(null, "").messages({
    "string.base": "El campo 'sello_discografico' debe ser una cadena de texto.",
  }),
  estado_fonograma: Joi.string()
    .valid("ACTIVO", "INACTIVO", "BAJA")
    .messages({
      "string.base": "El campo 'estado_fonograma' debe ser una cadena de texto.",
      "any.only": "El campo 'estado_fonograma' solo puede ser 'ACTIVO', 'INACTIVO' o 'BAJA'.",
    }),
});

export const deleteFonogramaParamsSchema = Joi.object({
  id: uuidSchema.messages({
      "string.base": "El parámetro 'id' debe ser una cadena de texto.",
      "string.uuid": "El parámetro 'id' debe ser un UUID válido.",
      "any.required": "El parámetro 'id' es obligatorio.",
    }),
});