import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Compania extends Model {}

Compania.init(
  {
    id_compania: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_compania: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(200),
    },
    telefono: {
      type: DataTypes.STRING(50),
    },
    email: {
      type: DataTypes.STRING(150),
    },
    cuit: {
      type: DataTypes.STRING(11),
      unique: true,
      allowNull: false,
    },
    tipo_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'TiposCompania',
        key: 'id_tipo',
      },
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
    modelName: 'Compania',
    tableName: 'companias',
  }
);

export default Compania;