import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class LogActividad extends Model {
  public id_log!: number;
  public actividad!: string;
  public fecha!: Date;
  public id_usuario!: number;
  public ip_origen!: string;
  public navegador!: string;
}

LogActividad.init(
  {
    id_log: {
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
    actividad: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'La actividad debe tener entre 1 y 255 caracteres.',
        },
        notEmpty: {
          msg: 'La actividad no puede estar vacía.',
        },
      },
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha debe ser una fecha válida.',
        },
      },
    },
    ip_origen: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [7, 50],
          msg: 'La dirección IP debe tener entre 7 y 50 caracteres.',
        },
        notEmpty: {
          msg: 'La dirección IP no puede estar vacía.',
        },
      },
    },
    navegador: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [1, 100],
          msg: 'El navegador debe tener entre 1 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'El navegador no puede estar vacío.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'LogActividad',
    tableName: 'LogActividad',
    timestamps: true,
  }
);

export default LogActividad;
