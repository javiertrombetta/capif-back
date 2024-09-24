import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class ErroresInsercion extends Model {
  public id_error!: number;
  public tabla_afectada!: string;
  public descripcion_error!: string;
  public fecha_error!: Date;
}

ErroresInsercion.init(
  {
    id_error: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tabla_afectada: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [1, 100],
          msg: 'El nombre de la tabla afectada debe tener entre 1 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'La tabla afectada no puede estar vacía.',
        },
      },
    },
    descripcion_error: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La descripción del error no puede estar vacía.',
        },
      },
    },
    fecha_error: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha del error debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ErroresInsercion',
    tableName: 'ErroresInsercion',
    timestamps: true,
  }
);

export default ErroresInsercion;
