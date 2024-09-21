import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoCompania extends Model {
  public id_tipo_compania!: number;
  public descripcion!: string;
}

TipoCompania.init(
  {
    id_tipo_compania: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    modelName: 'TipoCompania',
    tableName: 'TipoCompania',
    timestamps: false,
  }
);

export default TipoCompania;
