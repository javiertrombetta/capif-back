import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Cashflow from './Cashflow';
import Usuario from './Usuario';
import FonogramaISRC from './FonogramaISRC';

const TIPO_TRASPASO = ['TRASPASO POR ISRC', 'TRASPASO GENERAL'] as const;

class CashflowTraspaso extends Model {
  public id_traspaso!: string;
  public cashflow_origen_id!: string;
  public cashflow_destino_id!: string;
  public isrc_id!: string | null;
  public usuario_registrante_id!: string;
  public tipo_traspaso!: (typeof TIPO_TRASPASO)[number];
  public monto_negativo_origen!: number;
  public monto_positivo_destino!: number;
  public fecha_registro_traspaso!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public cashflow_origen?: Cashflow;
  public cashflow_destino?: Cashflow;
  public isrc?: FonogramaISRC;
  public usuario_registrante?: Usuario;

  public static associations: {
    cashflow_origen: Association<CashflowTraspaso, Cashflow>;
    cashflow_destino: Association<CashflowTraspaso, Cashflow>;
    isrc: Association<CashflowTraspaso, FonogramaISRC>;
    usuario_registrante: Association<CashflowTraspaso, Usuario>;
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
    isrc_id: {
      type: DataTypes.STRING(12),
      allowNull: true,
      references: {
        model: FonogramaISRC,
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
        fields: ['isrc_id'],
        name: 'idx_cashflow_traspaso_isrc_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_cashflow_traspaso_usuario_id',
      },
      {
        fields: ['fecha_registro_traspaso'],
        name: 'idx_cashflow_traspaso_fecha_registro',
      },
    ],
  }
);

CashflowTraspaso.belongsTo(Cashflow, {
  foreignKey: 'cashflow_origen_id',
  as: 'cashflow_origen',
  onDelete: 'RESTRICT',
});

Cashflow.hasMany(CashflowTraspaso, {
  foreignKey: 'cashflow_origen_id',
  as: 'traspasosOrigen',
  onDelete: 'RESTRICT',
});

CashflowTraspaso.belongsTo(Cashflow, {
  foreignKey: 'cashflow_destino_id',
  as: 'cashflow_destino',
  onDelete: 'RESTRICT',
});

Cashflow.hasMany(CashflowTraspaso, {
  foreignKey: 'cashflow_destino_id',
  as: 'traspasosDestino',
  onDelete: 'RESTRICT',
});

CashflowTraspaso.belongsTo(FonogramaISRC, {
  foreignKey: 'isrc_id',
  as: 'isrc',
  onDelete: 'RESTRICT',
});

FonogramaISRC.hasMany(CashflowTraspaso, {
  foreignKey: 'isrc_id',
  as: 'traspasos',
  onDelete: 'RESTRICT',
});

CashflowTraspaso.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuario_registrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(CashflowTraspaso, {
  foreignKey: 'usuario_registrante_id',
  as: 'traspasos_registrados',
  onDelete: 'SET NULL',
});

export default CashflowTraspaso;
