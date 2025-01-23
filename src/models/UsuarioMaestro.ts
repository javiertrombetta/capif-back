import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Productora from './Productora';

class UsuarioMaestro extends Model {
  public id_usuario_maestro!: string;
  public usuario_id!: string;  
  public productora_id!: string | null;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuarioRegistrante?: Usuario;  
  public productora?: Productora;

  public static associations: {
    usuarioRegistrante: Association<UsuarioMaestro, Usuario>;
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
          msg: 'El ID del usuario registrante debe ser un UUID válido.',
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
  },
  {
    sequelize,
    modelName: 'UsuarioMaestro',
    tableName: 'UsuarioMaestro',
    timestamps: true,
    indexes: [
      {
        fields: ['usuario_id'],
        name: 'idx_usuario_maestro_usuario_id',
      },
      {
        fields: ['productora_id'],
        name: 'idx_usuario_maestro_productora_id',
      },
    ],
  }
);

export default UsuarioMaestro;
