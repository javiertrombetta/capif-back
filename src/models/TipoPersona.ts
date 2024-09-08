import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class TipoPersona extends Model {}

TipoPersona.init(
  {
    id_tipo_persona: {
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
    modelName: 'TipoPersona',
    tableName: 'tipos_persona',
  }
);

export default TipoPersona;