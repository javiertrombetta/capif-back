import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class Reporte extends Model {
  public id_reporte!: number;
  public tipo_reporte!: string;
  public ruta_archivo!: string;
  public id_usuario!: number;
  public fecha_generacion!: Date;
}

Reporte.init(
  {
    id_reporte: {
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
    tipo_reporte: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: 'El tipo de reporte debe tener entre 3 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'El tipo de reporte no puede estar vacío.',
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
    fecha_generacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de generación debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Reporte',
    tableName: 'Reporte',
    timestamps: false,
  }
);

export default Reporte;
