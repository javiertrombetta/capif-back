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
    CUIT_AVAILABLE: "El CUIT está disponible para registro.",
  },
  USUARIO: {
    USUARIO_UPDATED: 'Los datos del usuario fueron actualizados exitosamente.',
    USUARIO_DELETED: 'El usuario fue eliminado exitosamente.',
    TYPE_REGISTER_FOUND: 'El tipo de registro fue encontrado existosamente.'
  },
  APPLICATION: {
    SAVED:
      'Aplicación cargada y pendiente de evaluación, para la autorización definitiva del usuario.',
    UPDATED:
      'Aplicación actualizada y pendiente de evaluación, para la autorización definitiva del usuario.',
    REJECTED: 'Aplicación rechazada y se ha enviado el correo con los comentarios al usuario.',
    FOUND: 'La búsqueda de registros pendientes fue completada.',
  },
  CONFLICTO: {
    CONFLICTO_CREATED: 'Conflicto creado exitosamente.',
    CONFLICTO_FETCHED: 'Conflicto obtenido exitosamente.',
    CONFLICTO_RESOLVED: 'Conflicto resuelto exitosamente.',
    CONFLICTO_CANCELED: 'Conflicto cancelado exitosamente.',
    STATUS_UPDATED: 'El estado del conflicto fue actualizado exitosamente',
    COMENTARIO_ADDED: 'Comentario agregado exitosamente.',
    INVOLUCRADO_ADDED: 'Involucrado agregado exitosamente.',
    DECISION_ADDED: 'Decisión agregada exitosamente.',
    CONFLICTO_DELETED: 'Conflicto eliminado exitosamente.',
    RESOLUTION_APPLIED: 'Resolución aplicada exitosamente.',
    EXTENSION_GRANTED: 'Prórroga otorgada exitosamente.',
    PARTICIPATION_CONFIRMED_PENDING: 'Confirmación de porcentaje de titularidad aplicado exitosamente.',
    DOCUMENTS_SENT: 'Documentos enviados exitosamente.',
    REPORT_GENERATED: 'Reporte generado exitosamente.',
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
    ISRC_AVAILABLE: "El ISRC está disponible.",
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
    FONOGRAMAS_NOT_PROVIDED: "Se debe proporcionar un array de IDs de fonogramas.",
    OPERATIONS_INVALID: 'Las operaciones proporcionadas no son válidas.',
    PARTICIPACION_NOT_PROVIDED: 'No se incluyeron participaciones en la solicitud.',
    TERRITORIO_ISO_NOT_FOUND: 'No se proporcionó un código ISO de territorio.',
    TERRITORIO_ALREADY_EXIST: 'El territorio ya está asociado a este fonograma.',
    TERRITORIO_STATUS_NOT_FOUND: 'El campo is_activo debe ser true o false.',
    ENVIO_STATE_INVALID: 'El estado proporcionado no es válido.',
    NO_CSV_FOUND: 'No se proporcionó un archivo CSV.',
    DATES_INVALID: 'Las fechas proporcionadas son inválidas.',
    CUIT_ALREADY_EXISTS: "El CUIT ya está registrado en el sistema.",
  },
  REGISTER: {
    ALREADY_REGISTERED: 'El correo electrónico ya está registrado.',
    NO_PENDING_USERS: 'No hay registros pendientes de autorización',
    USER_NOT_CONFIRMED:
      'El mail está pendiente de verificación. Por favor, revise la Bandeja de Entrada y siga los pasos.',
    NO_TEMP_PASSWORD: 'EL usuario creado no tiene una clave temporal asignada.'
  },
  USER: {
    NOT_FOUND: 'Usuario no encontrado.',
    NOT_SINGLE_USER: 'Se encontró más de un usuario en la búsqueda realizada.',
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
    NO_PRODUCTORA_PRINCIPAL: 'El usuario no tiene una productora asociada.',
    CANNOT_DELETE_SELF: 'No podés eliminar tu propia cuenta.',
    CANNOT_DELETE_OTHERS: 'Solo podés eliminar usuarios relacionados con tu misma productora.',
    CANNOT_DELETE_PRINCIPAL_WITH_PRODUCTORA: 'El usuario tiene productoras asociadas y no puede ser eliminado.',
    ROLE_NOT_ASSIGNED: 'El usuario autenticado no tiene un rol asignado.',
  },
  MESSAGE: {
    NO_SINGLE_FOUND: 'No se encontraron mensajes para el usuario solicitado.',
    NO_REJECT: 'No se encontraron mensajes de rechazo para el usuario.',
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
    SEND_FAILED:
      'No se pudo enviar el correo electrónico. Por favor, verificar en los logs',
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
  ENVIO: {
    NOT_FOUND: 'No hay envíos registrados para este fonograma.',
  },
  FONOGRAMA: {
    NOT_FOUND: 'El repetorio no fue encontrado.',
    NOT_FOUND_MULTIPLE: 'Uno o más repertorios no fueron encontrados.',
    TYPE_NOT_FOUND: 'El tipo de repertorio no fue encontrado.',
    NOT_SEND_PENDING: 'Uno o más repertorios a enviar no están en estado PENDIENTE DE ENVIO.'
  },
  CONFLICTO: {
    NOT_FOUND: 'El conflicto no fue encontrado.',
    NO_CONFLICTS_FOUND: 'No se encontraron conflictos',
    INVALID_STATE: 'El estado del conflicto es inválido.',
    NO_SUPERPOSITION_FOUND: 'No se encontraron períodos con porcentaje de participación superior al 100%',
    PART_NOT_FOUND: ' No se encontró la participación en conflicto.',
    EXCEEDS_100_PERCENT: 'Existen titularidades que simultáneamente superan el 100% de participación.',
    CANNOT_EXTEND: 'No se puede extender otra instancia a la actual.',
    NO_DOCUMENTS_ATTACHED: 'No se adjuntaron documentos.',
    MAIN_EMAIL_NOT_CONFIGURED: 'No se encontraron los parámetros del correo electrónico a enviar.',
    INVALID_REPORT_FORMAT: 'Formato de reporte inválido',
  },
  ESTADO: {
    NOT_FOUND: 'El estado no fue encontrado.',
  },
  PARTICIPACION: {
    NOT_FOUND: 'La participación no fue encontrada para este fonograma.',
    NOT_FOUND_PERIOD: 'No hay participaciones para este fonograma en el período seleccionado.',
    ALREADY_EXISTS: 'La participación ya existe en el fonograma.',
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
    NOT_FOUND: 'No hay un archivo cargado a esta ruta.',
    NOT_FOUND_FILE: 'No se encontró el archivo fisico en el sistema.',
    NOT_FOUND_DB: 'No se encontró el registro del archivo en la base de datos.',
    INVALID_FILE_EXTENSION: 'Extensión de archivo inválida.',
  },
  PRODUCTORA: {
    NOT_FOUND: 'Productora no encontrada.',
    CREATION_FAILED: 'No se pudo crear la productora de forma correcta.',
    ID_REQUIRED: "Se requiere el id de la productora",
    ALREADY_EXISTS: 'La productora ya existe.',
    INVALID_ROLE: 'El rol del usuario no corresponde a productor.',
    INVALID_NAME: 'La productora asociada no tiene un nombre válido.',
    ROLE_NOT_FOUND: 'Rol de productor no encontrado en el sistema.',
    INVALID_TIPO_COMPANIA: 'El tipo de compañía proporcionado no es válido.',
    INVALID_ESTADO: 'El estado proporcionado no es válido.',
    NO_ENTRIES: 'No existen productoras registradas.'
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
    ISRC_REQUIRED: "El ISRC debe ser proporcionado y debe ser una cadena de texto.",
    ISRC_LENGTH: "El ISRC debe tener exactamente 12 caracteres.",
    ISRC_PREFIX: "El ISRC debe comenzar con 'AR'.",
    ISRC_PRODUCTORA_INVALID: "El código de productora no es válido o no existe como tipo AUDIO.",
    ISRC_YEAR_MISMATCH: "El año en el ISRC no coincide con el año actual ({year}).",
    ISRC_IN_USE: "El ISRC ya está en uso.",
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
  TERRITORIO: {
    NOT_FOUND: 'El territorio no existe o no está habilitado.',
    NOT_ASSIGNED: 'No hay territorios asociados a este fonograma.',
    INVALID_TYPE: 'El tipo de trámite es inválido.',
    NOT_ENABLED: ' El territorio no se encuentra habilitado.'
  },
};

const frontendUrl = process.env.FRONTEND_URL || "http://localhost";
const baseUrl = new URL(frontendUrl).origin;

export const EMAIL_BODY = {
  PASSWORD_RECOVERY: (resetLink: string) => `
    <h1>Recuperación de contraseña</h1>
    <p>Hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="${baseUrl}/password-recovery/${resetLink}">${baseUrl}/password-recovery/${resetLink}</a>
    <p>Este enlace expira en 1 hora.</p>
    <p>Atte.,</p>
    <p><b>CAPIF</b></p>
  `,
  VALIDATE_ACCOUNT: (validationLink: string) => `
    <h1>Confirmá tu cuenta</h1>
    <p>Hacé clic en el siguiente enlace para validar tu correo electrónico:</p>
    <a href="${baseUrl}/verify-account/${validationLink}">${baseUrl}/verify-account/${validationLink}</a>    
    <p>Este enlace expira en 24 horas.</p>
    <p>Atte.,</p>
    <p><b>CAPIF</b></p>
  `,
  REJECTION_NOTIFICATION: (nombre: string, comentario: string) => `
    <p>Hola ${nombre},</p>
    <p>Lamentamos informarte que el registro de nueva productora fue rechazado por el siguiente motivo:</p>
    <blockquote>${comentario}</blockquote>
    <p>Por favor, ingresá nuevamente al sistema GIT para corregir los datos.</p>
    <p>Atte.,</p>
    <p><b>CAPIF</b></p>
  `,
  TEMP_PASSWORD: (tempPassword: string) => `
    <h1>Registro en el sistema GIT</h1>
    <p>Ya podés acceder al sistema GIT con la siguiente contraseña temporal:</p>
    <p><strong>${tempPassword}</strong></p>
    <p>Por motivos de seguridad, se te pedirá que cambies esta contraseña al acceder al sistema.</p>
    <p>Atte.,</p>
    <p><b>CAPIF</b></p>
  `,
  VALIDATE_ACCOUNT_WITH_TEMP_PASSWORD: (validationLink: string, tempPassword: string) => `
    <h1>Registro en el sistema GIT</h1>
    <p>Tu cuenta fue creada con éxito. Para activarla tenés que hacer clic en el siguiente enlace:</p>
    <a href="${baseUrl}/verify-account/${validationLink}">${baseUrl}/verify-account/${validationLink}</a>    
    <p>Este enlace expira en 24 horas.</p>
    <p>Usá la siguiente contraseña temporal para ingresar por primera vez:</p>
    <p><strong>${tempPassword}</strong></p>
    <p>Por motivos de seguridad, el sistema te va a pedir que cambies esta contraseña luego de acceder al sistema.</p>
    <p>Atte.,</p>
    <p><b>CAPIF</b></p>
  `,
  PRODUCTOR_PRINCIPAL_NOTIFICATION: (
    nombrePersona: string,
    nombreProductora: string,
    cuitProductora: string,
    cbuProductora: string,
    aliasCbuProductora: string,
    isrcs: { tipo: string; codigo_productora: string }[]
  ) => `
    <h1>Registro en el sistema GIT</h1>
    <p>Hola ${nombrePersona},</p>
    <p>Tu cuenta fue autorizada como principal para la productora <strong>${nombreProductora}</strong>.</p>
    <p>A continuación, los datos asociados a la productora registrada:</p>
    <ul>
      <li><strong>Nombre de la productora:</strong> ${nombreProductora}</li>
      <li><strong>CUIT:</strong> ${cuitProductora}</li>
      <li><strong>CBU:</strong> ${cbuProductora}</li>
      <li><strong>Alias CBU:</strong> ${aliasCbuProductora}</li>
    </ul>
    <p>IMPORTANTE: Guardá los siguientes Códigos de Entidad Registrante para armar los ISRC:</p>
    <ul>
      ${isrcs
        .map(
          (isrc) =>
            `<li><strong>Tipo:</strong> ${isrc.tipo} - <strong>Código:</strong> ${isrc.codigo_productora}</li>`
        )
        .join("")}
    </ul>
    <p>Atte.,</p>
    <p><b>CAPIF</b></p>
  `,
  APPLICATION_SUBMITTED: (nombre: string) => `
    <p>Hola ${nombre},</p>
    <p>Tu solicitud de alta de productora fue enviada exitosamente y está en proceso de revisión.</p>
    <p>Nos pondremos en contacto con vos una vez que se complete la revisión.</p>
    <p>Atte.,</p>
    <p><b>CAPIF</b></p>
  `,
  SENDFILE_REJECTION_NOTIFICATION: (nombre: string, comentario: string) => `
    <p>Hola ${nombre},</p>
    <p>La aprobación del audio del repertorio fue rechazado por el siguiente motivo:</p>
    <blockquote>${comentario}</blockquote>
    <p>Por favor, contacte con CAPIF para obtener más información.</p>
    <p>Atte.,</p>
    <p><b>CAPIF</b></p>
  `,
  SEND_DOCUMENTS_NOTIFICATION: (nombre_participante: string, conflicto_id: string) => `
    <p>Hola,</p>
    <p>Se han adjuntado documentos enviados por el participante <strong>${nombre_participante}</strong> en relación con el conflicto <strong>${conflicto_id}</strong>.</p>
    <p>Por favor, revise los archivos adjuntos.</p>
    <p>Atte.,</p>
    <p><b>CAPIF</b></p>
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
