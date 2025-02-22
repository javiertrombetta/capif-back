import { ProductoraPremio } from "../models";

export const generateUniqueCodigoPostulacion = async (): Promise<string> => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo: string;
    let exists = true;
    do {
      codigo = "";
      for (let i = 0; i < 10; i++) {
        codigo += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Consultar si el código ya existe
      const count = await ProductoraPremio.count({ where: { codigo_postulacion: codigo } });
      exists = count > 0;
    } while (exists);
    return codigo;
  };