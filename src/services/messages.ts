export const SUCCESS = {
  REGISTER: 'Registro completado exitosamente. Ahora puedes iniciar sesión con tu cuenta.',
  LOGIN: 'Has iniciado sesión exitosamente. Bienvenido/a de nuevo.',
  PASSWORD_RECOVERY_EMAIL_SENT:
    'El correo para restablecer tu contraseña ha sido enviado. Revisa tu bandeja de entrada.',
  PASSWORD_RESET:
    'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
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
};