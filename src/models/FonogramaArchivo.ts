import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';

class FonogramaArchivo extends Model {
  public id_archivo!: string;
  public fonograma_id!: string;
  public ruta_archivo_audio!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonogramaDelArchivoAudio?: Fonograma;

  public static associations: {
    fonogramaDelArchivoAudio: Association<FonogramaArchivo, Fonograma>;
  };
}

FonogramaArchivo.init(
  {
    id_archivo: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del archivo debe ser un UUID válido.',
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
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del fonograma debe ser un UUID válido.',
        },
      },
    },
    ruta_archivo_audio: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La ruta del archivo de audio no puede estar vacía.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'FonogramaArchivo',
    tableName: 'FonogramaArchivo',
    timestamps: true,
    indexes: [      
      {
        fields: ['fonograma_id'],
        name: 'idx_fonograma_archivo_fonograma_id',
      },
    ],
  }
);

export default FonogramaArchivo;