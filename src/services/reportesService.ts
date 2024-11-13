import { Parser } from 'json2csv';
import { promises as fs } from 'fs';
import path from 'path';
import ISRC from '../models/FonogramaISRC';
import Fonograma from '../models/Fonograma';
import Repertorio from '../models/zzzRepertorio';
import { InternalServerError } from './customErrors';

const getReportesDirectory = (): string => {
  return path.join(process.env.TEMP || '/tmp', 'reportes');
};

const ensureDirectoryExists = async (directoryPath: string): Promise<void> => {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
  } catch (error) {
    throw new InternalServerError('Error al crear el directorio de reportes');
  }
};

const saveCSVFile = async (fileName: string, csvData: string): Promise<string> => {
  const reportesDir = getReportesDirectory();
  await ensureDirectoryExists(reportesDir);
  const filePath = path.join(reportesDir, fileName);
  try {
    await fs.writeFile(filePath, csvData, 'utf8');
    return filePath;
  } catch (error) {
    throw new InternalServerError('Error al guardar el reporte CSV en el sistema de archivos');
  }
};

export const generateISRCReportFile = async (isrcReports: ISRC[]): Promise<string> => {
  try {
    const fields = [
      { label: 'ID ISRC', value: 'id_isrc' },
      { label: 'Código ISRC', value: 'codigo_isrc' },
      { label: 'Tipo', value: 'tipo' },
      { label: 'ID Fonograma', value: 'id_fonograma' },
      { label: 'Título Fonograma', value: 'Fonograma.titulo' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(isrcReports);

    const fileName = `ISRC_Report_${new Date().getTime()}.csv`;
    const filePath = await saveCSVFile(fileName, csv);

    return filePath;
  } catch (error) {
    throw new InternalServerError('Error al generar el reporte de ISRC en formato CSV');
  }
};

export const generateOtherReport = async (
  tipoReporte: string,
  parametros: any
): Promise<string> => {
  try {
    let data: any[] = [];
    let fields: any[] = [];

    switch (tipoReporte) {
      case 'fonograma':
        data = await getFonogramaReportData(parametros);
        fields = [
          { label: 'ID Fonograma', value: 'id_fonograma' },
          { label: 'Título', value: 'titulo' },
          { label: 'Duración', value: 'duracion' },
          { label: 'Fecha de Creación', value: 'createdAt' },
        ];
        break;
      case 'repertorio':
        data = await getRepertorioReportData(parametros);
        fields = [
          { label: 'ID Repertorio', value: 'id_repertorio' },
          { label: 'Título', value: 'titulo' },
          { label: 'Tipo', value: 'tipo' },
          { label: 'ID Usuario', value: 'id_usuario' },
        ];
        break;
      default:
        throw new InternalServerError(`No se reconoce el tipo de reporte: ${tipoReporte}`);
    }

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    const fileName = `${tipoReporte}_Report_${new Date().getTime()}.csv`;
    const filePath = await saveCSVFile(fileName, csv);

    return filePath;
  } catch (error) {
    throw new InternalServerError('Error al generar el reporte en formato CSV');
  }
};

const getFonogramaReportData = async (parametros: any): Promise<Fonograma[]> => {
  const { fechaInicio, fechaFin } = parametros;
  return await Fonograma.findAll({
    where: {
      createdAt: {
        $between: [new Date(fechaInicio), new Date(fechaFin)],
      },
    },
  });
};

const getRepertorioReportData = async (parametros: any): Promise<any[]> => {
  const { fechaInicio, fechaFin } = parametros;
  return await Repertorio.findAll({
    where: {
      createdAt: {
        $between: [new Date(fechaInicio), new Date(fechaFin)],
      },
    },
  });
};
