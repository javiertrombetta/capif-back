import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class DepuracionRepertorio extends Model {}

DepuracionRepertorio.init(
  {
    id_depuracion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_fonograma: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Fonograma',
        key: 'id_fonograma',
      },
      onDelete: 'CASCADE',
    },
    accion: {
      type: DataTypes.STRING(100),
    },
    motivo: {
      type: DataTypes.TEXT,
    },
    fecha_accion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'DepuracionRepertorio',
    tableName: 'depuracion_repertorio',
  }
);

export default DepuracionRepertorio;