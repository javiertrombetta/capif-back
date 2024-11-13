import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class ProductoraISRCTipo extends Model {
  public codigo!: string;
  public is_en_uso!: boolean;
}

ProductoraISRCTipo.init(
  {
    codigo: {
      type: DataTypes.STRING(3),
      primaryKey: true,
      allowNull: false,
      validate: {
        isAlphanumeric: {
          msg: 'El código debe ser alfanumérico.',
        },
        len: {
          args: [3, 3],
          msg: 'El código debe tener exactamente 3 caracteres.',
        },
      },
    },
    is_en_uso: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'ProductoraISRCTipo',
    tableName: 'ProductoraISRCTipo',
    timestamps: false,
  }
);

export default ProductoraISRCTipo;
