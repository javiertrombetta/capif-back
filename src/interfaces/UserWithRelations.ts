import { Usuario } from '../models';

export interface UserWithRelations extends Usuario {
  Rol: {
    descripcion: string;
  };
  Estado: {
    descripcion: string;
    tipo_estado_id: number;
  };
  TipoPersona: {
    descripcion: string;
  };
}
