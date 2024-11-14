import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import UsuarioRolTipo from './UsuarioRolTipo';
import UsuarioProductora from './Productora';

class UsuarioMaestro extends Model {
  public id_usuario_maestro!: string;
  public usuario_registrante_id!: string;
  public rol_id!: string;
  public productora_id!: string | null;
  public fecha_ultimo_cambio_rol!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuarioRegistrante?: Usuario;
  public rol?: UsuarioRolTipo;
  public productora?: UsuarioProductora;

  public static associations: {
    usuarioRegistrante: Association<UsuarioMaestro, Usuario>;
    rol: Association<UsuarioMaestro, UsuarioRolTipo>;
    productora: Association<UsuarioMaestro, UsuarioProductora>;
  };
}

UsuarioMaestro.init(
  {
    id_usuario_maestro: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de Usuario Maestro debe ser un UUID válido.',
        },
      },
    },
    usuario_registrante_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario registrante debe ser un UUID válido.',
        },
      },
    },
    rol_id: {
      type: DataTypes.UUID,
      defaultValue: 'usuario',
      allowNull: false,
      references: {
        model: UsuarioRolTipo,
        key: 'id_rol',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del rol debe ser un UUID válido.',
        },
      },
    },
    productora_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UsuarioProductora,
        key: 'id_productora',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la productora debe ser un UUID válido.',
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
    modelName: 'UsuarioMaestro',
    tableName: 'UsuarioMaestro',
    timestamps: true,
    indexes: [
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_usuario_maestro_registrante_id',
      },
      {
        fields: ['rol_id'],
        name: 'idx_usuario_maestro_rol_id',
      },
      {
        fields: ['productora_id'],
        name: 'idx_usuario_maestro_productora_id',
      },
    ],
  }
);

UsuarioMaestro.beforeUpdate(async (usuarioMaestro) => {
  if (usuarioMaestro.changed('rol_id')) {
    usuarioMaestro.fecha_ultimo_cambio_rol = new Date();
  }
});

UsuarioMaestro.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'CASCADE',
});

Usuario.hasMany(UsuarioMaestro, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuariosRegistrantes',
  onDelete: 'CASCADE',
});

UsuarioMaestro.belongsTo(UsuarioRolTipo, {
  foreignKey: 'rol_id',
  as: 'rol',
  onDelete: 'RESTRICT',
});

UsuarioRolTipo.hasMany(UsuarioMaestro, {
  foreignKey: 'rol_id',
  as: 'roles',
  onDelete: 'SET NULL',
});

UsuarioMaestro.belongsTo(UsuarioProductora, {
  foreignKey: 'productora_id',
  as: 'productora',
  onDelete: 'RESTRICT',
});

UsuarioProductora.hasMany(UsuarioMaestro, {
  foreignKey: 'productora_id',
  as: 'productoras',
  onDelete: 'SET NULL',
});

export default UsuarioMaestro;
