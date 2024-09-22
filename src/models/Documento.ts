import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Tramite from './Tramite';

class Documento extends Model {
  public id_documento!: number;
  public nombre_documento!: string;
  public tipo_documento!: string;
  public ruta_documento!: string;
  public id_tramite!: number;
  public fecha_subida!: Date;
}

Documento.init(
  {
    id_documento: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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
    tipo_documento: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [3, 50],
          msg: 'El tipo de documento debe tener entre 3 y 50 caracteres.',
        },
        notEmpty: {
          msg: 'El tipo de documento no puede estar vacío.',
        },
      },
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
      type: DataTypes.INTEGER,
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
    fecha_subida: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de subida debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Documento',
    tableName: 'Documento',
    timestamps: false,
  }
);

export default Documento;