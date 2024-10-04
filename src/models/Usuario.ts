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
  public codigo_postal!: string;
  public telefono?: string;
  public isRegistro_pendiente!: boolean;
  public email_verification_token!: string | null;
  public email_verification_token_expires!: Date | null;
  public reset_password_token!: string | null;
  public reset_password_token_expires!: Date | null;
  public isHabilitado!: boolean;
  public intentos_fallidos!: number;
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
          msg: 'El apellido debe tener entre 2 y 100 caracteres.',
        },
        is: {
          args: /^[A-Za-zÀ-ÿ\s]+$/,
          msg: 'El apellido solo debe contener letras y espacios.',
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
        is: {
          args: /^[A-Za-zÀ-ÿ\s]+$/,
          msg: 'El apellido solo debe contener letras y espacios.',
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
        is: {
          args: /^[0-9]{11}$/,
          msg: 'El CUIT debe tener exactamente 11 dígitos.',
        },
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
        notEmpty: {
          msg: 'El campo ciudad no puede estar vacío.',
        },
      },
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'La provincia debe tener entre 2 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'El campo provincia no puede estar vacío.',
        },
      },
    },
    pais: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'El país debe tener entre 2 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'El campo país no puede estar vacío.',
        },
      },
    },
    codigo_postal: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        len: {
          args: [2, 20],
          msg: 'El código postal debe tener entre 2 y 20 caracteres.',
        },
        notEmpty: {
          msg: 'El código postal no puede estar vacío.',
        },
      },
    },
    telefono: {
      type: DataTypes.STRING(50),
      validate: {
        is: {
          args: /^[0-9\-+() ]+$/,
          msg: 'El teléfono solo puede contener números y los caracteres +, -, (, ) y espacio.',
        },
      },
    },
    isRegistro_pendiente: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    email_verification_token: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    email_verification_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    reset_password_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isHabilitado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    intentos_fallidos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuario',
    timestamps: true,
  }
);

export default Usuario;
