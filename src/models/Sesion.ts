import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Sesion extends Model {}

Sesion.init(
  {
    id_sesion: {
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
    fecha_inicio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_fin: {
      type: DataTypes.DATE,
    },
    ip: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    modelName: 'Sesion',
    tableName: 'sesiones',
  }
);

export default Sesion;