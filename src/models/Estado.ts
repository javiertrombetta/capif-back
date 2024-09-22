import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import TipoEstado from './TipoEstado';

class Estado extends Model {
  public id_estado!: number;
  public descripcion!: string;
  public tipo_estado_id!: number;
}

Estado.init(
  {
    id_estado: {
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
        is: {
          args: /^[A-Za-z\s]+$/,
          msg: 'La descripción solo puede contener letras y espacios.',
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
      },
    },
    tipo_estado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoEstado,
        key: 'id_tipo_estado',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Estado',
    tableName: 'Estado',
    timestamps: false,
  }
);

export default Estado;
