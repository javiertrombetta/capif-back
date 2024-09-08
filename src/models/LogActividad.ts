import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class LogActividad extends Model {}

LogActividad.init(
  {
    id_log: {
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
    actividad: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'LogActividad',
    tableName: 'log_actividades',
  }
);

export default LogActividad;