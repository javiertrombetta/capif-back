import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoEstado extends Model {
  public id_tipo_estado!: number;
  public descripcion!: string;
}

TipoEstado.init(
  {
    id_tipo_estado: {
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
        is: {
          args: /^[A-Za-z\s]+$/,
          msg: 'La descripción solo puede contener letras y espacios.',
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
        notNull: {
          msg: 'La descripción es un campo requerido.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'TipoEstado',
    tableName: 'TipoEstado',
    timestamps: true,
  }
);

export default TipoEstado;
