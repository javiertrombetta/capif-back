import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import TipoCompania from './TipoCompania';
import Estado from './Estado';

class Compania extends Model {
  public id_compania!: number;
  public nombre_compania!: string;
  public direccion!: string | null;
  public telefono!: string | null;
  public email!: string | null;
  public cuit!: string;
  public estado_id!: number;
  public tipo_compania_id!: number;
}

Compania.init(
  {
    id_compania: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_compania: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: {
          args: [3, 150],
          msg: 'El nombre de la compañía debe tener entre 3 y 150 caracteres.',
        },
        notEmpty: {
          msg: 'El nombre de la compañía no puede estar vacío.',
        },
      },
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        is: /^[0-9\-+() ]+$/,
        msg: 'El teléfono solo puede contener números y los caracteres +, -, (, ) y espacios.',
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Debe ser un correo electrónico válido.',
        },
      },
    },
    cuit: {
      type: DataTypes.CHAR(11),
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[0-9]{11}$/,
          msg: 'El CUIT debe contener exactamente 11 dígitos numéricos.',
        },
      },
    },
    tipo_compania_id: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoCompania,
        key: 'id_tipo_compania',
      },
      onDelete: 'CASCADE',
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
    modelName: 'Compania',
    tableName: 'Compania',
    timestamps: true,
  }
);

export default Compania;
