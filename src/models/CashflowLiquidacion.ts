import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import CashflowMaestro from './CashflowMaestro';

const CONCEPTO = ['FONOGRAMA', 'GENERAL'] as const;
const NACIONALIDAD_FONOGRAMA = ['NACIONAL', 'INTERNACIONAL'] as const;

class CashflowLiquidacion extends Model {
  public id_liquidacion!: string;
  public cashflow_maestro_id!: string;
  public concepto!: (typeof CONCEPTO)[number];
  public nacionalidad_fonograma?: (typeof NACIONALIDAD_FONOGRAMA)[number];
  public monto!: number;
  public isRetencion!: boolean;
  public cuit!: string;
  public isrc?: string;
  public pasadas!: number;
  public nombre_fonograma?: string;
  public nombre_artista?: string;
  public sello_discografico?: string;
  public fecha_liquidacion!: Date;
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
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de liquidación debe ser un UUID válido.',
        },
      },
    },
    cashflow_maestro_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: CashflowMaestro,
        key: 'id_transaccion',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la transacción debe ser un UUID válido.',
        },
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
    pasadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'El monto debe ser un número entero válido.',
        },
        min: {
          args: [0],
          msg: 'El campo pasadas debe ser un número entero positivo.',
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
    fecha_liquidacion: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de liquidación debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'CashflowLiquidacion',
    tableName: 'CashflowLiquidacion',
    timestamps: true,
    indexes: [
      { fields: ['cashflow_maestro_id'], name: 'idx_cashflow_liquidacion_maestro_id' },      
      { fields: ['cuit'], name: 'idx_cashflow_liquidacion_cuit' }, 
      { fields: ['isrc'], name: 'idx_cashflow_liquidacion_isrc' },
    ],
  }
);

export default CashflowLiquidacion;