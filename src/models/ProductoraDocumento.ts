import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Productora from './Productora';
import ProductoraDocumentoTipo from './ProductoraDocumentoTipo';

class ProductoraDocumento extends Model {
  public id_documento!: string;
  public productora_id!: string;
  public tipo_documento_id!: string;
  public ruta_archivo_documento!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public productoraDelDocumento?: Productora;
  public tipoDeDocumento?: ProductoraDocumentoTipo;

  public static associations: {
    productoraDelDocumento: Association<ProductoraDocumentoTipo, Productora>;
    tipoDeDocumento: Association<ProductoraDocumento, ProductoraDocumentoTipo>;
  };
}

ProductoraDocumento.init(
  {
    id_documento: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del documento debe ser un UUID válido.',
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
    tipo_documento_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ProductoraDocumentoTipo',
        key: 'id_documento_tipo',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de tipo de documento debe ser un UUID válido.',
        },
      },
    },
    ruta_archivo_documento: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: {
          msg: 'La ruta del archivo debe ser una URL válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ProductoraDocumento',
    tableName: 'ProductoraDocumento',
    timestamps: true,
    indexes: [
      {
        fields: ['productora_id'],
        name: 'idx_documento_productora',
      },
      {
        fields: ['tipo_documento_id'],
        name: 'idx_documento_tipo_documento',
      },
    ],
  }
);

export default ProductoraDocumento;
