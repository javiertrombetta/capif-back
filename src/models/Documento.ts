import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Tramite from './Tramite';
import TipoDocumento from './TipoDocumento';

class Documento extends Model {
  public id_documento!: number;
  public nombre_documento!: string;
  public tipo_documento!: string;
  public ruta_documento!: string;
  public id_tramite!: number;
}

Documento.init(
  {
    id_documento: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre_documento: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: {
          args: [3, 150],
          msg: 'El nombre del documento debe tener entre 3 y 150 caracteres.',
        },
        notEmpty: {
          msg: 'El nombre del documento no puede estar vacío.',
        },
      },
    },
    id_tipo_documento: {
      type: DataTypes.UUID,
      references: {
        model: TipoDocumento,
        key: 'id_tipo_documento',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    ruta_documento: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [5, 255],
          msg: 'La ruta del documento debe tener entre 5 y 255 caracteres.',
        },
        notEmpty: {
          msg: 'La ruta del documento no puede estar vacía.',
        },
      },
    },
    id_tramite: {
      type: DataTypes.UUID,
      references: {
        model: Tramite,
        key: 'id_tramite',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del trámite es obligatorio.',
        },
        isInt: {
          msg: 'El ID del trámite debe ser un número entero.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Documento',
    tableName: 'Documento',
    timestamps: true,
  }
);

export default Documento;
