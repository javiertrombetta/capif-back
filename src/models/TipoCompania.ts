import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class TipoCompania extends Model {}

TipoCompania.init(
  {
    id_tipo: {
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
    modelName: 'TipoCompania',
    tableName: 'tipos_compania',
  }
);

export default TipoCompania;