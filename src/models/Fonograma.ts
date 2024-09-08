import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Fonograma extends Model {}

Fonograma.init(
  {
    id_fonograma: {
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
      onDelete: 'CASCADE',
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    artista: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isrc: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    duracion: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    fecha_lanzamiento: {
      type: DataTypes.DATE,
    },
    tipo: {
      type: DataTypes.STRING(50),
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
    modelName: 'Fonograma',
    tableName: 'fonogramas',
  }
);

export default Fonograma;