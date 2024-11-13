import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import CashflowPago from './CashflowPago';
import Cashflow from './Cashflow';
import Usuario from './Usuario';

class CashflowRechazo extends Model {
  public id_rechazo!: string;
  public pago_id!: string;
  public cashflow_destino_id!: string;
  public usuario_registrante_id!: string;
  public monto_positivo_destino!: number;
  public fecha_registro_rechazo!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public cashflow_pago?: CashflowPago;
  public cashflow_destino?: Cashflow;
  public usuario_registrante?: Usuario;

  public static associations: {
    cashflow_pago: Association<CashflowRechazo, CashflowPago>;
    cashflow_destino: Association<CashflowRechazo, Cashflow>;
    usuario_registrante: Association<CashflowRechazo, Usuario>;
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
        fields: ['usuario_registrante_id'],
        name: 'idx_cashflow_rechazo_usuario_registrante_id',
      },
      {
        fields: ['fecha_registro_rechazo'],
        name: 'idx_cashflow_rechazo_fecha_registro',
      },
    ],
  }
);

CashflowRechazo.belongsTo(CashflowPago, {
  foreignKey: 'pago_id',
  as: 'cashflow_pago',
  onDelete: 'RESTRICT',
});

CashflowPago.hasMany(CashflowRechazo, {
  foreignKey: 'pago_id',
  as: 'rechazos',
  onDelete: 'RESTRICT',
});

CashflowRechazo.belongsTo(Cashflow, {
  foreignKey: 'cashflow_destino_id',
  as: 'cashflow_destino',
  onDelete: 'RESTRICT',
});

Cashflow.hasMany(CashflowRechazo, {
  foreignKey: 'cashflow_destino_id',
  as: 'rechazos',
  onDelete: 'RESTRICT',
});

CashflowRechazo.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuario_registrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(CashflowRechazo, {
  foreignKey: 'usuario_registrante_id',
  as: 'rechazos_registrados',
  onDelete: 'SET NULL',
});

export default CashflowRechazo;
