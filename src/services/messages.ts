export const SUCCESS = {
  AUTH: {
    REGISTER_PRIMARY_FIRST:
      'El primer paso del registro fue completado exitosamente. Confirmá tu cuenta ingresando a la Bandeja de Entrada del correo registrado.',
    REGISTER_PRIMARY_SECOND: 'El proceso de registro se completó exitosamente.',
    REGISTER_SECONDARY:
      'Registro completado exitosamente. El usuario debe verificar la Bandeja de Entrada del correo registrado y seguir los pasos indicados.',
    LOGIN: 'Sesión iniciada correctamente.',
    PRODUCTORA_SELECTED: 'Productora activa seleccionada correctamente.',
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
  USUARIO: {
    USUARIO_UPDATED: 'Los datos del usuario fueron actualizados exitosamente.',
    USUARIO_DELETED: 'El usuario fue eliminado exitosamente.',
  },
  APPLICATION: {
    SAVED:
      'Aplicación cargada y pendiente de evaluación, para la autorización definitiva del usuario.',
    UPDATED:
      'Aplicación actualizada y pendiente de evaluación, para la autorización definitiva del usuario.',
    REJECTED: 'Aplicación rechazada y se ha enviado el correo con los comentarios al usuario.',
  },
  CONFLICTO: {
    CONFLICTO_CREATED: 'Conflicto creado exitosamente.',
    CONFLICTO_RESOLVED: 'Conflicto resuelto exitosamente.',
    COMENTARIO_ADDED: 'Comentario agregado exitosamente.',
    INVOLUCRADO_ADDED: 'Involucrado agregado exitosamente.',
    DECISION_ADDED: 'Decisión agregada exitosamente.',
    CONFLICTO_DELETED: 'Conflicto eliminado exitosamente.',
  },
  PRODUCTORA: {
    PRODUCTORA_CREATED: 'Productora creado exitosamente.',
    UPDATED: 'Productora actualizada exitosamente.',
    DELETED: 'Productora eliminada exitosamente.',
  },
  DOCUMENTO: {
    CREATED: 'Documento creado exitosamente.',
    UPDATED: 'Documento actualizado exitosamente.',
    DELETED: 'Documento eliminado exitosamente.',
    ALL_DELETED: 'Todos los documentos de la productora fueron eliminados exitosamente.',
  },
  ISRC: {
    CREATED: 'ISRC creado exitosamente.',
    UPDATED: 'ISRC actualizado exitosamente.',
    DELETED: 'Todos los ISRCs de la productora fueron eliminados exitosamente.',
  },
  POSTULACION: {
    CREATED: 'Postulación creada exitosamente.',
    UPDATED: 'Postulación actualizada exitosamente.',
    DELETED: 'Postulaciones eliminadas exitosamente para la productora.',
    ALL_DELETED: 'Todas las postulaciones de todas las productoras fueron eliminadas exitosamente.',
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
};

export const ERROR = {
  VALIDATION: {
    GENERAL: 'Error de validación en los datos proporcionados.',
    USER_INVALID: 'El id de usuario no fue proporcionado o es inválido.',
    EMAIL_INVALID: 'El email no fue proporcionado o no es válido.',
    PASSWORD_INVALID: 'La clave no fue proporcionada o no es válida.',
    ROLE_INVALID: 'El rol no fue proporcionado o no es válido.',
    STATE_INVALID: 'El estado no fue proporcionado o no es válido.',
    FISICA_ALREADY_EXISTS: 'La Persona Física ya existe en la base de datos.',
    JURIDICA_ALREADY_EXISTS: 'La Persona Jurídica ya existe en la base de datos.',
    STATE_ALREADY_AUTHORIZED: 'El usuario ya se encuentra autorizado y no puede ser eliminado.',
    PASSWORD_INCORRECT: 'Credenciales incorrectas.',
    ALREADY_LOGGED_IN: 'El usuario ya se encuentra logueado.',
    NO_TOKEN_PROVIDED: 'No se proporcionó un token.',
    INVALID_TOKEN: 'Token inválido o expirado.',
    NO_COOKIE_FOUND: 'No se encontró una sesión activa.',
    COMMENT_REQUIRED: 'El comentario de rechazo no fue proporcionado.',
    PRODUCTORA_NOT_ALLOWED: 'La productora no está asociada al usuario.',
    PRODUCTORA_ID_REQUIRED: 'El ID de la productora no fue propocionado o es inválido.',
    MISSING_PARAMETERS: 'Faltan uno o más parámetros obligatorios.',
    NO_DATA_PROVIDED: 'No se proporcionaron datos para actualizar.',
  },
  REGISTER: {
    ALREADY_REGISTERED: 'El correo electrónico ya está registrado.',
    NO_PENDING_USERS: 'No hay registros pendientes de autorización',
    USER_NOT_CONFIRMED:
      'El mail está pendiente de verificación. Por favor, revise la Bandeja de Entrada y siga los pasos.',
  },
  USER: {
    NOT_FOUND: 'Usuario no encontrado.',
    NO_MAESTRO_RECORD: 'Usuario sin registro en la tabla maestro.',
    MULTIPLE_MASTERS_FOR_PRINCIPAL: 'El usuario principal tiene más de una productora vinculada.',
    MULTIPLE_MAESTRO_RECORDS: 'EL usuario tiene múltiples registros para una misma productora.',
    NOT_AUTHORIZED: 'No tienes autorización para realizar esta acción.',
    NOT_AUTHORIZED_TO_CHANGE_PASSWORD: 'No estás autorizado para cambiar la clave.',
    NOT_AUTHORIZED_TO_CHANGE_ROLE: 'No estás autorizado para cambiar el rol.',
    USER_BLOCKED:
      'El usuario se encuentra bloqueado. Por favor, contacte a un administrador del sistema.',
    UPDATE_FAILED: 'Hubo un error al buscar al usuario e intentar actualizarlo.',
    DELETE_FAILED: 'Hubo un error al buscar al usuario e intentar eliminarlo.',
    CANNOT_MODIFY_DISABLED_USER:
      'EL usuario está deshabilitado. No se puede cambiar el estado de inicio de sesión.',
    NO_ASSOCIATED_PRODUCTORAS: 'Productoras no asociadas al usuario.',
    CANNOT_DELETE_SELF: 'No podés eliminar tu propia cuenta.',
    ROLE_NOT_ASSIGNED: 'El usuario autenticado no tiene un rol asignado.',
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
      'No se pudo enviar el correo de recuperación. Por favor, verificar en los logs.',
    TEMP_FAILED:
      'No se pudo enviar el correo con la clave temporal. Por favor, verificar en los logs',
    REJECTION_FAILED: 'No se pudo enviar el correo de rechazo. Por favor, verificar en los logs',
  },
  PASSWORD: {
    RESET_FAILED: 'No se pudo restablecer la contraseña. Por favor, intente nuevamente más tarde.',
    CONFIRMATION_MISMATCH: 'La nueva contraseña y la confirmación no coinciden.',
  },
  GENERAL: {
    UNKNOWN: 'Ocurrió un error inesperado, por favor intente nuevamente más tarde.',
    INVALID_FILE_TYPE: 'Tipo de archivo no permitido. Solo se permiten archivos %s.',
    RECORD_NOT_FOUND: 'El registro solicitado no fue encontrado.',
    MODEL_NOT_FOUND: 'El modelo solicitado no fue encontrado.',
  },
  CONSULTA: {
    NOT_FOUND: 'Consulta no encontrada.',
  },
  FONOGRAMA: {
    NOT_FOUND: 'El fonograma no fue encontrado.',
    TYPE_NOT_FOUND: 'El tipo de fonograma no fue encontrado.',
  },
  CONFLICTO: {
    NOT_FOUND: 'El conflicto no fue encontrado.',
    INVALID_TYPE: 'El tipo de conflicto es inválido.',
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
    INVALID_SALDO: 'El saldo proporcionado es inválido.',
  },
  PAGO: {
    NOT_FOUND: 'No se encontraron pagos asociados a la cuenta.',
    INVALID_PAYMENT_METHOD: 'El tipo de forma de pago es inválido.',
  },
  AUTH: {
    NOT_AUTHORIZED: 'No estás autorizado para realizar esta acción.',
  },
  POSTULACIONES: {
    NOT_FOUND: 'No se encontraron postulaciones en la búsqueda.',
    NOT_FOUND_FOR_PRODUCTORA: 'No se encontró la postulación de la productora especificada.',
    ALREADY_EXISTS: 'Ya existe una postulación con el código proporcionado para esta productora.',
    CREATION_FAILED: 'No se pudo crear la postulación.',
  },
  ARCHIVO: {
    NOT_FOUND: 'No se encontró el archivo.',
    INVALID_FILE_EXTENSION: 'Extensión de archivo inválida.',
  },
  PRODUCTORA: {
    NOT_FOUND: 'Productor no encontrado.',
    CREATION_FAILED: 'No se pudo crear la productora de forma correcta.',
    ID_REQUIRED: "Se requiere el id de la productora",
    ALREADY_EXISTS: 'La productora ya existe.',
    INVALID_ROLE: 'El rol del usuario no corresponde a productor.',
    INVALID_NAME: 'La productora asociada no tiene un nombre válido.',
    ROLE_NOT_FOUND: 'Rol de productor no encontrado en el sistema.',
    INVALID_TIPO_COMPANIA: 'El tipo de compañía proporcionado no es válido.',
    INVALID_ESTADO: 'El estado proporcionado no es válido.',
  },
  DOCUMENTOS: {
    NOT_FOUND: 'No se encontron documentos.',
    NOT_FOUND_BY_ID: 'No se encontró el documento solicitado.',
    CREATION_FAILED: 'No se pudo crear el documento.',
  },
  ISRC: {
    NOT_FOUND: 'No se encontron ISRC en la búsqueda.',
    NOT_FOUND_FOR_PRODUCTORA: 'No se encontraron ISRCs para la productora especificada.',
    ALREADY_EXISTS: 'Ya existe un ISRC con este código para la productora especificada.',
    NO_ISRC_CODES_AVAILABLE: 'No hay códigos ISRC disponibles.',
    CREATION_FAILED: 'No se pudo crear el ISRC.',
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
    TYPE_NOT_FOUND: 'El tipo de reporte no fue encontrado.',
  },
  SESION: {
    NOT_FOUND: 'No se encontró la sesión solicitada.',
  },
  TRAMITE: {
    NOT_FOUND: 'No se encontró el trámite solicitado.',
    INVALID_TYPE: 'El tipo de trámite es inválido.',
  },
};

export const EMAIL_BODY = {
  PASSWORD_RECOVERY: (resetLink: string) => `
    <h1>Recuperación de contraseña</h1>
    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="http://localhost:3001/password-recovery/${resetLink}">http://localhost:3001/password-recovery/${resetLink}</a>
    <p>Este enlace expirará en 1 hora.</p>
  `,
  VALIDATE_ACCOUNT: (validationLink: string) => `
    <h1>Confirma tu cuenta</h1>
    <p>Haz clic en el siguiente enlace para validar tu correo electrónico:</p>
    <a href="http://localhost:3001/confirm-account/${validationLink}">http://localhost:3001/confirm-account/${validationLink}</a>    
    <p>Este enlace expirará en 24 horas.</p>
  `,
  REJECTION_NOTIFICATION: (email: string, comentario: string) => `
    <p>Estimado/a ${email},</p>
    <p>Lamentamos informarle que la carga de sus datos ha sido rechazada por el siguiente motivo:</p>
    <blockquote>${comentario}</blockquote>
    <p>Por favor, ingrese nuevamente al sistema para corregir los datos.</p>
    <p>Gracias por su atención.</p>
  `,
  TEMP_PASSWORD: (tempPassword: string) => `
    <h1>Registro exitoso</h1>
    <p>Su cuenta ha sido creada exitosamente. Use la siguiente contraseña temporal para iniciar sesión:</p>
    <p><strong>${tempPassword}</strong></p>
    <p>Por motivos de seguridad, se le pedirá que cambie esta contraseña en su primer ingreso.</p>
    <p>Gracias por registrarse.</p>
  `,
  VALIDATE_ACCOUNT_WITH_TEMP_PASSWORD: (validationLink: string, tempPassword: string) => `
    <h1>Confirma tu cuenta</h1>
    <p>Su cuenta ha sido creada exitosamente como usuario secundario. Para activar su cuenta, haga clic en el siguiente enlace:</p>
    <a href="http://localhost:3001/confirm-account/${validationLink}">http://localhost:3001/confirm-account/${validationLink}</a>    
    <p>Este enlace expirará en 24 horas.</p>
    <p>Use la siguiente contraseña temporal para su primer acceso:</p>
    <p><strong>${tempPassword}</strong></p>
    <p>Por motivos de seguridad, deberá cambiar esta contraseña en su primer ingreso.</p>
    <p>Gracias por registrarse.</p>
  `,
  PRODUCTOR_PRINCIPAL_NOTIFICATION: (
    nombreProductora: string,
    cuitProductora: string,
    cbuProductora: string,
    aliasCbuProductora: string
  ) => `
    <h1>Registro exitoso como Productor Principal</h1>
    <p>Estimado usuario,</p>
    <p>Su cuenta fue registrada exitosamente como productor principal de la productora <strong>${nombreProductora}</strong>.</p>
    <p>A continuación, encontrará los datos asociados a la productora:</p>
    <ul>
      <li><strong>Nombre de la productora:</strong> ${nombreProductora}</li>
      <li><strong>CUIT:</strong> ${cuitProductora}</li>
      <li><strong>CBU:</strong> ${cbuProductora}</li>
      <li><strong>Alias CBU:</strong> ${aliasCbuProductora}</li>
    </ul>
    <p>Gracias por registrarte.</p>
  `,
  APPLICATION_SUBMITTED: (email: string) => `
    <p>Estimado/a ${email},</p>
    <p>Su solicitud ha sido enviada exitosamente y está en proceso de revisión.</p>
    <p>Nos pondremos en contacto con usted una vez que se complete la revisión.</p>
    <p>Gracias por su paciencia.</p>
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
    'string.pattern.base': 'El nombre solo debe contener letras y espacios.',
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
  codigo_postal: {
    'string.pattern.base': 'El código postal tiene un formato inválido.',
    'any.required': 'El código postal es obligatorio.',
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
