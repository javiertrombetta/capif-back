import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/config';

class TipoEstado extends Model {
  public id_tipo_estado!: number;
  public descripcion!: string;
}

TipoEstado.init(
  {
    id_tipo_estado: {
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
    modelName: 'TipoEstado',
    tableName: 'TipoEstado',
    timestamps: false,
  }
);

export default TipoEstado;
