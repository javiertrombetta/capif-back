import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Cashflow from './Cashflow';


const TIPO_TRASPASO = ['TRASPASO POR ISRC', 'TRASPASO GENERAL'] as const;

class CashflowTraspaso extends Model {
  public id_traspaso!: string;
  public cashflow_origen_id!: string;
  public cashflow_destino_id!: string;
  public numero_traspaso!: number;
  public tipo_traspaso!: (typeof TIPO_TRASPASO)[number];
  public monto_negativo_origen!: number;
  public monto_positivo_destino!: number;
  public fecha_registro_traspaso!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public originarioDelTraspaso?: Cashflow;
  public destinoDelTraspaso?: Cashflow;


  public static associations: {
    originarioDelTraspaso: Association<CashflowTraspaso, Cashflow>;
    destinoDelTraspaso: Association<CashflowTraspaso, Cashflow>;
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
          msg: 'El ID de cashflow traspaso debe ser un UUID válido.',
        },
      },
    },
    cashflow_origen_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Cashflow,
        key: 'id_cashflow',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de cashflow origen debe ser un UUID válido.',
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
          msg: 'El ID de cashflow destino debe ser un UUID válido.',
        },
      },
    },
    numero_traspaso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        isInt: {
          msg: 'El número de traspaso debe ser un entero.',
        },
      },
    },
    tipo_traspaso: {
      type: DataTypes.ENUM(...TIPO_TRASPASO),
      allowNull: false,
      validate: {
        isIn: {
          args: [TIPO_TRASPASO],
          msg: 'El tipo de traspaso debe ser TRASPASO POR ISRC o TRASPASO GENERAL.',
        },
      },
    },
    monto_negativo_origen: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El monto negativo origen debe ser un número decimal válido.',
        },
        max: {
          args: [0],
          msg: 'El monto negativo debe ser menor o igual a cero.',
        },
      },
    },
    monto_positivo_destino: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El monto positivo destino debe ser un número decimal válido.',
        },
        min: {
          args: [0],
          msg: 'El monto positivo no puede ser negativo.',
        },
      },
    },
    fecha_registro_traspaso: {
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
    modelName: 'CashflowTraspaso',
    tableName: 'CashflowTraspaso',
    hooks: {
      beforeCreate: async (liquidacion) => {
        const maxNumero = await CashflowTraspaso.max<number, CashflowTraspaso>('numero_liquidacion');
        liquidacion.numero_traspaso = (maxNumero ?? 0) + 1; // Usar coalescencia nula para asignar 1 si maxNumero es null
      },
    },
    timestamps: true,
    indexes: [
      {
        fields: ['cashflow_origen_id'],
        name: 'idx_cashflow_traspaso_origen_id',
      },
      {
        fields: ['cashflow_destino_id'],
        name: 'idx_cashflow_traspaso_destino_id',
      },
      {
        fields: ['fecha_registro_traspaso'],
        name: 'idx_cashflow_traspaso_fecha_registro',
      },
      {
        fields: ['numero_traspaso'],
        name: 'idx_cashflow_numero_traspaso',
        unique: true
      },
    ],
  }
);

export default CashflowTraspaso;
