import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'capif-back' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Comprime logs viejos automáticamente
      maxSize: '10m', // Máximo 10MB por archivo
      maxFiles: '2d', // Guarda solo logs de los últimos 2 días
      level: 'error',
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Comprime logs viejos automáticamente
      maxSize: '20m', // Máximo 20MB por archivo
      maxFiles: '2d', // Guarda solo logs de los últimos 2 días
    }),
  ],
});

// Solo mostrar logs en consola en entornos que no sean producción
if (!process.env.NODE_ENV?.startsWith('production')) {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export default logger;