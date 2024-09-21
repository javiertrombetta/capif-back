import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Rol from './Rol';
import Estado from './Estado';
import TipoPersona from './TipoPersona';

class Usuario extends Model {
  public id_usuario!: number;
  public nombre!: string;
  public apellido!: string;
  public email!: string;
  public clave!: string;
  public rol_id!: number;
  public estado_id!: number;
  public cuit!: string;
  public tipo_persona_id!: number;
  public domicilio?: string;
  public ciudad!: string;
  public provincia!: string;
  public pais!: string;
  public telefono?: string;
  public codigo_isrc_audio!: string;
  public codigo_isrc_video!: string;
  public registro_pendiente!: boolean;
}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    clave: {
      type: DataTypes.STRING(256),
      allowNull: false,
      validate: {
        len: [8, 256],
      },
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Rol,
        key: 'id_rol',
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
    cuit: {
      type: DataTypes.CHAR(11),
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: true,
        len: [11, 11],
      },
    },
    tipo_persona_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TipoPersona,
        key: 'id_tipo_persona',
      },
      onDelete: 'CASCADE',
    },
    domicilio: {
      type: DataTypes.STRING(200),
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pais: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    telefono: {
      type: DataTypes.STRING(50),
    },
    codigo_isrc_audio: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    codigo_isrc_video: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    registro_pendiente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuario',
    timestamps: false,
  }
);

export default Usuario;
