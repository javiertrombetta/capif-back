
import { TipoMetodoPago } from '../models';

export interface PagosWithRelations {
  id_pago: number;
  id_usuario: number;
  monto: number;
  fecha_pago: Date;
  id_tipo_metodo_pago: number;
  referencia: string | null;
  tipoMetodoPago?: {
    id_tipo_metodo_pago: number;
    descripcion: string;
  };
}
