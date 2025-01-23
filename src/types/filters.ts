export interface Filters {
  usuarioId?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  tipo_registro?: string;
  rolId?: string;
  nombre_rol?: string;
  productoraId?: string;
  productoraNombre?: string;
  limit?: number;
  offset?: number;
  [key: string]: any;
}