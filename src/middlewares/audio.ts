import multer from "multer";
import * as fs from "fs";
import * as path from "path";
import { Request } from "express";
import { UPLOAD_DIR } from "../config/paths";

const allowedAudioTypes = [".mp3", ".wav", ".flac", ".aac"];

// Configuración del almacenamiento
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadPath = path.join(UPLOAD_DIR, "audio");
      
      // Verificar si el directorio existe, de lo contrario, crearlo
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    } catch (error) {
      cb(new Error("Error al crear el directorio de carga de audio"), "");
    }
  },
  filename: (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedAudioTypes.includes(ext)) {
        return cb(new Error(`Tipo de archivo no permitido: ${ext}`), "");
      }

      // Asignar un nombre temporal al archivo (usando el nombre original)
      cb(null, file.originalname);
    } catch (error) {
      cb(new Error("Error al procesar el nombre del archivo"), "");
    }
  },
});

// Filtro de archivos
const audioFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedAudioTypes.includes(ext)) {
    return cb(new Error(`Tipo de archivo no permitido: ${ext}`));
  }
  cb(null, true);
};

// Exportar configuración del middleware
export const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
});