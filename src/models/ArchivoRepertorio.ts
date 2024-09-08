import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class ArchivoRepertorio extends Model {}

ArchivoRepertorio.init(
  {
    id_archivo_repertorio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_repertorio: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Repertorio',
        key: 'id_repertorio',
      },
    },
    nombre_archivo: {
      type: DataTypes.STRING(150),
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
    modelName: 'ArchivoRepertorio',
    tableName: 'archivos_repertorio',
  }
);

export default ArchivoRepertorio;