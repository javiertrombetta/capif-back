import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class ConsultaRespuesta extends Model {}

ConsultaRespuesta.init(
  {
    id_respuesta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_consulta: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Consulta',
        key: 'id_consulta',
      },
    },
    id_usuario_responde: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Usuario',
        key: 'id_usuario',
      },
    },
    mensaje: {
      type: DataTypes.TEXT,
    },
    fecha_respuesta: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ConsultaRespuesta',
    tableName: 'consultas_respuestas',
  }
);

export default ConsultaRespuesta;