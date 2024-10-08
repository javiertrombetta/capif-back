import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import TipoArchivo from './TipoArchivo';

class Archivo extends Model {
  public id_archivo!: number;
  public nombre_archivo!: string;
  public ruta_archivo!: string;
  public id_tipo_archivo!: number;
  public id_usuario!: number;
}

Archivo.init(
  {
    id_archivo: {
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
    id_tipo_archivo: {
      type: DataTypes.UUID,
      references: {
        model: TipoArchivo,
        key: 'id_tipo_archivo',
      },
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El tipo de archivo es obligatorio.',
        },
        isInt: {
          msg: 'El tipo de archivo debe ser un número entero.',
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
  },
  {
    sequelize,
    modelName: 'Archivo',
    tableName: 'Archivo',
    timestamps: true,
  }
);

export default Archivo;
