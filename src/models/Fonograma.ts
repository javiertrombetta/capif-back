import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Estado from './Estado';
import Repertorio from './Repertorio';

class Fonograma extends Model {
  public id_fonograma!: number;
  public id_repertorio!: number;
  public titulo!: string;
  public artista!: string;
  public isrc!: string;
  public duracion!: string;
  public fecha_lanzamiento?: Date;
  public tipo?: string;
  public estado_id?: number;
}

Fonograma.init(
  {
    id_fonograma: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_repertorio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Repertorio,
        key: 'id_repertorio',
      },
      onDelete: 'CASCADE',
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    artista: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    isrc: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[A-Z]{2}[0-9A-Z]{3}[0-9]{2}[0-9]{5}$/,
      },
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
        model: Estado,
        key: 'id_estado',
      },
    },
  },
  {
    sequelize,
    modelName: 'Fonograma',
    tableName: 'Fonograma',
    timestamps: false,
  }
);

export default Fonograma;
