import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Repertorio from './Repertorio';
import Estado from './Estado';
import ISRC from './ISRC';

class Fonograma extends Model {
  public id_fonograma!: number;
  public titulo!: string;
  public artista!: string;
  public duracion!: string;
  public fecha_lanzamiento!: Date;
  public tipo!: string | null;
  public estado_id!: number;
  public id_repertorio!: number;
  public id_isrc!: number | null;
}

Fonograma.init(
  {
    id_fonograma: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: {
          args: [3, 150],
          msg: 'El título debe tener entre 3 y 150 caracteres.',
        },
        notEmpty: {
          msg: 'El título no puede estar vacío.',
        },
      },
    },
    artista: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'El nombre del artista debe tener entre 2 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'El campo artista no puede estar vacío.',
        },
      },
    },
    duracion: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La duración no puede estar vacía.',
        },
        is: {
          args: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
          msg: 'La duración debe estar en formato HH:MM:SS.',
        },
      },
    },
    fecha_lanzamiento: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de lanzamiento debe ser una fecha válida.',
        },
      },
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: {
          args: [['Single', 'Álbum', 'EP', 'Otro']],
          msg: 'El tipo debe ser uno de los siguientes: Single, Álbum, EP, Otro.',
        },
      },
    },
    id_repertorio: {
      type: DataTypes.INTEGER,
      references: {
        model: Repertorio,
        key: 'id_repertorio',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del repertorio es obligatorio.',
        },
        isInt: {
          msg: 'El ID del repertorio debe ser un número entero.',
        },
      },
    },
    estado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Estado,
        key: 'id_estado',
      },
    },
    id_isrc: {
      type: DataTypes.INTEGER,
      references: {
        model: ISRC,
        key: 'id_isrc',
      },
      onDelete: 'SET NULL',
      allowNull: true,
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
