import sequelize from '../config/database/sequelize';
import Rol from './Rol';
import TipoEstado from './TipoEstado';
import Estado from './Estado';
import TipoPersona from './TipoPersona';
import TipoCompania from './TipoCompania';
import Usuario from './Usuario';
import Compania from './Compania';
import UsuarioAsignado from './UsuarioAsignado';
import Fonograma from './Fonograma';
import Conflicto from './Conflicto';
import Consulta from './Consulta';
import Tramite from './Tramite';
import Documento from './Documento';
import AuditoriaCambio from './AuditoriaCambio';
import Repertorio from './Repertorio';
import Pago from './Pago';
import CuentaCorriente from './CuentaCorriente';
import LogActividad from './LogActividad';
import ErroresInsercion from './ErroresInsercion';
import Regla from './Regla';

Usuario.belongsTo(Rol, { foreignKey: 'rol_id', onDelete: 'CASCADE' });
Rol.hasMany(Usuario, { foreignKey: 'rol_id' });

Usuario.belongsTo(Estado, { foreignKey: 'estado_id' });
Estado.hasMany(Usuario, { foreignKey: 'estado_id' });

Usuario.belongsTo(TipoPersona, { foreignKey: 'tipo_persona_id', onDelete: 'CASCADE' });
TipoPersona.hasMany(Usuario, { foreignKey: 'tipo_persona_id' });

Compania.belongsTo(TipoCompania, { foreignKey: 'tipo_compania_id', onDelete: 'CASCADE' });
TipoCompania.hasMany(Compania, { foreignKey: 'tipo_compania_id' });

Compania.belongsTo(Estado, { foreignKey: 'estado_id' });
Estado.hasMany(Compania, { foreignKey: 'estado_id' });

UsuarioAsignado.belongsTo(Usuario, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
Usuario.hasMany(UsuarioAsignado, { foreignKey: 'id_usuario' });

UsuarioAsignado.belongsTo(Compania, { foreignKey: 'id_compania', onDelete: 'CASCADE' });
Compania.hasMany(UsuarioAsignado, { foreignKey: 'id_compania' });

Fonograma.belongsTo(Estado, { foreignKey: 'estado_id' });
Estado.hasMany(Fonograma, { foreignKey: 'estado_id' });

Fonograma.belongsTo(Repertorio, { foreignKey: 'id_repertorio', onDelete: 'CASCADE' });
Repertorio.hasMany(Fonograma, { foreignKey: 'id_repertorio' });

Conflicto.belongsTo(Fonograma, { foreignKey: 'id_fonograma', onDelete: 'CASCADE' });
Fonograma.hasMany(Conflicto, { foreignKey: 'id_fonograma' });

Conflicto.belongsTo(Estado, { foreignKey: 'estado_id' });
Estado.hasMany(Conflicto, { foreignKey: 'estado_id' });

Consulta.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Consulta, { foreignKey: 'id_usuario' });

Consulta.belongsTo(Estado, { foreignKey: 'estado_id' });
Estado.hasMany(Consulta, { foreignKey: 'estado_id' });

Tramite.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Tramite, { foreignKey: 'id_usuario' });

Tramite.belongsTo(Estado, { foreignKey: 'estado_id' });
Estado.hasMany(Tramite, { foreignKey: 'estado_id' });

Documento.belongsTo(Tramite, { foreignKey: 'id_tramite' });
Tramite.hasMany(Documento, { foreignKey: 'id_tramite' });

AuditoriaCambio.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(AuditoriaCambio, { foreignKey: 'id_usuario' });

Repertorio.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Repertorio, { foreignKey: 'id_usuario' });

Pago.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Pago, { foreignKey: 'id_usuario' });

CuentaCorriente.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(CuentaCorriente, { foreignKey: 'id_usuario' });

LogActividad.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(LogActividad, { foreignKey: 'id_usuario' });

export {
  sequelize,
  Rol,
  TipoEstado,
  Estado,
  TipoPersona,
  TipoCompania,
  Usuario,
  Compania,
  UsuarioAsignado,
  Fonograma,
  Conflicto,
  Consulta,
  Tramite,
  Documento,
  AuditoriaCambio,
  Repertorio,
  Pago,
  CuentaCorriente,
  LogActividad,
  ErroresInsercion,
  Regla,
};
