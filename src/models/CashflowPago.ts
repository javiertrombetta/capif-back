import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import CashflowMaestro from './CashflowMaestro';

const CONCEPTO = ['FONOGRAMA', 'GENERAL'] as const;

class CashflowPago extends Model {
  public id_pago!: string;
  public cashflow_maestro_id!: string;
  public concepto!: (typeof CONCEPTO)[number];
  public monto!: number;
  public isRetencion!: boolean;
  public cuit!: string;
  public isrc?: string;
  public fecha_pago!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public maestroDelPago?: CashflowMaestro;  

  public static associations: {
    maestroDelPago: Association<CashflowPago, CashflowMaestro>;
  };
}

CashflowPago.init(
  {
    id_pago: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de cashflow pago debe ser un UUID válido.',
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
          msg: 'El tipo de pago debe ser FONOGRAMA o GENERAL.',
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
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false,
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
    modelName: 'CashflowPago',
    tableName: 'CashflowPago',   
    timestamps: true,
    indexes: [
      {
        fields: ['cashflow_maestro_id'],
        name: 'idx_cashflow_pago_maestro_id',
      },
      {
        fields: ['fecha_pago'],
        name: 'idx_cashflow_fecha_pago',
      },
      {
        fields: ['cuit'],
        name: 'idx_cashflow_pago_cuit',
      },
      {
        fields: ['isrc'],
        name: 'idx_cashflow_pago_isrc',
      },
    ],
  }
);
export default CashflowPago;