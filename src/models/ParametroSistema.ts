import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class ParametroSistema extends Model {}

ParametroSistema.init(
  {
    id_parametro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
    },
    valor: {
      type: DataTypes.STRING(255),
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'ParametroSistema',
    tableName: 'parametros_sistema',
  }
);

export default ParametroSistema;