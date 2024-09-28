export const SUCCESS = {
  AUTH: {
    REGISTER:
      'Registro completado exitosamente. Confirmá tu cuenta ingresando a la Bandeja de Entrada del correo registrado.',
    LOGIN: 'Sesión iniciada correctamente.',
    PASSWORD_RECOVERY_EMAIL_SENT: 'Correo para restablecer la contraseña enviado.',
    PASSWORD_RESET: 'Contraseña actualizada correctamente.',
    EMAIL_CONFIRMED: 'Cuenta confirmada con éxito.',
    AUTHORIZED: 'Usuario autorizado como productor.',
    USER_BLOCKED: 'Usuario bloqueado correctamente.',
    USER_UNBLOCKED: 'Usuario habilitado correctamente.',
    ROLE_UPDATED: 'Rol actualizado correctamente.',
    PASSWORD_RESET_REQUESTED: 'Solicitud de restablecimiento de contraseña enviada.',
    LOGOUT: 'La sesión se cerró exitosamente',
    USER_DELETED: 'Usuario eliminado correctamente.',
  },
  CONSULTA: {
    CONSULTA_DELETED: 'Consulta eliminada correctamente.',
    CONSULTA_ADDED: 'Consulta generada con éxito',
  },
  CONFLICTO: {
    CONFLICTO_CREATED: 'Conflicto creado exitosamente.',
    CONFLICTO_RESOLVED: 'Conflicto resuelto exitosamente.',
    COMENTARIO_ADDED: 'Comentario agregado exitosamente.',
    INVOLUCRADO_ADDED: 'Involucrado agregado exitosamente.',
    DECISION_ADDED: 'Decisión agregada exitosamente.',
    CONFLICTO_DELETED: 'Conflicto eliminado exitosamente.',
  },
  CUENTA_CORRIENTE: {
    CUENTA_DELETED: 'Cuenta corriente eliminada correctamente.',
    SALDO_UPDATED: 'Saldo de la cuenta corriente actualizado correctamente.',
  },
  PAGO: {
    PAGO_CREATED: 'Pago creado con éxito.',
    PAGO_UPDATED: 'Pago actualizado con éxito.',
    PAGO_DELETED: 'Pago eliminado con éxito.',
  },
  PREMIO: {
    PREMIO_CREATED: 'Postulación creada con éxito.',
    PREMIO_UPDATED: 'Postulación actualizada con éxito.',
    PREMIO_DELETED: 'Postulación eliminada con éxito.',
  },
  ARCHIVO: {
    ARCHIVO_CREATED: 'Archivo creado con éxito.',
    ARCHIVO_UPDATED: 'Archivo actualizado con éxito.',
    ARCHIVO_DELETED: 'Archivo eliminado con éxito.',
  },
  PRODUCTOR: {
    PRODUCER_CREATED: 'Productor creado con éxito.',
    PRODUCER_UPDATED: 'Productor actualizado con éxito.',
    PRODUCER_DELETED: 'Productor eliminado con éxito.',
  },
  REGLA: {
    REGLA_CREATED: 'Regla creada con éxito.',
    REGLA_UPDATED: 'Regla actualizada con éxito.',
    REGLA_DELETED: 'Regla eliminada con éxito.',
  },
  REPERTORIO: {
    CREATED: 'El repertorio fue creado exitosamente.',
    CREATED_BY_TEMA: 'El repertorio por tema fue creado exitosamente.',
    CREATED_BY_ALBUM: 'El repertorio por álbum fue creado exitosamente.',
    UPDATED: 'El repertorio fue actualizado exitosamente.',
    DELETED: 'El repertorio fue eliminado exitosamente.',
    DOWNLOADED: 'El repertorio fue descargado exitosamente.',
    LOTE_ENVIO_GENERADO: 'El lote de envío fue generado exitosamente.',
    UPDATED_DEPURACION: 'El repertorio depurado fue actualizado exitosamente.',
  },
  REPORTE: {
    ISRC_GENERATED: 'El reporte ISRC se ha generado correctamente.',
    GENERATED: 'El reporte se ha generado correctamente.',
  },
  SESION: {
    DELETED: 'Sesión eliminada correctamente.',
    USER_SESSIONS_CLOSED: 'Todas las sesiones del usuario han sido cerradas.',
  },
  TRAMITE: {
    CREATED: 'Trámite creado con éxito.',
    UPDATED: 'Trámite actualizado con éxito.',
    DELETED: 'Trámite eliminado con éxito.',
  },
};

export const ERROR = {
  VALIDATION: {
    GENERAL: 'Error de validación en los datos proporcionados.',
    ROLE_INVALID: 'El rol proporcionado no es válido.',
    STATE_INVALID: 'El estado proporcionado no es válido.',
    STATE_ALREADY_AUTHORIZED: 'El usuario ya se encuentra autorizado y no puede ser eliminado.',
    PASSWORD_INCORRECT: 'Credenciales incorrectas.',
    ALREADY_LOGGED_IN: 'El usuario ya se encuentra logueado.',
    NO_TOKEN_PROVIDED: 'No se proporcionó un token.',
    INVALID_TOKEN: 'Token inválido o expirado.',
    USER_NOT_CONFIRMED:
      'El mail está pendiente de verificación. Por favor, revise la Bandeja de Entrada y siga los pasos.',
    USER_BLOCKED:
      'El usuario se encuentra bloqueado. Por favor, contacte a un administrador del sistema.',
  },
  USER: {
    ALREADY_REGISTERED: 'El correo electrónico ya está registrado.',
    NOT_FOUND: 'Usuario no encontrado.',
    NOT_AUTHORIZED: 'No tienes autorización para realizar esta acción.',
    NOT_AUTHORIZED_TO_CHANGE_ROLE: 'No estás autorizado para cambiar el rol.',
  },
  DATABASE: {
    CONNECTION: 'Error de conexión con la base de datos.',
    GENERAL: 'Error de base de datos.',
  },
  JWT: {
    ERROR: 'Error al generar el token.',
    EXPIRED: 'El enlace de recuperación ha expirado.',
    INVALID: 'Token inválido.',
    GENERATION_ERROR: 'Error al generar el token de recuperación.',
  },
  EMAIL: {
    RECOVERY_FAILED:
      'No se pudo enviar el correo de recuperación. Por favor, intente nuevamente más tarde.',
  },
  PASSWORD: {
    RESET_FAILED: 'No se pudo restablecer la contraseña. Por favor, intente nuevamente más tarde.',
    CONFIRMATION_MISMATCH: 'La nueva contraseña y la confirmación no coinciden.',
  },
  GENERAL: {
    UNKNOWN: 'Ocurrió un error inesperado, por favor intente nuevamente más tarde.',
  },
  CONSULTA: {
    NOT_FOUND: 'Consulta no encontrada.',
  },
  FONOGRAMA: {
    NOT_FOUND: 'El fonograma no fue encontrado.',
  },
  CONFLICTO: {
    NOT_FOUND: 'El conflicto no fue encontrado.',
  },
  ESTADO: {
    NOT_FOUND: 'El estado no fue encontrado.',
  },
  INVOLUCRADO: {
    NOT_FOUND: 'El involucrado no fue encontrado.',
    ALREADY_EXISTS: 'El involucrado ya está registrado en el conflicto.',
  },
  CUENTA_CORRIENTE: {
    NOT_FOUND: 'La cuenta corriente no fue encontrada.',
  },
  PAGO: {
    NOT_FOUND: 'No se encontraron pagos asociados a la cuenta.',
  },
  AUTH: {
    NOT_AUTHORIZED: 'No estás autorizado para realizar esta acción.',
  },
  PREMIO: {
    NOT_FOUND: 'No se encontró la postulación.',
  },
  ARCHIVO: {
    NOT_FOUND: 'No se encontró el archivo.',
  },
  PRODUCTOR: {
    NOT_FOUND: 'Productor no encontrado.',
    INVALID_ROLE: 'El rol del usuario no corresponde a productor.',
    ROLE_NOT_FOUND: 'Rol de productor no encontrado en el sistema.',
  },
  REGLA: {
    NOT_FOUND: 'Regla no encontrada.',
  },
  REPERTORIO: {
    NOT_FOUND: 'No se encontró el repertorio solicitado.',
    INVALID_STATE: 'El estado del repertorio no es válido para esta acción.',
  },
  REPORTE: {
    NOT_FOUND: 'No se encontró el reporte solicitado.',
    GENERATION_FAILED: 'Error al generar el reporte.',
  },
  SESION: {
    NOT_FOUND: 'No se encontró la sesión solicitada.',
  },
  TRAMITE: {
    NOT_FOUND: 'No se encontró el trámite solicitado.',
  },
};

export const EMAIL_BODY = {
  PASSWORD_RECOVERY: (resetLink: string) => `
    <h1>Recuperación de contraseña</h1>
    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Este enlace expirará en 1 hora.</p>
  `,
  VALIDATE_ACCOUNT: (validationLink: string) => `
    <h1>Confirma tu cuenta</h1>
    <p>Haz clic en el siguiente enlace para validar tu correo electrónico:</p>
    <a href="${validationLink}">${validationLink}</a>
    <p>Este enlace expirará en 24 horas.</p>
  `,
};

export const VALIDATION_AUTH = {
  email: {
    'string.email': 'El email debe ser válido.',
    'any.required': 'El email es obligatorio.',
  },
  password: {
    'string.min': 'La contraseña debe tener al menos 8 caracteres.',
    'any.required': 'La contraseña es obligatoria.',
  },
  nombre: {
    'string.min': 'El nombre debe tener al menos 2 caracteres.',
    'string.max': 'El nombre no debe exceder los 100 caracteres.',
    'any.required': 'El nombre es obligatorio.',
  },
  apellido: {
    'string.min': 'El apellido debe tener al menos 2 caracteres.',
    'string.max': 'El apellido no debe exceder los 100 caracteres.',
    'string.pattern.base': 'El apellido solo debe contener letras y espacios.',
    'any.required': 'El apellido es obligatorio.',
  },
  cuit: {
    'string.pattern.base': 'El CUIT debe tener exactamente 11 dígitos.',
    'any.required': 'El CUIT es obligatorio.',
  },
  tipo_persona_id: {
    'number.base': 'El tipo de persona debe ser un número.',
    'any.required': 'El tipo de persona es obligatorio.',
  },
  domicilio: {
    'string.max': 'El domicilio no debe exceder los 200 caracteres.',
  },
  ciudad: {
    'any.required': 'La ciudad es obligatoria.',
  },
  provincia: {
    'any.required': 'La provincia es obligatoria.',
  },
  pais: {
    'any.required': 'El país es obligatorio.',
  },
  telefono: {
    'string.max': 'El teléfono no debe exceder los 50 caracteres.',
    'string.pattern.base':
      'El teléfono solo puede contener números y los caracteres +, -, (, ), y espacio.',
  },
  token: {
    'string.empty': 'El token es obligatorio.',
    'any.required': 'El token es obligatorio.',
  },
  newPassword: {
    'string.min': 'La nueva contraseña debe tener al menos 8 caracteres.',
    'string.empty': 'La nueva contraseña es obligatoria.',
    'any.required': 'La nueva contraseña es obligatoria.',
  },
  bloquear: {
    'boolean.base': 'El valor para bloquear debe ser verdadero o falso.',
    'any.required': 'El valor para bloquear es obligatorio.',
  },
  rol: {
    'string.base': 'El rol debe ser un texto válido.',
    'any.required': 'El rol es obligatorio.',
  },
};
