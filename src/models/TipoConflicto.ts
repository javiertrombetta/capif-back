import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoConflicto extends Model {
  public id_tipo_conflicto!: string;
  public descripcion!: string;
}

TipoConflicto.init(
  {
    id_tipo_conflicto: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: 'La descripción debe tener entre 3 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'TipoConflicto',
    tableName: 'TipoConflicto',
    timestamps: true,
  }
);

export default TipoConflicto;
