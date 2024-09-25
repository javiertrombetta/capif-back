
import { Usuario } from '../models';

export interface UsuarioConRol extends Usuario {
  Rol: {
    descripcion: string;
  };
}
