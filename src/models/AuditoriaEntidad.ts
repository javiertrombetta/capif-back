import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

const ENTIDADES_PERMITIDAS = [
  'AuditoriaEntidad',
  'AuditoriaSesion',
  'Cashflow',
  'CashflowLiquidacion',
  'CashflowPago',
  'CashflowRechazo',
  'CashflowTraspaso',
  'Conflicto',
  'ConflictoMensaje',
  'Fonograma',
  'FonogramaArchivo',
  'FonogramaArchivoMaestro',
  'FonogramaDatos',
  'FonogramaEnvio',
  'FonogramaISRC',
  'FonogramaMaestro',
  'FonogramaPaisTipo',
  'FonogramaParticipacion',
  'FonogramaTerritorialidad',
  'Reporte',
  'ReporteTipo',
  'Usuario',
  'UsuarioDocumento',
  'UsuarioDocumentoTipo',
  'UsuarioMaestro',
  'UsuarioPersonaFisica',
  'UsuarioPersonaJuridica',
  'UsuarioPremio',
  'UsuarioProductora',
  'UsuarioRolTipo',
];

class AuditoriaEntidad extends Model {
  public id_auditoria!: string;
  public usuario_originario_id!: string | null;
  public usuario_destino_id!: string | null;
  public entidad_afectada!: string;
  public tipo_auditoria!: string;
  public detalle!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuarioOriginario?: Usuario;
  public usuarioRegistrante?: Usuario;

  public static associations: {
    usuarioOriginario: Association<AuditoriaEntidad, Usuario>;
    usuarioRegistrante: Association<AuditoriaEntidad, Usuario>;
  };
}

AuditoriaEntidad.init(
  {
    id_auditoria: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de auditoría debe ser un UUID válido.',
        },
      },
    },
    usuario_originario_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      onDelete: 'SET NULL',
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario originario debe ser un UUID válido.',
        },
      },
    },
    usuario_destino_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      onDelete: 'SET NULL',
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario destino debe ser un UUID válido.',
        },
      },
    },
    entidad_afectada: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: {
          args: [ENTIDADES_PERMITIDAS],
          msg: `La entidad afectada debe ser una de las siguientes: ${ENTIDADES_PERMITIDAS.join(
            ', '
          )}.`,
        },
      },
    },
    tipo_auditoria: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: {
          args: [['ALTA', 'BAJA', 'CAMBIO', 'ERROR', 'SISTEMA', 'AUTH']],
          msg: 'El tipo de auditoría debe ser uno de los siguientes: ALTA, BAJA, MODIFICACION, ERROR, SISTEMA, AUTH.',
        },
      },
    },
    detalle: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'El detalle libre no puede exceder los 30 caracteres.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'AuditoriaEntidad',
    tableName: 'AuditoriaEntidad',
    timestamps: true,
    indexes: [
      {
        fields: ['usuario_originario_id'],
        name: 'idx_auditoria_usuario_originario_id',
      },
      {
        fields: ['usuario_destino_id'],
        name: 'idx_auditoria_usuario_destino_id',
      },
      {
        fields: ['entidad_afectada'],
        name: 'idx_auditoria_entidad_afectada',
      },
      {
        fields: ['tipo_auditoria'],
        name: 'idx_auditoria_tipo_auditoria',
      },
    ],
  }
);
AuditoriaEntidad.belongsTo(Usuario, {
  foreignKey: 'usuario_originario_id',
  as: 'usuarioOriginario',
  onDelete: 'SET NULL',
});

Usuario.hasMany(AuditoriaEntidad, {
  foreignKey: 'usuario_originario_id',
  as: 'auditoriasOriginarios',
  onDelete: 'RESTRICT',
});

AuditoriaEntidad.belongsTo(Usuario, {
  foreignKey: 'usuario_destino_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(AuditoriaEntidad, {
  foreignKey: 'usuario_destino_id',
  as: 'auditoriasDestinos',
  onDelete: 'RESTRICT',
});

export default AuditoriaEntidad;