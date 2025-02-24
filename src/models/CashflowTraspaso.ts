import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import CashflowMaestro from './CashflowMaestro';

const TIPO_TRASPASO = ['FONOGRAMA', 'GENERAL'] as const;

class CashflowTraspaso extends Model {
  public id_traspaso!: string;
  public cashflow_maestro_id!: string;
  public tipo_traspaso!: (typeof TIPO_TRASPASO)[number];
  public isrc?: string;
  public cuit_origen?: string;
  public cuit_destino!: string;
  public porcentaje_traspaso?: number;
  public monto!: number;
  public fecha_traspaso!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public maestroDelTraspaso?: CashflowMaestro;

  public static associations: {
    maestroDelTraspaso: Association<CashflowTraspaso, CashflowMaestro>;
  };
}

CashflowTraspaso.init(
  {
    id_traspaso: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del traspaso debe ser un UUID válido.',
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
    tipo_traspaso: {
      type: DataTypes.ENUM(...TIPO_TRASPASO),
      allowNull: false,
    },
    isrc: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [12, 12],
          msg: 'El ISRC debe tener exactamente 12 caracteres.',
        },
      },
    },
    cuit_origen: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: {
          msg: 'El CUIT debe contener solo números.',
        },
        len: {
          args: [11, 11],
          msg: 'El CUIT debe tener exactamente 11 dígitos.',
        },
      },
    },
    cuit_destino: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'El CUIT debe contener solo números.',
        },
        len: {
          args: [11, 11],
          msg: 'El CUIT debe tener exactamente 11 dígitos.',
        },
      },
    },
    porcentaje_traspaso: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: {
          msg: 'El porcentaje de traspaso debe ser un número entero.',
        },
        min: {
          args: [0],
          msg: 'El porcentaje de traspaso no puede ser negativo.',
        },
        max: {
          args: [100],
          msg: 'El porcentaje de traspaso no puede ser mayor a 100.',
        },
      },
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_traspaso: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de traspaso debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'CashflowTraspaso',
    tableName: 'CashflowTraspaso',
    timestamps: true,
    indexes: [
      { fields: ['cashflow_maestro_id'], name: 'idx_cashflow_traspaso_maestro_id' },
      { fields: ['cuit_origen'], name: 'idx_cashflow_traspaso_cuit_origen' },
      { fields: ['cuit_destino'], name: 'idx_cashflow_traspaso_cuit_destino' },
      { fields: ['isrc'], name: 'idx_cashflow_traspaso_isrc' },
    ],
  }
);

export default CashflowTraspaso;