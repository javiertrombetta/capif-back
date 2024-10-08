import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoDocumento extends Model {
  public id_tipo_documento!: number;
  public descripcion!: string;
}

TipoDocumento.init(
  {
    id_tipo_documento: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    modelName: 'TipoDocumento',
    tableName: 'TipoDocumento',
    timestamps: true,
  }
);

export default TipoDocumento;
