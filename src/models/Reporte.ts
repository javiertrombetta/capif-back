import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Reporte extends Model {}

Reporte.init(
  {
    id_reporte: {
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
    tipo_reporte: {
      type: DataTypes.STRING(100),
    },
    fecha_generacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ruta_reporte: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    modelName: 'Reporte',
    tableName: 'reportes',
  }
);

export default Reporte;