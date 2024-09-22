import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class Archivo extends Model {
  public id_archivo!: number;
  public nombre_archivo!: string;
  public ruta_archivo!: string;
  public tipo_archivo!: string;
  public id_usuario!: number;
  public fecha_subida!: Date;
}

Archivo.init(
  {
    id_archivo: {
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
    nombre_archivo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: {
          args: [1, 150],
          msg: 'El nombre del archivo debe tener entre 1 y 150 caracteres.',
        },
        notEmpty: {
          msg: 'El nombre del archivo no puede estar vacío.',
        },
      },
    },
    tipo_archivo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [1, 50],
          msg: 'El tipo de archivo debe tener entre 1 y 50 caracteres.',
        },
        notEmpty: {
          msg: 'El tipo de archivo no puede estar vacío.',
        },
      },
    },
    ruta_archivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [5, 255],
          msg: 'La ruta del archivo debe tener entre 5 y 255 caracteres.',
        },
        notEmpty: {
          msg: 'La ruta del archivo no puede estar vacía.',
        },
      },
    },
    fecha_subida: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de subida debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Archivo',
    tableName: 'Archivo',
    timestamps: false,
  }
);

export default Archivo;
