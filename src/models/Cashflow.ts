import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Productora from './Productora';

class Cashflow extends Model {
  public id_cashflow!: string;
  public productora_id!: string;
  public saldo_actual_productora!: number;  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public productoraDeCC?: Productora; 

  public static associations: {
    productoraDeCC: Association<Cashflow, Productora>;
  };
}

Cashflow.init(
  {
    id_cashflow: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de cashflow debe ser un UUID válido.',
        },
      },
    },
    productora_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Productora,
        key: 'id_productora',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la productora debe ser un UUID válido.',
        },
      },
    },
    saldo_actual_productora: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El saldo actual debe ser un número decimal válido.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Cashflow',
    tableName: 'Cashflow',
    timestamps: true,
    indexes: [
      { fields: ["id_cashflow"], name: "idx_cashflow_id", unique: true },
      { fields: ["productora_id"], name: "idx_cashflow_productora_id" },
      { fields: ["saldo_actual_productora"], name: "idx_cashflow_saldo" },
      { fields: ["createdAt"], name: "idx_cashflow_created_at" },
    ],
  }
);

export default Cashflow;