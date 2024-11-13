import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Productora from './Productora';
import ProductoraDocumentoTipo from './ProductoraDocumentoTipo';

class ProductoraDocumento extends Model {
  public id_documento!: string;
  public usuario_principal_id!: string;
  public productora_id!: string | null;
  public tipo_documento_id!: string;
  public ruta_archivo_documento!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuarioPrincipal?: Usuario;
  public productora?: Productora;
  public tipoDocumento?: ProductoraDocumentoTipo;

  public static associations: {
    usuarioPrincipal: Association<ProductoraDocumentoTipo, Usuario>;
    productora: Association<ProductoraDocumentoTipo, Productora>;
    tipoDocumento: Association<ProductoraDocumento, ProductoraDocumentoTipo>;
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
    usuario_principal_id: {
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
    tipo_documento_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [1, 50],
          msg: 'El tipo de documento debe tener entre 1 y 50 caracteres.',
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
        fields: ['usuario_principal_id'],
        name: 'idx_documento_usuario_principal',
      },
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

ProductoraDocumento.belongsTo(Usuario, {
  foreignKey: 'usuario_principal_id',
  as: 'usuarioPrincipal',
  onDelete: 'CASCADE',
});

Usuario.hasMany(ProductoraDocumento, {
  foreignKey: 'usuario_principal_id',
  as: 'documentosRegistrados',
  onDelete: 'CASCADE',
});

ProductoraDocumento.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productora',
  onDelete: 'CASCADE',
});

Productora.hasMany(ProductoraDocumento, {
  foreignKey: 'productora_id',
  as: 'documentos',
  onDelete: 'CASCADE',
});

ProductoraDocumento.belongsTo(ProductoraDocumentoTipo, {
  foreignKey: 'tipo_documento_id',
  as: 'tipoDocumento',
  onDelete: 'SET NULL',
});

ProductoraDocumentoTipo.hasMany(ProductoraDocumento, {
  foreignKey: 'tipo_documento_id',
  as: 'documentos',
  onDelete: 'SET NULL',
});

export default ProductoraDocumento;
