import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Parametro extends Model {}

Parametro.init(
  {
    id_parametro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_parametro: {
      type: DataTypes.STRING(100),
    },
    valor: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    modelName: 'Parametro',
    tableName: 'parametros',
  }
);

export default Parametro;