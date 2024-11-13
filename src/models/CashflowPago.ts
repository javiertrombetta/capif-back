import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import { calculateLoteAndOrdenPago } from '../services/checkModels';
import Cashflow from './Cashflow';
import Usuario from './Usuario';
import ISRC from './FonogramaISRC';

const TIPO_PAGO = ['PAGO POR ISRC', 'PAGO GENERAL'] as const;

class CashflowPago extends Model {
  public id_pago!: string;
  public cashflow_destino_id!: string;
  public isrc_id!: string | null;
  public usuario_registrante_id!: string;
  public tipo_pago!: (typeof TIPO_PAGO)[number];
  public monto_negativo_destino!: number;
  public monto_retencion_pago!: number;
  public lote_envio!: number;
  public orden_en_lote!: number;
  public fecha_registro_pago!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public cashflow_destino?: Cashflow;
  public isrc?: ISRC;
  public usuario_registrante?: Usuario;

  public static associations: {
    cashflow_destino: Association<CashflowPago, Cashflow>;
    isrc: Association<CashflowPago, ISRC>;
    usuario_registrante: Association<CashflowPago, Usuario>;
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
    isrc_id: {
      type: DataTypes.STRING(12),
      allowNull: true,
      references: {
        model: ISRC,
        key: 'id_isrc',
      },
      validate: {
        is: {
          args: /^[A-Z]{2}[0-9A-Z]{3}[0-9]{2}[0-9]{5}$/,
          msg: 'El código ISRC debe seguir el formato correcto (Ej: ARABC2100001).',
        },
        len: {
          args: [12, 12],
          msg: 'El ISRC debe tener exactamente 12 caracteres.',
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
    tipo_pago: {
      type: DataTypes.ENUM(...TIPO_PAGO),
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
    timestamps: true,
    indexes: [
      {
        fields: ['cashflow_destino_id'],
        name: 'idx_cashflow_pago_destino_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_cashflow_pago_usuario_registrante_id',
      },
      {
        fields: ['isrc_id'],
        name: 'idx_cashflow_pago_isrc_id',
      },
      {
        fields: ['lote_envio', 'orden_en_lote'],
        name: 'idx_cashflow_pago_lote_orden',
        unique: true,
      },
    ],
  }
);

CashflowPago.belongsTo(Cashflow, {
  foreignKey: 'cashflow_destino_id',
  as: 'cashflow_destino',
  onDelete: 'RESTRICT',
});

Cashflow.hasMany(CashflowPago, {
  foreignKey: 'cashflow_destino_id',
  as: 'pagos',
  onDelete: 'RESTRICT',
});

CashflowPago.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuario_registrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(CashflowPago, {
  foreignKey: 'usuario_registrante_id',
  as: 'pagos_registrados',
  onDelete: 'SET NULL',
});

CashflowPago.belongsTo(ISRC, {
  foreignKey: 'isrc_id',
  as: 'isrc',
  onDelete: 'RESTRICT',
});

ISRC.hasMany(CashflowPago, {
  foreignKey: 'isrc_id',
  as: 'pagos',
  onDelete: 'RESTRICT',
});

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
