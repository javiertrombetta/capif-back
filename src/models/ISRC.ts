import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';

class ISRC extends Model {
  public id_isrc!: number;
  public codigo_isrc!: string;
  public tipo!: 'audio' | 'video';
  public id_fonograma!: number;
}

ISRC.init(
  {
    id_isrc: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo_isrc: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[A-Z]{2}[0-9A-Z]{3}[0-9]{2}[0-9]{5}$/,
          msg: 'El código ISRC debe seguir el formato correcto (Ej: XX12345678901).',
        },
        notEmpty: {
          msg: 'El código ISRC no puede estar vacío.',
        },
      },
    },
    tipo: {
      type: DataTypes.ENUM('audio', 'video'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['audio', 'video']],
          msg: 'El tipo debe ser "audio" o "video".',
        },
      },
    },
    id_fonograma: {
      type: DataTypes.INTEGER,
      references: {
        model: Fonograma,
        key: 'id_fonograma',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del fonograma es obligatorio.',
        },
        isInt: {
          msg: 'El ID del fonograma debe ser un número entero.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ISRC',
    tableName: 'ISRC',
    timestamps: true,
  }
);

export default ISRC;
