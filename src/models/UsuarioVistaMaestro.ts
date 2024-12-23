import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import UsuarioVista from './UsuarioVista';


class UsuarioVistaMaestro extends Model {
  public id_vista_maestro!: string;
  public usuario_id!: string;
  public vista_id!: string;
  public is_habilitado!: boolean
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuarioDeVista?: Usuario;
  public vista?: UsuarioVista;

  public static associations: {
    usuario: Association<UsuarioVistaMaestro, Usuario>;
    vista: Association<UsuarioVistaMaestro, UsuarioVista>;

  };
}

UsuarioVistaMaestro.init(
  {
    id_vista_maestro: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de Vista Maestro debe ser un UUID válido.',
        },
      },
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario debe ser un UUID válido.',
        },
      },
    },
    vista_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UsuarioVista,
        key: 'id_vista',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la vista debe ser un UUID válido.',
        },
      },
    },
    is_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'UsuarioVistaMaestro',
    tableName: 'UsuarioVistaMaestro',
    timestamps: true,
    indexes: [
      {
        fields: ['usuario_id'],
        name: 'idx_vista_maestro_usuario',
      },
      {
        fields: ['vista_id'],
        name: 'idx_vista_maestro_vista',
      },  
    ],
  }
);

export default UsuarioVistaMaestro;