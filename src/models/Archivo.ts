import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Archivo extends Model {}

Archivo.init(
  {
    id_archivo: {
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
    nombre_archivo: {
      type: DataTypes.STRING(150),
    },
    tipo_archivo: {
      type: DataTypes.STRING(50),
    },
    ruta_archivo: {
      type: DataTypes.STRING(255),
    },
    fecha_subida: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Archivo',
    tableName: 'archivos',
  }
);

export default Archivo;