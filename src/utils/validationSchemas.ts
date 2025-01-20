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

export const completeProfileSchema = Joi.object({
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

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages(VALIDATION_AUTH.token),
  newPassword: Joi.string().min(8).required().messages(VALIDATION_AUTH.newPassword),
});

export const changePasswordSchema = Joi.object({
  id_usuario: uuidSchema,
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

//  end of authRoutes

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// strart of usuariosRoutes

export const availableDisableSchema = Joi.object({
  id_usuario: uuidSchema,  
});

// Schema for blocking/unblocking a user
export const blockOrUnblockSchema = Joi.object({
  id_usuario: uuidSchema,
  bloquear: Joi.boolean().required().messages({
    'any.required': '{#label} es obligatorio.',
    'boolean.base': '{#label} debe ser un valor booleano.',
  }),
});

// Schema for changing a user's role
export const changeRoleSchema = Joi.object({
  id_usuario: uuidSchema,
  nuevo_rol: Joi.string()
    .valid('admin_principal', 'admin_secundario', 'productor_principal', 'productor_secundario')
    .required()
    .messages({
      'any.required': '{#label} es obligatorio.',
      'any.only': '{#label} debe ser uno de los roles permitidos.',
    }),
});

// Schema para filtros en query
export const getUsuariosQuerySchema = Joi.object({
  id_usuario: Joi.string().uuid().optional(),
  email: Joi.string().email().optional(),
  nombre: Joi.string().optional(),
  apellido: Joi.string().optional(),
  tipo_registro: Joi.string()
    .valid(
      "DEPURAR",
      "NUEVO",
      "CONFIRMADO",
      "PENDIENTE",
      "ENVIADO",
      "HABILITADO",
      "DESHABILITADO"
    )
    .optional(),
  rolId: Joi.string().uuid().optional(),
  nombre_rol: Joi.string().optional(),
  productoraId: Joi.string().uuid().optional(),
  productoraNombre: Joi.string().optional(),
  limit: Joi.number().integer().min(1).optional(),
  offset: Joi.number().integer().min(0).optional(),
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
  rol: Joi.string()
    .valid('admin_principal', 'admin_secundario')
    .required()
    .messages({
      'any.required': '{#label} es obligatorio.',
      'any.only': '{#label} debe ser uno de los roles permitidos.',
    }),
});

// Schema for getting pending registrations
export const getRegistrosPendientesSchema = Joi.object({
  id_usuario: uuidSchema,
});

// Schema for approving an application
export const approveApplicationSchema = Joi.object({
  id_usuario: uuidSchema,  
});

// Schema for rejecting an application
export const rejectApplicationSchema = Joi.object({
  id_usuario: uuidSchema,
  comentario: Joi.string().min(5).required().messages({
    'string.min': '{#label} debe tener al menos 5 caracteres.',
    'any.required': '{#label} es obligatorio.',
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
  id_usuario: uuidSchema.required().messages({
    'any.required': 'El campo id_usuario es obligatorio.',
    'string.guid': 'El campo id_usuario debe ser un UUID válido.',
  }),
  productoraData: productoraDataSchema,
  documentos: Joi.array().items(documentSchema).optional().messages({
    'array.base': 'El campo documentos debe ser un arreglo.',
  }),
  nombre: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'any.required': 'El campo nombre es obligatorio.',
      'string.min': 'El campo nombre debe tener al menos 3 caracteres.',
      'string.max': 'El campo nombre no debe exceder los 255 caracteres.',
    }),
  apellido: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'any.required': 'El campo apellido es obligatorio.',
      'string.min': 'El campo apellido debe tener al menos 3 caracteres.',
      'string.max': 'El campo apellido no debe exceder los 255 caracteres.',
    }),
  telefono: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'any.required': 'El campo telefono es obligatorio.',
      'string.pattern.base': 'El campo telefono debe contener solo números.',
    }),
});

// Schema for updating an application
export const updateApplicationSchema = Joi.object({
  id_usuario: uuidSchema.required().messages({
    'any.required': 'El campo id_usuario es obligatorio.',
    'string.guid': 'El campo id_usuario debe ser un UUID válido.',
  }),
  productoraData: Joi.object({
    tipo_persona: Joi.string()
      .valid('FISICA', 'JURIDICA')
      .optional()
      .messages({
        'any.only': 'El campo tipo_persona debe ser "FISICA" o "JURIDICA".',
      }),
    nombre_productora: Joi.string()
      .min(3)
      .max(255)
      .optional()
      .messages({
        'string.min': 'El campo nombre_productora debe tener al menos 3 caracteres.',
        'string.max': 'El campo nombre_productora no debe exceder los 255 caracteres.',
      }),
    cuit_cuil: Joi.string()
      .length(11)
      .optional()
      .messages({
        'string.length': 'El campo cuit_cuil debe tener exactamente 11 caracteres.',
      }),
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'El campo email debe ser un correo electrónico válido.',
      }),
    calle: Joi.string().optional(),
    numero: Joi.string().optional(),
    ciudad: Joi.string().optional(),
    localidad: Joi.string().optional(),
    provincia: Joi.string().optional(),
    codigo_postal: Joi.string().optional(),
    telefono: Joi.string()
      .pattern(/^[0-9]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'El campo telefono debe contener solo números.',
      }),
    nacionalidad: Joi.string().optional(),
    alias_cbu: Joi.string()
      .min(6)
      .max(20)
      .optional()
      .messages({
        'string.min': 'El campo alias_cbu debe tener al menos 6 caracteres.',
        'string.max': 'El campo alias_cbu no debe exceder los 20 caracteres.',
      }),
    cbu: Joi.string()
      .length(22)
      .optional()
      .messages({
        'string.length': 'El campo cbu debe tener exactamente 22 caracteres.',
      }),
    denominacion_sello: Joi.string().optional(),
    datos_adicionales: Joi.string().optional(),
    nombres: Joi.string().optional(),
    apellidos: Joi.string().optional(),
    razon_social: Joi.string().optional(),
    nombres_representante: Joi.string().optional(),
    apellidos_representante: Joi.string().optional(),
    cuit_representante: Joi.string()
      .length(11)
      .optional()
      .messages({
        'string.length': 'El campo cuit_representante debe tener exactamente 11 caracteres.',
      }),
  }).optional().messages({
    'object.base': 'El campo productoraData debe ser un objeto.',
  }),
  documentos: Joi.array()
    .items(
      Joi.object({
        nombre_documento: Joi.string().optional(),
        ruta_archivo_documento: Joi.string()
          .uri()
          .optional()
          .messages({
            'string.uri': 'El campo ruta_archivo_documento debe ser una URI válida.',
          }),
      })
    )
    .optional()
    .messages({
      'array.base': 'El campo documentos debe ser un arreglo.',
    }),
});

// Schema for updating a user's details
export const updateUserSchema = Joi.object({
  id_usuario: uuidSchema.required().messages({
    'any.required': 'El campo id_usuario es obligatorio.',
    'string.guid': 'El campo id_usuario debe ser un UUID válido.',
  }),
  datosUsuario: Joi.object({
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'El campo email debe ser un correo electrónico válido.',
      }),
    nombres: Joi.string()
      .min(2)
      .max(50)
      .regex(/^[A-Za-zÀ-ÿ\s]+$/)
      .optional()
      .messages({
        'string.min': 'El campo nombres debe tener al menos 2 caracteres.',
        'string.max': 'El campo nombres no debe exceder los 50 caracteres.',
        'string.pattern.base': 'El campo nombres debe contener solo letras y espacios.',
      }),
    apellidos: Joi.string()
      .min(2)
      .max(50)
      .regex(/^[A-Za-zÀ-ÿ\s]+$/)
      .optional()
      .messages({
        'string.min': 'El campo apellidos debe tener al menos 2 caracteres.',
        'string.max': 'El campo apellidos no debe exceder los 50 caracteres.',
        'string.pattern.base': 'El campo apellidos debe contener solo letras y espacios.',
      }),
    telefono: Joi.string()
      .max(50)
      .regex(/^[0-9\-+() ]+$/)
      .optional()
      .messages({
        'string.max': 'El campo telefono no debe exceder los 50 caracteres.',
        'string.pattern.base': 'El campo telefono debe ser un número de teléfono válido.',
      }),
    estado: Joi.string()
      .valid('HABILITADO', 'DESHABILITADO', 'PENDIENTE')
      .optional()
      .messages({
        'any.only': 'El campo estado debe ser uno de los valores permitidos: HABILITADO, DESHABILITADO, PENDIENTE.',
      }),
    rol: Joi.string()
      .optional()
      .messages({
        'string.base': 'El campo rol debe ser un texto.',
      }),
  })
    .optional()
    .messages({
      'object.base': 'El campo datosUsuario debe ser un objeto.',
    }),
});

// Schema for deleting a user
export const deleteUserSchema = Joi.object({
  id_usuario: uuidSchema.messages({
    'any.required': 'El ID del usuario es obligatorio.',
    'string.guid': 'El ID del usuario debe ser un UUID válido.',
  }),
}).required().messages({
  'object.base': 'Los datos proporcionados deben ser un objeto válido.',
  'any.required': 'Los datos para eliminar un usuario son obligatorios.',
});

// Schema for updating user's views
export const updateUserViewsSchema = {
  body: Joi.object({
    id_usuario: Joi.string().uuid().required().messages({
      "string.base": "El ID de usuario debe ser un string.",
      "string.guid": "El ID de usuario debe ser un UUID válido.",
      "any.required": "El ID de usuario es obligatorio.",
    }),
    roleName: Joi.string().required().messages({
      "string.base": "El nombre del rol debe ser un string.",
      "any.required": "El nombre del rol es obligatorio.",
    }),
  }),
};

// Schema for updating status of user's views
export const toggleUserViewStatusSchema = Joi.object({
  id_usuario: Joi.string()
    .uuid()
    .required()
    .messages({
      'any.required': 'El campo id_usuario es obligatorio.',
      'string.guid': 'El campo id_usuario debe ser un UUID válido.',
      'string.base': 'El campo id_usuario debe ser una cadena.',
    }),
  vistas: Joi.array()
    .items(
      Joi.object({
        nombre_vista: Joi.string()
          .required()
          .messages({
            'any.required': 'El campo nombre_vista es obligatorio.',
            'string.base': 'El campo nombre_vista debe ser una cadena.',
          }),
        is_habilitado: Joi.boolean()
          .required()
          .messages({
            'any.required': 'El campo is_habilitado es obligatorio.',
            'boolean.base': 'El campo is_habilitado debe ser un valor booleano.',
          }),
      }).messages({
        'object.base': 'Cada elemento en el campo vistas debe ser un objeto válido.',
      })
    )
    .required()
    .messages({
      'array.base': 'El campo vistas debe ser un arreglo.',
      'any.required': 'El campo vistas es obligatorio.',
    }),
});