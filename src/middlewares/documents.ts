import multer, { Multer } from "multer";
import * as fs from "fs";
import * as path from "path";
import { Request, RequestHandler } from "express";
import { ProductoraDocumentoTipo } from "../models";
import { UPLOAD_DIR } from "../app";

const allowedFileTypes = [".pdf", ".png", ".jpg", ".jpeg"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadPath = path.join(UPLOAD_DIR, "documents");

      // Crear directorio si no existe
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    } catch (error) {
      cb(new Error("Error al crear el directorio de subida"), "");
    }
  },
  filename: (req: Request, file, cb) => {
    try {
      // Extraer cuit_cuil desde productoraData ya parseado
      const { productoraData } = req.body;
      const cuit = productoraData.cuit_cuil;
      if (!cuit) {
        return cb(new Error("El campo 'cuit_cuil' no está presente en 'productoraData'"), "");
      }

      // Validar extensión del archivo
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedFileTypes.includes(ext)) {
        return cb(new Error(`Tipo de archivo no permitido: ${ext}`), "");
      }

      // Extraer índice del campo documentos
      const fieldNameMatch = file.fieldname.match(/\[(\d+)]$/);
      const index = fieldNameMatch ? parseInt(fieldNameMatch[1], 10) : null;
      if (index === null) {
        return cb(new Error("No se pudo determinar el índice del archivo"), "");
      }

      // Validar tipoDocumento
      const tipoDocumento = req.body[`tipoDocumento[${index}]`];
      if (!tipoDocumento) {
        return cb(new Error(`Falta el tipoDocumento para el archivo en el índice ${index}`), "");
      }

      // Validar tipoDocumento en la base de datos
      ProductoraDocumentoTipo.findOne({
        where: { nombre_documento: tipoDocumento },
      })
        .then((tipoDoc) => {
          if (!tipoDoc) {
            return cb(new Error(`Tipo de documento no válido: ${tipoDocumento}`), "");
          }

          // Crear nombre seguro para el archivo
          const sanitizedFileName = `${cuit}_${tipoDocumento}${ext}`;
          cb(null, sanitizedFileName);
        })
        .catch((error) =>
          cb(new Error(`Error al validar el tipoDocumento: ${error.message}`), "")
        );
    } catch (error: any) {
      cb(new Error(`Error al procesar el nombre del archivo: ${error.message}`), "");
    }
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedFileTypes.includes(ext)) {
      return cb(new Error(`Tipo de archivo no permitido: ${ext}`));
    }
    cb(null, true);
  } catch (error: any) {
    cb(new Error(`Error al filtrar el archivo: ${error.message}`));
  }
};

export const uploadDocuments: RequestHandler = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
}).fields([
  { name: "documentos[0]", maxCount: 1 },
  { name: "documentos[1]", maxCount: 1 },
  { name: "documentos[2]", maxCount: 1 },
  { name: "documentos[3]", maxCount: 1 },
]);