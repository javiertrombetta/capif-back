import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import TipoMetodoPago from './TipoMetodoPago';

class Pago extends Model {
  public id_pago!: number;
  public monto!: number;
  public fecha_pago!: Date;
  public id_usuario!: number;
  public id_tipo_metodo_pago!: number;
  public referencia!: string;
  public TipoMetodoPago?: TipoMetodoPago;
}

Pago.init(
  {
    id_pago: {
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
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El monto debe ser un valor decimal válido.',
        },
        min: {
          args: [0],
          msg: 'El monto debe ser mayor o igual a 0.',
        },
        notNull: {
          msg: 'El monto es obligatorio.',
        },
      },
    },
    fecha_pago: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de pago debe ser una fecha válida.',
        },
      },
    },
    id_tipo_metodo_pago: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoMetodoPago,
        key: 'id_tipo_metodo_pago',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    referencia: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'La referencia no puede exceder los 100 caracteres.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Pago',
    tableName: 'Pago',
    timestamps: true,
  }
);

export default Pago;
