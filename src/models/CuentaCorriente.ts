import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class CuentaCorriente extends Model {
  public id_cuenta_corriente!: number;
  public saldo!: number;
  public id_usuario!: number;
}

CuentaCorriente.init(
  {
    id_cuenta_corriente: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.UUID,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del usuario es obligatorio.',
        },
        isInt: {
          msg: 'El ID del usuario debe ser un número entero.',
        },
      },
    },
    saldo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El saldo debe ser un valor decimal válido.',
        },
        min: {
          args: [0],
          msg: 'El saldo debe ser mayor o igual a 0.',
        },
        notNull: {
          msg: 'El saldo es obligatorio.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'CuentaCorriente',
    tableName: 'CuentaCorriente',
    timestamps: true,
  }
);

export default CuentaCorriente;
