import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class Regla extends Model {
  public id_regla!: number;
  public descripcion!: string;
  public fecha_creacion!: Date;
  public activo!: boolean;
}

Regla.init(
  {
    id_regla: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'La descripción debe tener entre 1 y 255 caracteres.',
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
      },
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de creación debe ser una fecha válida.',
        },
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: 'El campo activo debe ser verdadero o falso.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Regla',
    tableName: 'Regla',
    timestamps: true,
  }
);

export default Regla;
