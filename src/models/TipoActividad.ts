import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoActividad extends Model {
  public id_tipo_actividad!: number;
  public descripcion!: string;
}

TipoActividad.init(
  {
    id_tipo_actividad: {
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
  },
  {
    sequelize,
    modelName: 'TipoActividad',
    tableName: 'TipoActividad',
    timestamps: true,
  }
);

export default TipoActividad;