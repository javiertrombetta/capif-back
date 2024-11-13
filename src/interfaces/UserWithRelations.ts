import { Usuario, Rol, Estado, PersonaFisica, PersonaJuridica } from '../models';

export interface UserWithRelations extends Usuario {
  Rol?: Rol;
  Estado?: Estado;
  PersonaFisica?: PersonaFisica;
  PersonaJuridica?: PersonaJuridica;
}
