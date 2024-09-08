import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Conflicto extends Model {}

Conflicto.init(
  {
    id_conflicto: {
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
    tipo_conflicto: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    estado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Estados',
        key: 'id_estado',
      },
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Conflicto',
    tableName: 'conflictos',
  }
);

export default Conflicto;