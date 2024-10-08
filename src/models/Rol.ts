import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class Rol extends Model {
  public id_rol!: number;
  public descripcion!: string;
}

Rol.init(
  {
    id_rol: {
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
          msg: 'La descripción debe tener al menos 3 caracteres y no más de 50.',
        },
        is: {
          args: /^[A-Za-z0-9.\-\s]+$/,
          msg: 'La descripción solo puede contener letras, números, espacios, puntos y guiones (-).',
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Rol',
    tableName: 'Rol',
    timestamps: true,
  }
);

export default Rol;
