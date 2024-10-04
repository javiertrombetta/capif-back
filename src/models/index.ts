import sequelize from '../config/database/sequelize';

import Rol from './Rol';
import TipoEstado from './TipoEstado';
import Estado from './Estado';
import TipoPersona from './TipoPersona';
import Usuario from './Usuario';
import TipoCompania from './TipoCompania';
import Compania from './Compania';
import UsuarioAsignado from './UsuarioAsignado';
import TipoRepertorio from './TipoRepertorio';
import Repertorio from './Repertorio';
import TipoFonograma from './TipoFonograma';
import Fonograma from './Fonograma';
import TipoISRC from './TipoISRC';
import ISRC from './ISRC';
import TipoConflicto from './TipoConflicto';
import Conflicto from './Conflicto';
import ComentarioConflicto from './ComentarioConflicto';
import Consulta from './Consulta';
import TipoTramite from './TipoTramite';
import Tramite from './Tramite';
import TipoDocumento from './TipoDocumento';
import Documento from './Documento';
import AltaMasivaTemp from './AltaMasivaTemp';
import TipoReporte from './TipoReporte';
import Reporte from './Reporte';
import TipoMetodoPago from './TipoMetodoPago';
import Pago from './Pago';
import CuentaCorriente from './CuentaCorriente';
import TipoArchivo from './TipoArchivo';
import Archivo from './Archivo';
import Sesion from './Sesion';
import TipoActividad from './TipoActividad';
import TipoNavegador from './TipoNavegador';
import LogActividad from './LogActividad';
import AuditoriaCambio from './AuditoriaCambio';
import ErroresInsercion from './ErroresInsercion';
import Regla from './Regla';
import TitularFonograma from './TitularFonograma';
import Involucrados from './Involucrados';
import DecisionInvolucrados from './DecisionInvolucrados';
import PostulacionPremio from './PostulacionPremio';

// Rol <-> Usuario
Rol.hasMany(Usuario, { foreignKey: 'rol_id', onDelete: 'CASCADE' });
Usuario.belongsTo(Rol, { foreignKey: 'rol_id' });

// TipoEstado <-> Estado
TipoEstado.hasMany(Estado, { foreignKey: 'tipo_estado_id', onDelete: 'CASCADE' });
Estado.belongsTo(TipoEstado, { foreignKey: 'tipo_estado_id' });

// Estado <-> Usuario
Estado.hasMany(Usuario, { foreignKey: 'estado_id' });
Usuario.belongsTo(Estado, { foreignKey: 'estado_id' });

// TipoPersona <-> Usuario
TipoPersona.hasMany(Usuario, { foreignKey: 'tipo_persona_id', onDelete: 'CASCADE' });
Usuario.belongsTo(TipoPersona, { foreignKey: 'tipo_persona_id' });

// TipoCompania <-> Compania
TipoCompania.hasMany(Compania, { foreignKey: 'tipo_compania_id', onDelete: 'CASCADE' });
Compania.belongsTo(TipoCompania, { foreignKey: 'tipo_compania_id' });

// Estado <-> Compania
Estado.hasMany(Compania, { foreignKey: 'estado_id' });
Compania.belongsTo(Estado, { foreignKey: 'estado_id' });

// Usuario <-> UsuarioAsignado
Usuario.hasMany(UsuarioAsignado, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
UsuarioAsignado.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Compania <-> UsuarioAsignado
Compania.hasMany(UsuarioAsignado, { foreignKey: 'id_compania', onDelete: 'CASCADE' });
UsuarioAsignado.belongsTo(Compania, { foreignKey: 'id_compania' });

// Usuario <-> Repertorio
Usuario.hasMany(Repertorio, { foreignKey: 'id_usuario' });
Repertorio.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// TipoRepertorio <-> Repertorio
TipoRepertorio.hasMany(Repertorio, { foreignKey: 'id_tipo_repertorio', onDelete: 'CASCADE' });
Repertorio.belongsTo(TipoRepertorio, { foreignKey: 'id_tipo_repertorio' });

// Repertorio <-> Fonograma
Repertorio.hasMany(Fonograma, { foreignKey: 'id_repertorio', onDelete: 'CASCADE' });
Fonograma.belongsTo(Repertorio, { foreignKey: 'id_repertorio' });

// Fonograma <-> ISRC
Fonograma.hasOne(ISRC, { foreignKey: 'id_fonograma', onDelete: 'CASCADE' });
ISRC.belongsTo(Fonograma, { foreignKey: 'id_fonograma' });

// TipoFonograma <-> Fonograma
TipoFonograma.hasMany(Fonograma, { foreignKey: 'id_tipo_fonograma', onDelete: 'CASCADE' });
Fonograma.belongsTo(TipoFonograma, { foreignKey: 'id_tipo_fonograma' });

// TipoISRC <-> ISRC
TipoISRC.hasMany(ISRC, { foreignKey: 'id_tipo_isrc', onDelete: 'CASCADE' });
ISRC.belongsTo(TipoISRC, { foreignKey: 'id_tipo_isrc' });

// Fonograma <-> Conflicto
Fonograma.hasMany(Conflicto, { foreignKey: 'id_fonograma', onDelete: 'CASCADE' });
Conflicto.belongsTo(Fonograma, { foreignKey: 'id_fonograma' });

// TipoConflicto <-> Conflicto
TipoConflicto.hasMany(Conflicto, { foreignKey: 'id_tipo_conflicto', onDelete: 'CASCADE' });
Conflicto.belongsTo(TipoConflicto, { foreignKey: 'id_tipo_conflicto' });

// Conflicto <-> ComentarioConflicto
Conflicto.hasMany(ComentarioConflicto, { foreignKey: 'id_conflicto', onDelete: 'CASCADE' });
ComentarioConflicto.belongsTo(Conflicto, { foreignKey: 'id_conflicto' });

// Usuario <-> Consulta
Usuario.hasMany(Consulta, { foreignKey: 'id_usuario' });
Consulta.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Usuario <-> Tramite
Usuario.hasMany(Tramite, { foreignKey: 'id_usuario' });
Tramite.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// TipoTramite <-> Tramite
TipoTramite.hasMany(Tramite, { foreignKey: 'id_tipo_tramite', onDelete: 'CASCADE' });
Tramite.belongsTo(TipoTramite, { foreignKey: 'id_tipo_tramite' });

// Tramite <-> Documento
Tramite.hasMany(Documento, { foreignKey: 'id_tramite', onDelete: 'CASCADE' });
Documento.belongsTo(Tramite, { foreignKey: 'id_tramite' });

// TipoDocumento <-> Documento
TipoDocumento.hasMany(Documento, { foreignKey: 'id_tipo_documento', onDelete: 'CASCADE' });
Documento.belongsTo(TipoDocumento, { foreignKey: 'id_tipo_documento' });

// Usuario <-> AltaMasivaTemp
Usuario.hasMany(AltaMasivaTemp, { foreignKey: 'id_usuario' });
AltaMasivaTemp.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Repertorio <-> AltaMasivaTemp
Repertorio.hasMany(AltaMasivaTemp, { foreignKey: 'id_repertorio', onDelete: 'CASCADE' });
AltaMasivaTemp.belongsTo(Repertorio, { foreignKey: 'id_repertorio' });

// Usuario <-> Reporte
Usuario.hasMany(Reporte, { foreignKey: 'id_usuario' });
Reporte.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// TipoReporte <-> Reporte
TipoReporte.hasMany(Reporte, { foreignKey: 'id_tipo_reporte', onDelete: 'CASCADE' });
Reporte.belongsTo(TipoReporte, { foreignKey: 'id_tipo_reporte' });

// Usuario <-> Pago
Usuario.hasMany(Pago, { foreignKey: 'id_usuario' });
Pago.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// TipoMetodoPago <-> Pago
TipoMetodoPago.hasMany(Pago, { foreignKey: 'id_tipo_metodo_pago', onDelete: 'CASCADE' });
Pago.belongsTo(TipoMetodoPago, { foreignKey: 'id_tipo_metodo_pago' });

// Usuario <-> CuentaCorriente
Usuario.hasMany(CuentaCorriente, { foreignKey: 'id_usuario' });
CuentaCorriente.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Usuario <-> Archivo
Usuario.hasMany(Archivo, { foreignKey: 'id_usuario' });
Archivo.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// TipoArchivo <-> Archivo
TipoArchivo.hasMany(Archivo, { foreignKey: 'id_tipo_archivo', onDelete: 'CASCADE' });
Archivo.belongsTo(TipoArchivo, { foreignKey: 'id_tipo_archivo' });

// Usuario <-> Sesion
Usuario.hasMany(Sesion, { foreignKey: 'id_usuario' });
Sesion.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Usuario <-> LogActividad
Usuario.hasMany(LogActividad, { foreignKey: 'id_usuario' });
LogActividad.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// TipoActividad <-> LogActividad
TipoActividad.hasMany(LogActividad, { foreignKey: 'id_tipo_actividad', onDelete: 'CASCADE' });
LogActividad.belongsTo(TipoActividad, { foreignKey: 'id_tipo_actividad' });

// TipoNavegador <-> LogActividad
TipoNavegador.hasMany(LogActividad, { foreignKey: 'id_tipo_navegador', onDelete: 'CASCADE' });
LogActividad.belongsTo(TipoNavegador, { foreignKey: 'id_tipo_navegador' });

// Usuario <-> AuditoriaCambio
Usuario.hasMany(AuditoriaCambio, { foreignKey: 'id_usuario' });
AuditoriaCambio.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Usuario <-> ErroresInsercion
Usuario.hasMany(ErroresInsercion, { foreignKey: 'id_usuario' });
ErroresInsercion.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Fonograma <-> TitularFonograma
Fonograma.hasMany(TitularFonograma, { foreignKey: 'id_fonograma', onDelete: 'CASCADE' });
TitularFonograma.belongsTo(Fonograma, { foreignKey: 'id_fonograma' });

// Compania <-> TitularFonograma
Compania.hasMany(TitularFonograma, { foreignKey: 'id_titular', onDelete: 'CASCADE' });
TitularFonograma.belongsTo(Compania, { foreignKey: 'id_titular' });

// Conflicto <-> Involucrados
Conflicto.hasMany(Involucrados, { foreignKey: 'id_conflicto', onDelete: 'CASCADE' });
Involucrados.belongsTo(Conflicto, { foreignKey: 'id_conflicto' });

// Compania <-> Involucrados
Compania.hasMany(Involucrados, { foreignKey: 'id_titular', onDelete: 'CASCADE' });
Involucrados.belongsTo(Compania, { foreignKey: 'id_titular' });

// Involucrados <-> DecisionInvolucrados
Involucrados.hasMany(DecisionInvolucrados, { foreignKey: 'id_involucrado', onDelete: 'CASCADE' });
DecisionInvolucrados.belongsTo(Involucrados, { foreignKey: 'id_involucrado' });

// Compania <-> PostulacionPremio
Compania.hasMany(PostulacionPremio, { foreignKey: 'id_compania', onDelete: 'CASCADE' });
PostulacionPremio.belongsTo(Compania, { foreignKey: 'id_compania' });

// Usuario <-> PostulacionPremio
Usuario.hasMany(PostulacionPremio, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
PostulacionPremio.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Estado <-> Trámite
Estado.hasMany(Tramite, { foreignKey: 'estado_id', onDelete: 'CASCADE' });
Tramite.belongsTo(Estado, { foreignKey: 'estado_id' });

// Estado <-> Repertorio
Estado.hasMany(Repertorio, { foreignKey: 'estado_id', onDelete: 'CASCADE' });
Repertorio.belongsTo(Estado, { foreignKey: 'estado_id', });

export {
  sequelize,
  Rol,
  TipoEstado,
  Estado,
  TipoPersona,
  Usuario,
  TipoCompania,
  Compania,
  UsuarioAsignado,
  TipoRepertorio,
  Repertorio,
  TipoFonograma,
  Fonograma,
  TipoISRC,
  ISRC,
  TipoConflicto,
  Conflicto,
  ComentarioConflicto,
  Consulta,
  TipoTramite,
  Tramite,
  TipoDocumento,
  Documento,
  AltaMasivaTemp,
  TipoReporte,
  Reporte,
  TipoMetodoPago,
  Pago,
  CuentaCorriente,
  TipoArchivo,
  Archivo,
  Sesion,
  TipoActividad,
  TipoNavegador,
  LogActividad,
  AuditoriaCambio,
  ErroresInsercion,
  Regla,
  TitularFonograma,
  Involucrados,
  DecisionInvolucrados,
  PostulacionPremio,
};
