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
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
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

export const updateSaldoSchema = Joi.object({
  nuevoSaldo: Joi.number().precision(2).min(0).required().messages({
    'number.base': 'El saldo debe ser un número decimal.',
    'number.min': 'El saldo debe ser mayor o igual a 0.',
    'any.required': 'El saldo es obligatorio.',
  }),
});

export const createPagoSchema = Joi.object({
  monto: Joi.number().precision(2).min(0).required().messages({
    'number.base': 'El monto debe ser un número decimal.',
    'number.min': 'El monto debe ser mayor o igual a 0.',
    'any.required': 'El monto es obligatorio.',
  }),
  fecha_pago: Joi.date().required().messages({
    'date.base': 'La fecha de pago debe ser una fecha válida.',
    'any.required': 'La fecha de pago es obligatoria.',
  }),
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
  metodo_pago: Joi.string().max(50).optional().messages({
    'string.max': 'El método de pago no debe exceder los 50 caracteres.',
  }),
  referencia: Joi.string().max(100).optional().messages({
    'string.max': 'La referencia no debe exceder los 100 caracteres.',
  }),
});

export const updatePagoSchema = Joi.object({
  monto: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'El monto debe ser un número decimal.',
    'number.min': 'El monto debe ser mayor o igual a 0.',
  }),
  fecha_pago: Joi.date().optional().messages({
    'date.base': 'La fecha de pago debe ser una fecha válida.',
  }),
  metodo_pago: Joi.string().max(50).optional().messages({
    'string.max': 'El método de pago no debe exceder los 50 caracteres.',
  }),
  referencia: Joi.string().max(100).optional().messages({
    'string.max': 'La referencia no debe exceder los 100 caracteres.',
  }),
});

export const createPremioSchema = Joi.object({
  id_compania: Joi.number().integer().required().messages({
    'number.base': 'El ID de la compañía debe ser un número entero.',
    'any.required': 'El ID de la compañía es obligatorio.',
  }),
  codigo_postulacion: Joi.string().max(50).required().messages({
    'string.max': 'El código de postulación no debe exceder los 50 caracteres.',
    'any.required': 'El código de postulación es obligatorio.',
  }),
  fecha_asignacion: Joi.date().optional().messages({
    'date.base': 'La fecha de asignación debe ser una fecha válida.',
  }),
});

export const updatePremioSchema = Joi.object({
  codigo_postulacion: Joi.string().max(50).optional().messages({
    'string.max': 'El código de postulación no debe exceder los 50 caracteres.',
  }),
  fecha_asignacion: Joi.date().optional().messages({
    'date.base': 'La fecha de asignación debe ser una fecha válida.',
  }),
});

export const companiaCreateSchema = Joi.object({
  nombre_compania: Joi.string().min(3).max(150).required().messages({
    'string.min': 'El nombre de la compañía debe tener al menos 3 caracteres.',
    'string.max': 'El nombre de la compañía no debe exceder los 150 caracteres.',
    'any.required': 'El nombre de la compañía es obligatorio.',
  }),
  direccion: Joi.string().max(200).allow(null, '').messages({
    'string.max': 'La dirección no debe exceder los 200 caracteres.',
  }),
  telefono: Joi.string()
    .regex(/^[0-9\-+() ]+$/)
    .max(50)
    .allow(null, '')
    .messages({
      'string.max': 'El teléfono no debe exceder los 50 caracteres.',
      'string.pattern.base':
        'El teléfono solo puede contener números y los caracteres +, -, (, ), y espacios.',
    }),
  email: Joi.string().email().allow(null, '').messages({
    'string.email': 'Debe proporcionar un correo electrónico válido.',
  }),
  cuit: Joi.string()
    .regex(/^[0-9]{11}$/)
    .required()
    .messages({
      'string.pattern.base': 'El CUIT debe contener exactamente 11 dígitos numéricos.',
      'any.required': 'El CUIT es obligatorio.',
    }),
  tipo_compania_id: Joi.number().integer().required().messages({
    'number.base': 'El tipo de compañía debe ser un número entero.',
    'any.required': 'El tipo de compañía es obligatorio.',
  }),
  estado_id: Joi.number().integer().required().messages({
    'number.base': 'El estado debe ser un número entero.',
    'any.required': 'El estado es obligatorio.',
  }),
});

export const companiaUpdateSchema = Joi.object({
  nombre_compania: Joi.string().min(3).max(150).messages({
    'string.min': 'El nombre de la compañía debe tener al menos 3 caracteres.',
    'string.max': 'El nombre de la compañía no debe exceder los 150 caracteres.',
  }),
  direccion: Joi.string().max(200).allow(null, '').messages({
    'string.max': 'La dirección no debe exceder los 200 caracteres.',
  }),
  telefono: Joi.string()
    .regex(/^[0-9\-+() ]+$/)
    .max(50)
    .allow(null, '')
    .messages({
      'string.max': 'El teléfono no debe exceder los 50 caracteres.',
      'string.pattern.base':
        'El teléfono solo puede contener números y los caracteres +, -, (, ), y espacios.',
    }),
  email: Joi.string().email().allow(null, '').messages({
    'string.email': 'Debe proporcionar un correo electrónico válido.',
  }),
  cuit: Joi.string()
    .regex(/^[0-9]{11}$/)
    .messages({
      'string.pattern.base': 'El CUIT debe contener exactamente 11 dígitos numéricos.',
    }),
  tipo_compania_id: Joi.number().integer().messages({
    'number.base': 'El tipo de compañía debe ser un número entero.',
  }),
  estado_id: Joi.number().integer().messages({
    'number.base': 'El estado debe ser un número entero.',
  }),
});

export const companiaIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'El ID de la compañía debe ser un número entero.',
    'any.required': 'El ID de la compañía es obligatorio.',
  }),
});

export const reglaCreateSchema = Joi.object({
  descripcion: Joi.string().min(3).max(255).required().messages({
    'string.min': 'La descripción debe tener al menos 3 caracteres.',
    'string.max': 'La descripción no debe exceder los 255 caracteres.',
    'any.required': 'La descripción es obligatoria.',
  }),
  activo: Joi.boolean().required().messages({
    'any.required': 'El estado de la regla es obligatorio.',
  }),
});

export const reglaUpdateSchema = Joi.object({
  descripcion: Joi.string().min(3).max(255).optional().messages({
    'string.min': 'La descripción debe tener al menos 3 caracteres.',
    'string.max': 'La descripción no debe exceder los 255 caracteres.',
  }),
  activo: Joi.boolean().optional().messages({
    'any.required': 'El estado de la regla es obligatorio.',
  }),
});

export const repertorioCreateSchema = Joi.object({
  titulo: Joi.string().min(3).max(150).required().messages({
    'string.min': 'El título debe tener al menos 3 caracteres.',
    'string.max': 'El título no debe exceder los 150 caracteres.',
    'any.required': 'El título es obligatorio.',
  }),
  tipo: Joi.string().valid('Música', 'Literatura', 'Cine', 'Otro').required().messages({
    'any.only': 'El tipo debe ser uno de los siguientes: Música, Literatura, Cine, Otro.',
    'any.required': 'El tipo es obligatorio.',
  }),
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
  estado: Joi.string().min(3).max(50).required().messages({
    'string.min': 'El estado debe tener al menos 3 caracteres.',
    'string.max': 'El estado no debe exceder los 50 caracteres.',
    'any.required': 'El estado es obligatorio.',
  }),
});

export const repertorioUpdateSchema = Joi.object({
  titulo: Joi.string().min(3).max(150).messages({
    'string.min': 'El título debe tener al menos 3 caracteres.',
    'string.max': 'El título no debe exceder los 150 caracteres.',
  }),
  tipo: Joi.string().valid('Música', 'Literatura', 'Cine', 'Otro').messages({
    'any.only': 'El tipo debe ser uno de los siguientes: Música, Literatura, Cine, Otro.',
  }),
  id_usuario: Joi.number().integer().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
  }),
  estado: Joi.string().min(3).max(50).messages({
    'string.min': 'El estado debe tener al menos 3 caracteres.',
    'string.max': 'El estado no debe exceder los 50 caracteres.',
  }),
});

export const repertorioIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'El ID del repertorio debe ser un número entero.',
    'any.required': 'El ID del repertorio es obligatorio.',
  }),
});

export const createRepertorioByTemaSchema = Joi.object({
  titulo: Joi.string().min(3).max(150).required().messages({
    'string.min': 'El título debe tener al menos 3 caracteres.',
    'string.max': 'El título no debe exceder los 150 caracteres.',
    'any.required': 'El título es obligatorio.',
  }),
  artista: Joi.string().min(3).max(100).required().messages({
    'string.min': 'El nombre del artista debe tener al menos 3 caracteres.',
    'string.max': 'El nombre del artista no debe exceder los 100 caracteres.',
    'any.required': 'El nombre del artista es obligatorio.',
  }),
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
  estado: Joi.string().min(3).max(50).required().messages({
    'string.min': 'El estado debe tener al menos 3 caracteres.',
    'string.max': 'El estado no debe exceder los 50 caracteres.',
    'any.required': 'El estado es obligatorio.',
  }),
});

export const createRepertorioByAlbumSchema = Joi.object({
  titulo: Joi.string().min(3).max(150).required().messages({
    'string.min': 'El título debe tener al menos 3 caracteres.',
    'string.max': 'El título no debe exceder los 150 caracteres.',
    'any.required': 'El título es obligatorio.',
  }),
  artista: Joi.string().min(3).max(100).required().messages({
    'string.min': 'El nombre del artista debe tener al menos 3 caracteres.',
    'string.max': 'El nombre del artista no debe exceder los 100 caracteres.',
    'any.required': 'El nombre del artista es obligatorio.',
  }),
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
  estado: Joi.string().min(3).max(50).required().messages({
    'string.min': 'El estado debe tener al menos 3 caracteres.',
    'string.max': 'El estado no debe exceder los 50 caracteres.',
    'any.required': 'El estado es obligatorio.',
  }),
});

export const updateDepuracionSchema = Joi.object({
  titulo: Joi.string().min(3).max(150).messages({
    'string.min': 'El título debe tener al menos 3 caracteres.',
    'string.max': 'El título no debe exceder los 150 caracteres.',
  }),
  tipo: Joi.string().valid('Música', 'Literatura', 'Cine', 'Otro').messages({
    'any.only': 'El tipo debe ser uno de los siguientes: Música, Literatura, Cine, Otro.',
  }),
  estado: Joi.string().min(3).max(50).required().messages({
    'string.min': 'El estado debe tener al menos 3 caracteres.',
    'string.max': 'El estado no debe exceder los 50 caracteres.',
    'any.required': 'El estado es obligatorio.',
  }),
});

export const createISRCReportSchema = Joi.object({
  tipo: Joi.string().valid('audio', 'video').required().messages({
    'any.only': 'El tipo debe ser "audio" o "video".',
    'any.required': 'El tipo de reporte es obligatorio.',
  }),
  fechaInicio: Joi.date().required().messages({
    'date.base': 'La fecha de inicio debe ser una fecha válida.',
    'any.required': 'La fecha de inicio es obligatoria.',
  }),
  fechaFin: Joi.date().required().messages({
    'date.base': 'La fecha de fin debe ser una fecha válida.',
    'any.required': 'La fecha de fin es obligatoria.',
  }),
});

export const idReportSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'El ID del reporte debe ser un número entero.',
    'any.required': 'El ID del reporte es obligatorio.',
  }),
});

export const generateReportByTypeSchema = Joi.object({
  tipoReporte: Joi.string().valid('fonograma', 'repertorio').required().messages({
    'any.only': 'El tipo de reporte debe ser "fonograma" o "repertorio".',
    'any.required': 'El tipo de reporte es obligatorio.',
  }),
  parametros: Joi.object().required().messages({
    'any.required': 'Los parámetros para generar el reporte son obligatorios.',
  }),
});

export const createTramiteSchema = Joi.object({
  titulo: Joi.string().min(3).max(150).required().messages({
    'string.min': 'El título debe tener al menos 3 caracteres.',
    'string.max': 'El título no debe exceder los 150 caracteres.',
    'any.required': 'El título es obligatorio.',
  }),
  descripcion: Joi.string().min(10).max(500).required().messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres.',
    'string.max': 'La descripción no debe exceder los 500 caracteres.',
    'any.required': 'La descripción es obligatoria.',
  }),
  estado: Joi.string().valid('pendiente', 'en proceso', 'completado').required().messages({
    'any.only': 'El estado debe ser "pendiente", "en proceso" o "completado".',
    'any.required': 'El estado es obligatorio.',
  }),
  id_usuario: Joi.number().integer().required().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
    'any.required': 'El ID del usuario es obligatorio.',
  }),
});

export const updateTramiteSchema = Joi.object({
  titulo: Joi.string().min(3).max(150).messages({
    'string.min': 'El título debe tener al menos 3 caracteres.',
    'string.max': 'El título no debe exceder los 150 caracteres.',
  }),
  descripcion: Joi.string().min(10).max(500).messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres.',
    'string.max': 'La descripción no debe exceder los 500 caracteres.',
  }),
  estado: Joi.string().valid('pendiente', 'en proceso', 'completado').messages({
    'any.only': 'El estado debe ser "pendiente", "en proceso" o "completado".',
  }),
  id_usuario: Joi.number().integer().messages({
    'number.base': 'El ID del usuario debe ser un número entero.',
  }),
});