import Joi from 'joi';
import { VALIDATION_AUTH } from './messages';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages(VALIDATION_AUTH.email),
  password: Joi.string().min(8).required().messages(VALIDATION_AUTH.password),
  nombre: Joi.string().min(2).max(100).required().messages(VALIDATION_AUTH.nombre),
  apellido: Joi.string()
    .min(2)
    .max(100)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages(VALIDATION_AUTH.apellido),
  cuit: Joi.string()
    .regex(/^[0-9]{11}$/)
    .required()
    .messages(VALIDATION_AUTH.cuit),
  tipo_persona_id: Joi.number().integer().required().messages(VALIDATION_AUTH.tipo_persona_id),
  domicilio: Joi.string().max(200).allow(null, '').messages(VALIDATION_AUTH.domicilio),
  ciudad: Joi.string().required().messages(VALIDATION_AUTH.ciudad),
  provincia: Joi.string().required().messages(VALIDATION_AUTH.provincia),
  pais: Joi.string().required().messages(VALIDATION_AUTH.pais),
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

export const recoverPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages(VALIDATION_AUTH.email),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages(VALIDATION_AUTH.token),
  newPassword: Joi.string().min(8).required().messages(VALIDATION_AUTH.newPassword),
});

export const validateEmailSchema = Joi.object({
  token: Joi.string().required().messages(VALIDATION_AUTH.token),
});

export const authorizeProducerSchema = Joi.object({
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
});

export const blockUserSchema = Joi.object({
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
  bloquear: Joi.boolean().required().messages({
    'boolean.base': 'El valor para bloquear debe ser verdadero o falso.',
    'any.required': 'El valor para bloquear es obligatorio.',
  }),
});

export const changeRoleSchema = Joi.object({
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
  nuevo_rol: Joi.string().required().messages({
    'string.base': 'El rol debe ser un texto válido.',
    'any.required': 'El nuevo rol es obligatorio.',
  }),
});

export const changePasswordSchema = Joi.object({
  id_usuario: Joi.number().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

export const deleteUserSchema = Joi.object({
  id_usuario: Joi.number().required(),
});

export const userCreateSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required().messages(VALIDATION_AUTH.nombre),
  apellido: Joi.string()
    .min(2)
    .max(100)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages(VALIDATION_AUTH.apellido),
  email: Joi.string().email().required().messages(VALIDATION_AUTH.email),
  clave: Joi.string().min(8).required().messages(VALIDATION_AUTH.password),
  rol_id: Joi.number().integer().required(),
  estado_id: Joi.number().integer().required(),
  cuit: Joi.string()
    .regex(/^[0-9]{11}$/)
    .required()
    .messages(VALIDATION_AUTH.cuit),
  tipo_persona_id: Joi.number().integer().required().messages(VALIDATION_AUTH.tipo_persona_id),
  domicilio: Joi.string().max(200).allow(null, '').messages(VALIDATION_AUTH.domicilio),
  ciudad: Joi.string().required().messages(VALIDATION_AUTH.ciudad),
  provincia: Joi.string().required().messages(VALIDATION_AUTH.provincia),
  pais: Joi.string().required().messages(VALIDATION_AUTH.pais),
  telefono: Joi.string()
    .max(50)
    .regex(/^[0-9\-+() ]+$/)
    .allow(null, '')
    .messages(VALIDATION_AUTH.telefono),
});

export const userUpdateSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).messages(VALIDATION_AUTH.nombre),
  apellido: Joi.string()
    .min(2)
    .max(100)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/)
    .messages(VALIDATION_AUTH.apellido),
  email: Joi.string().email().messages(VALIDATION_AUTH.email),
  clave: Joi.string().min(8).messages(VALIDATION_AUTH.password),
  rol_id: Joi.number().integer(),
  estado_id: Joi.number().integer(),
  cuit: Joi.string()
    .regex(/^[0-9]{11}$/)
    .messages(VALIDATION_AUTH.cuit),
  tipo_persona_id: Joi.number().integer().messages(VALIDATION_AUTH.tipo_persona_id),
  domicilio: Joi.string().max(200).allow(null, '').messages(VALIDATION_AUTH.domicilio),
  ciudad: Joi.string().messages(VALIDATION_AUTH.ciudad),
  provincia: Joi.string().messages(VALIDATION_AUTH.provincia),
  pais: Joi.string().messages(VALIDATION_AUTH.pais),
  telefono: Joi.string()
    .max(50)
    .regex(/^[0-9\-+() ]+$/)
    .allow(null, '')
    .messages(VALIDATION_AUTH.telefono),
});

export const userIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'El ID debe ser un número entero.',
    'any.required': 'El ID es obligatorio.',
  }),
});

export const createConsultaSchema = Joi.object({
  asunto: Joi.string().min(5).max(150).required().messages({
    'string.min': 'El asunto debe tener al menos 5 caracteres.',
    'string.max': 'El asunto no debe exceder los 150 caracteres.',
    'any.required': 'El asunto es obligatorio.',
  }),
  mensaje: Joi.string().required().messages({
    'any.required': 'El mensaje es obligatorio.',
  }),
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
  estado_id: Joi.number().integer().optional().messages({
    'number.base': 'El estado debe ser un número entero.',
  }),
});

export const updateConsultaSchema = Joi.object({
  asunto: Joi.string().min(5).max(150).messages({
    'string.min': 'El asunto debe tener al menos 5 caracteres.',
    'string.max': 'El asunto no debe exceder los 150 caracteres.',
  }),
  mensaje: Joi.string().optional().messages({
    'string.empty': 'El mensaje no puede estar vacío.',
  }),
  id_usuario: Joi.number().integer().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
  }),
  estado_id: Joi.number().integer().optional().messages({
    'number.base': 'El estado debe ser un número entero.',
  }),
});

export const getConsultaSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'El ID de la consulta debe ser un número entero.',
    'any.required': 'El ID de la consulta es obligatorio.',
  }),
});

export const deleteConsultaSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'El ID de la consulta debe ser un número entero.',
    'any.required': 'El ID de la consulta es obligatorio.',
  }),
});

export const archivoCreateSchema = Joi.object({
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
  nombre_archivo: Joi.string().max(150).required().messages({
    'string.max': 'El nombre del archivo no debe exceder los 150 caracteres.',
    'any.required': 'El nombre del archivo es obligatorio.',
  }),
  ruta_archivo: Joi.string().max(255).required().messages({
    'string.max': 'La ruta del archivo no debe exceder los 255 caracteres.',
    'any.required': 'La ruta del archivo es obligatoria.',
  }),
  tipo_archivo: Joi.string().max(50).required().messages({
    'string.max': 'El tipo de archivo no debe exceder los 50 caracteres.',
    'any.required': 'El tipo de archivo es obligatorio.',
  }),
});

export const archivoUpdateSchema = Joi.object({
  nombre_archivo: Joi.string().max(150).messages({
    'string.max': 'El nombre del archivo no debe exceder los 150 caracteres.',
  }),
  ruta_archivo: Joi.string().max(255).messages({
    'string.max': 'La ruta del archivo no debe exceder los 255 caracteres.',
  }),
  tipo_archivo: Joi.string().max(50).messages({
    'string.max': 'El tipo de archivo no debe exceder los 50 caracteres.',
  }),
});

export const archivoIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'El ID del archivo debe ser un número entero.',
    'any.required': 'El ID del archivo es obligatorio.',
  }),
});

export const createConflictoSchema = Joi.object({
  id_fonograma: Joi.number().integer().required().messages({
    'number.base': 'El ID del fonograma debe ser un número entero.',
    'any.required': 'El ID del fonograma es obligatorio.',
  }),
  tipo_conflicto: Joi.string().min(3).max(100).required().messages({
    'string.min': 'El tipo de conflicto debe tener al menos 3 caracteres.',
    'string.max': 'El tipo de conflicto no debe exceder los 100 caracteres.',
    'any.required': 'El tipo de conflicto es obligatorio.',
  }),
  descripcion: Joi.string().optional(),
});

export const conflictoIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'El ID del conflicto debe ser un número entero.',
    'any.required': 'El ID del conflicto es obligatorio.',
  }),
});

export const estadoConflictoSchema = Joi.object({
  estado: Joi.string().valid('pendiente', 'resuelto').required().messages({
    'any.only': 'El estado debe ser "pendiente" o "resuelto".',
    'any.required': 'El estado es obligatorio.',
  }),
});

export const comentarioSchema = Joi.object({
  comentario: Joi.string().required().messages({
    'any.required': 'El comentario es obligatorio.',
  }),
});

export const decisionSchema = Joi.object({
  decision: Joi.string().valid('aceptado', 'rechazado').required().messages({
    'any.only': 'La decisión debe ser "aceptado" o "rechazado".',
    'any.required': 'La decisión es obligatoria.',
  }),
  fecha_decision: Joi.date().required().messages({
    'date.base': 'La fecha de decisión debe ser una fecha válida.',
    'any.required': 'La fecha de decisión es obligatoria.',
  }),
});

export const involucradoIdSchema = Joi.object({
  id_involucrado: Joi.number().integer().required().messages({
    'number.base': 'El ID del involucrado debe ser un número entero.',
    'any.required': 'El ID del involucrado es obligatorio.',
  }),
});