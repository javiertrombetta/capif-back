import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class CashflowPendiente extends Model {
  public id_pendiente!: string;
  public isrc!: string;
  public monto!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CashflowPendiente.init(
  {
    id_pendiente: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del isrc pendiente debe ser un UUID válido.',
        },
      },
    },
    isrc: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [12, 12],
          msg: 'El ISRC debe tener exactamente 12 caracteres.',
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
  },
  {
    sequelize,
    modelName: 'CashflowPendiente',
    tableName: 'CashflowPendiente',
    timestamps: true,
    indexes: [
      { fields: ['isrc'], name: 'idx_cashflow_pendiente_isrc', unique: true },
    ],
  }
);

export default CashflowPendiente;