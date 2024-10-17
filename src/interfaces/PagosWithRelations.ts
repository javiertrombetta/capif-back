
export interface PagosWithRelations {
  id_pago: string;
  id_usuario: string;
  monto: number;
  fecha_pago: Date;
  id_tipo_metodo_pago: string;
  referencia: string | null;
  tipoMetodoPago?: {
    id_tipo_metodo_pago: string;
    descripcion: string;
  };
}
