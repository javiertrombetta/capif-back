import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear carpeta temporal si no existe
const uploadDir = path.join(__dirname, '../../uploads/csv');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer con almacenamiento en disco
const uploadCSV = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); // Guardar en la carpeta 'uploads/csv'
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `upload-${uniqueSuffix}.csv`); // Nombre único para evitar colisiones
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(new Error('Solo se permiten archivos CSV.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB
});

export default uploadCSV;