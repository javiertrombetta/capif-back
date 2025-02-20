import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Cashflow from './Cashflow';
import CashflowLiquidacion from './CashflowLiquidacion';
import CashflowPago from './CashflowPago';

const TIPO_TRANSACCION = ['LIQUIDACION', 'PAGO', 'RECHAZO', 'TRASPASO'] as const;

class CashflowMaestro extends Model {
  public id_transaccion!: number;
  public cashflow_id!: string;
  public tipo_transaccion!: (typeof TIPO_TRANSACCION)[number];
  public liquidacion_id?: string;
  public pago_id?: string;
  public rechazo_id?: string;
  public traspaso_id?: string;
  public monto!: number;
  public saldo_resultante!: number;
  public numero_lote!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public cashflow?: Cashflow;
  public liquidacion?: CashflowLiquidacion;
  public pago?: CashflowPago;

  public static associations: {
    cashflow: Association<CashflowMaestro, Cashflow>;
    liquidacion: Association<CashflowMaestro, CashflowLiquidacion>;
    pago: Association<CashflowMaestro, CashflowPago>;
  };
}

CashflowMaestro.init(
  {
    id_transaccion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    cashflow_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Cashflow,
        key: 'id_cashflow',
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
    },
    pago_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: CashflowPago,
        key: 'id_pago',
      },
    },
    rechazo_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    traspaso_id: {
      type: DataTypes.UUID,
      allowNull: true,
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