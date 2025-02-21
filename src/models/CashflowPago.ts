import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import CashflowMaestro from './CashflowMaestro';

const TIPO_PAGO = ['PAGO POR ISRC', 'PAGO GENERAL'] as const;

class CashflowPago extends Model {
  public id_pago!: string;
  public cashflow_destino_id!: string;
  public numero_pago!: number;
  public tipo_pago!: (typeof TIPO_PAGO)[number];
  public monto_negativo_destino!: number;
  public monto_retencion_pago!: number;
  public lote_envio!: number;
  public orden_en_lote!: number;
  public fecha_registro_pago!: Date;
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
      unique: true,
      validate: {
        isInt: {
          msg: 'El número de pago debe ser un entero.',
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
          args: [TIPO_PAGO],
          msg: 'El tipo de pago debe ser PAGO POR ISRC o PAGO GENERAL.',
        },
      },
    },
    monto_negativo_destino: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El monto debe ser un número decimal válido.',
        },
        max: {
          args: [0],
          msg: 'El monto negativo debe ser menor o igual a cero.',
        },
      },
    },
    monto_retencion_pago: {
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
    lote_envio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    orden_en_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_registro_pago: {
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
    modelName: 'CashflowPago',
    tableName: 'CashflowPago',
    hooks: {
      beforeCreate: async (liquidacion) => {
        const maxNumero = await CashflowPago.max<number, CashflowPago>('numero_liquidacion');
        liquidacion.numero_pago = (maxNumero ?? 0) + 1; // Usar coalescencia nula para asignar 1 si maxNumero es null
      },
    },
    timestamps: true,
    indexes: [
      { fields: ['cashflow_maestro_id'], name: 'idx_cashflow_pago_maestro_id' },
      { fields: ['cuit'], name: 'idx_cashflow_pago_cuit' },
      { fields: ['isrc'], name: 'idx_cashflow_pago_isrc' },
    ],
  }
);

CashflowPago.beforeCreate(async (cashflowPago, options) => {
  const lastLote = (await CashflowPago.max('lote_envio', { transaction: options.transaction })) as
    | number
    | null;
  const lastOrdenCount = await CashflowPago.count({
    where: { lote_envio: lastLote },
    transaction: options.transaction,
  });

  const { currentLote, ordenPago } = calculateLoteAndOrdenPago(lastLote, lastOrdenCount);
  cashflowPago.lote_envio = currentLote;
  cashflowPago.orden_en_lote = ordenPago;
});

export default CashflowPago;
