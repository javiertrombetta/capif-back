import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Productora from './Productora';

class ProductoraPremio extends Model {
  public id_premio!: string;
  public productora_id!: string;
  public codigo_postulacion!: string;
  public fecha_asignacion!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public productoraDelPremio?: Productora;

  public static associations: {
    productoraDelPremio: Association<ProductoraPremio, Productora>;
  };
}

ProductoraPremio.init(
  {
    id_premio: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del premio debe ser un UUID válido.',
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
    codigo_postulacion: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        isAlphanumeric: {
          msg: 'El código de postulación debe ser alfanumérico.',
        },
        len: {
          args: [5, 10],
          msg: 'El código de postulación debe tener entre 5 y 10 caracteres.',
        },
      },
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de asignación debe ser una fecha válida.',
        },
      },
    },    
  },
  {
    sequelize,
    modelName: 'ProductoraPremio',
    tableName: 'ProductoraPremio',
    timestamps: true,
    indexes: [
      {
        fields: ['productora_id'],
        name: 'idx_productora_premio_productora_id',
      },      
      {
        fields: ['codigo_postulacion'],
        name: 'idx_productora_premio_codigo_postulacion',
        unique: true,
      },
    ],
  }
);

export default ProductoraPremio;
