import Usuario from './Usuario';
import Compania from './Compania.ts';
import UsuariosAsignados from './UsuariosAsignados';
import Fonograma from './Fonograma';
import Conflicto from './Conflicto';
import Consulta from './Consulta';
import Tramite from './Tramite';
import Documento from './Documento';
import Repertorio from './Repertorio';
import Pago from './Pago';
import CuentaCorriente from './CuentaCorriente';
import Reporte from './Reporte';
import Archivo from './Archivo';
import Regla from './Regla';
import Parametro from './Parametro';
import ISRC from './ISRC';
import Sesion from './Sesion';
import LogActividad from './LogActividad';
import Premio from './Premio';
import ConsultaRespuesta from './ConsultaRespuesta';
import ArchivoRepertorio from './ArchivoRepertorio';
import ParametroSistema from './ParametroSistema';
import DepuracionRepertorio from './DepuracionRepertorio';
import Rol from './Rol';
import Estado from './Estado';
import TipoPersona from './TipoPersona';
import TipoCompania from './TipoCompania';

// Relaciones entre Usuarios y Compañías (Muchos a Muchos)
Usuario.belongsToMany(Compania, { through: UsuariosAsignados, foreignKey: 'id_usuario' });
Compania.belongsToMany(Usuario, { through: UsuariosAsignados, foreignKey: 'id_compania' });

// Relación entre Repertorios y Fonogramas (Uno a Muchos)
Repertorio.hasMany(Fonograma, { foreignKey: 'id_repertorio' });
Fonograma.belongsTo(Repertorio, { foreignKey: 'id_repertorio' });

// Relación entre Usuario y Repertorio (Uno a Muchos)
Usuario.hasMany(Repertorio, { foreignKey: 'id_usuario' });
Repertorio.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Relación entre Usuario y Fonogramas (A través de Repertorios)
Usuario.hasMany(Fonograma, { through: Repertorio, foreignKey: 'id_usuario' });

// Relación entre Fonogramas y Conflictos (Uno a Muchos)
Fonograma.hasMany(Conflicto, { foreignKey: 'id_fonograma' });
Conflicto.belongsTo(Fonograma, { foreignKey: 'id_fonograma' });

// Relación entre Usuarios y Consultas (Uno a Muchos)
Usuario.hasMany(Consulta, { foreignKey: 'id_usuario' });
Consulta.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Relación entre Tramites y Usuarios (Uno a Muchos)
Usuario.hasMany(Tramite, { foreignKey: 'id_usuario' });
Tramite.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Relación entre Tramites y Documentos (Uno a Muchos)
Tramite.hasMany(Documento, { foreignKey: 'id_tramite' });
Documento.belongsTo(Tramite, { foreignKey: 'id_tramite' });

// Relación entre Usuarios y Pagos (Uno a Muchos)
Usuario.hasMany(Pago, { foreignKey: 'id_usuario' });
Pago.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Relación entre Usuarios y CuentasCorrientes (Uno a Uno)
Usuario.hasOne(CuentaCorriente, { foreignKey: 'id_usuario' });
CuentaCorriente.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Relación entre Usuarios y Reportes (Uno a Muchos)
Usuario.hasMany(Reporte, { foreignKey: 'id_usuario' });
Reporte.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Relación entre Usuarios y Archivos (Uno a Muchos)
Usuario.hasMany(Archivo, { foreignKey: 'id_usuario' });
Archivo.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Relación entre Fonogramas y ISRC (Uno a Muchos)
Fonograma.hasMany(ISRC, { foreignKey: 'id_fonograma' });
ISRC.belongsTo(Fonograma, { foreignKey: 'id_fonograma' });

// Relación entre Repertorios y ArchivosRepertorio (Uno a Muchos)
Repertorio.hasMany(ArchivoRepertorio, { foreignKey: 'id_repertorio' });
ArchivoRepertorio.belongsTo(Repertorio, { foreignKey: 'id_repertorio' });

// Relación entre Fonogramas y DepuracionRepertorio (Uno a Muchos)
Fonograma.hasMany(DepuracionRepertorio, { foreignKey: 'id_fonograma' });
DepuracionRepertorio.belongsTo(Fonograma, { foreignKey: 'id_fonograma' });

// Exportar todos los modelos
export {
  Usuario,
  Compania,
  UsuariosAsignados,
  Fonograma,
  Conflicto,
  Consulta,
  Tramite,
  Documento,
  Repertorio,
  Pago,
  CuentaCorriente,
  Reporte,
  Archivo,
  Regla,
  Parametro,
  ISRC,
  Sesion,
  LogActividad,
  Premio,
  ConsultaRespuesta,
  ArchivoRepertorio,
  ParametroSistema,
  DepuracionRepertorio,
  Rol,
  Estado,
  TipoPersona,
  TipoCompania,
};