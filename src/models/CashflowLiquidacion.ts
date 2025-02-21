import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Cashflow from './Cashflow';

const TIPO_LIQUIDACION = ['FONOGRAMA', 'GENERAL'] as const;
const TIPO_NACIONALIDAD = ['NO APLICA', 'NACIONAL', 'INTERNACIONAL'] as const;

class CashflowLiquidacion extends Model {
  public id_liquidacion!: string;
  public cashflow_maestro_id!: string;
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

  public cuentaDeLaLiquidacion?: Cashflow;

  public static associations: {
    cuentaDeLaLiquidacion: Association<CashflowLiquidacion, Cashflow>;
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
      unique: true,
      validate: {
        isInt: {
          msg: 'El número de liquidación debe ser un entero.',
        },
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
          args: [TIPO_LIQUIDACION],
          msg: 'El tipo de liquidación debe ser FONOGRAMA o GENERAL.',
        },
      },
    },
    tipo_nacionalidad: {
      type: DataTypes.ENUM(...TIPO_NACIONALIDAD),
      allowNull: false,
      validate: {
        isIn: {
          args: [TIPO_NACIONALIDAD],
          msg: 'La nacionalidad debe ser SIN REGISTRO, NACIONAL o INTERNACIONAL.',
        },
      },
    },
    monto_positivo_destino: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El monto positivo debe ser un número decimal válido.',
        },
        min: {
          args: [0],
          msg: 'El monto positivo no puede ser negativo.',
        },
      },
    },
    monto_retencion_liquidacion: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El monto de retención debe ser un número decimal válido.',
        },
        min: {
          args: [0],
          msg: 'El monto de retención no puede ser negativo.',
        },
      },
    },
    is_isrc_no_asignado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_isrc_conflicto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fecha_registro_liquidacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de registro debe ser una fecha válida.',
        },
      },
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de pago debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'CashflowLiquidacion',
    tableName: 'CashflowLiquidacion',
    hooks: {
      beforeCreate: async (liquidacion) => {
        const maxNumero = await CashflowLiquidacion.max<number, CashflowLiquidacion>('numero_liquidacion');
        liquidacion.numero_liquidacion = (maxNumero ?? 0) + 1; // Usar coalescencia nula para asignar 1 si maxNumero es null
      },
    },
    timestamps: true,
    indexes: [
      { fields: ['cashflow_maestro_id'], name: 'idx_cashflow_liquidacion_maestro_id' },      
      { fields: ['cuit'], name: 'idx_cashflow_liquidacion_cuit' }, 
      { fields: ['isrc'], name: 'idx_cashflow_liquidacion_isrc' },
    ],
  }
);

export default CashflowLiquidacion;