import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import TipoISRC from './TipoISRC';

class ISRC extends Model {
  public id_isrc!: number;
  public codigo_isrc!: string;
  public id_tipo_isrc!: number;
  public id_fonograma!: number;
}

ISRC.init(
  {
    id_isrc: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    id_tipo_isrc: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoISRC,
        key: 'id_tipo_isrc',
      },
      allowNull: false,
      onDelete: 'CASCADE',
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
