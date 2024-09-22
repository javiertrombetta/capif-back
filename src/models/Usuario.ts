import { Model, DataTypes } from 'sequelize';
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
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres.',
        },
        isAlpha: {
          msg: 'El nombre solo debe contener letras.',
        },
      },
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'El apellido debe tener entre 2 y 100 caracteres.',
        },
        isAlpha: {
          msg: 'El apellido solo debe contener letras.',
        },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'El email debe ser válido.',
        },
      },
    },
    clave: {
      type: DataTypes.STRING(256),
      allowNull: false,
      validate: {
        len: {
          args: [8, 256],
          msg: 'La clave debe tener al menos 8 caracteres.',
        },
      },
    },
    rol_id: {
      type: DataTypes.INTEGER,
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
        is: /^[0-9]{11}$/,
        msg: 'El CUIT debe tener exactamente 11 dígitos.',
      },
    },
    tipo_persona_id: {
      type: DataTypes.INTEGER,
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
      validate: {
        len: {
          args: [2, 100],
          msg: 'La ciudad debe tener entre 2 y 100 caracteres.',
        },
      },
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pais: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(50),
      validate: {
        is: /^[0-9\-+() ]+$/,
        msg: 'El teléfono solo puede contener números y los caracteres +, -, (, ) y espacio.',
      },
    },
    registro_pendiente: {
      type: DataTypes.BOOLEAN,
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
