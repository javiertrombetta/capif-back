import { Productora, UsuarioVista } from '../models';
import Usuario from '../models/Usuario';
import UsuarioMaestro from '../models/UsuarioMaestro';
import UsuarioVistaMaestro from '../models/UsuarioVistaMaestro';

interface UsuarioMaestroConProductora extends UsuarioMaestro {
  productora?: Productora;
}

interface UsuarioVistaMaestroConVistas extends UsuarioVistaMaestro {
  vista?: UsuarioVista;
}

export interface UsuarioResponse {
  user: Usuario;
  maestros: UsuarioMaestroConProductora[];
  vistas: UsuarioVistaMaestroConVistas[];
  hasSingleMaestro: boolean;
}