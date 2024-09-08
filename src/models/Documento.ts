import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Documento extends Model {}

Documento.init(
  {
    id_documento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_tramite: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Tramite',
        key: 'id_tramite',
      },
    },
    nombre_documento: {
      type: DataTypes.STRING(150),
    },
    tipo_documento: {
      type: DataTypes.STRING(50),
    },
    ruta_documento: {
      type: DataTypes.STRING(255),
    },
    fecha_subida: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Documento',
    tableName: 'documentos',
  }
);

export default Documento;