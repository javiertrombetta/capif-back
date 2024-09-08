import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Consulta extends Model {}

Consulta.init(
  {
    id_consulta: {
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
    asunto: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
    },
    fecha_envio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Estados',
        key: 'id_estado',
      },
    },
  },
  {
    sequelize,
    modelName: 'Consulta',
    tableName: 'consultas',
  }
);

export default Consulta;