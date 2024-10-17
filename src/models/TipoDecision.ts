import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoDecision extends Model {
  public id_tipo_decision!: string;
  public descripcion!: string;
}

TipoDecision.init(
  {
    id_tipo_decision: {
      type: DataTypes.UUID,
      autoIncrement: true,
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
    modelName: 'TipoDecision',
    tableName: 'TipoDecision',
    timestamps: false,
  }
);

export default TipoDecision;
