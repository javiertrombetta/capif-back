import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Estado extends Model {}

Estado.init(
  {
    id_estado: {
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
    modelName: 'Estado',
    tableName: 'estados',
  }
);

export default Estado;