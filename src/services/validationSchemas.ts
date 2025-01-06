import Joi from 'joi';
import { VALIDATION_AUTH } from './messages';

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

// strart of usuariosRoutes

export const availableDisableSchema = Joi.object({
  id_usuario: uuidSchema,
  habilitado: Joi.boolean().required().messages({
    'any.required': '{#label} es obligatorio.',
    'boolean.base': '{#label} debe ser un valor booleano.',
  }),
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

// Schema for creating an admin user
export const createAdminSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '{#label} debe ser un correo electrónico válido.',
    'any.required': '{#label} es obligatorio.',
  }),
  nombres_y_apellidos: Joi.string()
    .min(2)
    .max(100)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages({
      'string.min': '{#label} debe tener al menos 2 caracteres.',
      'string.max': '{#label} no debe exceder los 100 caracteres.',
      'string.pattern.base': '{#label} debe contener solo letras y espacios.',
      'any.required': '{#label} es obligatorio.',
    }),
});

// Schema for getting pending registrations
export const getRegistroPendienteSchema = Joi.object({
  id_usuario: uuidSchema,
});

// Schema for approving an application
export const approveApplicationSchema = Joi.object({
  id_usuario: uuidSchema,
  nombre_productora: Joi.string().min(2).required().messages({
    'string.min': '{#label} debe tener al menos 2 caracteres.',
    'any.required': '{#label} es obligatorio.',
  }),
  cuit_productora: Joi.string().length(11).required().messages({
    'string.length': '{#label} debe tener 11 caracteres.',
    'any.required': '{#label} es obligatorio.',
  }),
  cbu_productora: Joi.string().length(22).required().messages({
    'string.length': '{#label} debe tener 22 caracteres.',
    'any.required': '{#label} es obligatorio.',
  }),
  alias_cbu_productora: Joi.string().max(30).messages({
    'string.max': '{#label} no debe exceder los 30 caracteres.',
  }),
});

// Schema for rejecting an application
export const rejectApplicationSchema = Joi.object({
  id_usuario: uuidSchema,
  motivo_rechazo: Joi.string().min(5).required().messages({
    'string.min': '{#label} debe tener al menos 5 caracteres.',
    'any.required': '{#label} es obligatorio.',
  }),
});

// Schema for sending an application
export const sendApplicationSchema = Joi.object({
  id_usuario: uuidSchema,
  datosFisica: Joi.object().optional().messages({
    'object.base': '{#label} debe ser un objeto.',
  }),
  datosJuridica: Joi.object().optional().messages({
    'object.base': '{#label} debe ser un objeto.',
  }),
  documentos: Joi.array()
    .items(
      Joi.object({
        tipo_documento_id: uuidSchema,
        ruta_archivo_documento: Joi.string().uri().required().messages({
          'string.uri': '{#label} debe ser una URI válida.',
          'any.required': '{#label} es obligatorio.',
        }),
      })
    )
    .optional()
    .messages({
      'array.base': '{#label} debe ser un arreglo de documentos.',
    }),
});

// Schema for updating an application
export const updateApplicationSchema = Joi.object({
  id_usuario: uuidSchema,
  datosFisica: Joi.object().optional().messages({
    'object.base': '{#label} debe ser un objeto.',
  }),
  datosJuridica: Joi.object().optional().messages({
    'object.base': '{#label} debe ser un objeto.',
  }),
  documentos: Joi.array()
    .items(
      Joi.object({
        tipo_documento_id: uuidSchema,
        ruta_archivo_documento: Joi.string().uri().required().messages({
          'string.uri': '{#label} debe ser una URI válida.',
          'any.required': '{#label} es obligatorio.',
        }),
      })
    )
    .optional()
    .messages({
      'array.base': '{#label} debe ser un arreglo de documentos.',
    }),
});

// Schema for updating a user's details
export const updateUserSchema = Joi.object({
  id_usuario: uuidSchema,
  email: Joi.string().email().optional().messages({
    'string.email': '{#label} debe ser un correo electrónico válido.',
  }),
  nombres_y_apellidos: Joi.string()
    .min(2)
    .max(100)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/)
    .optional()
    .messages({
      'string.min': '{#label} debe tener al menos 2 caracteres.',
      'string.max': '{#label} no debe exceder los 100 caracteres.',
      'string.pattern.base': '{#label} debe contener solo letras y espacios.',
    }),
  telefono: Joi.string()
    .max(50)
    .regex(/^[0-9\-+() ]+$/)
    .optional()
    .messages({
      'string.pattern.base': '{#label} debe ser un número de teléfono válido.',
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
export const updateUserViewsSchema = Joi.object({
  vistas: Joi.array().items(Joi.string().uuid()).required(),
});

// Schema for updating status of user's views
export const toggleUserViewStatusSchema = Joi.array()
  .items(
    Joi.object({
      id_vista: Joi.string().uuid().required(),
      is_habilitado: Joi.boolean().required(),
    })
  )
  .required();