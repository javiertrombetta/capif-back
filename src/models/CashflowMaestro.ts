import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Cashflow from './Cashflow';
import CashflowLiquidacion from './CashflowLiquidacion';
import CashflowPago from './CashflowPago';
import CashflowRechazo from './CashflowRechazo';
import CashflowTraspaso from './CashflowTraspaso';

const TIPO_TRANSACCION = ['LIQUIDACION', 'PAGO', 'RECHAZO', 'TRASPASO'] as const;

class CashflowMaestro extends Model {
  public id_transaccion!: string;
  public cashflow_id!: string;
  public tipo_transaccion!: (typeof TIPO_TRANSACCION)[number];
  public liquidacion_id?: string;
  public pago_id?: string;
  public rechazo_id?: string;
  public traspaso_id?: string;  
  public monto!: number;
  public saldo_resultante!: number;
  public numero_lote!: number;
  public referencia?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public cashflow?: Cashflow;
  public liquidacion?: CashflowLiquidacion;
  public pago?: CashflowPago;
  public rechazo?: CashflowRechazo;
  public traspaso?: CashflowTraspaso;

  public static associations: {
    cashflow: Association<CashflowMaestro, Cashflow>;
    liquidacion: Association<CashflowMaestro, CashflowLiquidacion>;
    pago: Association<CashflowMaestro, CashflowPago>;
    rechazo: Association<CashflowMaestro, CashflowRechazo>;
    traspaso: Association<CashflowMaestro, CashflowTraspaso>;
  };
}

CashflowMaestro.init(
  {
    id_transaccion: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de transacción debe ser un UUID válido.',
        },
      },
    },
    cashflow_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Cashflow,
        key: 'id_cashflow',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la transacción debe ser un UUID válido.',
        },
      },
    },
    tipo_transaccion: {
      type: DataTypes.ENUM(...TIPO_TRANSACCION),
      allowNull: false,
    },
    liquidacion_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: CashflowLiquidacion,
        key: 'id_liquidacion',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la liquidación debe ser un UUID válido.',
        },
      },
    },
    pago_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: CashflowPago,
        key: 'id_pago',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del pago debe ser un UUID válido.',
        },
      },
    },
    rechazo_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: CashflowRechazo,
        key: 'id_rechazo',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del rechazo debe ser un UUID válido.',
        },
      },
    },
    traspaso_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: CashflowTraspaso,
        key: 'id_traspaso',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del traspaso debe ser un UUID válido.',
        },
      },
    },    
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    saldo_resultante: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    numero_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referencia: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'CashflowMaestro',
    tableName: 'CashflowMaestro',
    timestamps: true,
    indexes: [
      { fields: ['cashflow_id'], name: 'idx_cashflow_maestro_cashflow_id' },
      { fields: ['tipo_transaccion'], name: 'idx_cashflow_maestro_tipo_transaccion' },
      { fields: ['numero_lote'], name: 'idx_cashflow_maestro_numero_lote' },
      { fields: ['referencia'], name: 'idx_cashflow_maestro_referencia', unique: true },
    ],
    validate: {
      atLeastOneReference() {
        if (!this.liquidacion_id && !this.pago_id && !this.rechazo_id && !this.traspaso_id) {
          throw new Error('Debe existir al menos un ID de referencia válido (liquidacion, pago, rechazo o traspaso).');
        }
      },
    },
  }
);

export default CashflowMaestro;