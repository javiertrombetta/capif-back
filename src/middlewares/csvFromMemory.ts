import multer from 'multer';

// Configuración de multer con almacenamiento en memoria
const uploadCSV = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase().slice(-4);

    if (ext !== '.csv') {
      return cb(new Error('Solo se permiten archivos CSV.'));
    }

    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB
});

export default uploadCSV;