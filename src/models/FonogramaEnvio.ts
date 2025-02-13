import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';

const ESTADO_ENVIO = [
  'PENDIENTE DE ENVIO',
  'ENVIADO SIN AUDIO',
  'ENVIADO CON AUDIO',
  'RECHAZADO POR VERICAST',
  'ERROR EN EL ENVIO',
] as const;

const CONTENIDO = [
  'DATOS',
  'COMPLETO',
] as const;

class FonogramaEnvio extends Model {
  public id_envio_vericast!: string;
  public fonograma_id!: string;
  public tipo_estado!: (typeof ESTADO_ENVIO)[number];
  public tipo_contenido!: (typeof CONTENIDO)[number];
  public fecha_envio_inicial!: Date | null;
  public fecha_envio_ultimo!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonogramaDelEnvio?: Fonograma;

  public static associations: {
    fonogramaDelEnvio: Association<FonogramaEnvio, Fonograma>;
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
    tipo_contenido: {
      type: DataTypes.ENUM(...CONTENIDO),
      allowNull: false,
      validate: {
        isIn: {
          args: [CONTENIDO],
          msg: 'El tipo de contenido no es válido.',
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
        fields: ['tipo_estado'],
        name: 'idx_envio_tipo_estado',
      },
      {
        fields: ['tipo_contenido'],
        name: 'idx_envio_tipo_contenido',
      },
    ],
  }
);

export default FonogramaEnvio;
