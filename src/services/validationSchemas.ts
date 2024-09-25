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