import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Tramite extends Model {}

Tramite.init(
  {
    id_tramite: {
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
    tipo_tramite: {
      type: DataTypes.STRING(100),
    },
    fecha_inicio: {
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
    modelName: 'Tramite',
    tableName: 'tramites',
  }
);

export default Tramite;