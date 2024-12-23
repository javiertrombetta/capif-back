import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import CashflowPago from './CashflowPago';
import Cashflow from './Cashflow';

class CashflowRechazo extends Model {
  public id_rechazo!: string;
  public pago_id!: string;
  public cashflow_destino_id!: string;
  public numero_rechazo!: number;
  public monto_positivo_destino!: number;
  public fecha_registro_rechazo!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public pagoDelRechazo?: CashflowPago;
  public ccDelRechazo?: Cashflow;

  public static associations: {
    pagoDelRechazo: Association<CashflowRechazo, CashflowPago>;
    ccDelRechazo: Association<CashflowRechazo, Cashflow>;

  };
}

CashflowRechazo.init(
  {
    id_rechazo: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de cashflow rechazo debe ser un UUID válido.',
        },
      },
    },
    pago_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: CashflowPago,
        key: 'id_pago',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de cashflow pago debe ser un UUID válido.',
        },
      },
    },
    cashflow_destino_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Cashflow,
        key: 'id_cashflow',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de destino debe ser un UUID válido.',
        },
      },
    },
    numero_rechazo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        isInt: {
          msg: 'El número de rechazo debe ser un entero.',
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
    fecha_registro_rechazo: {
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
  },
  {
    sequelize,
    modelName: 'CashflowRechazo',
    tableName: 'CashflowRechazo',
    hooks: {
      beforeCreate: async (liquidacion) => {
        const maxNumero = await CashflowRechazo.max<number, CashflowRechazo>('numero_liquidacion');
        liquidacion.numero_rechazo = (maxNumero ?? 0) + 1; // Usar coalescencia nula para asignar 1 si maxNumero es null
      },
    },
    timestamps: true,
    indexes: [
      {
        fields: ['pago_id'],
        name: 'idx_cashflow_rechazo_pago_id',
      },
      {
        fields: ['cashflow_destino_id'],
        name: 'idx_cashflow_rechazo_destino_id',
      },      
      {
        fields: ['numero_rechazo'],
        name: 'idx_cashflow_numero_rechazo',
        unique: true
      },
    ],
  }
);

export default CashflowRechazo;
