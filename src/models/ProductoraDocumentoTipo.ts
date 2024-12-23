import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class ProductoraDocumentoTipo extends Model {
  public id_documento_tipo!: string;
  public nombre_documento!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductoraDocumentoTipo.init(
  {
    id_documento_tipo: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del tipo de documento debe ser un UUID válido.',
        },
      },
    },
    nombre_documento: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [1, 50],
          msg: 'El nombre del documento debe tener entre 1 y 50 caracteres.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ProductoraDocumentoTipo',
    tableName: 'ProductoraDocumentoTipo',
    timestamps: true,
    indexes: [
      {
        fields: ['nombre_documento'],
        name: 'idx_usuario_documento_tipo_nombre',
        unique: true,
      },
    ],
  }
);



export default ProductoraDocumentoTipo;
