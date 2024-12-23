import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import UsuarioRol from './UsuarioRol';
import Productora from './Productora';

class UsuarioMaestro extends Model {
  public id_usuario_maestro!: string;
  public usuario_registrante_id!: string;
  public rol_id!: string;
  public productora_id!: string | null;
  public fecha_ultimo_cambio_rol!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuarioRegistrante?: Usuario;
  public rol?: UsuarioRol;
  public productora?: Productora;

  public static associations: {
    usuarioRegistrante: Association<UsuarioMaestro, Usuario>;
    rol: Association<UsuarioMaestro, UsuarioRol>;
    productora: Association<UsuarioMaestro, Productora>;
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
    productora_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Productora,
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

export default UsuarioMaestro;
