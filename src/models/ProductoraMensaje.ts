import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Productora from './Productora';

class ProductoraMensaje extends Model {
  public id_comentario!: string;
  public usuario_id!: string;
  public productora_id!: string;
  public mensaje!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  public usuarioDelMensaje?: Usuario;
  public productoraDelMensaje?: Productora;

  public static associations: {    
    usuarioDelMensaje: Association<ProductoraMensaje, Usuario>;
    productoraDelMensaje: Association<ProductoraMensaje, Productora>;
  };
}

ProductoraMensaje.init(
  {
    id_comentario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del mensaje debe ser un UUID válido.',
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
    productora_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    mensaje: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El mensaje no puede estar vacío.',
        },
      },
    },    
  },
  {
    sequelize,
    modelName: 'ProductoraMensaje',
    tableName: 'ProductoraMensaje',
    timestamps: true,
    indexes: [
      {
        fields: ['usuario_id'],
        name: 'idx_comentario_usuario',
      },
      {
        fields: ['productora_id'],
        name: 'idx_comentario_productora',
      },
    ],
  }
);

export default ProductoraMensaje;