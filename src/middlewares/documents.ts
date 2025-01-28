import multer from "multer";
import * as fs from "fs";
import * as path from "path";
import { Request } from "express";
import { Productora, ProductoraDocumentoTipo } from "../models";
import { UPLOAD_DIR } from '../app';

const allowedFileTypes = [".pdf", ".png", ".jpg", ".jpeg"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Construir la ruta base con el subdirectorio "documents"
      const uploadPath = path.join(UPLOAD_DIR, 'documents');
      
      // Verificar si el directorio existe, de lo contrario, crearlo
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    } catch (error) {
      cb(new Error('Error al crear el directorio de subida'), "");
    }
  },
  filename: async (req: Request, file, cb) => {
    try {
      const { id } = req.params;

      // Obtener el CUIT de la productora desde la base de datos
      const productora = await Productora.findOne({ where: { id_productora: id } });
      if (!productora) {
        return cb(new Error("La productora especificada no existe"), "");
      }

      const cuit = productora.cuit_cuil;

      // Validar el tipo de documento en base a la base de datos
      const { tipoDocumento } = req.body;
      const tipoDoc = await ProductoraDocumentoTipo.findOne({
        where: { nombre_documento: tipoDocumento },
      });
      if (!tipoDoc) {
        return cb(new Error("Tipo de documento no válido"), "");
      }

      // Validar la extensión del archivo
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedFileTypes.includes(ext)) {
        return cb(new Error(`Tipo de archivo no permitido: ${ext}`), "");
      }

      const sanitizedFileName = `${cuit}_${tipoDocumento}${ext}`;
      cb(null, sanitizedFileName);
    } catch (error) {
      cb(new Error("Error al procesar el nombre del archivo"), "");
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

export const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});