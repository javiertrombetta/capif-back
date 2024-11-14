import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

import * as MESSAGES from '../services/messages';
import * as Err from '../services/customErrors';
import { sendEmail } from '../services/emailService';

import {
  findUsuario,
  findRolByDescripcion,
  findUsuariosConFiltros,
  createUsuario,
} from '../services/userService';

import {
  Usuario,
  UsuarioMaestro,
  UsuarioRolTipo,
  Productora,
  ProductoraDocumento,
  ProductoraPersonaFisica,
  ProductoraPersonaJuridica,
  AuditoriaEntidad,
  AuditoriaSesion,
} from '../models';


// HABILITAR O DESHABILITAR EL REGISTRO DE UN USUARIO 
export const availableDisableUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_usuario } = req.body;

    // Paso 1: Buscar el usuario al que se le cambiará el estado mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user } = userData;

    // Paso 2: Alternar el tipo_registro entre HABILITADO y DESHABILITADO
    const nuevoEstado = user.tipo_registro === 'HABILITADO' ? 'DESHABILITADO' : 'HABILITADO';
    await Usuario.update({ tipo_registro: nuevoEstado }, { where: { id_usuario } });

    // Paso 3: Crear una auditoría de la acción
    const usuarioOriginarioId = typeof req.user === 'string' ? req.user : req.user?.id;

    await AuditoriaEntidad.create({
      usuario_originario_id: usuarioOriginarioId,
      usuario_destino_id: id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `Cambio de estado a ${nuevoEstado}`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario ${nuevoEstado} exitosamente: ${id_usuario}`
    );
    res.status(200).json({ message: `Usuario ${nuevoEstado} exitosamente` });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al cambiar estado del usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};


// BLOQUEAR O DESBLOQUEAR USUARIO
export const blockOrUnblockUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, isBlocked } = req.body;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para ${
        isBlocked ? 'bloquear' : 'desbloquear'
      } al usuario`
    );

    // Realiza la consulta para obtener el usuario
    const userData = await findUsuario({ userId });
    const user = userData?.user;

    if (!user) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${userId}`);
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Verificar si el usuario está DESHABILITADO
    if (user.tipo_registro === 'DESHABILITADO') {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se puede ${
          isBlocked ? 'bloquear' : 'desbloquear'
        } al usuario con ID ${userId} porque está DESHABILITADO.`
      );
      return next(new Err.ForbiddenError(MESSAGES.ERROR.USER.CANNOT_MODIFY_DISABLED_USER));
    }

    // Actualiza el estado de habilitación del usuario
    user.is_bloqueado = !isBlocked;
    await user.save();

    // Mensaje de éxito según la acción realizada
    const message = isBlocked
      ? MESSAGES.SUCCESS.AUTH.USER_BLOCKED
      : MESSAGES.SUCCESS.AUTH.USER_UNBLOCKED;

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario con ID ${userId} ${
        isBlocked ? 'bloqueado' : 'desbloqueado'
      } correctamente.`
    );

    // Verifica que `req.user` es un JwtPayload y tiene la propiedad `id`
    const usuarioRegistranteId =
      typeof req.user === 'object' && 'id' in req.user ? req.user.id : null;
    if (!usuarioRegistranteId) {
      logger.warn(`${req.method} ${req.originalUrl} - ID de usuario no encontrado en el token.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Registrar en auditoría el cambio de estado de bloqueo
    await AuditoriaEntidad.create({
      usuario_originario_id: usuarioRegistranteId,
      usuario_destino_id: userId,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `Usuario ${isBlocked ? 'bloqueado' : 'desbloqueado'}`,
    });

    res.status(200).json({ message });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al bloquear/desbloquear usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};

// CAMBIAR EL ROL A UN USUARIO
export const changeUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, newRole } = req.body;

    // Verifica que el usuario autenticado esté presente en la solicitud
    const userAuthenticatedId =
      req.user && typeof req.user === 'object' && 'id' in req.user ? req.user.id : null;
    if (!userAuthenticatedId) {
      logger.warn(`${req.method} ${req.originalUrl} - ID de usuario no encontrado en el token.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Busca el usuario y su rol actual
    const userData = await findUsuario({ userId });
    const user = userData?.user;

    if (!user) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${userId}`);
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Verifica que el rol actual del usuario sea "admin_principal" o "admin_secundario"
    if (req.role !== 'admin_principal' && req.role !== 'admin_secundario') {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario con ID ${userAuthenticatedId} no autorizado para cambiar de rol.`
      );
      return res.status(403).json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
    }

    // Verifica si el rol deseado existe en la base de datos
    const rol = await findRolByDescripcion(newRole);
    if (!rol) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Rol inválido: ${newRole} para el usuario con ID: ${userId}`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    // Busca el registro en UsuarioMaestro para este usuario
    const usuarioMaestro = await UsuarioMaestro.findOne({
      where: { usuario_registrante_id: user.id_usuario },
    });

    if (!usuarioMaestro) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró registro en UsuarioMaestro para el usuario con ID: ${userId}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NO_MAESTRO_RECORD);
    }

    // Actualiza el rol en UsuarioMaestro si ya existe el registro
    usuarioMaestro.rol_id = rol.id_tipo_rol;
    usuarioMaestro.fecha_ultimo_cambio_rol = new Date();
    await usuarioMaestro.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Rol del usuario con ID ${userId} actualizado correctamente a ${newRole}.`
    );

    // Registrar la acción en AuditoriaEntidad
    await AuditoriaEntidad.create({
      usuario_originario_id: userAuthenticatedId,
      usuario_destino_id: user.id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `Rol actualizado a ${newRole}`,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.ROLE_UPDATED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al cambiar el rol de usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};

// OBTENER TODOS LOS USUARIOS SEGÚN CONDICIONES
export const getUsers = async (
  req: Request<{ id?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rol, ...filters } = req.query;

    if (id) {
      logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para obtener usuario`);

      const user = await findUsuario({ userId: id });
      if (!user) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id}`);
        return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
      }

      logger.info(`${req.method} ${req.originalUrl} - Usuario encontrado con éxito: ${id}`);
      res.status(200).json(user);
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener usuarios filtrados.`,
      { rol, filters }
    );

    const userFilters: any = {};

    if (rol) {
      const rolObj = await findRolByDescripcion(String(rol));
      if (!rolObj) {
        logger.warn(`${req.method} ${req.originalUrl} - Rol no encontrado: ${rol}.`);
        return next(new Err.NotFoundError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID));
      }
      userFilters.rol_id = rolObj.id_tipo_rol;
    }

    const users = await findUsuariosConFiltros(userFilters);

    logger.info(
      `${req.method} ${req.originalUrl} - Se encontraron exitosamente ${users.length} usuarios.`
    );
    res.status(200).json(users);
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        error instanceof Error ? error.message : 'Error desconocido.'
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getRegistrosPendientes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener usuarios pendientes.`
    );

    // Configuración del filtro para usuarios con registro pendiente
    const userFilters = { tipo_registro: 'PENDIENTE' };

    // Buscar usuarios pendientes
    const pendingUsers = await findUsuariosConFiltros(userFilters);

    if (!pendingUsers || pendingUsers.length === 0) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontraron usuarios pendientes.`);
      res.status(404).json({ message: MESSAGES.ERROR.REGISTER.NO_PENDING_USERS });
    }

    logger.info(
      `${req.method} ${req.originalUrl} - ${pendingUsers.length} usuarios pendientes encontrados.`
    );
    res.status(200).json(pendingUsers);
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        error instanceof Error ? error.message : 'Error desconocido.'
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};


// CREAR UN USUARIO MANUALMENTE
export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, rol = 'productor_principal', estado = 'NUEVO' } = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para crear un usuario`, {
      email,
      rol,
      estado,
    });

    // Verificación de email proporcionado
    if (!email) {
      logger.warn(`${req.method} ${req.originalUrl} - Email no proporcionado o inválido.`);
      return next(new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.EMAIL_INVALID));
    }

    // Verificación de usuario existente utilizando `findUsuario`
    const existingUser = await findUsuario({ email });
    if (existingUser) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario ya registrado: ${email}`);
      return next(new Err.BadRequestError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED));
    }

    // Verificación y obtención de rol
    const rolObj = await findRolByDescripcion(rol);
    if (!rolObj) {
      logger.warn(`${req.method} ${req.originalUrl} - Rol inválido: ${rol}`);
      return next(new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID));
    }

    // Generación de clave temporal y su cifrado
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Creación del usuario
    const newUser = await createUsuario({
      email,
      clave: hashedPassword,
      rol_id: rolObj.id_tipo_rol,
      tipo_registro: estado,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario creado con éxito: ${newUser.id_usuario}`
    );

    // Envío de contraseña temporal por correo
    const emailBody = MESSAGES.EMAIL_BODY.TEMP_PASSWORD(tempPassword);
    try {
      await sendEmail({
        to: newUser.email,
        subject: 'Registro exitoso - Contraseña temporal',
        html: emailBody,
      });

      logger.info(`${req.method} ${req.originalUrl} - Correo enviado a ${newUser.email}`);
    } catch (emailError) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error al enviar correo: ${
          emailError instanceof Error ? emailError.message : 'Error desconocido'
        }`
      );
      return next(new Err.InternalServerError(MESSAGES.ERROR.EMAIL.TEMP_FAILED));
    }

    // Respuesta exitosa
    res.status(201).json({
      message: MESSAGES.SUCCESS.AUTH.REGISTER_SECONDARY,
      newUser,
    });
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al crear usuario: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

// OBTENER LOS DATOS CARGADOS POR UN USUARIO
export const getRegistroPendiente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para cargar datos personales`);

    const { id_usuario } = req.body;

    // Buscar el usuario y los datos asociados mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user, role } = userData;

    // Verificar que el usuario esté habilitado y tenga el rol adecuado
    if (user.tipo_registro !== 'HABILITADO' && role !== 'admin') {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no está habilitado o autorizado.`);
      return res.status(403).json({
        message: MESSAGES.ERROR.REGISTER.USER_NOT_CONFIRMED,
      });
    }

    // Buscar registros asociados en ProductoraPersonaFisica y ProductoraPersonaJuridica
    const personaFisica = await ProductoraPersonaFisica.findOne({
      where: { usuario_registrante_id: id_usuario },
    });

    const personaJuridica = await ProductoraPersonaJuridica.findOne({
      where: { usuario_registrante_id: id_usuario },
    });

    // Configurar la respuesta con datos personales
    const responseData: any = { user, role };

    if (personaFisica) {
      responseData.personaFisica = personaFisica;
    }

    if (personaJuridica) {
      responseData.personaJuridica = personaJuridica;
    }

    res.status(200).json({
      message: MESSAGES.SUCCESS.APPLICATION.SAVED,
      data: responseData,
    });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al cargar datos personales: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};

export const approveApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para autorizar usuario`);

    const { id_usuario, nombre_productora, cuit_productora, cbu_productora, alias_cbu_productora } =
      req.body;

    // Paso 1: Buscar al usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user } = userData;

    // Paso 2: Crear un nuevo registro en Productora
    const nuevaProductora = await Productora.create({
      usuario_principal_id: id_usuario,
      nombre_productora,
      cuit_productora,
      cbu_productora,
      alias_cbu_productora,
    });

    // Paso 3: Asociar el id de la productora con UsuarioMaestro del registro del usuario
    const usuarioMaestro = await UsuarioMaestro.findOne({
      where: { usuario_registrante_id: id_usuario },
    });
    if (!usuarioMaestro) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Registro de UsuarioMaestro no encontrado para el usuario: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NO_MAESTRO_RECORD));
    }

    usuarioMaestro.productora_id = nuevaProductora.id_productora;
    
    await usuarioMaestro.save();

    // Paso 4: Modificar el registro de ProductoraPersonaFisica para apuntar productora_id a la nueva productora creada
    await ProductoraPersonaFisica.update(
      { productora_id: nuevaProductora.id_productora },
      { where: { usuario_registrante_id: id_usuario } }
    );

    // Paso 5: Modificar el registro de ProductoraPersonaJuridica para apuntar productora_id a la nueva productora creada
    await ProductoraPersonaJuridica.update(
      { productora_id: nuevaProductora.id_productora },
      { where: { usuario_registrante_id: id_usuario } }
    );

    // Paso 6: Asignar productora_id a todos los documentos asociados a este usuario
    await ProductoraDocumento.update(
      { productora_id: nuevaProductora.id_productora },
      { where: { usuario_principal_id: id_usuario } }
    );

    // Paso 7: Crear las auditorías correspondientes
    await AuditoriaEntidad.create({
      usuario_originario_id: id_usuario,
      entidad_afectada: 'Productora',
      tipo_auditoria: 'ALTA',
      detalle: `${nuevaProductora.nombre_productora}`,
    });

    await AuditoriaEntidad.create({
      usuario_originario_id: id_usuario,
      entidad_afectada: 'UsuarioMaestro',
      tipo_auditoria: 'CAMBIO',
      detalle: `Usuario asociado a ${nuevaProductora.nombre_productora}`,
    });

    await AuditoriaEntidad.create({
      usuario_originario_id: id_usuario,
      entidad_afectada: 'ProductoraPersonaFisica',
      tipo_auditoria: 'CAMBIO',
      detalle: `Vinculado a ${nuevaProductora.nombre_productora}`,
    });

    await AuditoriaEntidad.create({
      usuario_originario_id: id_usuario,
      entidad_afectada: 'ProductoraPersonaJuridica',
      tipo_auditoria: 'CAMBIO',
      detalle: `Vinculado a ${nuevaProductora.nombre_productora}`,
    });

    // Paso 8: Enviar el correo de notificación al usuario
    await sendEmail({
      to: user.email,
      subject: 'Registro Exitoso como Productor Principal',
      html: MESSAGES.EMAIL_BODY.PRODUCTOR_PRINCIPAL_NOTIFICATION(
        nombre_productora,
        cuit_productora,
        cbu_productora,
        alias_cbu_productora
      ),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario autorizado y correo enviado exitosamente.`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.AUTHORIZED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al autorizar usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// RECHAZAR UNA APLICACION
export const rejectApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para rechazar aplicación`);

    const { id_usuario, comentario } = req.body;

    // Paso 1: Buscar el usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user } = userData;

    // Paso 2: Verificar que el comentario está presente en el body
    if (!comentario || comentario.trim() === '') {
      logger.warn(`${req.method} ${req.originalUrl} - Comentario de rechazo no proporcionado.`);
      return next(new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.COMMENT_REQUIRED));
    }

    // Paso 3: Crear registro de auditoría
    await AuditoriaEntidad.create({
      usuario_originario_id: id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'RECHAZO',
      detalle: `Rechazo de aplicación con comentario: ${comentario}`,
    });

    // Enviar correo de notificación de rechazo
    await sendEmail({
      to: user.email,
      subject: 'Rechazo de su Aplicación',
      html: MESSAGES.EMAIL_BODY.REJECTION_NOTIFICATION(user.email, comentario),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Aplicación rechazada y correo de notificación enviado.`
    );

    res.status(200).json({ message: MESSAGES.SUCCESS.APPLICATION.REJECTED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al rechazar aplicación: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// ENVIAR UNA APLICACION PARA SER APROBADA
export const sendApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para enviar aplicación`);

    const { id_usuario, personaFisicaData, personaJuridicaData, documentos } = req.body;

    // Paso 1: Buscar al usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user } = userData;

    // Paso 2: Cargar los datos de ProductoraPersonaFisica con productora_id en null
    const nuevaPersonaFisica = await ProductoraPersonaFisica.create({
      ...personaFisicaData,
      usuario_registrante_id: id_usuario,
      productora_id: null, // Dejar en null porque aún no está autorizado
    });

    // Paso 3: Cargar los datos de ProductoraPersonaJuridica con productora_id en null
    const nuevaPersonaJuridica = await ProductoraPersonaJuridica.create({
      ...personaJuridicaData,
      usuario_registrante_id: id_usuario,
      productora_id: null, // Dejar en null porque aún no está autorizado
    });

    // Paso 4: Cargar los documentos según los tipo_documento_id
    const documentosCargados = documentos.map(async (doc: any) => {
      return await ProductoraDocumento.create({
        usuario_principal_id: id_usuario,
        productora_id: null,
        tipo_documento_id: doc.tipo_documento_id,
        ruta_archivo_documento: doc.ruta_archivo_documento,
      });
    });

    await Promise.all(documentosCargados);

    // Paso 5: Enviar correo de notificación al usuario
    await sendEmail({
      to: user.email,
      subject: 'Solicitud de Aplicación Enviada',
      html: MESSAGES.EMAIL_BODY.APPLICATION_SUBMITTED(user.email),
    });

    // Paso 6: Registrar auditoría
    await AuditoriaEntidad.create({
      usuario_originario_id: id_usuario,
      entidad_afectada: 'Productora',
      tipo_auditoria: 'APLICACION_ENVIADA',
      detalle: `Solicitud de aplicación enviada por ${user.email}`,
    });

    logger.info(`${req.method} ${req.originalUrl} - Aplicación enviada exitosamente.`);
    res.status(200).json({ message: MESSAGES.SUCCESS.APPLICATION.SAVED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al enviar aplicación: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// ACTUALIZAR UNA APLICACION PENDIENTE
export const updateApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para actualizar la aplicación`);

    const { id_usuario, datosFisica, datosJuridica, documentos } = req.body;

    // Paso 1: Buscar al usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user } = userData;

    // Paso 2: Obtener los datos asociados de ProductoraPersonaFisica, ProductoraPersonaJuridica y ProductoraDocumentos
    const personaFisica = await ProductoraPersonaFisica.findOne({
      where: { usuario_registrante_id: id_usuario },
    });

    const personaJuridica = await ProductoraPersonaJuridica.findOne({
      where: { usuario_registrante_id: id_usuario },
    });

    // Paso 3: Modificar los datos de ProductoraPersonaFisica si existen en el body
    if (personaFisica && datosFisica) {
      await personaFisica.update(datosFisica);
    }

    // Paso 4: Modificar los datos de ProductoraPersonaJuridica si existen en el body
    if (personaJuridica && datosJuridica) {
      await personaJuridica.update(datosJuridica);
    }

    // Paso 5: Actualizar documentos específicos en ProductoraDocumento
    if (documentos && documentos.length > 0) {
      for (const documento of documentos) {
        const documentoExistente = await ProductoraDocumento.findOne({
          where: {
            usuario_principal_id: id_usuario,
            tipo_documento_id: documento.tipo_documento_id,
          },
        });

        if (documentoExistente) {
          // Si el documento ya existe, actualizar su ruta
          await documentoExistente.update({
            ruta_archivo_documento: documento.ruta_archivo_documento,
          });
        } else {
          // Si no existe, crear un nuevo documento
          await ProductoraDocumento.create({
            usuario_principal_id: id_usuario,
            productora_id: null,
            tipo_documento_id: documento.tipo_documento_id,
            ruta_archivo_documento: documento.ruta_archivo_documento,
          });
        }
      }
    }

    // Paso 6: Auditar la actualización de la aplicación
    await AuditoriaEntidad.create({
      usuario_originario_id: id_usuario,
      entidad_afectada: 'Aplicación',
      tipo_auditoria: 'CAMBIO',
      detalle: `Actualización de datos para el usuario ${user.email}`,
    });

    // Paso 7: Enviar el correo de notificación al usuario
    await sendEmail({
      to: user.email,
      subject: 'Actualización de Aplicación Enviada',
      html: MESSAGES.EMAIL_BODY.APPLICATION_SUBMITTED(user.email),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Aplicación actualizada y correo enviado exitosamente.`
    );

    res.status(200).json({ message: MESSAGES.SUCCESS.APPLICATION.UPDATED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al actualizar la aplicación: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// ACTUALIZAR LOS DATOS DE UN USUARIO
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para actualizar usuario`);

    const { id_usuario, datosUsuario } = req.body;

    // Paso 1: Buscar al usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user } = userData;

    // Paso 2: Actualizar los datos de Usuario
    await user.update(datosUsuario);

    // Auditar la actualización del usuario
    await AuditoriaEntidad.create({
      usuario_originario_id: id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `Actualización de datos del usuario ${user.email}`,
    });

    logger.info(`${req.method} ${req.originalUrl} - Usuario actualizado exitosamente.`);
    res.status(200).json({ message: MESSAGES.SUCCESS.USUARIO.USUARIO_UPDATED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al actualizar el usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// ELIMINAR UN USUARIO
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_usuario } = req.params;

    // Paso 1: Buscar el usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      console.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    // Paso 2: Eliminar todos los registros de UsuarioMaestro asociados
    await UsuarioMaestro.destroy({
      where: { usuario_registrante_id: id_usuario },
    });

    // Paso 3: Eliminar el registro de Usuario
    await Usuario.destroy({
      where: { id_usuario },
    });

    console.info(
      `${req.method} ${req.originalUrl} - Usuario eliminado exitosamente: ${id_usuario}`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.USUARIO.USUARIO_DELETED });
  } catch (err) {
    console.error(
      `${req.method} ${req.originalUrl} - Error al eliminar usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};