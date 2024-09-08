import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Repertorio extends Model {}

Repertorio.init(
  {
    id_repertorio: {
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
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(50),
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Repertorio',
    tableName: 'repertorios',
  }
);

export default Repertorio;