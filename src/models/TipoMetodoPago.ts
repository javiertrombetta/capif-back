import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoMetodoPago extends Model {
  public id_tipo_metodo_pago!: number;
  public descripcion!: string;
}

TipoMetodoPago.init(
  {
    id_tipo_metodo_pago: {
      type: DataTypes.INTEGER,
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
    modelName: 'TipoMetodoPago',
    tableName: 'TipoMetodoPago',
    timestamps: true,
  }
);

export default TipoMetodoPago;