import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Cashflow from './Cashflow';
import Usuario from './Usuario';

const TIPO_LIQUIDACION = ['FONOGRAMA', 'GENERAL'] as const;
const TIPO_NACIONALIDAD = ['NO APLICA', 'NACIONAL', 'INTERNACIONAL'] as const;

class CashflowLiquidacion extends Model {
  public id_liquidacion!: string;
  public cashflow_destino_id!: string;
  public isrc_id!: string | null;
  public usuario_registrante_id!: string;
  public tipo_liquidacion!: (typeof TIPO_LIQUIDACION)[number];
  public tipo_nacionalidad!: (typeof TIPO_NACIONALIDAD)[number];
  public monto_positivo_destino!: number;
  public monto_retencion_liquidacion!: number;
  public is_isrc_no_asignado!: boolean;
  public is_isrc_conflicto!: boolean;
  public is_liquidacion_paga!: boolean;
  public fecha_registro_liquidacion!: Date;
  public fecha_pago!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public cashflow_destino?: Cashflow;
  public usuario_registrante?: Usuario;

  public static associations: {
    cashflow_destino: Association<CashflowLiquidacion, Cashflow>;
    usuario_registrante: Association<CashflowLiquidacion, Usuario>;
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
          msg: 'El ID de cashflow liquidación debe ser un UUID válido.',
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
    tipo_liquidacion: {
      type: DataTypes.ENUM(...TIPO_LIQUIDACION),
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
    is_liquidacion_paga: {
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
    timestamps: true,
    indexes: [
      {
        fields: ['cashflow_destino_id'],
        name: 'idx_cashflow_liquidacion_destino_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_cashflow_liquidacion_usuario_registrante_id',
      },
      {
        fields: ['isrc_id'],
        name: 'idx_cashflow_liquidacion_isrc_id',
        unique: true,
      },
      {
        fields: ['fecha_registro_liquidacion'],
        name: 'idx_cashflow_liquidacion_fecha_registro',
      },
      {
        fields: ['tipo_liquidacion', 'tipo_nacionalidad'],
        name: 'idx_cashflow_liquidacion_tipo_nacionalidad',
      },
    ],
  }
);

CashflowLiquidacion.belongsTo(Cashflow, {
  foreignKey: 'cashflow_destino_id',
  as: 'cashflow_destino',
  onDelete: 'RESTRICT',
});

Cashflow.hasMany(CashflowLiquidacion, {
  foreignKey: 'cashflow_destino_id',
  as: 'liquidaciones',
  onDelete: 'RESTRICT',
});

CashflowLiquidacion.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuario_registrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(CashflowLiquidacion, {
  foreignKey: 'usuario_registrante_id',
  as: 'liquidaciones_registradas',
  onDelete: 'RESTRICT',
});

export default CashflowLiquidacion;