import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Rol extends Model {}

Rol.init(
  {
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Rol',
    tableName: 'roles',
  }
);

export default Rol;