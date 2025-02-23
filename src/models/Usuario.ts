import { Model, DataTypes, Association } from "sequelize";
import sequelize from "../config/database/sequelize";
import UsuarioRol from "./UsuarioRol";

const OPERACIONES_PERMITIDAS = [
  "DEPURAR",
  "NUEVO",
  "CONFIRMADO",
  "PENDIENTE",
  "ENVIADO",
  "RECHAZADO",
  "HABILITADO",
  "DESHABILITADO",
] as const;

class Usuario extends Model {
  public id_usuario!: string;
  public rol_id!: string;
  public tipo_registro!: (typeof OPERACIONES_PERMITIDAS)[number];
  public nombre!: string | null;
  public apellido!: string | null;
  public email!: string;
  public clave!: string;
  public is_bloqueado!: boolean;
  public intentos_fallidos!: number;
  public fecha_ultimo_cambio_registro!: Date;
  public telefono!: string | null;
  public email_verification_token!: string | null;
  public email_verification_token_expires!: Date | null;
  public reset_password_token!: string | null;
  public reset_password_token_expires!: Date | null;
  public fecha_ultimo_inicio_sesion!: Date | null;
  public fecha_ultimo_cambio_rol!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public rol?: UsuarioRol;
  
  public static associations: {
    rol: Association<Usuario, UsuarioRol>;
  };
  UsuarioMaestro: any;
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
          msg: "El ID de usuario debe ser un UUID válido.",
        },
      },
    },
    rol_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UsuarioRol,
        key: 'id_rol',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del rol debe ser un UUID válido.',
        },
      },
    },
    tipo_registro: {
      type: DataTypes.ENUM(...OPERACIONES_PERMITIDAS),
      allowNull: false,
      validate: {
        isIn: {
          args: [OPERACIONES_PERMITIDAS],
          msg: "El tipo de registro debe ser una operación permitida.",
        },
      },
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [3, 255],
          msg: "El nombre debe tener entre 3 y 255 caracteres.",
        },
      },
    },
    apellido: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [3, 255],
          msg: "El apellido debe tener entre 3 y 255 caracteres.",
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "El email debe ser un correo electrónico válido.",
        },
      },
    },
    clave: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 255],
          msg: "La clave debe tener al menos 8 caracteres.",
        },
      },
    },
    is_bloqueado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    intentos_fallidos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: "Los intentos fallidos debe ser un número entero.",
        },
        min: {
          args: [0],
          msg: "No pueden existir intentos fallidos negativos.",
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
          msg: "La fecha del último cambio del registro debe ser una fecha válida.",
        },
      },
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [7, 20],
          msg: "El teléfono debe tener entre 7 y 20 caracteres.",
        },
      },
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
          msg: "La fecha de expiración del token de verificación del email debe ser una fecha válida.",
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
          msg: "La fecha de expiración del token de reseteo de clave debe ser una fecha válida.",
        },
      },
    },
    fecha_ultimo_inicio_sesion: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: "La fecha del último inicio de sesión debe ser una fecha válida.",
        },
      },
    },
    fecha_ultimo_cambio_rol: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de último cambio de rol debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Usuario",
    tableName: "Usuario",
    timestamps: true,
    indexes: [
      {
        fields: ["email"],
        name: "idx_usuario_email",
        unique: true,
      },
      {
        fields: ["nombre"],
        name: "idx_usuario_nombre",
      },
      {
        fields: ["apellido"],
        name: "idx_usuario_apellido",
      },
      {
        fields: ["tipo_registro"],
        name: "idx_usuario_tipo_registro",
      },
      {
        fields: ["is_bloqueado"],
        name: "idx_usuario_bloqueado",
      },
      {
        fields: ['rol_id'],
        name: 'idx_usuario_rol_id',
      },
    ],
  }
);

// Usuario.beforeCreate(async (usuario) => {
//   if (!usuario.rol_id) {
//     const usuarioRol = await UsuarioRol.findOne({ where: { nombre_rol: 'usuario' } });
//     if (!usuarioRol) {
//       throw new Error('No se encontró el rol "usuario" en la base de datos.');
//     }
//     usuario.rol_id = usuarioRol.id_rol;
//   }
// });

Usuario.beforeUpdate(async (usuario) => {
  if (usuario.changed("tipo_registro")) {
    usuario.fecha_ultimo_cambio_registro = new Date();
  }
});

Usuario.beforeUpdate(async (usuario) => {
  if (usuario.changed('rol_id')) {
    usuario.fecha_ultimo_cambio_rol = new Date();
  }
});

export default Usuario;