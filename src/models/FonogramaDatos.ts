import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';

class FonogramaDatos extends Model {
  public id_datos!: string;
  public fonograma_id!: string;
  public titulo!: string;
  public artista!: string;
  public album!: string | null;
  public duracion!: string;
  public sello_discografico!: string | null;
  public anio_lanzamiento!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonograma?: Fonograma;

  public static associations: {
    fonograma: Association<FonogramaDatos, Fonograma>;
  };
}

FonogramaDatos.init(
  {
    id_datos: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de los datos debe ser un UUID válido.',
        },
      },
    },
    fonograma_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Fonograma,
        key: 'id_fonograma',
      },
      onDelete: 'CASCADE',
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del fonograma debe ser un UUID válido.',
        },
      },
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
    album: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    duracion: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: {
          args: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
          msg: 'La duración debe estar en formato HH:MM:SS.',
        },
      },
    },
    sello_discografico: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    anio_lanzamiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'El año de lanzamiento debe ser un número entero.',
        },
        min: {
          args: [1900],
          msg: 'El año de lanzamiento no puede ser anterior a 1900.',
        },
        max: {
          args: [new Date().getFullYear()],
          msg: 'El año de lanzamiento no puede ser mayor al año actual.',
        },
      },
    },    
  },
  {
    sequelize,
    modelName: 'FonogramaDatos',
    tableName: 'FonogramaDatos',
    timestamps: true,
    indexes: [
      {
        fields: ['fonograma_id'],
        name: 'idx_fonograma_datos_fonograma_id',
      },
      {
        fields: ['titulo'],
        name: 'idx_fonograma_datos_titulo',
      },
      {
        fields: ['artista'],
        name: 'idx_fonograma_datos_artista',
      },
      {
        fields: ['anio_lanzamiento'],
        name: 'idx_fonograma_datos_anio_lanzamiento',
      },
    ],
  }
);

FonogramaDatos.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonograma',
  onDelete: 'CASCADE',
});

Fonograma.hasOne(FonogramaDatos, {
  foreignKey: 'fonograma_id',
  as: 'datosFonograma',
  onDelete: 'CASCADE',
});

export default FonogramaDatos;