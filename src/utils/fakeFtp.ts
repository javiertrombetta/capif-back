import FtpSrv from "ftp-srv";
import fs from "fs";
import path from "path";
import logger from "../config/logger";

const FTP_PORT = process.env.FTP_PORT || "2121";
const FTP_URL = `ftp://127.0.0.1:${FTP_PORT}`;
const FTP_ROOT = path.resolve("ftp-root");

let ftpServer: FtpSrv | null = null;
let isFtpRunning = false;

export const startFakeFtpServer = async () => {
  try {
    if (!fs.existsSync(FTP_ROOT)) {
      fs.mkdirSync(FTP_ROOT, { recursive: true });
      logger.info(`Carpeta creada: ${FTP_ROOT}`);
    }

    const uploadsDir = path.join(FTP_ROOT, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      logger.info(`Directorio uploads creado: ${uploadsDir}`);
    }

    ftpServer = new FtpSrv({
      url: FTP_URL,
      anonymous: false,
      pasv_min: 5000,
      pasv_max: 5100,
      pasv_url: "127.0.0.1",
    });

    ftpServer.on("login", ({ connection, username, password }, resolve, reject) => {
      if (username === "test" && password === "password") {
        logger.info(`Usuario autenticado: ${username}`);
        resolve({ root: FTP_ROOT });
      } else {
        logger.warn(`Fallo de autenticación para usuario: ${username}`);
        reject(new Error("Credenciales inválidas"));
      }
    });

    ftpServer.on("client-error", ({ context, error }) => {
      logger.error(`Error en cliente FTP (${context}): ${error.message}`);
    });

    ftpServer.on("disconnect", ({ id }) => {
      logger.info(`Cliente desconectado: ${id}`);
    });

    await ftpServer.listen();
    isFtpRunning = true;
    logger.info(`Servidor FTP fake corriendo en ${FTP_URL}`);
  } catch (error: any) {
    logger.error(`Error al iniciar el servidor FTP: ${error.message}`);
  }
};

//Función para cerrar el servidor FTP correctamente
export const stopFakeFtpServer = async () => {
  if (!ftpServer || !isFtpRunning) {
    logger.warn("No hay servidor FTP en ejecución.");
    return;
  }

  logger.info("Apagando servidor FTP fake...");

  try {
    await new Promise<void>((resolve, reject) => {
      ftpServer!.close()
        .then(() => {
          logger.info("Servidor FTP fake cerrado correctamente.");
          isFtpRunning = false;
          ftpServer = null;
          resolve();
          return;
        })
        .catch((error:any) => {
          if (error.code === "ERR_SERVER_NOT_RUNNING") {
            logger.warn("El servidor FTP ya estaba detenido.");
          } else {
            logger.error(`Error al cerrar el servidor FTP: ${error.message}`);
          }
          reject(error);
        });
    });
  } catch (error: any) {
    logger.error(`Error inesperado al cerrar el servidor FTP: ${error.message}`);
  }
};