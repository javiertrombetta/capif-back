import { Request, Response, NextFunction } from "express";
import transporter from "../config/nodemailer";
import logger from "../config/logger";
import { handleEmailError } from "./errorService";
import { SendMailOptions } from "nodemailer";

/**
 * Interfaz extendida para opciones de envío de correo.
 */
interface MailOptions extends SendMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

/**
 * Valida si un email tiene el formato correcto.
 * @param email - Dirección de correo a validar.
 * @returns `true` si el email es válido, `false` en caso contrario.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Envía un correo electrónico utilizando Nodemailer.
 * @param options - Contiene la dirección del destinatario, asunto, contenido HTML y adjuntos opcionales.
 * @returns Promise<void> - Resuelve si el correo se envía con éxito o lanza un error si falla.
 */
export const sendEmail = async (options: MailOptions): Promise<void> => {

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM no está definido en las variables de entorno.");
  }

  const mailOptions: SendMailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments ?? [],
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info(`Correo enviado con éxito: ${info.messageId}`);

};

/**
 * Interfaz para manejo de errores en envío de correos.
 */
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  successLog: string;
  errorLog: string;
  attachments?: { filename: string; content: Buffer }[];
}

/**
 * Envía un correo electrónico con manejo de errores y logs de éxito/fallo.
 * @param options - Opciones del correo incluyendo destinatario, asunto, HTML y logs.
 * @param req - Objeto Request de Express para registrar detalles del request.
 * @param res - Objeto Response de Express, usado en caso de errores.
 * @param next - Función de Express para delegar errores a middlewares.
 * @returns Promise<void> - Resuelve si el correo se envía con éxito, maneja errores si falla.
 */
export const sendEmailWithErrorHandling = async (
  options: EmailOptions,
  req: Request,
  res?: Response,
  next?: NextFunction
): Promise<void> => {
  
  if (!options.to || !validateEmail(options.to)) {
    const errorMsg = `[EMAIL WARNING] No se envió el correo porque el email '${options.to}' no es válido.`;
    logger.warn(errorMsg);
    throw new Error(errorMsg);
  }

  await sendEmail({
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  });

  logger.info(`${String(req.method)} ${String(req.originalUrl)} -- ${options.successLog}`);
};