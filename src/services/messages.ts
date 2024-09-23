export const SUCCESS = {
  REGISTER: 'Registro completado exitosamente. Confirmá tu cuenta ingresando a la Bandeja de Entrada del correo registrado.',
  LOGIN: 'Sesión iniciada correctamente.',
  PASSWORD_RECOVERY_EMAIL_SENT: 'Correo para restablecer la contraseña enviado.',
  PASSWORD_RESET: 'Contraseña actualizada correctamente.',
  EMAIL_CONFIRMED: 'Cuenta confirmada con éxito.',
  AUTHORIZED: 'Usuario autorizado como productor.',
  USER_BLOCKED: 'Usuario bloqueado correctamente.',
  USER_UNBLOCKED: 'Usuario habilitado correctamente.',
  ROLE_UPDATED: 'Rol actualizado correctamente.',
};

export const ERROR = {
  VALIDATION: {
    GENERAL: 'Error de validación en los datos proporcionados.',
    ROLE_INVALID: 'El rol proporcionado no es válido.',
    STATE_INVALID: 'El estado proporcionado no es válido.',
    PASSWORD_INCORRECT: 'Credenciales incorrectas.',
  },
  USER: {
    ALREADY_REGISTERED: 'El correo electrónico ya está registrado.',
    NOT_FOUND: 'Usuario no encontrado.',
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
  },
  GENERAL: {
    UNKNOWN: 'Ocurrió un error inesperado, por favor intente nuevamente más tarde.',
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
    'string.email': 'Por favor, proporciona un correo electrónico válido.',
    'string.empty': 'El correo electrónico es obligatorio.',
    'any.required': 'El correo electrónico es obligatorio.',
  },
  password: {
    'string.min': 'La contraseña debe tener al menos 8 caracteres.',
    'string.empty': 'La contraseña es obligatoria.',
    'any.required': 'La contraseña es obligatoria.',
  },
  nombre: {
    'string.min': 'El nombre debe tener al menos 2 caracteres.',
    'string.max': 'El nombre no puede exceder los 100 caracteres.',
    'string.empty': 'El nombre es obligatorio.',
    'any.required': 'El nombre es obligatorio.',
  },
  apellido: {
    'string.min': 'El apellido debe tener al menos 2 caracteres.',
    'string.max': 'El apellido no puede exceder los 100 caracteres.',
    'string.empty': 'El apellido es obligatorio.',
    'any.required': 'El apellido es obligatorio.',
  },
  cuit: {
    'string.pattern.base': 'El CUIT debe tener 11 dígitos.',
    'string.empty': 'El CUIT es obligatorio.',
    'any.required': 'El CUIT es obligatorio.',
  },
  tipo_persona_id: {
    'number.base': 'El tipo de persona debe ser un número.',
    'any.required': 'El tipo de persona es obligatorio.',
  },
  domicilio: {
    'string.max': 'El domicilio no puede exceder los 200 caracteres.',
  },
  ciudad: {
    'string.empty': 'La ciudad es obligatoria.',
    'any.required': 'La ciudad es obligatoria.',
  },
  provincia: {
    'string.empty': 'La provincia es obligatoria.',
    'any.required': 'La provincia es obligatoria.',
  },
  pais: {
    'string.empty': 'El país es obligatorio.',
    'any.required': 'El país es obligatorio.',
  },
  telefono: {
    'string.max': 'El teléfono no puede exceder los 50 caracteres.',
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
