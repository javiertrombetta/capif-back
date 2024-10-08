import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoArchivo extends Model {
  public id_tipo_archivo!: number;
  public descripcion!: string;
}

TipoArchivo.init(
  {
    id_tipo_archivo: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [1, 50],
          msg: 'La descripción debe tener entre 1 y 50 caracteres.',
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'TipoArchivo',
    tableName: 'TipoArchivo',
    timestamps: true,
  }
);

export default TipoArchivo;
