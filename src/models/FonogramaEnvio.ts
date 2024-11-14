import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Fonograma from './Fonograma';

const ESTADO_ENVIO = [
  'PENDIENTE DE ENVIO',
  'ENVIADO SIN AUDIO',
  'ENVIADO A VERICAST',
  'RECHAZADO POR VERICAST',
  'ERROR EN EL ENVIO',
] as const;

class FonogramaEnvio extends Model {
  public id_envio_vericast!: string;
  public fonograma_id!: string;
  public usuario_registrante_id!: string;
  public tipo_estado!: (typeof ESTADO_ENVIO)[number];
  public fecha_envio_inicial!: Date | null;
  public fecha_envio_ultimo!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonograma?: Fonograma;
  public usuarioRegistrante?: Usuario;

  public static associations: {
    fonograma: Association<FonogramaEnvio, Fonograma>;
    usuarioRegistrante: Association<FonogramaEnvio, Usuario>;
  };
}

FonogramaEnvio.init(
  {
    id_envio_vericast: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de envío a Vericast debe ser un UUID válido.',
        },
      },
    },
    fonograma_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Fonograma,
        key: 'id_fonograma',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del fonograma debe ser un UUID válido.',
        },
      },
    },
    usuario_registrante_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario registrante debe ser un UUID válido.',
        },
      },
    },   
    tipo_estado: {
      type: DataTypes.ENUM(...ESTADO_ENVIO),
      allowNull: false,
      validate: {
        isIn: {
          args: [ESTADO_ENVIO],
          msg: 'El estado de envío no es válido.',
        },
      },
    },
    fecha_envio_inicial: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de envío inicial debe ser una fecha válida.',
        },
      },
    },
    fecha_envio_ultimo: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de último envío debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'FonogramaEnvio',
    tableName: 'FonogramaEnvio',
    timestamps: true,
    indexes: [
      {
        fields: ['fonograma_id'],
        name: 'idx_envio_fonograma_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_envio_usuario_registrante_id',
      },
      {
        fields: ['tipo_estado'],
        name: 'idx_envio_tipo_estado',
      },
      {
        fields: ['fecha_envio_inicial'],
        name: 'idx_envio_fecha_inicial',
      },
    ],
  }
);

FonogramaEnvio.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonograma',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaEnvio, {
  foreignKey: 'fonograma_id',
  as: 'envios',
  onDelete: 'RESTRICT',
});

FonogramaEnvio.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(FonogramaEnvio, {
  foreignKey: 'usuario_registrante_id',
  as: 'enviosRegistrados',
  onDelete: 'SET NULL',
});

FonogramaEnvio.belongsTo(Usuario, {
  foreignKey: 'usuario_principal_id',
  as: 'usuarioPrincipal',
  onDelete: 'SET NULL',
});

Usuario.hasMany(FonogramaEnvio, {
  foreignKey: 'usuario_principal_id',
  as: 'enviosPrincipal',
  onDelete: 'SET NULL',
});

export default FonogramaEnvio;
