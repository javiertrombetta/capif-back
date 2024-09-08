import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Premio extends Model {}

Premio.init(
  {
    id_premio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Usuario',
        key: 'id_usuario',
      },
    },
    codigo_premio: {
      type: DataTypes.STRING(50),
    },
    fecha_obtencion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Premio',
    tableName: 'premios',
  }
);

export default Premio;