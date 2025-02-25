import { parse, isValid, parseISO } from "date-fns";

/**
 * Parsea una fecha en diferentes formatos y devuelve un objeto Date válido.
 * Soporta:
 * - DD/MM/YYYY
 * - YYYY/MM/DD
 * - ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
 * - YYYY-MM-DD HH:mm:ss.SSS±hh
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== "string") return null;

  let parsedDate: Date | null = null;

  try {
    // Formato DD/MM/YYYY (26/02/2025)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("/").map(Number);
      parsedDate = new Date(year, month - 1, day);
    }
    // Formato YYYY/MM/DD (2025/02/26)
    else if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("/").map(Number);
      parsedDate = new Date(year, month - 1, day);
    }
    // Formato completo con zona horaria (YYYY-MM-DD HH:mm:ss.SSS±hh)
    // Modificada la expresión regular para capturar la zona horaria
    else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/.test(dateString)) {
      // Asegúrate de que la fecha esté bien parseada con el formato adecuado
      parsedDate = parse(dateString, "yyyy-MM-dd HH:mm:ss.SSSXXX", new Date());
    }
    // Formato ISO 8601
    else if (!isNaN(Date.parse(dateString))) {
      parsedDate = parseISO(dateString);
    }

    if (parsedDate && isValid(parsedDate)) {
      return parsedDate;
    }
  } catch (error) {
    console.error(`❌ Error al parsear fecha: ${dateString}`, error);
  }
  return null;
};