import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';
import { ProductoraDocumentoTipo } from '../models';
import dotenv from 'dotenv';

dotenv.config();

// Directorio de subida definido en el .env
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

// Tipos de archivo permitidos
const allowedFileTypes = ['.pdf', '.png', '.jpg', '.jpeg'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(new Error('Error al crear el directorio de subida'), '');
    }
  },
  filename: async (req: Request, file, cb) => {
    try {
      // Recupera los datos necesarios del cuerpo de la solicitud
      const { cuit, tipoDocumento } = req.body;

      if (!cuit || !tipoDocumento) {
        return cb(new Error('CUIT y Tipo de Documento son requeridos para nombrar el archivo'), '');
      }

      // Valida el tipo de documento en base a la base de datos
      const tipoDoc = await ProductoraDocumentoTipo.findOne({
        where: { nombre_documento: tipoDocumento },
      });
      if (!tipoDoc) {
        return cb(new Error('Tipo de documento no válido'), '');
      }

      // Normaliza el nombre del archivo
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedFileTypes.includes(ext)) {
        return cb(new Error(`Tipo de archivo no permitido: ${ext}`), '');
      }

      const sanitizedCuit = cuit.replace(/[^0-9]/g, '');
      const sanitizedFileName = `${sanitizedCuit}_${tipoDocumento}${ext}`;

      cb(null, sanitizedFileName);
    } catch (error) {
      cb(new Error('Error al procesar el nombre del archivo'), '');
    }
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedFileTypes.includes(ext)) {
    return cb(new Error(`Tipo de archivo no permitido: ${ext}`));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de tamaño de archivo: 5MB
  },
});