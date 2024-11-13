import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

const OPERACIONES_PERMITIDAS = [
  'DEPURAR',
  'INCOMPLETO',
  'RECHAZADO',
  'NUEVO',
  'CONFIRMADO',
  'PENDIENTE',
  'PRINCIPAL',
  'SECUNDARIO',
] as const;

class Usuario extends Model {
  public id_usuario!: string;
  public tipo_registro!: (typeof OPERACIONES_PERMITIDAS)[number];
  public nombres_y_apellidos!: string;
  public telefono!: string;
  public email!: string;
  public clave!: string;
  public is_registro_pendiente!: boolean;
  public email_verification_token!: string | null;
  public email_verification_token_expires!: Date | null;
  public reset_password_token!: string | null;
  public reset_password_token_expires!: Date | null;
  public fecha_ultimo_cambio_registro!: Date;
  public is_habilitado!: boolean;
  public intentos_fallidos!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de usuario debe ser un UUID válido.',
        },
      },
    },
    tipo_registro: {
      type: DataTypes.ENUM(...OPERACIONES_PERMITIDAS),
      allowNull: false,
      validate: {
        isIn: {
          args: [OPERACIONES_PERMITIDAS],
          msg: 'El tipo de registro debe ser una operación permitida.',
        },
      },
    },
    nombres_y_apellidos: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: 'El nombre y apellido debe tener entre 3 y 255 caracteres.',
        },
      },
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        len: {
          args: [7, 20],
          msg: 'El teléfono debe tener entre 7 y 20 caracteres.',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Debe ser un correo electrónico válido.',
        },
      },
    },
    clave: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 255],
          msg: 'La clave debe tener al menos 8 caracteres.',
        },
      },
    },
    is_registro_pendiente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    email_verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email_verification_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'Debe ser una fecha válida.',
        },
      },
    },
    reset_password_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reset_password_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'Debe ser una fecha válida.',
        },
      },
    },
    fecha_ultimo_cambio_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'Debe ser una fecha válida.',
        },
      },
    },
    is_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    intentos_fallidos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Debe ser un número entero.',
        },
        min: {
          args: [0],
          msg: 'No puede tener intentos fallidos negativos.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuario',
    timestamps: true,
    indexes: [
      {
        fields: ['email'],
        name: 'idx_usuario_email',
        unique: true,
      },
      {
        fields: ['nombres_y_apellidos'],
        name: 'idx_usuario_nombres_y_apellidos',        
      },
      {
        fields: ['tipo_registro'],
        name: 'idx_usuario_tipo_registro',
      },
      {
        fields: ['is_habilitado'],
        name: 'idx_usuario_habilitado',
      },
    ],
  }
);

Usuario.beforeUpdate(async (usuario) => {
  if (usuario.changed('tipo_registro')) {
    usuario.fecha_ultimo_cambio_registro = new Date();
  }
});

export default Usuario;
