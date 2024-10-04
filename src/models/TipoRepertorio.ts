import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoRepertorio extends Model {
  public id_tipo_repertorio!: number;
  public descripcion!: string;
}

TipoRepertorio.init(
  {
    id_tipo_repertorio: {
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
    modelName: 'TipoRepertorio',
    tableName: 'TipoRepertorio',
    timestamps: true,
  }
);

export default TipoRepertorio;