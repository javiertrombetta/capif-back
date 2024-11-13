import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import { validateCUIT, validateCBU } from '../services/checkModels';
import Usuario from './Usuario';
import UsuarioProductora from './Productora';

class Cashflow extends Model {
  public id_cashflow!: string;
  public productora_id!: string;
  public usuario_registrante_id!: string;
  public saldo_actual_productora!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public productora?: UsuarioProductora;
  public usuario_registrante?: Usuario;

  public static associations: {
    productora: Association<Cashflow, UsuarioProductora>;
    usuario_registrante: Association<Cashflow, Usuario>;
  };
}

Cashflow.init(
  {
    id_cashflow: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
        model: UsuarioProductora,
        key: 'id_productora',
      },
      onDelete: 'RESTRICT',
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la productora debe ser un UUID válido.',
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
      onDelete: 'RESTRICT',
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario registrante debe ser un UUID válido.',
        },
      },
    },
    cuit_productora: {
      type: DataTypes.STRING(11),
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'El CUIT de la productora debe contener solo números.',
        },
        len: {
          args: [11, 11],
          msg: 'El CUIT debe tener exactamente 11 dígitos.',
        },
        isValidCUIT(value: string) {
          const validationResult = validateCUIT(value);
          if (validationResult !== true) {
            throw new Error(validationResult as string);
          }
        },
      },
    },
    cbu_productora: {
      type: DataTypes.STRING(22),
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'El CBU de la productora debe contener solo números.',
        },
        len: {
          args: [22, 22],
          msg: 'El CBU debe tener exactamente 22 dígitos.',
        },
        isValidCBU(value: string) {
          const validationResult = validateCBU(value);
          if (validationResult !== true) {
            throw new Error(validationResult as string);
          }
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
      {
        fields: ['productora_id'],
        name: 'idx_cashflow_productora_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_cashflow_usuario_registrante_id',
      },
    ],
  }
);

Cashflow.belongsTo(UsuarioProductora, {
  foreignKey: 'productora_id',
  as: 'productora',
  onDelete: 'RESTRICT',
});

UsuarioProductora.hasOne(Cashflow, {
  foreignKey: 'productora_id',
  as: 'cashflow',
  onDelete: 'RESTRICT',
});

Cashflow.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuario_registrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(Cashflow, {
  foreignKey: 'usuario_registrante_id',
  as: 'cashflows',
  onDelete: 'RESTRICT',
});

export default Cashflow;
