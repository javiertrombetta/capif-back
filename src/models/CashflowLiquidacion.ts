import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import CashflowMaestro from './CashflowMaestro';

const CONCEPTO = ['FONOGRAMA', 'GENERAL'] as const;
const NACIONALIDAD_FONOGRAMA = ['NACIONAL', 'INTERNACIONAL'] as const;

class CashflowLiquidacion extends Model {
  public id_liquidacion!: number;
  public cashflow_maestro_id!: number;
  public concepto!: (typeof CONCEPTO)[number];
  public nacionalidad_fonograma?: (typeof NACIONALIDAD_FONOGRAMA)[number];
  public monto!: number;
  public isRetencion!: boolean;
  public cuit!: string;
  public isrc?: string;
  public nombre_fonograma?: string;
  public nombre_artista?: string;
  public sello_discografico?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public maestroDeLaLiquidacion?: CashflowMaestro;

  public static associations: {
    maestroDeLaLiquidacion: Association<CashflowLiquidacion, CashflowMaestro>;
  };
}

CashflowLiquidacion.init(
  {
    id_liquidacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    cashflow_maestro_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CashflowMaestro,
        key: 'id_transaccion',
      },
    }, 
    concepto: {
      type: DataTypes.ENUM(...CONCEPTO),
      allowNull: false,
      validate: {
        isIn: {
          args: [CONCEPTO],
          msg: 'El tipo de liquidación debe ser FONOGRAMA o GENERAL.',
        },
      },
    },
    nacionalidad_fonograma: {
      type: DataTypes.ENUM(...NACIONALIDAD_FONOGRAMA),
      allowNull: true,
      validate: {
        isIn: {
          args: [NACIONALIDAD_FONOGRAMA],
          msg: 'La nacionalidad del fonograma debe ser NACIONAL o INTERNACIONAL.',
        },
      },
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El monto debe ser un número decimal válido.',
        },
      },
    },
    isRetencion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    cuit: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'El CUIT debe contener solo números.',
        },
        len: {
          args: [11, 11],
          msg: 'El CUIT debe tener exactamente 11 dígitos.',
        },
      },
    },
    isrc: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [12, 12],
          msg: 'El ISRC debe tener exactamente 12 caracteres.',
        },
      },
    },
    nombre_fonograma: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombre_artista: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sello_discografico: {
      type: DataTypes.STRING,
      allowNull: true,
    },    
  },
  {
    sequelize,
    modelName: 'CashflowLiquidacion',
    tableName: 'CashflowLiquidacion',
    timestamps: true,
    indexes: [
      { fields: ['cashflow_maestro_id'], name: 'idx_cashflow_liquidacion_maestro_id' },
      { fields: ['cashflow_maestro_id', 'fecha_pago_liquidacion'], name: 'idx_cashflow_maestro_fecha_pago_liquidacion' },
    ],
  }
);

export default CashflowLiquidacion;