import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoFonograma extends Model {
  public id_tipo_fonograma!: number;
  public descripcion!: string;
}

TipoFonograma.init(
  {
    id_tipo_fonograma: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [3, 50],
          msg: 'La descripción debe tener entre 3 y 50 caracteres.',
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'TipoFonograma',
    tableName: 'TipoFonograma',
    timestamps: true,
  }
);

export default TipoFonograma;