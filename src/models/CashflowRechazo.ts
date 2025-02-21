import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import CashflowMaestro from './CashflowMaestro';

class CashflowRechazo extends Model {
  public id_rechazo!: string;
  public cashflow_maestro_id!: string;
  public monto!: number;
  public referencia?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public maestroDelRechazo?: CashflowMaestro;

  public static associations: {
    maestroDelRechazo: Association<CashflowRechazo, CashflowMaestro>;
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
          msg: 'El ID del rechazo debe ser un UUID válido.',
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
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El monto debe ser un número decimal válido.',
        },        
      },
    },
    referencia: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },  
  },
  {
    sequelize,
    modelName: 'CashflowRechazo',
    tableName: 'CashflowRechazo',    
    timestamps: true,
    indexes: [
      { fields: ['cashflow_maestro_id'], name: 'idx_cashflow_rechazo_maestro_id' },
      { fields: ['referencia'], name: 'idx_cashflow_rechazo_referencia', unique: true },
    ],
  }
);

export default CashflowRechazo;