import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class ISRC extends Model {}

ISRC.init(
  {
    id_isrc: {
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
    codigo_isrc: {
      type: DataTypes.STRING(20),
    },
    tipo: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    modelName: 'ISRC',
    tableName: 'isrcs',
  }
);

export default ISRC;