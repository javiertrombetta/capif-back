import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Productor extends Model {}

Productor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_completo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Productor',
    tableName: 'productores',
  }
);

export default Productor;
