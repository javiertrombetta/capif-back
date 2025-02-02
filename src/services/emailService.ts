import { Request, Response, NextFunction } from 'express';
import transporter from '../config/nodemailer';
import logger from '../config/logger';
import { handleEmailError } from './errorService';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envía un correo electrónico utilizando Nodemailer.
 *
 * @param options - Contiene la dirección de correo del destinatario, el asunto y el contenido en HTML del correo.
 * @returns Promise<void> - Resuelve cuando el correo se envía con éxito o lanza un error si falla.
 *
 * @example
 * await sendEmail({
 *   to: 'usuario@dominio.com',
 *   subject: 'Bienvenido',
 *   html: '<p>Gracias por registrarte.</p>',
 * });
 */
export const sendEmail = async (options: MailOptions): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito:', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  successLog: string;
  errorLog: string;
}

/**
 * Envía un correo electrónico con manejo de errores, incluyendo logs de éxito y fallo.
 *
 * @param options - Contiene la dirección del destinatario, asunto, contenido HTML y mensajes de log personalizados.
 * @param req - Objeto Request de Express que se usa para registrar detalles del método HTTP y la URL original.
 * @param res - Objeto Response de Express, usado en caso de manejar errores.
 * @param next - Función NextFunction de Express para delegar errores a los middlewares de manejo de errores.
 * @returns Promise<void> - Resuelve cuando el correo se envía con éxito o lanza un error si falla.
 *
 * @example
 * await sendEmailWithErrorHandling({
 *   to: 'usuario@dominio.com',
 *   subject: 'Notificación',
 *   html: '<p>Este es un correo de prueba.</p>',
 *   successLog: 'Correo enviado con éxito.',
 *   errorLog: 'Error al enviar el correo.',
 * }, req, res, next);
 */
export const sendEmailWithErrorHandling = async (
  options: EmailOptions,
  req: Request,
  res?: Response,
  next?: NextFunction
): Promise<void> => {
  try {
    await sendEmail({
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    logger.info(`${String(req.method)} ${String(req.originalUrl)} -- ${options.successLog}`);

  } catch (error) {
    if (res && next) {
      handleEmailError(error, req, res, next, options.errorLog);
    } else {
      logger.error(`${options.errorLog}: ${error}`);
    }
  }
};
