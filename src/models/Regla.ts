import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Regla extends Model {}

Regla.init(
  {
    id_regla: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Regla',
    tableName: 'reglas',
  }
);

export default Regla;