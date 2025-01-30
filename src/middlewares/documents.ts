import { Request, RequestHandler } from "express";
import multer from "multer";
import * as fs from "fs";
import * as path from "path";
import { Productora, ProductoraDocumentoTipo } from "../models";
import { UPLOAD_DIR } from "../app";
import { validate as isUUID } from "uuid";

const allowedFileTypes = [".pdf", ".png", ".jpg", ".jpeg"];

declare module "express-serve-static-core" {
  interface Request {
    fileIndex?: number;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadPath = path.join(UPLOAD_DIR, "documents");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (error) {
      cb(new Error("Error al crear el directorio de subida."), "");
    }
  },
  filename: async (req: Request, file, cb) => {
    try {
      const { id } = req.params;

      // Validar que el ID sea un UUID válido
      if (!id || !isUUID(id)) {
        return cb(new Error(`Se debe ingresar un ID de productora válido.`), "");
      }

      // Obtener la productora desde la base de datos
      const productora = await Productora.findOne({ where: { id_productora: id } });

      if (!productora) {
        return cb(new Error(`No se encontró la productora con ID: ${id}.`), "");
      }

      const cuit = productora.cuit_cuil;

      // **🔹 Obtener el índice del archivo actual**
      if (typeof req.fileIndex === "undefined") {
        req.fileIndex = 0;
      }

      // **🔹 Convertir `tipoDocumento` en un array válido**
      let tipoDocumentoArray: string[] = [];

      if (Array.isArray(req.body.tipoDocumento)) {
        tipoDocumentoArray = req.body.tipoDocumento;
      } else if (typeof req.body.tipoDocumento === "string") {
        tipoDocumentoArray = req.body.tipoDocumento.split(",").map((item:any) => item.trim());
      }

      // **🔹 Obtener el tipo de documento correspondiente**
      const tipoDocumento = tipoDocumentoArray[req.fileIndex]?.trim();
      console.log(`Procesando archivo con tipoDocumento: ${tipoDocumento}`); // Debugging

      req.fileIndex++; // Incrementar después de usarlo

      if (!tipoDocumento) {
        return cb(new Error(`Cada archivo debe tener un tipoDocumento asociado.`), "");
      }

      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedFileTypes.includes(ext)) {
        return cb(new Error(`Tipo de archivo no permitido: ${ext}.`), "");
      }

      // **🔹 Validar tipo de documento en la base de datos**
      const tipoDoc = await ProductoraDocumentoTipo.findOne({ where: { nombre_documento: tipoDocumento } });

      if (!tipoDoc) {
        return cb(new Error(`Tipo de documento no válido: ${tipoDocumento}.`), "");
      }

      // **🔹 Generar el nombre del archivo basado en CUIT y tipo de documento**
      const sanitizedFileName = `${cuit}_${tipoDocumento}${ext}`;
      const filePath = path.join(UPLOAD_DIR, "documents", sanitizedFileName);

      // Si el archivo ya existe, eliminarlo antes de guardar el nuevo
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      cb(null, sanitizedFileName);
    } catch (error: any) {
      cb(new Error(`Error al procesar el nombre del archivo: ${error.message}.`), "");
    }
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedFileTypes.includes(ext)) {
      return cb(new Error(`Tipo de archivo no permitido: ${ext}.`));
    }
    cb(null, true);
  } catch (error: any) {
    cb(new Error(`Error al filtrar el archivo: ${error.message}.`));
  }
};

export const uploadDocuments: RequestHandler = async (req, res, next) => {
  req.fileIndex = 0;

  const { id } = req.params;

  // Validar que el ID sea un UUID válido
  if (!id || !isUUID(id)) {
    return res.status(400).json({ error: `Se debe ingresar un ID de productora válido.` });
  }

  // Validar que la productora existe antes de procesar los archivos
  const productora = await Productora.findOne({ where: { id_productora: id } });

  if (!productora) {
    return res.status(404).json({ error: `No se encontró la productora con ID: ${id}.` });
  }

  multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  }).any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // **🔹 Asegurar que `tipoDocumento` sea siempre un array**
    let tipoDocumentoArray: string[] = [];

    if (Array.isArray(req.body.tipoDocumento)) {
      tipoDocumentoArray = req.body.tipoDocumento;
    } else if (typeof req.body.tipoDocumento === "string") {
      tipoDocumentoArray = req.body.tipoDocumento.split(",").map((item:any) => item.trim());
    }

    console.log("Tipo de Documento Recibido:", tipoDocumentoArray); // Depuración

    // **🔹 Validar que el número de tipos de documentos coincida con los archivos**
    const archivos = req.files as Express.Multer.File[];

    if (tipoDocumentoArray.length !== archivos.length) {
      return res.status(400).json({
        error: "El número de tipos de documentos debe coincidir con el número de archivos subidos.",
      });
    }

    // **🔹 Validar duplicados y emparejamiento**
    const archivosPorTipo: Record<string, boolean> = {};

    archivos.forEach((file, index) => {
      const tipoDocumento = tipoDocumentoArray[index]?.trim();

      console.log(`Archivo: ${file.originalname} -> TipoDocumento: ${tipoDocumento}`); // Debugging

      if (!tipoDocumento) {
        return res.status(400).json({
          error: `Cada archivo debe tener un tipoDocumento asociado.`,
        });
      }

      if (archivosPorTipo[tipoDocumento]) {
        return res.status(400).json({
          error: `Solo se permite un archivo por tipo de documento: (${tipoDocumento}).`,
        });
      }

      archivosPorTipo[tipoDocumento] = true;
    });

    next();
  });
};