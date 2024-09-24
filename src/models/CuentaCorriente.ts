import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class CuentaCorriente extends Model {
  public id_cuenta_corriente!: number;
  public saldo!: number;
  public id_usuario!: number;
  public fecha_actualizacion!: Date;
}

CuentaCorriente.init(
  {
    id_cuenta_corriente: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
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
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de actualización debe ser una fecha válida.',
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
